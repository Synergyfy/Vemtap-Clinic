import { ValidationPipe } from '@nestjs/common';
import { MedicalRecordQueryDto } from './dto';

describe('MedicalRecordQueryDto', () => {
  it('accepts pagination query params for doctor dashboard requests', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });

    const result = await pipe.transform(
      {
        clinicId: 'c2e5de7e-a7b8-4083-889d-b20e60ba19e8',
        staffId: '5dd8c96d-4d25-4178-8a3e-6f6dd7078a35',
        page: '1',
        limit: '5',
      },
      { type: 'query', metatype: MedicalRecordQueryDto },
    );

    expect(result).toEqual(
      expect.objectContaining({
        clinicId: 'c2e5de7e-a7b8-4083-889d-b20e60ba19e8',
        staffId: '5dd8c96d-4d25-4178-8a3e-6f6dd7078a35',
        page: 1,
        limit: 5,
      }),
    );
  });
});
