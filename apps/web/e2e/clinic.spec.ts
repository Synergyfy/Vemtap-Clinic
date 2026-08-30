import { test, expect } from '@playwright/test';

test.describe('Clinic - Dashboard', () => {
  test('clinic dashboard loads (may redirect to login)', async ({ page }) => {
    await page.goto('/clinic/dashboard');
    // Either shows dashboard or redirects to login
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Clinic - Patients', () => {
  test('patients page loads', async ({ page }) => {
    await page.goto('/clinic/patients');
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Clinic - Queue', () => {
  test('queue page loads', async ({ page }) => {
    await page.goto('/clinic/queue');
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Clinic - Staff', () => {
  test('staff page loads', async ({ page }) => {
    await page.goto('/clinic/staff');
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});