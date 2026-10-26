import { test } from '@playwright/test';

test('debug login cookies', async ({ page, context }) => {
  page.on('request', (r) => {
    if (r.url().includes('/auth/refresh')) {
      console.log('[refresh-req] cookie header:', r.headers()['cookie']);
    }
  });
  page.on('response', async (r) => {
    if (r.url().includes('/api/auth/')) console.log('[res]', r.status(), r.url());
  });

  await page.goto('/login');
  await page.fill('input[type="email"]', 'doctor@vemtap.com');
  await page.fill('input[type="password"]', 'password123');
  await page.getByRole('button', { name: /authenticate/i }).click();
  await page.waitForTimeout(6000);

  const cookies = await context.cookies();
  console.log('[cookies]', JSON.stringify(cookies.map((c) => ({ name: c.name, domain: c.domain, path: c.path, sameSite: c.sameSite }))));
  console.log('[final url]', page.url());
});
