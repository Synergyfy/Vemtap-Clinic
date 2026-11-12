import * as bcrypt from 'bcryptjs';
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

  it('blocks registration when the email or phone belongs to an activated account', async () => {
    const existing = {
      id: 'existing-patient',
      email: 'new@example.com',
      phone: '+2348000000000',
      portalAccessEnabled: true,
      patientPassword: 'hashed-password',
    };

    const patientRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }) => (where.email === 'new@example.com' ? existing : null)),
      createQueryBuilder: jest.fn(() => ({
        where: () => ({ getOne: async () => existing }),
      })),
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

  it('claims the clinic-created record when the patient registers with the same email and phone', async () => {
    const clinicRecord = {
      id: 'patient-1',
      firstName: 'Clinic',
      lastName: 'Record',
      email: 'clinic.patient@example.com',
      phone: '08030000000',
      clinicId: 'clinic-9',
      branchId: null,
      portalAccessEnabled: false,
      patientPassword: null,
    };

    const patientRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }) => (where.email === clinicRecord.email ? clinicRecord : null)),
      createQueryBuilder: jest.fn(() => ({
        where: () => ({ getOne: async () => clinicRecord }),
      })),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => dto),
    };

    const membershipRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ ...dto, id: 'membership-1' })),
    };

    const service = new PatientPortalService(
      patientRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { sign: jest.fn(() => 'access-token') } as any,
      {} as any,
      {} as any,
      membershipRepo as any,
      { get: jest.fn() } as any,
    );

    const result = await service.register({
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '2000-01-15',
      gender: 'female',
      phone: '+2348030000000',
      email: 'clinic.patient@example.com',
      password: 'password123',
    } as any);

    expect(result.patient.id).toBe('patient-1');
    expect(patientRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'patient-1',
        clinicId: 'clinic-9',
        email: 'clinic.patient@example.com',
        portalAccessEnabled: true,
      }),
    );
    expect(patientRepo.create).not.toHaveBeenCalled();
    expect(membershipRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ patientId: 'patient-1', clinicId: 'clinic-9' }),
    );
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
      sendInvite: true,
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
      sendInvite: true,
    });

    const activation = await service.activateFamilyMember(invite.invitationId!, {
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

  it('keeps guardian family metadata on the patient auth payload for dependent accounts', async () => {
    const patientRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'dependent-123',
        firstName: 'Sam',
        lastName: 'Doe',
        email: 'dependent@example.com',
        phone: '+2348000000001',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        guardianId: 'guardian-1',
        guardianRelationship: 'child',
        portalAccessEnabled: true,
        patientPassword: await bcrypt.hash('password123', 10),
      }),
    };

    const service = new PatientPortalService(
      patientRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { sign: jest.fn().mockReturnValue('token-123') } as any,
      {} as any,
      {} as any,
    );

    const login = await service.login({ email: 'dependent@example.com', password: 'password123' } as any);

    expect(login.patient.guardianId).toBe('guardian-1');
    expect(login.patient.guardianRelationship).toBe('child');
    expect(login.patient.id).toBe('dependent-123');
  });

  it('marks a guardian-family registration as a family-linked account instead of a plain individual account', async () => {
    const patientRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn(async (dto) => ({ ...dto, id: 'guardian-123' })),
    };

    const service = new PatientPortalService(
      patientRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { sign: jest.fn().mockReturnValue('token-guardian') } as any,
      {} as any,
      {} as any,
    );

    const result = await service.register({
      firstName: 'Mary',
      lastName: 'James',
      dateOfBirth: '1985-05-10',
      gender: 'female',
      phone: '+2348001234567',
      email: 'guardian@example.com',
      password: 'password123',
      accountType: 'guardian',
    } as any);

    expect(result.patient.guardianRelationship).toBe('guardian');
    expect(patientRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      guardianRelationship: 'guardian',
    }));
  });

  it('refreshes a patient session from a valid patient-refresh token', async () => {
    const patientRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'patient-1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'patient@example.com',
        phone: '+2348000000000',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        portalAccessEnabled: true,
      }),
    };

    const jwtService = {
      verify: jest.fn().mockReturnValue({ sub: 'patient-1', type: 'patient-refresh' }),
      sign: jest.fn().mockReturnValueOnce('new-access-token').mockReturnValueOnce('new-refresh-token'),
    };

    const service = new PatientPortalService(
      patientRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      jwtService as any,
      {} as any,
      {} as any,
    );

    const result = await service.refreshSession('old-refresh-token');

    expect(jwtService.verify).toHaveBeenCalledWith('old-refresh-token');
    expect(result.tokens).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    expect(result.patient.id).toBe('patient-1');
  });

  it('rejects refresh tokens that were not issued for the patient portal', async () => {
    const jwtService = {
      verify: jest.fn().mockReturnValue({ sub: 'user-1', type: 'user' }),
      sign: jest.fn(),
    };

    const service = new PatientPortalService(
      { findOne: jest.fn() } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      jwtService as any,
      {} as any,
      {} as any,
    );

    await expect(service.refreshSession('staff-token')).rejects.toThrow(/Invalid refresh token/);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('lists the guardian, dependent profiles and pending invitations for the family group', async () => {
    const guardian = {
      id: 'guardian-1',
      firstName: 'Mary',
      lastName: 'James',
      email: 'guardian@example.com',
      phone: '+2348000000000',
      guardianId: null,
      guardianRelationship: 'guardian',
      portalAccessEnabled: true,
    };
    const dependent = {
      id: 'dependent-1',
      firstName: 'Sam',
      lastName: 'James',
      email: 'sam@example.com',
      phone: '+2348000000001',
      guardianId: 'guardian-1',
      guardianRelationship: 'child',
      portalAccessEnabled: true,
    };

    const patientRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }) => {
        if (where.id === 'guardian-1') return guardian;
        return null;
      }),
      find: jest.fn().mockResolvedValue([dependent]),
    };

    const service = new PatientPortalService(
      patientRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { sendTemplatedEmail: jest.fn().mockResolvedValue({ success: true }) } as any,
      {} as any,
    );

    const result = await service.getFamilyProfiles('guardian-1');

    expect(result.primary?.id).toBe('guardian-1');
    expect(result.members).toHaveLength(1);
    expect(result.members[0]).toEqual(
      expect.objectContaining({ id: 'dependent-1', relationship: 'child', status: 'active' }),
    );
    expect(result.pendingInvites).toHaveLength(0);
  });

  it('creates the dependent profile immediately so it is usable before activation', async () => {
    const patients: any[] = [
      {
        id: 'guardian-1',
        firstName: 'Mary',
        lastName: 'James',
        email: 'guardian@example.com',
        phone: '+2348000000000',
        guardianId: null,
        guardianRelationship: 'guardian',
        portalAccessEnabled: true,
      },
    ];

    const patientRepo = {
      findOne: jest.fn(async ({ where }) => {
        if (where.id) return patients.find((patient) => patient.id === where.id) ?? null;
        if (where.email) return patients.find((patient) => patient.email === where.email) ?? null;
        if (where.phone) return patients.find((patient) => patient.phone === where.phone) ?? null;
        return null;
      }),
      find: jest.fn(async ({ where }) =>
        patients.filter((patient) => patient.guardianId === where.guardianId),
      ),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => {
        const saved = dto.id ? dto : { ...dto, id: `dependent-${patients.length}` };
        const index = patients.findIndex((patient) => patient.id === saved.id);
        if (index >= 0) {
          patients[index] = saved;
        } else {
          patients.push(saved);
        }
        return saved;
      }),
    };

    const service = new PatientPortalService(
      patientRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { sendTemplatedEmail: jest.fn().mockResolvedValue({ success: true }) } as any,
      {} as any,
    );

    const invite = await service.createFamilyMemberInvite('guardian-1', {
      fullName: 'Joy Johnson',
      email: 'joy@example.com',
      relationship: 'child',
      dateOfBirth: '2016-05-12',
      gender: 'female',
    });

    expect(invite.patientId).toBeTruthy();
    expect(patientRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Joy',
        lastName: 'Johnson',
        email: 'joy@example.com',
        guardianId: 'guardian-1',
        guardianRelationship: 'child',
        portalAccessEnabled: false,
      }),
    );

    const result = await service.getFamilyProfiles('guardian-1');

    expect(result.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: invite.patientId, fullName: 'Joy Johnson', status: 'pending' }),
      ]),
    );
    expect(result.pendingInvites).toHaveLength(0);
  });

  it('does not email the activation link when a family member is added', async () => {
    const patients: any[] = [
      {
        id: 'guardian-1',
        firstName: 'Mary',
        lastName: 'James',
        email: 'guardian@example.com',
        guardianRelationship: 'guardian',
        portalAccessEnabled: true,
      },
    ];

    const patientRepo = {
      findOne: jest.fn(async ({ where }) => {
        if (where.id) return patients.find((patient) => patient.id === where.id) ?? null;
        if (where.email) return patients.find((patient) => patient.email === where.email) ?? null;
        return null;
      }),
      find: jest.fn(async ({ where }) =>
        patients.filter((patient) => patient.guardianId === where.guardianId),
      ),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => {
        const saved = dto.id ? dto : { ...dto, id: `dependent-${patients.length}` };
        patients.push(saved);
        return saved;
      }),
    };
    const emailService = { sendTemplatedEmail: jest.fn() };
    const invitationRepo = {
      update: jest.fn(async () => ({})),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => dto),
      find: jest.fn(async () => []),
      findOne: jest.fn(async () => null),
      delete: jest.fn(async () => ({})),
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
      undefined,
      undefined,
      invitationRepo as any,
    );

    const result = await service.createFamilyMemberInvite('guardian-1', {
      fullName: 'Joy Johnson',
      email: 'joy@example.com',
      relationship: 'child',
    });

    expect(result.patientId).toBeTruthy();
    expect(result.emailSent).toBe(false);
    expect(result.invitationId).toBeUndefined();
    expect(emailService.sendTemplatedEmail).not.toHaveBeenCalled();
    expect(invitationRepo.save).not.toHaveBeenCalled();
    expect(patients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: 'joy@example.com', guardianId: 'guardian-1', portalAccessEnabled: false }),
      ]),
    );
  });

  it('sends the activation invite only when the guardian requests it', async () => {
    const patients: any[] = [
      {
        id: 'guardian-1',
        firstName: 'Mary',
        lastName: 'James',
        email: 'guardian@example.com',
        guardianRelationship: 'guardian',
        portalAccessEnabled: true,
      },
      {
        id: 'stranger-1',
        firstName: 'Not',
        lastName: 'Family',
        email: 'stranger@example.com',
        portalAccessEnabled: true,
      },
    ];

    const patientRepo = {
      findOne: jest.fn(async ({ where }) => {
        if (where.id) return patients.find((patient) => patient.id === where.id) ?? null;
        if (where.email) return patients.find((patient) => patient.email === where.email) ?? null;
        return null;
      }),
      find: jest.fn(async ({ where }) =>
        patients.filter((patient) => patient.guardianId === where.guardianId),
      ),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => {
        const saved = dto.id ? dto : { ...dto, id: `dependent-${patients.length}` };
        const index = patients.findIndex((patient) => patient.id === saved.id);
        if (index >= 0) {
          patients[index] = saved;
        } else {
          patients.push(saved);
        }
        return saved;
      }),
    };
    const emailService = { sendTemplatedEmail: jest.fn().mockResolvedValue({ success: true }) };
    const invitationRepo = {
      update: jest.fn(async () => ({})),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => dto),
      find: jest.fn(async () => []),
      findOne: jest.fn(async () => null),
      delete: jest.fn(async () => ({})),
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
      undefined,
      undefined,
      invitationRepo as any,
    );

    const added = await service.createFamilyMemberInvite('guardian-1', {
      fullName: 'Joy Johnson',
      email: 'joy@example.com',
      relationship: 'child',
    });
    expect(emailService.sendTemplatedEmail).not.toHaveBeenCalled();

    const invited = await service.sendFamilyActivationInvite('guardian-1', added.patientId);

    expect(emailService.sendTemplatedEmail).toHaveBeenCalledTimes(1);
    expect(invited.invitationId).toBeTruthy();
    expect(invited.emailSent).toBe(true);
    expect(invitationRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ patientId: added.patientId, email: 'joy@example.com' }),
    );

    await expect(service.sendFamilyActivationInvite('guardian-1', 'stranger-1')).rejects.toThrow(
      /access to this family profile/i,
    );
  });

  it('activates the profile created at invite time instead of creating a duplicate', async () => {
    const patients: any[] = [
      {
        id: 'guardian-1',
        firstName: 'Mary',
        lastName: 'James',
        email: 'guardian@example.com',
        guardianRelationship: 'guardian',
        portalAccessEnabled: true,
      },
    ];

    const patientRepo = {
      findOne: jest.fn(async ({ where }) => {
        if (where.id) return patients.find((patient) => patient.id === where.id) ?? null;
        if (where.email) return patients.find((patient) => patient.email === where.email) ?? null;
        if (where.phone) return patients.find((patient) => patient.phone === where.phone) ?? null;
        return null;
      }),
      find: jest.fn(async ({ where }) =>
        patients.filter((patient) => patient.guardianId === where.guardianId),
      ),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => {
        const saved = dto.id ? dto : { ...dto, id: `dependent-${patients.length}` };
        const index = patients.findIndex((patient) => patient.id === saved.id);
        if (index >= 0) {
          patients[index] = saved;
        } else {
          patients.push(saved);
        }
        return saved;
      }),
    };

    const service = new PatientPortalService(
      patientRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { sendTemplatedEmail: jest.fn().mockResolvedValue({ success: true }) } as any,
      {} as any,
    );

    const invite = await service.createFamilyMemberInvite('guardian-1', {
      fullName: 'Joy Johnson',
      email: 'joy@example.com',
      relationship: 'child',
      dateOfBirth: '2016-05-12',
      gender: 'female',
      sendInvite: true,
    });

    const activation = await service.activateFamilyMember(invite.invitationId!, {
      fullName: 'Joy Johnson',
      dateOfBirth: '2016-05-12',
      gender: 'female',
      phone: '+2348000000009',
      password: 'newPassword123',
    });

    expect(activation.success).toBe(true);
    expect(activation.patient.id).toBe(invite.patientId);
    expect(activation.patient.portalAccessEnabled).toBe(true);
    expect(patients.filter((patient) => patient.email === 'joy@example.com')).toHaveLength(1);
  });

  it('lets a guardian switch to a family profile but rejects unrelated patients', async () => {
    const patients = [
      { id: 'guardian-1', guardianId: null, portalAccessEnabled: true },
      { id: 'dependent-1', guardianId: 'guardian-1', portalAccessEnabled: false },
      { id: 'stranger-1', guardianId: null, portalAccessEnabled: true },
    ];

    const patientRepo = {
      findOne: jest.fn(async ({ where }) => patients.find((patient) => patient.id === where.id) ?? null),
    };

    const service = new PatientPortalService(patientRepo as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any);

    await expect(service.resolvePatientId('guardian-1', 'dependent-1')).resolves.toBe('dependent-1');
    await expect(service.resolvePatientId('guardian-1')).resolves.toBe('guardian-1');
    await expect(service.resolvePatientId('guardian-1', 'stranger-1')).rejects.toThrow(/access to this family profile/i);
  });

  it('resolves the guardian group when a dependent views the family list', async () => {
    const guardian = {
      id: 'guardian-1',
      firstName: 'Mary',
      lastName: 'James',
      email: 'guardian@example.com',
      guardianRelationship: 'guardian',
    };
    const dependent = {
      id: 'dependent-1',
      firstName: 'Sam',
      lastName: 'James',
      email: 'sam@example.com',
      guardianId: 'guardian-1',
      guardianRelationship: 'child',
    };

    const patientRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }) => {
        if (where.id === 'dependent-1') return dependent;
        if (where.id === 'guardian-1') return guardian;
        return null;
      }),
      find: jest.fn().mockResolvedValue([dependent]),
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

    const result = await service.getFamilyProfiles('dependent-1');

    expect(result.primary?.id).toBe('guardian-1');
    expect(result.members.map((member) => member.id)).toEqual(['dependent-1']);
  });

  it('persists family invitations so pending members survive an API restart', async () => {
    const invitations: any[] = [];
    const invitationRepo = {
      update: jest.fn(async () => ({})),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => {
        invitations.push(dto);
        return dto;
      }),
      find: jest.fn(async ({ where }) =>
        invitations.filter((invitation) => invitation.guardianId === where.guardianId && !invitation.used),
      ),
      findOne: jest.fn(async ({ where }) => invitations.find((invitation) => invitation.token === where.token) ?? null),
      delete: jest.fn(async () => ({})),
    };

    const guardian = {
      id: 'guardian-1',
      firstName: 'Mary',
      lastName: 'James',
      email: 'guardian@example.com',
      guardianRelationship: 'guardian',
    };
    const patientRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }) => (where.id === 'guardian-1' ? guardian : null)),
      find: jest.fn().mockResolvedValue([]),
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
      { sendTemplatedEmail: jest.fn().mockResolvedValue({ success: true }) } as any,
      {} as any,
      undefined,
      undefined,
      invitationRepo as any,
    );

    const invite = await service.createFamilyMemberInvite('guardian-1', {
      fullName: 'Joy Johnson',
      email: 'joy@example.com',
      relationship: 'child',
      sendInvite: true,
    });

    expect(invitationRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ guardianId: 'guardian-1', email: 'joy@example.com', used: false }),
    );

    const result = await service.getFamilyProfiles('guardian-1');

    expect(result.pendingInvites).toHaveLength(0);
    expect(result.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fullName: 'Joy Johnson', email: 'joy@example.com', status: 'pending' }),
      ]),
    );
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

  it('rejects adding family members from a dependent profile', async () => {
    const patientRepo = {
      findOne: jest.fn(async ({ where }) => {
        if (where.id === 'dependent-1') {
          return { id: 'dependent-1', guardianId: 'guardian-1', portalAccessEnabled: true };
        }
        return null;
      }),
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
      service.createFamilyMemberInvite('dependent-1', {
        fullName: 'New Member',
        email: 'new@example.com',
        relationship: 'child',
      }),
    ).rejects.toThrow(/only the family owner/i);
  });

  it('returns only the selected profile lens orders', async () => {
    const lensOrders = [
      { id: 'lens-1', patientId: 'guardian-1', lensType: 'Single vision' },
      { id: 'lens-2', patientId: 'dependent-1', lensType: 'Bifocal' },
    ];
    const lensOrderRepo = {
      find: jest.fn(async ({ where }) => lensOrders.filter((order) => order.patientId === where.patientId)),
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
      undefined,
      undefined,
      undefined,
      lensOrderRepo as any,
    );

    await expect(service.getMyLensOrders('dependent-1')).resolves.toEqual([
      expect.objectContaining({ id: 'lens-2', patientId: 'dependent-1' }),
    ]);
    expect(lensOrderRepo.find).toHaveBeenCalledWith({
      where: { patientId: 'dependent-1' },
      order: { createdAt: 'DESC' },
    });
  });

  it('returns an empty lens order list when the repository is unavailable', async () => {
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
    );

    await expect(service.getMyLensOrders('dependent-1')).resolves.toEqual([]);
  });
});
