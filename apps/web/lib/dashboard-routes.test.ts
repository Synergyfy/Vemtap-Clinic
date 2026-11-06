import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getDashboardRoute } from './dashboard-routes';
import { normalizeAuthUser } from './auth-state';

test('returns super admin dashboard for platform admins even with a stale clinic assignment', () => {
  assert.equal(getDashboardRoute({ clinicId: 'clinic-123', roles: ['super_admin'] }), '/admin/dashboard');
  assert.equal(getDashboardRoute({ clinicId: 'clinic-123', roles: ['admin'] }), '/admin/dashboard');
});

test('returns clinic admin dashboard for clinic owners/managers', () => {
  assert.equal(getDashboardRoute({ clinicId: 'clinic-123', roles: ['clinic_admin'] }), '/clinic/dashboard');
  assert.equal(getDashboardRoute({ clinicId: null, roles: ['clinic_admin'] }), '/clinic/dashboard');
});

test('returns doctor dashboard for staff users with a role even when they belong to a clinic', () => {
  assert.equal(getDashboardRoute({ clinicId: 'clinic-123', roles: ['doctor'] }), '/doctor/dashboard');
});

test('returns doctor dashboard for doctors without a clinic', () => {
  assert.equal(getDashboardRoute({ clinicId: null, roles: ['doctor'] }), '/doctor/dashboard');
});

test('keeps clinicId for clinic admin users assigned to a clinic', () => {
  const normalized = normalizeAuthUser({
    userId: 'user-1',
    email: 'clinic-admin@example.com',
    roles: ['clinic_admin'],
    clinicId: 'clinic-123',
    firstName: 'Clinic',
    lastName: 'Admin',
  });

  assert.ok(normalized);
  assert.equal(normalized.clinicId, 'clinic-123');
});
