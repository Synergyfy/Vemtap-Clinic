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

  it('creates and remembers multiple clinic memberships for the same patient', async () => {
    const membershipRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([
        { clinicId: 'clinic-1', branchId: 'branch-1', isPrimary: true },
        { clinicId: 'clinic-2', branchId: 'branch-2', isPrimary: false },
      ]),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ ...dto, id: 'membership-123' })),
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
      {} as any,
      membershipRepo as any,
    );

    await expect((service as any).ensurePatientClinicMembership('patient-1', 'clinic-2', 'branch-2')).resolves.toEqual({
      clinicId: 'clinic-2',
      branchId: 'branch-2',
      membershipId: 'membership-123',
    });

    expect(membershipRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: 'patient-1',
        clinicId: 'clinic-2',
        branchId: 'branch-2',
      }),
    );
  });

  it('blocks registration when the email or phone is already in use', async () => {
    const patientRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }) => {
        if (where.email === 'new@example.com') return null;
        if (where.phone === '+2348000000000') return { id: 'existing-patient' };
        return null;
      }),
      create: jest.fn((dto) => dto),
      save: jest.fn(),
    };

    const service = new PatientPortalService(
      patientRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await expect(
      service.register({
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: '2000-01-15',
        gender: 'female',
        phone: '+2348000000000',
        email: 'new@example.com',
        password: 'password123',
      } as any),
    ).rejects.toThrow(/already.*(email|phone)|already.*registered/i);

    expect(patientRepo.save).not.toHaveBeenCalled();
  });

  it('sends and verifies an email OTP for patient registration', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalAllowOtpDebug = process.env.ALLOW_OTP_DEBUG;
    process.env.NODE_ENV = 'development';
    delete process.env.ALLOW_OTP_DEBUG;

    const emailService = {
      sendTemplatedEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'email-otp' }),
    };

    const service = new PatientPortalService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      emailService as any,
      {} as any,
    );

    try {
      const result = await service.sendEmailOtp('patient@example.com');

      expect(result.success).toBe(true);
      expect(result.code).toBeUndefined();
      expect(result.expiresAt).toBeDefined();

      await expect(service.verifyEmailOtp('patient@example.com', result.code || '000000')).resolves.toBe(false);
      const actualCode = (emailService.sendTemplatedEmail as jest.Mock).mock.calls[0][2].code;
      await expect(service.verifyEmailOtp('patient@example.com', actualCode)).resolves.toBe(true);
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

  it('creates a family activation invite for a guardian and stores a valid activation token', async () => {
    const patientRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }) => {
        if (where.id === 'guardian-1') {
          return { id: 'guardian-1', firstName: 'Jane', lastName: 'Doe', email: 'guardian@example.com' };
        }
        if (where.email === 'dependent@example.com') {
          return null;
        }
        return null;
      }),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ ...dto, id: 'dependent-123' })),
    };

    const emailService = {
      sendTemplatedEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'family-invite' }),
    };

    const service = new PatientPortalService(
      patientRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      emailService as any,
      {} as any,
    );

    const result = await service.createFamilyMemberInvite('guardian-1', {
      fullName: 'Sam Doe',
      email: 'dependent@example.com',
      relationship: 'child',
    });

    expect(result.success).toBe(true);
    expect(result.invitationId).toBeTruthy();
    expect(result.activationUrl).toContain('/patient/family/activate?token=');
    expect(emailService.sendTemplatedEmail).toHaveBeenCalledWith(
      'family-activation',
      'dependent@example.com',
      expect.objectContaining({
        guardianName: 'Jane Doe',
        fullName: 'Sam Doe',
      }),
    );
  });

  it('activates a dependent profile with a guardian invite and gives the dependent a separate login', async () => {
    const patientRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }) => {
        if (where.id === 'guardian-1') {
          return { id: 'guardian-1', firstName: 'Jane', lastName: 'Doe', email: 'guardian@example.com' };
        }
        if (where.email === 'dependent@example.com') return null;
        if (where.phone === '+2348000000001') return null;
        return null;
      }),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ ...dto, id: 'dependent-123' })),
    };

    const service = new PatientPortalService(
      patientRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { sendTemplatedEmail: jest.fn() } as any,
      {} as any,
    );

    const invite = await service.createFamilyMemberInvite('guardian-1', {
      fullName: 'Sam Doe',
      email: 'dependent@example.com',
      relationship: 'child',
    });

    const activation = await service.activateFamilyMember(invite.invitationId, {
      fullName: 'Sam Doe',
      dateOfBirth: '2015-04-12',
      gender: 'male',
      phone: '+2348000000001',
      password: 'newPassword123',
    });

    expect(activation.success).toBe(true);
    expect(activation.patient.guardianId).toBe('guardian-1');
    expect(activation.patient.guardianRelationship).toBe('child');
    expect(activation.patient.email).toBe('dependent@example.com');
    expect(activation.patient.portalAccessEnabled).toBe(true);
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
