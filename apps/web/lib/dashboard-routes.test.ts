import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { getClinicEntryRoute, getDashboardRoute } from './dashboard-routes';
import { normalizeAuthUser, hasUsablePatientIdentity, hasActivePersistedSession } from './auth-state';
import { shouldSkipAuthHeader } from './api';

const createStorageState = (value: Record<string, unknown> = {}) => ({
  getItem: (key: string) => Object.prototype.hasOwnProperty.call(value, key) ? JSON.stringify(value[key]) : null,
  setItem: (key: string, item: string) => {
    value[key] = JSON.parse(item);
  },
  removeItem: (key: string) => {
    delete value[key];
  },
  clear: () => {
    Object.keys(value).forEach((key) => delete value[key]);
  },
  key: (index: number) => Object.keys(value)[index] ?? null,
  length: 0,
}) as Storage;

beforeEach(() => {
  const storage = createStorageState();
  globalThis.localStorage = storage;
  globalThis.window = { localStorage: storage } as Window & typeof globalThis;
});

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
  const storage = createStorageState({ 'vemtap-clinic-onboarding': { completed: false } });
  globalThis.localStorage = storage;
  globalThis.window = { localStorage: storage } as Window & typeof globalThis;

  assert.equal(getClinicEntryRoute({ clinicId: 'clinic-123', roles: ['clinic_admin'] }), '/clinic/onboarding');
});

test('sends a clinic admin with completed onboarding to the dashboard', () => {
  const storage = createStorageState({ 'vemtap-clinic-onboarding': { completed: true } });
  globalThis.localStorage = storage;
  globalThis.window = { localStorage: storage } as Window & typeof globalThis;

  assert.equal(getClinicEntryRoute({ clinicId: 'clinic-123', roles: ['clinic_admin'] }), '/clinic/dashboard');
});

test('treats stale patient auth with no usable profile identity as invalid', () => {
  assert.equal(hasUsablePatientIdentity({ roles: ['patient'], userId: '', email: '', firstName: '', lastName: '' }), false);
  assert.equal(hasUsablePatientIdentity({ roles: ['patient'], userId: 'p-1', email: 'jane@example.com' }), true);
  assert.equal(hasUsablePatientIdentity({ roles: ['clinic_admin'], userId: 'p-1', email: 'admin@example.com' }), true);
});

test('keeps a valid patient session active even if a stale logout flag is stored', () => {
  assert.equal(
    hasActivePersistedSession({
      accessToken: 'token-123',
      user: {
        userId: 'p-1',
        email: 'jay@example.com',
        roles: ['patient'],
        firstName: 'Jay',
        lastName: 'Jay',
        clinicId: '',
      },
      isAuthenticated: true,
      isLoggedOut: true,
    }),
    true,
  );

  assert.equal(
    hasActivePersistedSession({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoggedOut: true,
    }),
    false,
  );
});

test('adds the bearer token to protected patient portal routes while only skipping public auth endpoints', () => {
  assert.equal(shouldSkipAuthHeader('/patient-portal/login'), true);
  assert.equal(shouldSkipAuthHeader('/patient-portal/register'), true);
  assert.equal(shouldSkipAuthHeader('/patient-portal/profile'), false);
  assert.equal(shouldSkipAuthHeader('/patient-portal/memberships'), false);
  assert.equal(shouldSkipAuthHeader('/auth/refresh'), true);
  assert.equal(shouldSkipAuthHeader('/clinic/patients'), false);
});
