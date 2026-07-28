// Specific tests for collapsible UI accessibility enhancements
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { waitForAppLoad } from './test-utils';

test.describe('Collapsible UI Accessibility', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('should have proper ARIA attributes for advanced settings', async ({
    page,
  }: {
    page: Page;
  }) => {
    const advancedToggle = page.locator('.advanced-settings-toggle');
    const advancedContent = page.locator('#advanced-settings-content');

    // Check ARIA attributes
    await expect(advancedToggle).toHaveAttribute('aria-controls', 'advanced-settings-content');
    await expect(advancedToggle).toHaveAttribute('aria-describedby', 'advanced-settings-desc');
    // Accept either explicit role="region" or semantic <section>
    const hasRegionRole = await advancedContent.getAttribute('role');
    if (hasRegionRole) {
      await expect(advancedContent).toHaveAttribute('role', 'region');
    } else {
      // Fallback: semantic element should be a SECTION or FIELDSET with labeling
      const tag = await advancedContent.evaluate(el => el.tagName);
      expect(['SECTION', 'FIELDSET']).toContain(tag);
    }
    // Must be labelled by the toggle for assistive tech
    await expect(advancedContent).toHaveAttribute('aria-labelledby', 'advanced-settings-toggle');
  });

  test('should have proper ARIA attributes for PDF settings', async ({ page }: { page: Page }) => {
    const pdfToggle = page.locator('.pdf-settings-toggle');
    const pdfContent = page.locator('#pdf-settings-content');

    // Check ARIA attributes
    await expect(pdfToggle).toHaveAttribute('aria-controls', 'pdf-settings-content');
    await expect(pdfToggle).toHaveAttribute('aria-describedby', 'pdf-settings-desc');
    const pdfRegionRole = await pdfContent.getAttribute('role');
    if (pdfRegionRole) {
      await expect(pdfContent).toHaveAttribute('role', 'region');
    } else {
      const tag = await pdfContent.evaluate(el => el.tagName);
      expect(['SECTION', 'FIELDSET']).toContain(tag);
    }
    await expect(pdfContent).toHaveAttribute('aria-labelledby', 'pdf-settings-toggle');
  });

  test('should support Escape key to close expanded sections', async ({ page }: { page: Page }) => {
    // Expand advanced settings
    await page.click('.advanced-settings-toggle');
    await expect(page.locator('.advanced-settings')).toHaveAttribute('open');

    // Press Escape to close
    await page.locator('.advanced-settings-toggle').focus();
    await page.keyboard.press('Escape');
    await expect(page.locator('.advanced-settings')).not.toHaveAttribute('open');
  });

  test('should have screen reader friendly toggle indicators', async ({ page }: { page: Page }) => {
    // Check that decorative icons are hidden from screen readers
    await expect(page.locator('.advanced-settings-toggle span[aria-hidden="true"]')).toHaveCount(2);
    await expect(page.locator('.pdf-settings-toggle span[aria-hidden="true"]')).toHaveCount(2);

    // Check that status text exists for screen readers
    await expect(page.locator('.toggle-status')).toHaveCount(2);
  });

  test('should have descriptive content for assistive technologies', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Check that description elements exist
    await expect(page.locator('#advanced-settings-desc')).toBeAttached();
    await expect(page.locator('#pdf-settings-desc')).toBeAttached();

    // Check that descriptions are hidden visually but available to screen readers
    await expect(page.locator('#advanced-settings-desc')).toHaveClass(/sr-only/);
    await expect(page.locator('#pdf-settings-desc')).toHaveClass(/sr-only/);
  });

  test('should maintain keyboard navigation flow', async ({ page }: { page: Page }) => {
    // Add timeout for Firefox compatibility
    test.setTimeout(90000); // Increased timeout for Firefox compatibility (doubled from 45s)

    // Tab through the interface, asserting each key landmark is reachable.
    // We don't hardcode the exact number of Tabs because intermediate focusable
    // elements (e.g. a dismissable success/warning message) may or may not be
    // present. Instead, Tab until the target landmark becomes focused.
    const tabUntilFocused = async (selector: string, maxTabs = 10): Promise<void> => {
      for (let i = 0; i < maxTabs; i++) {
        if (await page.locator(selector).evaluate(el => el === document.activeElement)) {
          return;
        }
        await page.keyboard.press('Tab');
      }
      await expect(page.locator(selector)).toBeFocused();
    };

    // First Tab reaches the language select.
    await page.keyboard.press('Tab');
    await expect(page.locator('#language-select')).toBeFocused();

    // Continue tabbing to the operations select (first field in SettingsSection).
    await tabUntilFocused('#operations');
    await expect(page.locator('#operations')).toBeFocused();

    // Continue to the number of problems input.
    await tabUntilFocused('#numProblems');
    await expect(page.locator('#numProblems')).toBeFocused();

    // Should be able to reach advanced settings toggle with timeout protection.
    // Tab through remaining focusable elements (ranges, preset cards, pdf settings).
    let focusedElement = await page.evaluate(() => document.activeElement?.className);
    let tabCount = 0;
    const maxTabs = 30; // Prevent infinite loop in Firefox

    while (
      focusedElement &&
      !focusedElement.includes('advanced-settings-toggle') &&
      tabCount < maxTabs
    ) {
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.className);
      tabCount++;
    }

    expect(focusedElement).toContain('advanced-settings-toggle');
  });

  test('should provide proper focus management when expanding sections', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Focus on advanced settings toggle
    await page.locator('.advanced-settings-toggle').focus();

    // Activate with Enter key
    await page.keyboard.press('Enter');
    await expect(page.locator('.advanced-settings')).toHaveAttribute('open');

    // Focus should remain on the toggle
    const focusedElement = await page.evaluate(() => document.activeElement?.className);
    expect(focusedElement).toContain('advanced-settings-toggle');
  });
});
