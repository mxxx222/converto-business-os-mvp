import { test, expect } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL;
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

if (!baseUrl || !adminEmail || !adminPassword) {
  throw new Error('E2E admin smoke test requires E2E_* environment variables');
}

test('admin smoke', async ({ page }) => {
  await page.goto(baseUrl);
  await page.getByRole('link', { name: /Kirjaudu/i }).click();
  await page.getByLabel(/Sähköposti/i).fill(adminEmail);
  await page.getByLabel(/Salasana/i).fill(adminPassword);
  await page.getByRole('button', { name: /Kirjaudu/i }).click();

  await page.getByText(/Tänään käsitelty/i).waitFor({ timeout: 10000 });
  await expect(page.getByText(/Säästetty tässä kuussa/i)).toBeVisible();
});
