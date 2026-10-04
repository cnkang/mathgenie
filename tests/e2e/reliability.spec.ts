import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const settings = { operations: ['+'], numProblems: 1, numRange: [2, 2], resultRange: [4, 4], numOperandsRange: [2, 2], allowNegative: false, showAnswers: true, fontSize: 16, lineSpacing: 12, paperSize: 'a4', enableGrouping: false, problemsPerGroup: 20, totalGroups: 1 };
test.beforeEach(async ({ page }) => {
  await page.addInitScript((value) => { localStorage.setItem('mathgenie-settings', JSON.stringify(value)); localStorage.setItem('mathgenie-language', 'en'); }, settings);
  await page.goto('/');
});
test('printed answers remain hidden in keyboard accessible quiz', async ({ page }) => {
  await expect(page.locator('.problem-text')).toContainText('4');
  await page.getByRole('button', { name: /Start Quiz/i }).click();
  const input = page.locator('.answer-input');
  await expect(input).toBeFocused();
  await expect(page.locator('.problem-expression')).not.toContainText('= 4');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await input.fill('4');
  await input.press('Enter');
  await expect(page.locator('.quiz-results')).toBeVisible();
});
test('large generation uses bounded pages and keeps display edits stable', async ({ page }) => {
  await page.locator('#numProblems').fill('50000');
  await expect(page.locator('#results-title')).toContainText('50000', { timeout: 60000 });
  await expect(page.locator('.problem-item')).toHaveCount(200);
  const first = await page.locator('.problem-text').first().textContent();
  await page.getByRole('button', { name: /Next Page/i }).click();
  await expect(page.locator('.problems-pagination output')).toContainText('2');
  await page.getByRole('button', { name: /Previous Page/i }).click();
  expect(await page.locator('.problem-text').first().textContent()).toBe(first);
  await page.locator('#language-select').selectOption('zh');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
  expect(await page.locator('.problem-text').first().textContent()).toBe(first);
});
test('loads PDF only on demand', async ({ page }) => {
  const pdfRequests: string[] = [];
  page.on('request', (request) => { if (/jspdf.*\.js/.test(request.url())) pdfRequests.push(request.url()); });
  await page.reload();
  await expect(page.locator('.problem-item')).toHaveCount(1);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true })); });
  expect(pdfRequests).toHaveLength(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download PDF/i }).click();
  expect((await download).suggestedFilename()).toBe('problems.pdf');
  expect(pdfRequests.length).toBeGreaterThan(0);
 });
test('serves the application and quiz offline', async ({ page, context }) => {
  await expect(page.locator('.problem-item')).toHaveCount(1);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true })); });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.problem-item')).toHaveCount(1);
  await page.getByRole('button', { name: /Start Quiz/i }).click();
  await expect(page.locator('.answer-input')).toBeVisible();
});
