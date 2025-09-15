// WebKit (Safari) specific tests
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  applyPresetWebkitSafe,
  changeLanguage,
  isWebKit,
  waitForAppLoad,
  waitForPresetsLoad,
} from './test-utils';

test.describe('WebKit (Safari) Specific Tests', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('should detect WebKit browser correctly', async ({ page }: { page: Page }) => {
    const isWebKitBrowser = await isWebKit(page);

    // This test will only pass on WebKit browsers
    if (
      await page.evaluate(
        () => /WebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
      )
    ) {
      expect(isWebKitBrowser).toBe(true);
    } else {
      expect(isWebKitBrowser).toBe(false);
    }
  });

  test('should handle preset clicks reliably in WebKit', async ({ page }: { page: Page }) => {
    await waitForPresetsLoad(page);

    // Test WebKit-safe clicking on all presets
    for (let i = 0; i < 4; i++) {
      await applyPresetWebkitSafe(page, i);

      // Verify the preset was applied
      const expectedValues = ['15', '20', '25', '30'];
      await expect(page.locator('#numProblems')).toHaveValue(expectedValues[i], { timeout: 8000 });

      // Wait a bit between preset changes for WebKit
      await page.waitForTimeout(200);
    }
  });

  test('should handle form interactions properly in WebKit', async ({ page }: { page: Page }) => {
    // Test form filling with WebKit-specific handling
    await page.fill('#numProblems', '25');
    await expect(page.locator('#numProblems')).toHaveValue('25', { timeout: 5000 });

    // Test select dropdown
    await page.selectOption('#operations', ['+', '-']);
    const selectedOptions = await page.locator('#operations option:checked').allTextContents();
    expect(selectedOptions).toHaveLength(2);

    // Test checkbox interactions
    const allowNegativeCheckbox = page.locator('#allowNegative');
    if (await allowNegativeCheckbox.isVisible()) {
      await allowNegativeCheckbox.check();
      await expect(allowNegativeCheckbox).toBeChecked();
    }
  });

  test('should handle language switching in WebKit', async ({ page }: { page: Page }) => {
    // Test language switching with WebKit-specific handling
    await changeLanguage(page, 'zh');

    // Verify language change took effect
    await expect(page.locator('#language-select')).toHaveValue('zh');

    // Verify UI elements are still functional after language change
    await waitForPresetsLoad(page);
    await applyPresetWebkitSafe(page, 0);
    await expect(page.locator('#numProblems')).toHaveValue('15', { timeout: 8000 });
  });

  test('should handle rapid interactions without race conditions', async ({
    page,
  }: {
    page: Page;
  }) => {
    await waitForPresetsLoad(page);

    // Test rapid preset switching with proper WebKit handling
    await applyPresetWebkitSafe(page, 0);
    await expect(page.locator('#numProblems')).toHaveValue('15', { timeout: 5000 });

    await applyPresetWebkitSafe(page, 2);
    await expect(page.locator('#numProblems')).toHaveValue('25', { timeout: 5000 });

    await applyPresetWebkitSafe(page, 1);
    await expect(page.locator('#numProblems')).toHaveValue('20', { timeout: 5000 });

    // Verify final state is correct
    const finalValue = await page.locator('#numProblems').inputValue();
    expect(finalValue).toBe('20');
  });

  test('should handle scrolling and viewport changes', async ({ page }: { page: Page }) => {
    // Test scrolling behavior in WebKit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Ensure presets are still functional after scrolling
    await waitForPresetsLoad(page);
    await applyPresetWebkitSafe(page, 1);
    await expect(page.locator('#numProblems')).toHaveValue('20', { timeout: 8000 });
  });

  test('should handle focus and blur events properly', async ({ page }: { page: Page }) => {
    // Test focus handling in WebKit
    await page.focus('#numProblems');
    await page.fill('#numProblems', '30');

    // Blur the field
    await page.locator('#numRangeFrom').focus();

    // Verify value was saved
    await expect(page.locator('#numProblems')).toHaveValue('30');

    // Test that presets still work after focus changes
    await waitForPresetsLoad(page);
    await applyPresetWebkitSafe(page, 0);
    await expect(page.locator('#numProblems')).toHaveValue('15', { timeout: 8000 });
  });
});
