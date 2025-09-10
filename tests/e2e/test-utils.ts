// Test utilities for e2e tests
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Wait for the app to fully load with all necessary elements
 */
export async function waitForAppLoad(page: Page): Promise<void> {
  // Wait for main elements to be visible
  await page.waitForSelector('h1', { timeout: 10000 });
  await page.waitForSelector('#operations', { timeout: 10000 });

  // Wait for translations to load (title should not be empty or "Loading...")
  await page.waitForFunction(
    () => {
      const title = document.querySelector('h1')?.textContent;
      return title && title !== 'Loading...' && title.length > 0;
    },
    { timeout: 10000 }
  );
}

/**
 * Wait for presets to be fully loaded and visible
 */
export async function waitForPresetsLoad(page: Page): Promise<void> {
  await page.waitForSelector('.settings-presets', { timeout: 10000 });
  await page.waitForSelector('.preset-card', { timeout: 10000 });

  // Ensure at least one preset button is visible
  await expect(page.locator('.preset-card').first()).toBeVisible();
}

/**
 * Clear localStorage and reload the page
 */
export async function clearStorageAndReload(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await waitForAppLoad(page);
}

/**
 * Apply a preset by index and wait for it to take effect
 */
export async function applyPreset(page: Page, presetIndex: number): Promise<void> {
  await waitForPresetsLoad(page);

  const presetButton = page.locator('.preset-card').nth(presetIndex);
  await expect(presetButton).toBeVisible();
  await presetButton.click();

  // Wait for settings to be applied
  await page.waitForTimeout(1000);
}

/**
 * Get current settings from localStorage
 */
export async function getStoredSettings(page: Page): Promise<any> {
  return await page.evaluate(() => {
    const saved = localStorage.getItem('mathgenie-settings');
    return saved ? JSON.parse(saved) : null;
  });
}

/**
 * Get current language from localStorage
 */
export async function getStoredLanguage(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    return localStorage.getItem('mathgenie-language');
  });
}

/**
 * Wait for error message to appear and verify its content
 */
export async function waitForErrorMessage(page: Page, expectedContent?: string): Promise<void> {
  await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

  if (expectedContent) {
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain(expectedContent);
  }
}

/**
 * Wait for error message to disappear
 */
export async function waitForErrorClear(page: Page): Promise<void> {
  await expect(page.locator('.error-message')).not.toBeVisible({ timeout: 5000 });
}

/**
 * Wait for problems to be generated and verify count
 */
export async function waitForProblemsGenerated(page: Page, expectedCount?: number): Promise<void> {
  await page.waitForSelector('.problem-item', { timeout: 10000 });

  if (expectedCount) {
    const problems = page.locator('.problem-item');
    await expect(problems).toHaveCount(expectedCount);
  }
}

/**
 * Change language and wait for translations to load
 */
export async function changeLanguage(page: Page, languageCode: string): Promise<void> {
  await page.selectOption('#language-select', languageCode);

  // Wait for translations to load
  await page.waitForTimeout(3000);

  // Verify language selector shows the new language
  await expect(page.locator('#language-select')).toHaveValue(languageCode);
}

/**
 * Fill form field and wait for debounced save
 */
export async function fillAndSave(page: Page, selector: string, value: string): Promise<void> {
  await page.fill(selector, value);
  await page.waitForTimeout(500); // Wait for debounced save
}

/**
 * Check if operations are selected correctly
 */
export async function verifyOperationsSelected(
  page: Page,
  expectedOperations: string[]
): Promise<void> {
  const selectedOperations = await page.locator('#operations option:checked').allTextContents();

  for (const operation of expectedOperations) {
    expect(selectedOperations.some(selected => selected.includes(operation))).toBe(true);
  }

  expect(selectedOperations).toHaveLength(expectedOperations.length);
}

/**
 * Verify form field values match expected settings
 */
export async function verifyFormValues(
  page: Page,
  expectedValues: Record<string, any>
): Promise<void> {
  for (const [field, value] of Object.entries(expectedValues)) {
    if (typeof value === 'boolean') {
      if (value) {
        await expect(page.locator(`#${field}`)).toBeChecked();
      } else {
        await expect(page.locator(`#${field}`)).not.toBeChecked();
      }
    } else {
      await expect(page.locator(`#${field}`)).toHaveValue(String(value));
    }
  }
}

/**
 * Create a validation error by setting invalid values
 */
export async function createValidationError(
  page: Page,
  errorType: 'count' | 'range' | 'operations'
): Promise<void> {
  switch (errorType) {
    case 'count':
      await page.fill('#numProblems', '0');
      await page.locator('#numProblems').blur();
      break;
    case 'range':
      await page.fill('#numRangeFrom', '20');
      await page.fill('#numRangeTo', '10');
      await page.locator('#numRangeTo').blur();
      break;
    case 'operations':
      await page.locator('#operations').selectOption([]);
      await page.click('button:has-text("Generate Problems")');
      break;
  }
}

