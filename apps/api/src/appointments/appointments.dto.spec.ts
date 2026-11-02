import { ValidationPipe } from '@nestjs/common';
import { AppointmentQueryDto } from './dto';

describe('AppointmentQueryDto', () => {
  it('accepts pagination and sorting query params', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });

    const result = await pipe.transform(
      {
        clinicId: 'c2e5de7e-a7b8-4083-889d-b20e60ba19e8',
        page: '1',
        limit: '100',
        sortBy: 'appointmentDate',
        sortOrder: 'ASC',
      },
      { type: 'query', metatype: AppointmentQueryDto },
    );

    expect(result).toEqual(
      expect.objectContaining({
        clinicId: 'c2e5de7e-a7b8-4083-889d-b20e60ba19e8',
        page: 1,
        limit: 100,
        sortBy: 'appointmentDate',
        sortOrder: 'ASC',
      }),
    );
  });
});
