import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PatientsService } from './patients.service';

describe('PatientsService', () => {
  it('scopes patient listings to the current clinic when no clinicId is supplied', async () => {
    const patientRepository = {
      findAndCount: jest.fn().mockResolvedValue([[{ id: 'patient-1', clinicId: 'clinic-123' }], 1]),
    };

    const service = new PatientsService(patientRepository as any, {} as any);

    const result = await service.findAll({ page: 1, limit: 10 } as any, { clinicId: 'clinic-123' });

    expect(patientRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ clinicId: 'clinic-123' }),
      }),
    );

    expect(result).toEqual({
      data: [{ id: 'patient-1', clinicId: 'clinic-123' }],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('forces the authenticated clinic onto patient creation', async () => {
    const patientRepository = {
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ ...dto, id: 'patient-2' })),
    };

    const service = new PatientsService(patientRepository as any, {} as any);

    const result = await service.create({ firstName: 'Ada', clinicId: 'other-clinic' } as any, { clinicId: 'clinic-123' });

    expect(patientRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Ada',
        clinicId: 'clinic-123',
      }),
    );

    expect(result).toMatchObject({ firstName: 'Ada', clinicId: 'clinic-123', id: 'patient-2' });
  });

  it('defaults a new patient to the staff branch when the form omits it', async () => {
    const patientRepository = {
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ ...dto, id: 'patient-branch' })),
      findOne: jest.fn().mockResolvedValue(null),
    };

    const membershipRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ ...dto, id: 'membership-branch' })),
    };

    const service = new PatientsService(patientRepository as any, {} as any, membershipRepository as any);

    await service.create(
      { firstName: 'Ada', phone: '08030000000' } as any,
      { clinicId: 'clinic-123', branchId: 'branch-9' },
    );

    expect(patientRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ clinicId: 'clinic-123', branchId: 'branch-9' }),
    );
    expect(membershipRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ patientId: 'patient-branch', clinicId: 'clinic-123', branchId: 'branch-9' }),
    );
  });

  it('does not reuse the clinic ID as a branch ID when a real branch is not assigned', async () => {
    const patientRepository = {
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ ...dto, id: 'patient-3' })),
    };

    const service = new PatientsService(patientRepository as any, {} as any);

    await service.create({ firstName: 'Grace', clinicId: 'clinic-123', branchId: 'clinic-123' } as any, { clinicId: 'clinic-123' });

    const payload = patientRepository.create.mock.calls[0][0];
    expect(payload.clinicId).toBe('clinic-123');
    expect(payload.branchId).toBeUndefined();
  });

  it('creates a clinic membership so the patient portal can list the clinic', async () => {
    const patientRepository = {
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ ...dto, id: 'patient-4' })),
      findOne: jest.fn().mockResolvedValue(null),
    };

    const membershipRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ ...dto, id: 'membership-1' })),
    };

    const service = new PatientsService(patientRepository as any, {} as any, membershipRepository as any);

    await service.create(
      { firstName: 'Ada', phone: '08030000000' } as any,
      { clinicId: 'clinic-123' },
    );

    expect(membershipRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: 'patient-4',
        clinicId: 'clinic-123',
        isPrimary: true,
        isActive: true,
      }),
    );
    expect(membershipRepository.save).toHaveBeenCalled();
  });

  it('rejects a new patient when the email belongs to a different name', async () => {
    const existing = {
      id: 'patient-portal',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      portalAccessEnabled: true,
      clinicId: null,
      branchId: null,
    };

    const patientRepository = {
      findOne: jest.fn().mockResolvedValue(existing),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => dto),
    };

    const service = new PatientsService(patientRepository as any, {} as any);

    await expect(
      service.create(
        {
          firstName: 'Grace',
          lastName: 'Hopper',
          email: 'ada@example.com',
          phone: '08030000000',
        } as any,
        { clinicId: 'clinic-123' },
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    await expect(
      service.create(
        {
          firstName: 'Grace',
          lastName: 'Hopper',
          email: 'ADA@example.com',
          phone: '08030000000',
        } as any,
        { clinicId: 'clinic-123' },
      ),
    ).rejects.toThrow(/Ada Lovelace/);

    expect(patientRepository.save).not.toHaveBeenCalled();
  });

  it('adopts the existing account when the name only differs by case and spacing', async () => {
    const existing = {
      id: 'patient-portal',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      portalAccessEnabled: true,
      clinicId: null,
      branchId: null,
    };

    const patientRepository = {
      findOne: jest.fn().mockImplementation(({ where }: any) =>
        Promise.resolve(
          where.id
            ? { ...existing, clinicId: 'clinic-123', branchId: 'branch-1' }
            : existing,
        ),
      ),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => dto),
    };

    const service = new PatientsService(patientRepository as any, {} as any);

    const result = await service.create(
      {
        firstName: '  ada ',
        lastName: 'LOVELACE',
        email: ' Ada@Example.com ',
        phone: '08030000000',
      } as any,
      { clinicId: 'clinic-123', branchId: 'branch-1' },
    );

    expect(patientRepository.create).not.toHaveBeenCalled();
    expect(result).toMatchObject({ id: 'patient-portal', clinicId: 'clinic-123' });
  });

  it('reuses a dependent profile added by the guardian instead of duplicating it', async () => {
    const dependent = {
      id: 'dependent-1',
      firstName: 'Amir',
      lastName: 'Gambo',
      email: 'amir@example.com',
      portalAccessEnabled: false,
      guardianId: 'guardian-1',
      clinicId: null,
      branchId: null,
    };

    const patientRepository = {
      findOne: jest.fn().mockImplementation(({ where }: any) =>
        Promise.resolve(where.id ? { ...dependent, clinicId: 'clinic-123' } : dependent),
      ),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => dto),
      find: jest.fn().mockResolvedValue([]),
    };

    const membershipRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => dto),
    };

    const service = new PatientsService(patientRepository as any, {} as any, membershipRepository as any);

    const result = await service.create(
      {
        firstName: 'Amir',
        lastName: 'Gambo',
        email: 'amir@example.com',
        phone: '08030000000',
      } as any,
      { clinicId: 'clinic-123', branchId: 'branch-1' },
    );

    expect(patientRepository.create).not.toHaveBeenCalled();
    expect(result).toMatchObject({ id: 'dependent-1', clinicId: 'clinic-123' });
    expect(membershipRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ patientId: 'dependent-1', clinicId: 'clinic-123' }),
    );
  });

  it('attaches the guardian clinic to dependents that were created without one', async () => {
    const guardian = {
      id: 'guardian-1',
      firstName: 'Abu',
      lastName: 'Gambo',
      email: 'abu@example.com',
      portalAccessEnabled: true,
      clinicId: null,
      branchId: null,
    };

    const dependents = [
      { id: 'dependent-1', firstName: 'Amir', lastName: 'Gambo', guardianId: 'guardian-1', clinicId: null, branchId: null },
      { id: 'dependent-2', firstName: 'Amina', lastName: 'Gambo', guardianId: 'guardian-1', clinicId: null, branchId: null },
      {
        id: 'dependent-3',
        firstName: 'Gambo',
        lastName: 'Gambo',
        guardianId: 'guardian-1',
        clinicId: 'other-clinic',
        branchId: 'other-branch',
      },
    ];

    const patientRepository = {
      findOne: jest.fn().mockImplementation(({ where }: any) =>
        Promise.resolve(where.id ? { ...guardian, clinicId: 'clinic-123' } : guardian),
      ),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => dto),
      find: jest.fn().mockResolvedValue(dependents),
    };

    const membershipRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => dto),
    };

    const service = new PatientsService(patientRepository as any, {} as any, membershipRepository as any);

    await service.create(
      { firstName: 'Abu', lastName: 'Gambo', email: 'abu@example.com', phone: '08030000000' } as any,
      { clinicId: 'clinic-123', branchId: 'branch-1' },
    );

    expect(patientRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'dependent-1', clinicId: 'clinic-123', branchId: 'branch-1' }),
    );
    expect(patientRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'dependent-2', clinicId: 'clinic-123', branchId: 'branch-1' }),
    );
    expect(patientRepository.save).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: 'dependent-3', clinicId: 'clinic-123' }),
    );
    expect(membershipRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ patientId: 'dependent-1', clinicId: 'clinic-123', branchId: 'branch-1' }),
    );
    expect(membershipRepository.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ patientId: 'dependent-3', clinicId: 'clinic-123' }),
    );
  });

  it('registers a family member under the selected guardian', async () => {
    const guardian = {
      id: 'guardian-1',
      firstName: 'Abu',
      lastName: 'Gambo',
      email: 'abu@example.com',
      guardianId: null,
      clinicId: 'clinic-123',
      branchId: 'branch-1',
    };

    const patientRepository = {
      findOne: jest.fn().mockImplementation(({ where }: any) => {
        if (where.id === 'guardian-1') return Promise.resolve(guardian);
        if (where.id === 'patient-new') {
          return Promise.resolve({
            id: 'patient-new',
            firstName: 'Amir',
            lastName: 'Gambo',
            guardianId: 'guardian-1',
            guardianRelationship: 'child',
            clinicId: 'clinic-123',
          });
        }
        return Promise.resolve(null);
      }),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ ...dto, id: 'patient-new' })),
      find: jest.fn().mockResolvedValue([]),
    };

    const membershipRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => dto),
    };

    const service = new PatientsService(patientRepository as any, {} as any, membershipRepository as any);

    const result = await service.create(
      {
        firstName: 'Amir',
        lastName: 'Gambo',
        phone: '08030000000',
        guardianId: 'guardian-1',
        guardianRelationship: 'child',
      } as any,
      { clinicId: 'clinic-123', branchId: 'branch-1' },
    );

    expect(patientRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        guardianId: 'guardian-1',
        guardianRelationship: 'child',
        clinicId: 'clinic-123',
      }),
    );
    expect(result).toMatchObject({ id: 'patient-new', guardianId: 'guardian-1' });
  });

  it('refuses to link a guardian from another clinic', async () => {
    const patientRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'guardian-1',
        firstName: 'Other',
        lastName: 'Guardian',
        guardianId: null,
        clinicId: 'other-clinic',
      }),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => dto),
    };

    const service = new PatientsService(patientRepository as any, {} as any);

    await expect(
      service.create(
        {
          firstName: 'Amir',
          lastName: 'Gambo',
          phone: '08030000000',
          guardianId: 'guardian-1',
          guardianRelationship: 'child',
        } as any,
        { clinicId: 'clinic-123' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(patientRepository.save).not.toHaveBeenCalled();
  });

  it('refuses to make a dependent the guardian of another patient', async () => {
    const patientRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'dependent-9',
        firstName: 'Existing',
        lastName: 'Dependent',
        guardianId: 'guardian-1',
        clinicId: 'clinic-123',
      }),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => dto),
    };

    const service = new PatientsService(patientRepository as any, {} as any);

    await expect(
      service.create(
        {
          firstName: 'Amir',
          lastName: 'Gambo',
          phone: '08030000000',
          guardianId: 'dependent-9',
          guardianRelationship: 'child',
        } as any,
        { clinicId: 'clinic-123' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
