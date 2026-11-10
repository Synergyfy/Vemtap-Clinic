import { AuthService } from './auth.service';
import { UserRole } from '../entities/user.entity';

const makeQueryBuilder = (result: any) => ({
  where: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue(result),
});

describe('AuthService.register', () => {
  it('creates a clinic admin account by default and leaves the clinic unset until the owner creates one', async () => {
    const userRepository = {
      createQueryBuilder: jest.fn(() => makeQueryBuilder(null)),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((entity) => ({ ...entity, id: 'user-123' })),
      save: jest.fn(async (entity) => ({ ...entity, id: 'user-123' })),
    };

    const refreshTokenRepository = {
      create: jest.fn((entity) => entity),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const jwtService = {
      sign: jest.fn().mockReturnValue('access-token'),
    };

    const configService = {
      get: jest.fn().mockReturnValue('7d'),
    };

    const emailService = {} as any;
    const clinicRepository = {
      create: jest.fn((entity) => entity),
      save: jest.fn(async (entity) => entity),
    };

    const service = new AuthService(
      userRepository as any,
      refreshTokenRepository as any,
      jwtService as any,
      configService as any,
      emailService,
      clinicRepository as any,
    );

    await service.register({
      firstName: 'Jane',
      lastName: 'Admin',
      email: 'jane@vemtap.com',
      password: 'secure123',
    } as any);

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: UserRole.CLINIC_ADMIN,
        clinicId: null,
      }),
    );
  });

  it('returns a clear email conflict message when an account already exists', async () => {
    const userRepository = {
      createQueryBuilder: jest.fn(() => makeQueryBuilder({ id: 'existing-user' })),
      findOne: jest.fn().mockResolvedValue({ id: 'existing-user' }),
      create: jest.fn(),
      save: jest.fn(),
    };

    const clinicRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const refreshTokenRepository = {
      create: jest.fn((entity) => entity),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const jwtService = {
      sign: jest.fn().mockReturnValue('access-token'),
    };

    const configService = {
      get: jest.fn().mockReturnValue('7d'),
    };

    const emailService = {} as any;

    const service = new AuthService(
      userRepository as any,
      refreshTokenRepository as any,
      jwtService as any,
      configService as any,
      emailService,
      clinicRepository as any,
    );

    await expect(
      service.register({
        firstName: 'Jane',
        lastName: 'Exists',
        email: 'jane@vemtap.com',
        password: 'secure123',
        clinicName: 'Apex Vision Clinic',
      } as any),
    ).rejects.toThrow('This email is already registered. Please log in or reset your password.');
  });

  it('creates a clinic and links the owner as a clinic admin when a clinic name is provided', async () => {
    const userRepository = {
      createQueryBuilder: jest.fn(() => makeQueryBuilder(null)),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((entity) => ({ ...entity, id: 'user-456' })),
      save: jest.fn(async (entity) => ({ ...entity, id: entity.id ?? 'user-456' })),
    };

    const clinicRepository = {
      create: jest.fn((entity) => ({ ...entity, id: 'clinic-123' })),
      save: jest.fn(async (entity) => ({ ...entity, id: 'clinic-123' })),
    };

    const refreshTokenRepository = {
      create: jest.fn((entity) => entity),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const jwtService = {
      sign: jest.fn().mockReturnValue('access-token'),
    };

    const configService = {
      get: jest.fn().mockReturnValue('7d'),
    };

    const emailService = {} as any;

    const service = new AuthService(
      userRepository as any,
      refreshTokenRepository as any,
      jwtService as any,
      configService as any,
      emailService,
      clinicRepository as any,
    );

    const result = await service.register({
      firstName: 'Jane',
      lastName: 'Clinic',
      email: 'jane@clinic.com',
      password: 'secure123',
      clinicName: 'Apex Vision Clinic',
      clinicCity: 'Lagos',
      clinicPhone: '08012345678',
    } as any);

    expect(clinicRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Apex Vision Clinic',
        city: 'Lagos',
        phone: '08012345678',
        ownerId: 'user-456',
      }),
    );
    expect(userRepository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({
        role: UserRole.CLINIC_ADMIN,
        clinicId: 'clinic-123',
      }),
    );
    expect(result.user.clinicId).toBe('clinic-123');
  });

  it('returns the user name fields in the auth payload so the UI can display the account owner', async () => {
    const userRepository = {
      createQueryBuilder: jest.fn(() => makeQueryBuilder(null)),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((entity) => ({ ...entity, id: 'user-456' })),
      save: jest.fn(async (entity) => ({ ...entity, id: 'user-456' })),
    };

    const refreshTokenRepository = {
      create: jest.fn((entity) => entity),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const jwtService = {
      sign: jest.fn().mockReturnValue('access-token'),
    };

    const configService = {
      get: jest.fn().mockReturnValue('7d'),
    };

    const emailService = {} as any;
    const clinicRepository = {
      create: jest.fn((entity) => entity),
      save: jest.fn(async (entity) => entity),
    };

    const service = new AuthService(
      userRepository as any,
      refreshTokenRepository as any,
      jwtService as any,
      configService as any,
      emailService,
      clinicRepository as any,
    );

    const result = await service.register({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@vemtap.com',
      password: 'secure123',
    } as any);

    expect(result.user).toMatchObject({
      userId: 'user-456',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@vemtap.com',
    });
  });

  it('includes the clinic name in the auth payload so the dashboard can show the clinic context', async () => {
    const userRepository = {
      createQueryBuilder: jest.fn(() => makeQueryBuilder(null)),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((entity) => ({ ...entity, id: 'user-456' })),
      save: jest.fn(async (entity) => ({ ...entity, id: 'user-456' })),
    };

    const clinicRepository = {
      create: jest.fn((entity) => ({ ...entity, id: 'clinic-123', name: 'Apex Vision Clinic' })),
      save: jest.fn(async (entity) => ({ ...entity, id: 'clinic-123', name: 'Apex Vision Clinic' })),
    };

    const refreshTokenRepository = {
      create: jest.fn((entity) => entity),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const jwtService = {
      sign: jest.fn().mockReturnValue('access-token'),
    };

    const configService = {
      get: jest.fn().mockReturnValue('7d'),
    };

    const emailService = {} as any;

    const service = new AuthService(
      userRepository as any,
      refreshTokenRepository as any,
      jwtService as any,
      configService as any,
      emailService,
      clinicRepository as any,
    );

    const result = await service.register({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@vemtap.com',
      password: 'secure123',
      clinicName: 'Apex Vision Clinic',
    } as any);

    expect(result.user.clinicName).toBe('Apex Vision Clinic');
  });

  it('logs users in even when the email is entered with different casing', async () => {
    const normalizedEmail = 'jane@vemtap.com';
    const queryBuilder = makeQueryBuilder({
      id: 'user-789',
      firstName: 'Jane',
      lastName: 'Admin',
      email: normalizedEmail,
      password: '$2a$10$abcdefghijklmnopqrstuv',
      role: UserRole.ADMIN,
      clinicId: null,
      isActive: true,
    });

    const userRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder),
      findOne: jest.fn(async ({ where }) => ({
        id: 'user-789',
        firstName: 'Jane',
        lastName: 'Admin',
        email: normalizedEmail,
        password: '$2a$10$abcdefghijklmnopqrstuv',
        role: UserRole.ADMIN,
        clinicId: null,
        isActive: true,
        ...where,
      })),
    };

    const refreshTokenRepository = {
      create: jest.fn((entity) => entity),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const jwtService = {
      sign: jest.fn().mockReturnValue('access-token'),
    };

    const configService = {
      get: jest.fn().mockReturnValue('7d'),
    };

    const emailService = {} as any;
    const clinicRepository = {
      create: jest.fn((entity) => entity),
      save: jest.fn(async (entity) => entity),
    };
    const bcryptCompare = jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);

    const service = new AuthService(
      userRepository as any,
      refreshTokenRepository as any,
      jwtService as any,
      configService as any,
      emailService,
      clinicRepository as any,
    );

    const result = await service.login({ email: 'JANE@VEMTAP.COM', password: 'secure123' } as any);

    expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(queryBuilder.where).toHaveBeenCalledWith('LOWER(user.email) = :email', {
      email: normalizedEmail,
    });
    expect(result.user.email).toBe(normalizedEmail);

    bcryptCompare.mockRestore();
  });
});
