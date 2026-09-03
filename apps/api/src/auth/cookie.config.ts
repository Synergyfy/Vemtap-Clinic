export const COOKIE_CONFIG = {
  ACCESS_TOKEN: 'vemtap_access_token',
  REFRESH_TOKEN: 'vemtap_refresh_token',
} as const;

export const ACCESS_TOKEN_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const REFRESH_TOKEN_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth/refresh', // only sent to refresh endpoint
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
}
