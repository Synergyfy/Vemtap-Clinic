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
});
