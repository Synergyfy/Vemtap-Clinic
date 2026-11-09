import { PatientPortalService } from './patient-portal.service';

describe('PatientPortalService', () => {
  it('keeps a general patient account unassigned when no clinic is provided', async () => {
    const clinicRepo = {
      findOne: jest.fn(),
    };

    const branchRepo = {
      findOne: jest.fn(),
    };

    const service = new PatientPortalService(
      {} as any,
      clinicRepo as any,
      branchRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await expect((service as any).resolveClinicAssociation(undefined, undefined, undefined)).resolves.toEqual({
      clinicId: null,
      branchId: null,
    });
  });

  it('uses the clinic branch when a clinic is explicitly linked', async () => {
    const clinicRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'clinic-123' }),
    };

    const branchRepo = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'branch-456', clinicId: 'clinic-123' }),
    };

    const service = new PatientPortalService(
      {} as any,
      clinicRepo as any,
      branchRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await expect((service as any).resolveClinicAssociation('clinic-123', undefined, undefined)).resolves.toEqual({
      clinicId: 'clinic-123',
      branchId: 'branch-456',
    });
  });

  it('generates and verifies a phone OTP for local patient verification', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalAllowOtpDebug = process.env.ALLOW_OTP_DEBUG;
    process.env.NODE_ENV = 'development';
    process.env.ALLOW_OTP_DEBUG = 'true';

    const smsService = {
      sendOtpSms: jest.fn().mockResolvedValue({ success: true, messageId: 'local-otp' }),
    };

    const service = new PatientPortalService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      smsService as any,
    );

    try {
      const result = await service.sendPhoneOtp('+2348012345678');

      expect(result.success).toBe(true);
      expect(result.code).toBeDefined();
      expect(result.expiresAt).toBeDefined();

      await expect(service.verifyPhoneOtp('+2348012345678', result.code!)).resolves.toBe(true);
      await expect(service.verifyPhoneOtp('+2348012345678', '000000')).resolves.toBe(false);
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = originalNodeEnv;
      }

      if (originalAllowOtpDebug === undefined) {
        delete process.env.ALLOW_OTP_DEBUG;
      } else {
        process.env.ALLOW_OTP_DEBUG = originalAllowOtpDebug;
      }
    }
  });

  it('requires a real SMS provider in production and blocks silent debugging', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalAllowOtpDebug = process.env.ALLOW_OTP_DEBUG;
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_OTP_DEBUG;

    const smsService = {
      sendOtpSms: jest.fn().mockResolvedValue({
        success: false,
        error: 'No SMS provider configured. Set SMS_PROVIDER and the provider credentials in your environment.',
      }),
    };

    const service = new PatientPortalService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      smsService as any,
    );

    try {
      const result = await service.sendPhoneOtp('+2348012345678');

      expect(result.success).toBe(false);
      expect(result.code).toBeUndefined();
      expect(result.error).toMatch(/SMS provider|configured/i);
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
      if (originalAllowOtpDebug === undefined) {
        delete process.env.ALLOW_OTP_DEBUG;
      } else {
        process.env.ALLOW_OTP_DEBUG = originalAllowOtpDebug;
      }
    }
  });
});
