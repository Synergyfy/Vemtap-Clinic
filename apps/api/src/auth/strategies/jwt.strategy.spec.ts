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
      type: 'patient',
    });
    expect(patientRepo.findOne).toHaveBeenCalledWith({ where: { id: 'patient-123' } });
    expect(userRepo.findOne).not.toHaveBeenCalled();
  });
});
