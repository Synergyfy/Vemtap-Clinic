import { ValidationPipe } from '@nestjs/common';
import { ObservationNoteQueryDto } from './dto';

describe('ObservationNoteQueryDto', () => {
  it('accepts staffId and limit query params used by the nurse dashboard', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });

    const result = await pipe.transform(
      {
        clinicId: 'c2e5de7e-a7b8-4083-889d-b20e60ba19e8',
        staffId: '2c276bfa-98af-4237-b144-52fac1b95e3a',
        limit: '50',
      },
      { type: 'query', metatype: ObservationNoteQueryDto },
    );

    expect(result).toEqual(
      expect.objectContaining({
        clinicId: 'c2e5de7e-a7b8-4083-889d-b20e60ba19e8',
        staffId: '2c276bfa-98af-4237-b144-52fac1b95e3a',
        limit: 50,
      }),
    );
  });
});
