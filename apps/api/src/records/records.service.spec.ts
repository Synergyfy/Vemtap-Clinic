import { RecordsService } from './records.service';

describe('RecordsService.create', () => {
  it('applies the parent clinicId to nested tenant-scoped records', async () => {
    const recordRepository = {
      create: jest.fn((entity) => ({ ...entity, id: 'record-123' })),
      save: jest.fn(async (entity) => entity),
      findOne: jest.fn(async () => ({
        id: 'record-123',
        clinicId: 'clinic-123',
        patientId: 'patient-123',
        branchId: 'branch-123',
      })),
    };

    const vitalsRepository = {
      create: jest.fn((entity) => entity),
      save: jest.fn(async (entity) => entity),
    };

    const eyeTestRepository = {
      create: jest.fn((entity) => entity),
      save: jest.fn(async (entity) => entity),
    };

    const service = new RecordsService(
      recordRepository as any,
      vitalsRepository as any,
      eyeTestRepository as any,
    );

    await service.create({
      patientId: 'patient-123',
      branchId: 'branch-123',
      clinicId: 'clinic-123',
      vitals: { temperature: 36.5 },
      eyeTest: { diagnosis: 'Clear vision' },
    } as any);

    expect(vitalsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicId: 'clinic-123',
        medicalRecordId: 'record-123',
      }),
    );

    expect(eyeTestRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicId: 'clinic-123',
        medicalRecordId: 'record-123',
      }),
    );
  });
});
