import { AuthService } from './auth.service';
import { UserRole } from '../entities/user.entity';

describe('AuthService.register', () => {
  it('creates an admin account by default and leaves clinic unset until the admin creates one', async () => {
    const userRepository = {
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

    const service = new AuthService(
      userRepository as any,
      refreshTokenRepository as any,
      jwtService as any,
      configService as any,
    );

    await service.register({
      firstName: 'Jane',
      lastName: 'Admin',
      email: 'jane@vemtap.com',
      password: 'secure123',
    } as any);

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: UserRole.ADMIN,
        clinicId: null,
      }),
    );
  });

  it('returns the user name fields in the auth payload so the UI can display the account owner', async () => {
    const userRepository = {
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

    const service = new AuthService(
      userRepository as any,
      refreshTokenRepository as any,
      jwtService as any,
      configService as any,
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

  it('logs users in even when the email is entered with different casing', async () => {
    const normalizedEmail = 'jane@vemtap.com';
    const userRepository = {
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

    const bcryptCompare = jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);

    const service = new AuthService(
      userRepository as any,
      refreshTokenRepository as any,
      jwtService as any,
      configService as any,
    );

    const result = await service.login({ email: 'JANE@VEMTAP.COM', password: 'secure123' } as any);

    expect(userRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: normalizedEmail },
      }),
    );
    expect(result.user.email).toBe(normalizedEmail);

    bcryptCompare.mockRestore();
  });
});
