import { BadRequestException } from '@nestjs/common';
import { resolveClinicScope } from './settings-scope';

describe('resolveClinicScope', () => {
  it('pins tenant users to their own clinic, ignoring a spoofed query value', () => {
    expect(resolveClinicScope({ roles: ['doctor'], clinicId: 'clinic-a' }, 'clinic-b')).toBe('clinic-a');
  });

  it('allows a super admin to target another clinic', () => {
    expect(resolveClinicScope({ roles: ['super_admin'], clinicId: null }, 'clinic-b')).toBe('clinic-b');
  });

  it('falls back to the super admin clinic when no clinic is requested', () => {
    expect(resolveClinicScope({ roles: ['super_admin'], clinicId: 'clinic-a' })).toBe('clinic-a');
  });

  it('rejects requests without a clinic', () => {
    expect(() => resolveClinicScope({ roles: ['admin'], clinicId: null })).toThrow(BadRequestException);
  });
});
