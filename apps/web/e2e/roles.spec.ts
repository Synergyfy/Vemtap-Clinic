import { test, expect, Page } from '@playwright/test';

const PASSWORD = 'password123';

interface RoleDef {
  name: string;
  email: string;
  home: string;
  pages: string[];
}

const STAFF_ROLES: RoleDef[] = [
  {
    name: 'admin',
    email: 'admin@vemtap.com',
    home: '/admin/dashboard',
    pages: [
      '/admin/dashboard',
      '/admin/analytics',
      '/admin/clinics',
      '/admin/finance',
      '/admin/security',
      '/admin/settings',
      '/admin/support',
      '/admin/config',
      '/admin/config/drugs',
      '/admin/config/hmo',
    ],
  },
  {
    name: 'doctor',
    email: 'doctor@vemtap.com',
    home: '/doctor/dashboard',
    pages: [
      '/doctor/dashboard',
      '/doctor/patients',
      '/doctor/appointments',
      '/doctor/queue',
      '/doctor/records',
      '/doctor/reports',
      '/doctor/settings',
    ],
  },
  {
    name: 'nurse',
    email: 'nurse@vemtap.com',
    home: '/nurse/dashboard',
    pages: [
      '/nurse/dashboard',
      '/nurse/patients',
      '/nurse/vitals',
      '/nurse/monitoring',
      '/nurse/treatment',
      '/nurse/eye-tests',
      '/nurse/followups',
      '/nurse/settings',
    ],
  },
  {
    name: 'receptionist',
    email: 'reception@vemtap.com',
    home: '/reception/dashboard',
    pages: [
      '/reception/dashboard',
      '/reception/patients',
      '/reception/appointments',
      '/reception/check-in',
      '/reception/queue',
      '/reception/billing',
      '/reception/documents',
      '/reception/tasks',
      '/reception/settings',
    ],
  },
  {
    name: 'pharmacist',
    email: 'pharmacist@vemtap.com',
    home: '/pharmacy/dashboard',
    pages: [
      '/pharmacy/dashboard',
      '/pharmacy/prescriptions',
      '/pharmacy/dispensing',
      '/pharmacy/inventory',
      '/pharmacy/suppliers',
      '/pharmacy/settings',
    ],
  },
  {
    name: 'optometrist',
    email: 'optometrist@vemtap.com',
    home: '/optician/dashboard',
    pages: [
      '/optician/dashboard',
      '/optician/orders',
      '/optician/production',
      '/optician/inventory',
      '/optician/sales',
      '/optician/settings',
    ],
  },
  {
    name: 'cashier',
    email: 'cashier@vemtap.com',
    home: '/cashier',
    pages: ['/cashier', '/cashier/history', '/cashier/reconciliation', '/cashier/settings'],
  },
];

async function loginViaUi(page: Page, email: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', PASSWORD);
  await page.getByRole('button', { name: /authenticate/i }).click();
}

test.describe('Role login redirects', () => {
  for (const role of STAFF_ROLES) {
    test(`${role.name} logs in and lands on ${role.home}`, async ({ page }) => {
      await loginViaUi(page, role.email);
      await page.waitForURL(`**${role.home}`, { timeout: 60_000 });
      expect(new URL(page.url()).pathname).toBe(role.home);
    });
  }
});

test.describe('Role feature pages load', () => {
  for (const role of STAFF_ROLES) {
    test(`${role.name} can open all feature pages`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(`${e.name}: ${e.message}`));

      await loginViaUi(page, role.email);
      await page.waitForURL(`**${role.home}`, { timeout: 60_000 });

      for (const path of role.pages) {
        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        // Must not be bounced to the login page
        expect(new URL(page.url()).pathname, `redirected away from ${path}`).not.toBe('/login');
        // Body must render
        await expect(page.locator('body')).toBeVisible();
      }

      // Surface any uncaught runtime errors (filter noisy analytics/network)
      const fatal = errors.filter(
        (e) => !/Failed to fetch|NetworkError|ResizeObserver|hydration/i.test(e),
      );
      expect(fatal, `page errors on ${role.name}: ${fatal.join(' | ')}`).toHaveLength(0);
    });
  }
});
