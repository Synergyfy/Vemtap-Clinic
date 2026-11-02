import { Not, IsNull, In } from 'typeorm';
import { UserRole } from '../entities/user.entity';
import { ClinicsService } from './clinics.service';

describe('ClinicsService', () => {
  it('treats the default seeded demo clinic as a placeholder', () => {
    const service = new ClinicsService({} as any, {} as any, {} as any, {} as any);

    expect(service.isDemoClinic({ name: 'Local Test Clinic', email: 'clinic@example.com' })).toBe(true);
    expect(service.isDemoClinic({ name: 'Real Eye Clinic', email: 'real@clinic.com' })).toBe(false);
  });

  it('counts only active users attached to a clinic for the platform summary', async () => {
    const userRepo = {
      count: jest.fn().mockResolvedValue(0),
    };

    const clinicRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    const invoiceRepo = {
      count: jest.fn().mockResolvedValue(0),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: '0' }),
      }),
    };

    const claimRepo = {
      count: jest.fn().mockResolvedValue(0),
    };

    const service = new ClinicsService(clinicRepo as any, userRepo as any, invoiceRepo as any, claimRepo as any);

    await service.getPlatformOverview();

    expect(userRepo.count).toHaveBeenCalledWith({
      where: {
        isActive: true,
        clinicId: Not(IsNull()),
      },
    });
  });

  it('scopes the platform overview to the authenticated tenant owner', async () => {
    const clinicRepo = {
      find: jest.fn().mockResolvedValue([
        { id: 'clinic-1', name: 'Alpha', isActive: true, createdAt: new Date() },
      ]),
    };

    const userRepo = {
      count: jest.fn().mockResolvedValue(2),
    };

    const invoiceRepo = {
      count: jest.fn().mockResolvedValue(0),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: '0' }),
      }),
    };

    const claimRepo = {
      count: jest.fn().mockResolvedValue(0),
    };

    const service = new ClinicsService(clinicRepo as any, userRepo as any, invoiceRepo as any, claimRepo as any);

    await service.getPlatformOverview({ userId: 'user-42', clinicId: null, roles: ['admin'] });

    expect(clinicRepo.find).toHaveBeenCalledWith({
      where: { ownerId: 'user-42' },
      order: { createdAt: 'DESC' },
    });
    expect(userRepo.count).toHaveBeenCalledWith({
      where: {
        isActive: true,
        clinicId: In(['clinic-1']),
      },
    });
  });

  it('lists only clinics owned by the current user in a tenant-scoped account', async () => {
    const where = jest.fn().mockReturnThis();
    const andWhere = jest.fn().mockReturnThis();
    const orderBy = jest.fn().mockReturnThis();
    const getMany = jest.fn().mockResolvedValue([{ id: 'clinic-1' }]);

    const clinicRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where,
        andWhere,
        orderBy,
        getMany,
      }),
    };

    const service = new ClinicsService(clinicRepo as any, {} as any, {} as any, {} as any);

    await service.findAll({} as any, { userId: 'user-42', clinicId: null, roles: ['admin'] });

    expect(where).toHaveBeenCalledWith('clinic.ownerId = :ownerId', { ownerId: 'user-42' });
  });

  it('assigns a newly created clinic to its owner in a multi-tenant setup', async () => {
    const clinicRepo = {
      create: jest.fn((dto) => ({ ...dto, id: 'clinic-123' })),
      save: jest.fn(async (clinic) => clinic),
    };

    const userRepo = {
      update: jest.fn().mockResolvedValue(undefined),
    };

    const service = new ClinicsService(clinicRepo as any, userRepo as any, {} as any, {} as any);

    await service.create({
      name: 'Sunrise Eye Clinic',
      city: 'Lagos',
      state: 'Nigeria',
      address: '24 Ikoyi Road',
      phone: '+2348012345678',
      email: 'sunrise@clinic.com',
    }, 'user-42');

    expect(clinicRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Sunrise Eye Clinic',
      ownerId: 'user-42',
    }));
    expect(userRepo.update).toHaveBeenCalledWith({ id: 'user-42' }, { clinicId: 'clinic-123' });
  });
});
