import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getClinicEntryRoute, getDashboardRoute } from './dashboard-routes';
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

test('sends a clinic admin with incomplete onboarding back to onboarding', () => {
  globalThis.localStorage = {
    getItem: (key: string) => key === 'vemtap-clinic-onboarding' ? JSON.stringify({ completed: false }) : null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  } as Storage;

  assert.equal(getClinicEntryRoute({ clinicId: 'clinic-123', roles: ['clinic_admin'] }), '/clinic/onboarding');
});

test('sends a clinic admin with completed onboarding to the dashboard', () => {
  globalThis.localStorage = {
    getItem: (key: string) => key === 'vemtap-clinic-onboarding' ? JSON.stringify({ completed: true }) : null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  } as Storage;

  assert.equal(getClinicEntryRoute({ clinicId: 'clinic-123', roles: ['clinic_admin'] }), '/clinic/dashboard');
});
