import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const SENSITIVE_KEYS = new Set([
  'password',
  'clinic',
  'owner',
  'req',
  'request',
  'res',
  'response',
  'session',
  'token',
  'refreshToken',
  'socket',
  'connection',
  'parser',
]);

export const sanitizeCurrentUser = (user: any): any => {
  if (!user || typeof user !== 'object') {
    return user;
  }

  const seen = new WeakSet<object>();

  const visit = (value: any): any => {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (value instanceof Date) {
      return value;
    }

    if (seen.has(value)) {
      return undefined;
    }

    seen.add(value);

    if (Array.isArray(value)) {
      return value
        .map((item) => visit(item))
        .filter((item) => item !== undefined);
    }

    const result: Record<string, any> = {};

    for (const [key, item] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();

      if (SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(normalizedKey)) {
        continue;
      }

      const sanitizedValue = visit(item);
      if (sanitizedValue !== undefined) {
        result[key] = sanitizedValue;
      }
    }

    return result;
  };

  const sanitizedUser = visit(user);
  const primaryId = user.sub ?? user.userId ?? user.id;

  if (sanitizedUser && typeof sanitizedUser === 'object' && primaryId) {
    sanitizedUser.sub = primaryId;
  }

  return sanitizedUser;
};

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request?.user;
    if (!user) {
      return null;
    }

    const normalizedUser = sanitizeCurrentUser(user);
    return data ? normalizedUser?.[data] : normalizedUser;
  },
);
