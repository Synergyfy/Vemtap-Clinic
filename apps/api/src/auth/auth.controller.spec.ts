import { AuthController } from './auth.controller';

describe('AuthController.refresh', () => {
  it('returns a silent no-session response when no refresh cookie is present', async () => {
    const authService = {
      refreshTokens: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    };

    const configService = {
      get: jest.fn((key: string, fallback?: string) => fallback ?? ''),
    };

    const clinicRepo = {
      find: jest.fn(),
    };

    const controller = new AuthController(authService as any, configService as any, clinicRepo as any);
    const req = {
      cookies: {},
      headers: {},
      ip: '127.0.0.1',
    } as any;

    const res = {
      cookie: jest.fn(),
    } as any;

    const result = await controller.refresh(req, res);

    expect(authService.refreshTokens).not.toHaveBeenCalled();
    expect(result).toEqual({
      accessToken: null,
      user: null,
      message: 'No active session',
    });
  });
});
