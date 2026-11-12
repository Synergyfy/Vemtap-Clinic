import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('accepts patient tokens issued by the patient portal', async () => {
    const userRepo = { findOne: jest.fn() };
    const patientRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'patient-123',
        email: 'jay@example.com',
        firstName: 'Jay',
        lastName: 'Jay',
        phone: '+08106289200',
        portalAccessEnabled: true,
        clinicId: 'clinic-abc',
        branchId: 'branch-xyz',
        isActive: true,
      }),
    };

    const strategy = new (JwtStrategy as any)(
      { get: jest.fn().mockReturnValue('secret') },
      userRepo,
      patientRepo,
    );

    const result = await strategy.validate({
      sub: 'patient-123',
      email: 'jay@example.com',
      type: 'patient',
    });

    expect(result).toMatchObject({
      sub: 'patient-123',
      userId: 'patient-123',
      email: 'jay@example.com',
      roles: ['patient'],
      clinicId: 'clinic-abc',
      branchId: 'branch-xyz',
      type: 'patient',
    });
    expect(patientRepo.findOne).toHaveBeenCalledWith({ where: { id: 'patient-123' } });
    expect(userRepo.findOne).not.toHaveBeenCalled();
  });

  it('exposes the staff branch so services can default new records to it', async () => {
    const userRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'reception@example.com',
        firstName: 'Rita',
        lastName: 'Reception',
        phone: null,
        role: 'receptionist',
        isActive: true,
        clinicId: 'clinic-1',
        branchId: 'branch-1',
      }),
    };
    const patientRepo = { findOne: jest.fn() };

    const strategy = new (JwtStrategy as any)(
      { get: jest.fn().mockReturnValue('secret') },
      userRepo,
      patientRepo,
    );

    await expect(strategy.validate({ sub: 'user-1' })).resolves.toMatchObject({
      sub: 'user-1',
      type: 'user',
      clinicId: 'clinic-1',
      branchId: 'branch-1',
    });
    expect(patientRepo.findOne).not.toHaveBeenCalled();
  });

  it('returns a null branch for staff accounts without one', async () => {
    const userRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'user-2',
        email: 'admin@example.com',
        role: 'admin',
        isActive: true,
        clinicId: null,
        branchId: null,
      }),
    };

    const strategy = new (JwtStrategy as any)(
      { get: jest.fn().mockReturnValue('secret') },
      userRepo,
      { findOne: jest.fn() },
    );

    await expect(strategy.validate({ sub: 'user-2' })).resolves.toMatchObject({
      clinicId: null,
      branchId: null,
    });
  });
});
