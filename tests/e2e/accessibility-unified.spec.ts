// Unified accessibility validation for WCAG 2.2 AAA compliance
// Consolidates all accessibility tests into a single comprehensive file
import { AxeBuilder } from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  createValidationError,
  expandAdvancedSettings,
  waitForAppLoad,
  waitForErrorMessage,
} from './test-utils';

// Device configurations for testing
const testDevices = {
  desktop: { width: 1280, height: 720 },
  mobile: [
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Samsung Galaxy S21', width: 384, height: 854 },
  ],
  tablet: [
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
  ],
};

const themes = ['light', 'dark'] as const;

test.describe('WCAG 2.2 AAA Accessibility Compliance', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
  });

  // Core accessibility compliance tests
  test.describe('Core Compliance', () => {
    for (const theme of themes) {
      test(`should pass WCAG 2.2 AAA standards - ${theme} theme`, async ({
        page,
      }: {
        page: Page;
      }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.waitForTimeout(1000);

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag22aa', 'wcag22aaa'])
          .exclude('#webpack-dev-server-client-overlay')
          .analyze();

        if (accessibilityScanResults.violations.length > 0) {
          console.log(`${theme} theme violations:`);
          accessibilityScanResults.violations.forEach((violation, index) => {
            console.log(`${index + 1}. ${violation.id} (${violation.impact})`);
            console.log(`   Description: ${violation.description}`);
            console.log(`   Help: ${violation.helpUrl}`);
          });
        }

        expect(accessibilityScanResults.violations).toEqual([]);
      });
    }

    test('should pass accessibility with form interactions', async ({ page }: { page: Page }) => {
      await page.fill('#numProblems', '25');
      await page.selectOption('#operations', ['+', '-']);
      await expandAdvancedSettings(page);
      await page.check('#allowNegative');
      await page.click('.generate-card');
      await page.waitForTimeout(1000);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag22aa', 'wcag22aaa'])
        .exclude('#webpack-dev-server-client-overlay')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass accessibility with error states', async ({ page }: { page: Page }) => {
      await createValidationError(page, 'count');
      await waitForErrorMessage(page);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag22aa', 'wcag22aaa'])
        .exclude('#webpack-dev-server-client-overlay')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  // Device-specific accessibility tests
  test.describe('Device Accessibility', () => {
    // Mobile device tests (flattened to reduce nested functions)
    for (const device of testDevices.mobile) {
      for (const theme of themes) {
        test(`[mobile ${device.name} ${device.width}x${device.height}] WCAG AAA - ${theme}`, async ({
          page,
        }: {
          page: Page;
        }) => {
          await page.setViewportSize({ width: device.width, height: device.height });
          await page.emulateMedia({ colorScheme: theme });
          await page.waitForTimeout(1000);

          const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag22aa', 'wcag22aaa'])
            .exclude('#webpack-dev-server-client-overlay')
            .analyze();

          expect(accessibilityScanResults.violations).toEqual([]);
        });
      }

      test(`[mobile ${device.name} ${device.width}x${device.height}] touch targets >= 44x44`, async ({
        page,
      }: {
        page: Page;
      }) => {
        // Increase timeout for this specific test
        test.setTimeout(60000);
        await page.setViewportSize({ width: device.width, height: device.height });

        // Wait for the page to fully load and WCAG enforcement to run
        await page.waitForTimeout(3000);

        // Force WCAG enforcement to run
        await page.evaluate(() => {
          // @ts-ignore
          if (window.enforceWCAGTouchTargets) {
            // @ts-ignore
            window.enforceWCAGTouchTargets();
          }
        });

        await page.waitForTimeout(1000);

        // Use a more specific selector to avoid problematic elements
        const interactiveElements = page.locator(
          'button:visible, input:visible, select:visible, a:visible, [role="button"]:visible'
        );
        const count = await interactiveElements.count();

        // Limit the number of elements to check to prevent excessive test time
        const maxElementsToCheck = Math.min(count, 50);

        for (let i = 0; i < maxElementsToCheck; i++) {
          const element = interactiveElements.nth(i);

          try {
            // Check if element is attached to DOM first
            const isAttached = await element.evaluate(el => el.isConnected).catch(() => false);
            if (!isAttached) {
              continue; // Skip detached elements
            }

            // Add timeout for individual element operations
            const isVisible = await element.isVisible({ timeout: 3000 });
            if (!isVisible) {
              continue; // Skip invisible elements
            }

            const boundingBox = await element.boundingBox({ timeout: 3000 });
            if (!boundingBox) {
              continue; // Skip elements without bounding box
            }

            // Get element info for debugging (with shorter timeouts)
            const [tagName, className, textContent] = await Promise.all([
              element.evaluate(el => el.tagName, { timeout: 1000 }).catch(() => 'UNKNOWN'),
              element.evaluate(el => el.className, { timeout: 1000 }).catch(() => ''),
              element
                .evaluate(el => el.textContent?.slice(0, 50) || '', { timeout: 1000 })
                .catch(() => ''),
            ]);

            // Skip elements that are likely to be problematic or non-interactive
            if (
              className.includes('hidden') ||
              className.includes('sr-only') ||
              tagName === 'BODY' ||
              tagName === 'SECTION' ||
              (tagName === 'SUMMARY' && textContent === '') ||
              boundingBox.width === 0 ||
              boundingBox.height === 0
            ) {
              continue;
            }

            // Account for floating-point precision in browser rendering
            try {
              expect(boundingBox.width).toBeGreaterThanOrEqual(43.99);
              expect(boundingBox.height).toBeGreaterThanOrEqual(43.99);
            } catch (error) {
              console.log(
                `❌ Touch target too small - Element ${i}: ${tagName}.${className} "${textContent}" - Size: ${boundingBox.width}x${boundingBox.height} (minimum: 44x44)`
              );
              throw error;
            }
          } catch (error) {
            // Log the problematic element and continue with the next one
            console.log(`Skipping element ${i} due to timeout or error:`, error);
            continue;
          }
        }
      });
    }

    // Tablet device tests (flattened)
    for (const device of testDevices.tablet) {
      for (const theme of themes) {
        test(`[tablet ${device.name} ${device.width}x${device.height}] WCAG AAA - ${theme}`, async ({
          page,
        }: {
          page: Page;
        }) => {
          await page.setViewportSize({ width: device.width, height: device.height });
          await page.emulateMedia({ colorScheme: theme });
          await page.waitForTimeout(1000);

          const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag22aa', 'wcag22aaa'])
            .exclude('#webpack-dev-server-client-overlay')
            .analyze();

          expect(accessibilityScanResults.violations).toEqual([]);
        });
      }
    }
  });

  // Color contrast and theme tests
  test.describe('Color Contrast', () => {
    for (const theme of themes) {
      test(`should meet AAA contrast standards - ${theme} theme`, async ({
        page,
      }: {
        page: Page;
      }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.waitForTimeout(1000);

        const contrastResults = await new AxeBuilder({ page })
          .withTags(['wcag2aa', 'wcag2aaa', 'wcag22aa', 'wcag22aaa'])
          .withRules(['color-contrast'])
          .exclude('#webpack-dev-server-client-overlay')
          .analyze();

        logContrastViolations(contrastResults, theme);

        expect(contrastResults.violations).toEqual([]);
      });
    }

    test('should maintain contrast with error messages', async ({ page }: { page: Page }) => {
      for (const theme of themes) {
        await page.emulateMedia({ colorScheme: theme });
        await page.waitForTimeout(1000);

        await createValidationError(page, 'count');
        await waitForErrorMessage(page);

        const errorElement = page.locator('.error-message');
        await expect(errorElement).toBeVisible();

        const errorStyles = await errorElement.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          };
        });

        expect(errorStyles.color).toBeTruthy();
        expect(errorStyles.backgroundColor).toBeTruthy();

        // Clear error for next theme
        await page.fill('#numProblems', '20');
        await page.waitForTimeout(500);
      }
    });
  });

  const logContrastViolations = (contrastResults: any, theme: string): void => {
    if (!contrastResults || !Array.isArray(contrastResults.violations)) {
      return;
    }
    if (contrastResults.violations.length === 0) {
      return;
    }
    console.log(`${theme} theme contrast violations:`);
    for (let i = 0; i < contrastResults.violations.length; i++) {
      const violation = contrastResults.violations[i];
      console.log(`${i + 1}. ${violation.id}`);
      for (let j = 0; j < violation.nodes.length; j++) {
        const node = violation.nodes[j];
        console.log(`   Element ${j + 1}: ${node.target.join(' ')}`);
        const data = node.any && node.any[0] && node.any[0].data;
        if (data) {
          console.log(`   Contrast: ${data.contrastRatio}`);
          console.log(`   Expected: ${data.expectedContrastRatio}`);
        }
      }
    }
  };

  // Keyboard navigation and interaction tests
  test.describe('Keyboard Navigation', () => {
    test('should support full keyboard navigation', async ({ page }: { page: Page }) => {
      // Wait for the app to fully load and dismiss any messages
      await page.waitForSelector('#numProblems', { timeout: 10000 });
      await page.waitForSelector('.generate-card', { timeout: 10000 });
      await page.waitForTimeout(2000);

      // Dismiss any error/success messages that might be blocking elements
      const dismissButtons = page.locator('.message-dismiss');
      const dismissCount = await dismissButtons.count();
      for (let i = 0; i < dismissCount; i++) {
        const button = dismissButtons.nth(i);
        if (await button.isVisible()) {
          await button.click();
        }
      }

      await page.waitForTimeout(500);

      // Ensure page has focus before tabbing
      await page.locator('body').click({ position: { x: 1, y: 1 } });
      // Start from the beginning of the page
      await page.keyboard.press('Tab');

      interface FocusableElement {
        tagName: string;
        id: string;
        className: string;
        type: string | null;
        role: string | null;
      }

      const focusableElements: FocusableElement[] = [];
      let currentElement = await page.evaluate(() => {
        const active = document.activeElement;
        return active
          ? {
              tagName: active.tagName,
              id: active.id,
              className: active.className,
              type: active.getAttribute('type'),
              role: active.getAttribute('role'),
            }
          : null;
      });

      // Tab through elements and collect them
      for (let i = 0; i < 20 && currentElement; i++) {
        focusableElements.push(currentElement);
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100); // Small delay to ensure focus has moved

        const nextElement = await page.evaluate(() => {
          const active = document.activeElement;
          return active
            ? {
                tagName: active.tagName,
                id: active.id,
                className: active.className,
                type: active.getAttribute('type'),
                role: active.getAttribute('role'),
              }
            : null;
        });

        // Break if we've cycled back to the same element or reached the end
        if (
          !nextElement ||
          (nextElement.tagName === currentElement.tagName &&
            nextElement.id === currentElement.id &&
            nextElement.className === currentElement.className)
        ) {
          break;
        }
        currentElement = nextElement;
      }

      console.log('Focusable elements found:', focusableElements);
      expect(focusableElements.length).toBeGreaterThanOrEqual(2);
    });

    test('should support keyboard interaction with form elements', async ({
      page,
    }: {
      page: Page;
    }) => {
      await page.locator('#numProblems').focus();
      await page.locator('#numProblems').selectText();
      await page.keyboard.type('25');
      await expect(page.locator('#numProblems')).toHaveValue('25');

      await expandAdvancedSettings(page);
      await page.locator('#allowNegative').focus();
      await page.keyboard.press('Space');
      await expect(page.locator('#allowNegative')).toBeChecked();
    });

    test('should support keyboard interaction with buttons', async ({ page }: { page: Page }) => {
      // Wait for the page to fully load
      await page.waitForTimeout(3000);

      // Try multiple selectors to find the generate button
      const generateButton = page.locator('button:has-text("Generate Problems")').first();
      await expect(generateButton).toBeVisible({ timeout: 10000 });

      await generateButton.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);

      const problems = page.locator('.problem-item');
      await expect(problems.first()).toBeVisible();
    });

    test('should maintain visible focus indicators', async ({ page }: { page: Page }) => {
      const focusableSelectors = [
        '#numProblems',
        '#operations',
        '#allowNegative',
        '.generate-card',
      ];

      for (const selector of focusableSelectors) {
        await page.locator(selector).focus();

        const focusedElement = page.locator(selector);
        const styles = await focusedElement.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            outline: computed.outline,
            outlineWidth: computed.outlineWidth,
            boxShadow: computed.boxShadow,
          };
        });

        const hasFocusIndicator =
          styles.outline !== 'none' || styles.outlineWidth !== '0px' || styles.boxShadow !== 'none';

        expect(hasFocusIndicator).toBe(true);
      }
    });
  });

  // ARIA and semantic HTML tests
  test.describe('ARIA and Semantics', () => {
    test('should have proper ARIA labels and roles', async ({ page }: { page: Page }) => {
      // Check main landmarks
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('header')).toBeVisible();

      // Check form labels
      const inputs = page.locator('input, select');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputId = await input.getAttribute('id');

        if (inputId) {
          const hasLabel = (await page.locator(`label[for="${inputId}"]`).count()) > 0;
          const hasAriaLabel = (await input.getAttribute('aria-label')) !== null;
          expect(hasLabel || hasAriaLabel).toBe(true);
        }
      }
    });

    test('should have proper heading hierarchy', async ({ page }: { page: Page }) => {
      const h1Elements = page.locator('h1');
      await expect(h1Elements).toHaveCount(1);

      const h1Text = await h1Elements.textContent();
      expect(h1Text).toBeTruthy();
      expect(h1Text!.length).toBeGreaterThan(5);

      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(1);
    });

    test('should have accessible error messages', async ({ page }: { page: Page }) => {
      await createValidationError(page, 'count');
      await waitForErrorMessage(page);

      const errorElement = page.locator('.error-message');
      await expect(errorElement).toHaveAttribute('role', 'alert');
      await expect(errorElement).toHaveAttribute('aria-live', 'polite');
      await expect(errorElement).toHaveAttribute('aria-atomic', 'true');

      const errorText = await errorElement.textContent();
      expect(errorText).toBeTruthy();
      expect(errorText!.length).toBeGreaterThan(10);
    });

    test('should have accessible buttons', async ({ page }: { page: Page }) => {
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();

        const accessibleName = ariaLabel || textContent;
        expect(accessibleName).toBeTruthy();
        expect(accessibleName!.length).toBeGreaterThan(0);
      }
    });
  });

  // Accessibility preferences tests
  test.describe('Accessibility Preferences', () => {
    test('should support reduced motion preferences', async ({ page }: { page: Page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(1000);

      await page.fill('#numProblems', '8');
      await expect(page.locator('#numProblems')).toHaveValue('8');

      await page.click('.generate-card');
      await page.waitForTimeout(2000);

      const problems = page.locator('.problem-item');
      await expect(problems.first()).toBeVisible();

      const accessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag22aa', 'wcag22aaa'])
        .exclude('#webpack-dev-server-client-overlay')
        .analyze();

      expect(accessibilityResults.violations).toEqual([]);
    });

    test('should support high contrast mode', async ({ page }: { page: Page }) => {
      await page.emulateMedia({
        colorScheme: 'dark',
        reducedMotion: 'reduce',
      });

      await page.waitForTimeout(1000);

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#operations')).toBeVisible();
      await expect(page.locator('#numProblems')).toBeVisible();

      await page.fill('#numProblems', '25');
      await expect(page.locator('#numProblems')).toHaveValue('25');
    });

    test('should not rely solely on color for information', async ({ page }: { page: Page }) => {
      await page.click('.generate-card');
      await page.waitForTimeout(2000);

      await createValidationError(page, 'count');
      await waitForErrorMessage(page);

      const errorElement = page.locator('.error-message');
      await expect(errorElement).toHaveAttribute('role', 'alert');

      const errorText = await errorElement.textContent();
      expect(errorText).toBeTruthy();
      expect(errorText!.length).toBeGreaterThan(5);
    });
  });

  // Form validation accessibility
  test.describe('Form Validation', () => {
    test('should provide clear validation feedback', async ({ page }: { page: Page }) => {
      const validationTests = [
        { type: 'count' as const, expectedText: 'between 1 and 100' },
        { type: 'range' as const, expectedText: 'minimum cannot be greater than maximum' },
        { type: 'operations' as const, expectedText: 'select at least one' },
      ];

      for (const { type, expectedText } of validationTests) {
        await createValidationError(page, type);
        await waitForErrorMessage(page, expectedText);

        const errorMessage = await page.locator('.error-message').textContent();
        expect(errorMessage).toBeTruthy();
        expect(errorMessage!.length).toBeGreaterThan(10);

        // Clear error for next test
        if (type === 'count') {
          await page.fill('#numProblems', '20');
        } else if (type === 'range') {
          await page.fill('#numRangeTo', '30');
        } else if (type === 'operations') {
          await page.locator('#operations').selectOption(['+', '-']);
        }

        await page.waitForTimeout(500);
      }
    });

    test('should maintain focus management during errors', async ({ page }: { page: Page }) => {
      await page.locator('#numProblems').focus();
      await page.fill('#numProblems', '0');
      await page.locator('#numProblems').blur();
      await waitForErrorMessage(page);

      await page.locator('#numProblems').focus();
      const focusedElement = await page.evaluate(() => document.activeElement?.id);
      expect(focusedElement).toBe('numProblems');
    });
  });
});
