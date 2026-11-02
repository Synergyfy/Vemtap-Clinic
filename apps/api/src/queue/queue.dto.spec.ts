import { plainToInstance } from 'class-transformer';
import { QueueQueryDto } from './dto';

describe('QueueQueryDto', () => {
  it('allows filtering queue entries by patientId', () => {
    const clinicId = '123e4567-e89b-12d3-a456-426614174000';
    const patientId = '123e4567-e89b-12d3-a456-426614174001';

    const dto = plainToInstance(QueueQueryDto, {
      clinicId,
      patientId,
      limit: 25,
    });

    expect(dto.clinicId).toBe(clinicId);
    expect(dto.patientId).toBe(patientId);
    expect(dto.limit).toBe(25);
  });
});
