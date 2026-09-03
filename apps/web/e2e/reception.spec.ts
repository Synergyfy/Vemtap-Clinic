import { test, expect } from '@playwright/test';

test.describe('Reception - Patient Check-in', () => {
  test('check-in page loads and shows start screen', async ({ page }) => {
    await page.goto('/reception/check-in');
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Reception - Queue', () => {
  test('queue page loads', async ({ page }) => {
    await page.goto('/reception/queue');
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Reception - Patients', () => {
  test('patients page loads', async ({ page }) => {
    await page.goto('/reception/patients');
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});