// localStorage persistence e2e tests
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { ensureElementVisible, expandAdvancedSettings, expandPdfSettings } from './test-utils';

test.describe('localStorage Persistence', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForSelector('#operations', { timeout: 10000 });
  });

  test('should persist basic settings in localStorage', async ({ page }: { page: Page }) => {
    // Change basic settings
    await page.fill('#numProblems', '25');
    await page.waitForTimeout(500); // Wait for debounced save

    await page.selectOption('#operations', ['+', '-', '*']);
    await page.waitForTimeout(500);

    // Verify settings are saved in localStorage
    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem('mathgenie-settings');
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.numProblems).toBe(25);
    expect(savedSettings.operations).toEqual(['+', '-', '*']);
  });

  test('should persist range settings in localStorage', async ({ page }: { page: Page }) => {
    // Change range settings
    await page.fill('#numRangeFrom', '5');
    await page.fill('#numRangeTo', '15');
    await page.waitForTimeout(500);

    await page.fill('#result-range-from', '0');
    await page.fill('#result-range-to', '30');
    await page.waitForTimeout(500);

    // Verify range settings are saved
    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem('mathgenie-settings');
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.numRange).toEqual([5, 15]);
    expect(savedSettings.resultRange).toEqual([0, 30]);
  });

  test('should persist checkbox settings in localStorage', async ({ page }: { page: Page }) => {
    // Change checkbox settings
    await expandAdvancedSettings(page);
    await page.check('#allowNegative');
    await page.waitForTimeout(500);

    await page.check('#showAnswers');
    await page.waitForTimeout(500);

    // Verify checkbox settings are saved
    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem('mathgenie-settings');
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.allowNegative).toBe(true);
    expect(savedSettings.showAnswers).toBe(true);
  });

  test('should persist PDF settings in localStorage', async ({ page }: { page: Page }) => {
    // Change PDF settings
    await expandPdfSettings(page);
    await page.fill('#fontSize', '18');
    await page.waitForTimeout(500);

    await page.fill('#lineSpacing', '14');
    await page.waitForTimeout(500);

    await page.selectOption('#paperSize', 'letter');
    await page.waitForTimeout(500);

    // Verify PDF settings are saved
    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem('mathgenie-settings');
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.fontSize).toBe(18);
    expect(savedSettings.lineSpacing).toBe(14);
    expect(savedSettings.paperSize).toBe('letter');
  });

  test('should restore settings after page reload', async ({ page }: { page: Page }) => {
    // Set specific settings
    await page.fill('#numProblems', '30');
    await page.selectOption('#operations', ['+', '*']);
    await expandAdvancedSettings(page);
    await page.check('#allowNegative');
    await expandPdfSettings(page);
    await page.fill('#fontSize', '20');
    await page.selectOption('#paperSize', 'legal');
    await page.waitForTimeout(1000); // Wait for all saves to complete

    // Reload the page
    await page.reload();
    await page.waitForSelector('#numProblems', { timeout: 10000 });

    // Verify settings are restored
    await expect(page.locator('#numProblems')).toHaveValue('30');
    await ensureElementVisible(page, '#allowNegative');
    await expect(page.locator('#allowNegative')).toBeChecked();
    await ensureElementVisible(page, '#fontSize');
    await expect(page.locator('#fontSize')).toHaveValue('20');
    await expect(page.locator('#paperSize')).toHaveValue('legal');

    // Check operations selection
    const selectedOperations = await page.locator('#operations option:checked').allTextContents();
    expect(selectedOperations).toContain('Addition (+)');
    expect(selectedOperations).toContain('Multiplication (×)');
  });

  test('should handle localStorage corruption gracefully', async ({ page }: { page: Page }) => {
    // Corrupt localStorage data
    await page.evaluate(() => {
      localStorage.setItem('mathgenie-settings', 'invalid-json');
    });

    // Reload the page
    await page.reload();
    await page.waitForSelector('#numProblems', { timeout: 10000 });

    // Should fall back to default settings
    await expect(page.locator('#numProblems')).toHaveValue('20');

    // Should be able to save new settings
    await page.fill('#numProblems', '15');
    await page.waitForTimeout(500);

    // Verify new settings are saved correctly
    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem('mathgenie-settings');
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.numProblems).toBe(15);
  });

  test('should persist language selection', async ({ page }: { page: Page }) => {
    // Change language
    await page.selectOption('#language-select', 'zh');
    await page.waitForTimeout(2000); // Wait for language to load

    // Verify language is saved
    const savedLanguage = await page.evaluate(() => {
      return localStorage.getItem('mathgenie-language');
    });

    expect(savedLanguage).toBe('zh');

    // Reload and verify language is restored
    await page.reload();
    await page.waitForSelector('#language-select', { timeout: 10000 });

    await expect(page.locator('#language-select')).toHaveValue('zh');
  });

  test('should persist settings when applied via presets', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Apply a preset
    const beginnerPreset = page.locator('.settings-section .preset-card').first();
    await expect(beginnerPreset).toBeVisible();
    await beginnerPreset.scrollIntoViewIfNeeded();
    await beginnerPreset.click();

    await page.waitForTimeout(1000); // Wait for settings to be saved

    // Verify preset settings are saved in localStorage
    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem('mathgenie-settings');
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.numProblems).toBe(15); // Beginner preset value
    expect(savedSettings.operations).toEqual(['+', '-']);

    // Reload and verify settings are restored
    await page.reload();
    await page.waitForSelector('#numProblems', { timeout: 10000 });

    await expect(page.locator('#numProblems')).toHaveValue('15');
  });

  test('should handle localStorage quota exceeded', async ({ page }: { page: Page }) => {
    // Fill localStorage to near capacity (this is a simulation)
    await page.evaluate(() => {
      try {
        // Try to fill localStorage with large data
        const largeData = 'x'.repeat(1000000); // 1MB string
        for (let i = 0; i < 10; i++) {
          localStorage.setItem(`large-data-${i}`, largeData);
        }
      } catch (e) {
        // Expected to fail at some point (quota exceeded)
        const message = e instanceof Error ? e.message : String(e);
        console.debug('localStorage quota exceeded during test:', message);
      }
    });

    // Try to save settings
    await page.fill('#numProblems', '25');
    await page.waitForTimeout(500);

    // App should still function even if localStorage save fails
    await expect(page.locator('#numProblems')).toHaveValue('25');

    // Should be able to generate problems
    const generateButton = page.locator('button').filter({ hasText: 'Generate Problems' }).first();
    await generateButton.scrollIntoViewIfNeeded();
    await generateButton.click();
    await page.waitForSelector('.problem-item', { timeout: 10000 });

    const problems = page.locator('.problem-item');
    await expect(problems).toHaveCount(25);
  });

  test('should maintain settings consistency across tabs', async ({ browser }) => {
    // Create two pages (tabs)
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Navigate both pages
    await page1.goto('/');
    await page2.goto('/');

    await page1.waitForSelector('#numProblems', { timeout: 10000 });
    await page2.waitForSelector('#numProblems', { timeout: 10000 });

    // Change settings in first tab
    await page1.fill('#numProblems', '35');
    await expandAdvancedSettings(page1);
    await page1.check('#allowNegative');
    await page1.waitForTimeout(1000);

    // Reload second tab
    await page2.reload();
    await page2.waitForSelector('#numProblems', { timeout: 10000 });

    // Settings should be synchronized
    await expect(page2.locator('#numProblems')).toHaveValue('35');
    await ensureElementVisible(page2, '#allowNegative');
    await expect(page2.locator('#allowNegative')).toBeChecked();

    await context.close();
  });

  test('should preserve settings during network failures', async ({ page }) => {
    // Set offline mode to simulate network failure
    await page.context().setOffline(true);

    // Change settings while offline
    await page.fill('#numProblems', '40');
    await expandAdvancedSettings(page);
    await page.check('#showAnswers');
    await page.waitForTimeout(500);

    // Settings should still be saved locally
    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem('mathgenie-settings');
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.numProblems).toBe(40);
    expect(savedSettings.showAnswers).toBe(true);

    // Restore online mode
    await page.context().setOffline(false);

    // Reload and verify settings are still there
    await page.reload();
    await page.waitForSelector('#numProblems', { timeout: 10000 });

    await expect(page.locator('#numProblems')).toHaveValue('40');
    await ensureElementVisible(page, '#showAnswers');
    await expect(page.locator('#showAnswers')).toBeChecked();
  });
});
