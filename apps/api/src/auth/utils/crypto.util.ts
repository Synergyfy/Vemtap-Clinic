import * as crypto from 'crypto';

export function generateOpaqueToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}