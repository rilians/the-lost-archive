import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const base = process.env.BASE_URL || 'http://localhost:5173';
await mkdir('checks/artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto(base);
  await page.getByRole('button', { name: 'Interact with the archival monitor' }).click({ force: true });
  await page.getByText('HELLO,').waitFor();
  await page.getByRole('button', { name: 'Let’s get a little lost' }).click();
  await page.getByRole('heading', { name: 'WELCOME TO MY HOMEPAGE!' }).waitFor();
  await page.getByRole('button', { name: 'Hardware', exact: true }).click();
  if (await page.locator('.artifact-card').count() !== 2) throw new Error('Hardware filter should return two artifacts.');
  await page.locator('.artifact-card').first().click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open archive terminal' }).click();
  await page.getByRole('textbox', { name: 'Terminal command' }).fill('help');
  await page.getByRole('textbox', { name: 'Terminal command' }).press('Enter');
  await page.getByText('COMMANDS:', { exact: false }).waitFor();
  await page.keyboard.press('Escape');
  await page.screenshot({ path: 'checks/artifacts/desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'checks/artifacts/mobile.png' });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (mobileOverflow) throw new Error('Unexpected horizontal overflow at mobile viewport.');
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(JSON.stringify({ result: 'passed', pageErrors: errors, mobileOverflow }, null, 2));
} finally {
  await browser.close();
}
