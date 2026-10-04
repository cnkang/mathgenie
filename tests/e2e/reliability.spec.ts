/// <reference types="node" />
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { readdir } from 'node:fs/promises';

// An isolated origin lets the test disconnect the real network without WebKit's
// offline-emulation bug rejecting responses fulfilled entirely by a service worker.
const createOfflineOrigin = async (upstreamOrigin: string) => {
  const files = await readdir(new URL('../../dist/', import.meta.url), { recursive: true });
  // Requests select a prebuilt URL; they cannot supply a host, protocol, or fetch path.
  const allowedRequests = new Map(
    ['/', ...files.map(file => `/${file}`)].map(path => [path, new URL(path, upstreamOrigin)]),
  );
  const server = createServer(async (request, response) => {
    const target = allowedRequests.get(request.url ?? '/');
    if (!target) {
      response.writeHead(404).end();
      return;
    }
    try {
      const upstream = await fetch(target, {
        signal: AbortSignal.timeout(10000),
      });
      const headers = Object.fromEntries(upstream.headers);
      delete headers['content-encoding'];
      delete headers['content-length'];
      response.writeHead(upstream.status, headers);
      response.end(Buffer.from(await upstream.arrayBuffer()));
    } catch {
      response.writeHead(502).end();
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing offline test origin');
  const disconnect = async () => {
    if (!server.listening) return;
    const closed = new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
    server.closeAllConnections();
    await closed;
  };
  return { url: `http://127.0.0.1:${address.port}`, disconnect };
};
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
test('disabled grouping does not block generation with cleared group counts', async ({ page }) => {
  await page.locator('.grouping-label').click();
  await page.locator('#totalGroups').fill('0');
  await page.locator('.grouping-label').click();
  await page.locator('#numProblems').fill('3');
  await expect(page.locator('.problem-item')).toHaveCount(3);
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
test('serves the application and quiz offline', async ({ page }) => {
  const origin = await createOfflineOrigin(new URL(page.url()).origin);
  try {
    expect((await page.request.get(`${origin.url}/not-a-build-asset`)).status()).toBe(404);
    expect((await page.request.get(`${origin.url}//example.invalid/`)).status()).toBe(404);
    await page.goto(origin.url);
    await expect(page.locator('.problem-item')).toHaveCount(1);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
      }
    });
    await origin.disconnect();
    await page.reload();
    await expect(page.locator('.problem-item')).toHaveCount(1);
    await page.getByRole('button', { name: /Start Quiz/i }).click();
    await expect(page.locator('.answer-input')).toBeVisible();
  } finally {
    await origin.disconnect();
  }
});
