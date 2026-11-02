import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getDashboardRoute } from './dashboard-routes';
import { normalizeAuthUser } from './auth-state';

test('returns admin dashboard for platform admins even with a stale clinic assignment', () => {
  assert.equal(getDashboardRoute({ clinicId: 'clinic-123', roles: ['admin'] }), '/admin/dashboard');
});

test('returns admin dashboard for platform admins without a clinic', () => {
  assert.equal(getDashboardRoute({ clinicId: null, roles: ['admin'] }), '/admin/dashboard');
});

test('returns doctor dashboard for staff users with a role even when they belong to a clinic', () => {
  assert.equal(getDashboardRoute({ clinicId: 'clinic-123', roles: ['doctor'] }), '/doctor/dashboard');
});

test('returns doctor dashboard for doctors without a clinic', () => {
  assert.equal(getDashboardRoute({ clinicId: null, roles: ['doctor'] }), '/doctor/dashboard');
});

test('keeps clinicId for admin users assigned to a clinic', () => {
  const normalized = normalizeAuthUser({
    userId: 'user-1',
    email: 'clinic-admin@example.com',
    roles: ['admin'],
    clinicId: 'clinic-123',
    firstName: 'Clinic',
    lastName: 'Admin',
  });

  assert.ok(normalized);
  assert.equal(normalized.clinicId, 'clinic-123');
});