/**
 * Verify that problems contain only specific operations
 */
export async function verifyProblemOperations(
  page: Page,
  allowedOperations: string[]
): Promise<void> {
  await waitForProblemsGenerated(page);

  const problemTexts = await page.locator('.problem-item').allTextContents();

  for (const problemText of problemTexts) {
    let hasAllowedOperation = false;

    for (const operation of allowedOperations) {
      if (problemText.includes(operation)) {
        hasAllowedOperation = true;
        break;
      }
    }

    expect(hasAllowedOperation).toBe(true);
  }
}

/**
 * Test preset configuration
 */
export interface PresetConfig {
  name: string;
  numProblems: number;
  operations: string[];
  allowNegative: boolean;
  numRangeFrom: number;
  numRangeTo: number;
}

/**
 * Verify preset settings are applied correctly
 */
export async function verifyPresetSettings(page: Page, config: PresetConfig): Promise<void> {
  await expect(page.locator('#numProblems')).toHaveValue(String(config.numProblems));
  await expect(page.locator('#numRangeFrom')).toHaveValue(String(config.numRangeFrom));
  await expect(page.locator('#numRangeTo')).toHaveValue(String(config.numRangeTo));

  if (config.allowNegative) {
    await expect(page.locator('#allowNegative')).toBeChecked();
  } else {
    await expect(page.locator('#allowNegative')).not.toBeChecked();
  }

  await verifyOperationsSelected(page, config.operations);
}

/**
 * Simulate network failure
 */
export async function simulateNetworkFailure(page: Page): Promise<void> {
  await page.context().setOffline(true);
}

/**
 * Restore network connection
 */
export async function restoreNetworkConnection(page: Page): Promise<void> {
  await page.context().setOffline(false);
}

/**
 * Fill localStorage with large data to simulate quota exceeded
 */
export async function fillLocalStorageQuota(page: Page): Promise<void> {
  await page.evaluate(() => {
    try {
      const largeData = 'x'.repeat(1000000); // 1MB string
      for (let i = 0; i < 10; i++) {
        localStorage.setItem(`large-data-${i}`, largeData);
      }
    } catch (e) {
      // Expected to fail at some point (simulate quota exceeded); log at debug level
      try {
        // Browsers may drop this log; safe in test context
        console.debug('Simulated quota exceed error while filling localStorage');
      } catch (_ignore) {
        // no-op
      }
    }
  });
}

/**
 * Corrupt localStorage data
 */
export async function corruptLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.setItem('mathgenie-settings', 'invalid-json-data');
  });
}

/**
 * Expand collapsible settings sections to make elements visible
 */
export async function expandAdvancedSettings(page: Page): Promise<void> {
  // Expand advanced settings if it exists and is not already open
  const advancedSettings = page.locator('.advanced-settings');
  if ((await advancedSettings.count()) > 0) {
    const isOpen = await advancedSettings.getAttribute('open');
    if (!isOpen) {
      await advancedSettings.locator('summary').click();
      await page.waitForTimeout(300); // Wait for animation
    }
  }
}

/**
 * Expand PDF settings section to make PDF elements visible
 */
export async function expandPdfSettings(page: Page): Promise<void> {
  // Expand PDF settings if it exists and is not already open
  const pdfSettings = page.locator('.pdf-settings-collapsible');
  if ((await pdfSettings.count()) > 0) {
    const isOpen = await pdfSettings.getAttribute('open');
    if (!isOpen) {
      // Use more specific selector to avoid conflicts with advanced settings
      const pdfToggle = page.locator('.pdf-settings-toggle');
      await pdfToggle.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200); // Wait for scroll

      // Try clicking with force if normal click fails
      try {
        await pdfToggle.click({ timeout: 5000 });
      } catch (error) {
        // Fallback: force click if element is intercepted
        await pdfToggle.click({ force: true });
      }

      await page.waitForTimeout(300); // Wait for animation
    }
  }
}

/**
 * Expand all collapsible settings sections
 */
export async function expandAllSettings(page: Page): Promise<void> {
  await expandAdvancedSettings(page);
  await expandPdfSettings(page);
}

/**
 * Ensure element is visible by expanding its parent section if needed
 */
export async function ensureElementVisible(page: Page, selector: string): Promise<void> {
  // Check if element is already visible
  const element = page.locator(selector);
  const isVisible = await element.isVisible().catch(() => false);

  if (!isVisible) {
    // Try to expand sections that might contain this element
    if (selector.includes('allowNegative') || selector.includes('showAnswers')) {
      await expandAdvancedSettings(page);
    }
    if (
      selector.includes('fontSize') ||
      selector.includes('lineSpacing') ||
      selector.includes('paperSize')
    ) {
      await expandPdfSettings(page);
    }

    // Wait a bit for the element to become visible
    await page.waitForTimeout(300);
  }
}
