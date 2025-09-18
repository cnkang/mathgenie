// Presets functionality e2e tests
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  applyPresetWebkitSafe,
  changeLanguage,
  ensureElementVisible,
  waitForPresetsLoad,
} from './test-utils';

test.describe('Presets Functionality', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
    // Wait for the app to fully load
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForSelector('#operations', { timeout: 10000 });
  });

  test('should display presets section after translations load', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Wait for translations to load completely
    await page.waitForFunction(
      () => {
        const title = document.querySelector('h1')?.textContent;
        return title && title !== 'Loading...' && title.length > 0;
      },
      { timeout: 10000 }
    );

    // Wait for presets section to be visible
    await expect(page.locator('.settings-presets')).toBeVisible({ timeout: 10000 });

    // Check that presets title is displayed (use h2 for the main title)
    const presetsTitle = page.locator('.settings-presets h2');
    await expect(presetsTitle).toBeVisible();
    await expect(presetsTitle).toContainText('Quick Presets');
  });

  test('should display all preset cards with correct content', async ({ page }: { page: Page }) => {
    // Wait for presets to load with longer timeout for Firefox
    await page.waitForSelector('.settings-presets', { timeout: 15000 }); // Increased from 10s

    // Check that all preset cards are visible
    const presetCards = page.locator('.preset-card');
    await expect(presetCards).toHaveCount(4);

    // Use more specific selectors to improve Firefox performance
    // Check beginner preset - use first() instead of nth(0) for better performance
    const beginnerCard = page.locator('.preset-card').first();
    await expect(beginnerCard.locator('h3')).toContainText('Beginner', { timeout: 8000 });
    await expect(beginnerCard.locator('p')).toContainText('Simple addition and subtraction');
    await expect(beginnerCard.locator('.preset-action')).toContainText('Apply');

    // Check intermediate preset - use more specific selector
    const intermediateCard = page.locator('.preset-card:has-text("Intermediate")');
    await expect(intermediateCard.locator('h3')).toContainText('Intermediate', { timeout: 8000 });
    await expect(intermediateCard.locator('p')).toContainText('All operations with medium numbers');

    // Check advanced preset - use more specific selector
    const advancedCard = page.locator('.preset-card:has-text("Advanced")');
    await expect(advancedCard.locator('h3')).toContainText('Advanced', { timeout: 8000 });
    await expect(advancedCard.locator('p')).toContainText('All operations including division');

    // Check multiplication preset - use more specific selector
    const multiplicationCard = page.locator('.preset-card:has-text("Multiplication")');
    await expect(multiplicationCard.locator('h3')).toContainText('Multiplication', { timeout: 8000 });
    await expect(multiplicationCard.locator('p')).toContainText('Focus on multiplication practice');
  });

  test('should apply beginner preset correctly', async ({ page }: { page: Page }) => {
    // Wait for app to fully load including translations
    await page.waitForFunction(
      () => {
        const title = document.querySelector('h1')?.textContent;
        return title && title !== 'Loading...' && title.length > 0;
      },
      { timeout: 10000 }
    );

    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Wait for all preset cards to be visible
    await page.waitForSelector('.preset-card', { timeout: 10000 });

    // Ensure we have exactly 4 preset cards
    const presetCount = await page.locator('.preset-card').count();
    expect(presetCount).toBe(4);

    // Click beginner preset (first preset card)
    const beginnerButton = page.locator('.preset-card').first();

    await expect(beginnerButton).toBeVisible();

    // Use Playwright's native click for better cross-browser compatibility
    await beginnerButton.click({ timeout: 5000 });

    // Wait for settings to be applied by checking for actual state change
    await expect(page.locator('#numProblems')).toHaveValue('15', { timeout: 5000 });

    // Verify beginner preset settings are applied
    await expect(page.locator('#numProblems')).toHaveValue('15');
    await expect(page.locator('#numRangeFrom')).toHaveValue('1');
    await expect(page.locator('#numRangeTo')).toHaveValue('10');
    await expect(page.locator('#result-range-from')).toHaveValue('0');
    await expect(page.locator('#result-range-to')).toHaveValue('20');
    await expect(page.locator('#operands-range-from')).toHaveValue('2');
    await expect(page.locator('#operands-range-to')).toHaveValue('2');
    await ensureElementVisible(page, '#allowNegative');
    await expect(page.locator('#allowNegative')).not.toBeChecked();
    await expect(page.locator('#showAnswers')).not.toBeChecked();
    await ensureElementVisible(page, '#fontSize');
    await expect(page.locator('#fontSize')).toHaveValue('18');
    await expect(page.locator('#lineSpacing')).toHaveValue('16');
    await expect(page.locator('#paperSize')).toHaveValue('a4');

    // Check operations selection
    const selectedOperations = await page.locator('#operations option:checked').allTextContents();
    expect(selectedOperations).toContain('Addition (+)');
    expect(selectedOperations).toContain('Subtraction (-)');
    expect(selectedOperations).toHaveLength(2);
  });

  test('should apply intermediate preset correctly', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Click intermediate preset using Playwright's native click
    const intermediateButton = page.locator('.preset-card').nth(1);
    await expect(intermediateButton).toBeVisible();
    await intermediateButton.click({ timeout: 5000 });

    // Wait for settings to be applied by checking for actual state change
    await expect(page.locator('#numProblems')).toHaveValue('20', { timeout: 5000 });

    // Verify intermediate preset settings are applied
    await expect(page.locator('#numProblems')).toHaveValue('20');
    await expect(page.locator('#numRangeFrom')).toHaveValue('1');
    await expect(page.locator('#numRangeTo')).toHaveValue('50');
    await expect(page.locator('#result-range-from')).toHaveValue('0');
    await expect(page.locator('#result-range-to')).toHaveValue('100');
    await expect(page.locator('#operands-range-from')).toHaveValue('2');
    await expect(page.locator('#operands-range-to')).toHaveValue('3');

    // Check operations selection (should include +, -, *)
    const selectedOperations = await page.locator('#operations option:checked').allTextContents();
    expect(selectedOperations).toContain('Addition (+)');
    expect(selectedOperations).toContain('Subtraction (-)');
    expect(selectedOperations).toContain('Multiplication (×)');
    expect(selectedOperations).toHaveLength(3);
  });

  test('should apply advanced preset correctly', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Click advanced preset using Playwright's native click
    const advancedButton = page.locator('.preset-card').nth(2);
    await expect(advancedButton).toBeVisible();
    await advancedButton.click({ timeout: 5000 });

    // Wait for settings to be applied by checking for actual state change
    await expect(page.locator('#numProblems')).toHaveValue('25', { timeout: 5000 });

    // Verify advanced preset settings are applied
    await expect(page.locator('#numProblems')).toHaveValue('25');
    await expect(page.locator('#numRangeFrom')).toHaveValue('1');
    await expect(page.locator('#numRangeTo')).toHaveValue('100');
    await expect(page.locator('#result-range-from')).toHaveValue('-50');
    await expect(page.locator('#result-range-to')).toHaveValue('200');
    await expect(page.locator('#operands-range-from')).toHaveValue('2');
    await expect(page.locator('#operands-range-to')).toHaveValue('4');
    await ensureElementVisible(page, '#allowNegative');
    await expect(page.locator('#allowNegative')).toBeChecked();

    // Check operations selection (should include all operations)
    const selectedOperations = await page.locator('#operations option:checked').allTextContents();
    expect(selectedOperations).toContain('Addition (+)');
    expect(selectedOperations).toContain('Subtraction (-)');
    expect(selectedOperations).toContain('Multiplication (×)');
    expect(selectedOperations).toContain('Division (÷)');
    expect(selectedOperations).toHaveLength(4);
  });

  test('should apply multiplication preset correctly', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Click multiplication preset using Playwright's native click
    const multiplicationButton = page.locator('.preset-card').nth(3);
    await expect(multiplicationButton).toBeVisible();
    await multiplicationButton.click({ timeout: 5000 });

    // Wait for settings to be applied by checking for actual state change
    await expect(page.locator('#numProblems')).toHaveValue('30', { timeout: 5000 });

    // Verify multiplication preset settings are applied
    await expect(page.locator('#numProblems')).toHaveValue('30');
    await expect(page.locator('#numRangeFrom')).toHaveValue('1');
    await expect(page.locator('#numRangeTo')).toHaveValue('12');
    await expect(page.locator('#result-range-from')).toHaveValue('1');
    await expect(page.locator('#result-range-to')).toHaveValue('144');
    await expect(page.locator('#operands-range-from')).toHaveValue('2');
    await expect(page.locator('#operands-range-to')).toHaveValue('2');
    await ensureElementVisible(page, '#allowNegative');
    await expect(page.locator('#allowNegative')).not.toBeChecked();

    // Check operations selection (should only include multiplication)
    const selectedOperations = await page.locator('#operations option:checked').allTextContents();
    expect(selectedOperations).toContain('Multiplication (×)');
    expect(selectedOperations).toHaveLength(1);
  });

  test('should generate problems after applying preset', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Apply beginner preset
    const beginnerButton = page.locator('.preset-card').first();
    await beginnerButton.click({ timeout: 5000 });

    // Wait for problems to be generated automatically
    await page.waitForSelector('.problem-item', { timeout: 10000 });

    // Verify problems are generated
    const problems = page.locator('.problem-item');
    await expect(problems).toHaveCount(15); // Beginner preset has 15 problems

    // Verify problems contain only addition and subtraction
    const problemTexts = await problems.allTextContents();
    for (const problemText of problemTexts) {
      expect(problemText).toMatch(/[+-]/); // Should contain + or -
      expect(problemText).not.toMatch(/[×÷]/); // Should not contain × or ÷
    }
  });

  test('should preserve custom settings when switching between presets', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Apply beginner preset first
    const beginnerPreset = page.locator('.preset-card').first();
    await beginnerPreset.click({ timeout: 5000 });

    // Verify beginner settings
    await expect(page.locator('#numProblems')).toHaveValue('15', { timeout: 5000 });

    // Apply intermediate preset
    const intermediatePreset = page.locator('.preset-card').nth(1);
    await intermediatePreset.click({ timeout: 5000 });

    // Verify intermediate settings
    await expect(page.locator('#numProblems')).toHaveValue('20', { timeout: 5000 });
    await expect(page.locator('#numRangeTo')).toHaveValue('50', { timeout: 5000 });

    // Apply advanced preset
    const advancedPreset = page.locator('.preset-card').nth(2);
    await advancedPreset.click({ timeout: 5000 });

    // Verify advanced settings
    await expect(page.locator('#numProblems')).toHaveValue('25', { timeout: 5000 });
    await ensureElementVisible(page, '#allowNegative');
    await expect(page.locator('#allowNegative')).toBeChecked({ timeout: 5000 });
  });

  test('should work correctly after language change', async ({ page }: { page: Page }) => {
    // Wait for initial load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Change language to Chinese
    await changeLanguage(page, 'zh');

    // Presets should still be visible and functional
    await expect(page.locator('.settings-presets')).toBeVisible();

    // Apply a preset
    const firstPresetButton = page.locator('.preset-card').first();
    await expect(firstPresetButton).toBeVisible();
    await firstPresetButton.click({ timeout: 5000 });

    // Verify settings are applied correctly
    await expect(page.locator('#numProblems')).toHaveValue('15', { timeout: 5000 });

    // Problems should be generated
    await page.waitForSelector('.problem-item', { timeout: 10000 });
    const problems = page.locator('.problem-item');
    await expect(problems).toHaveCount(15);
  });

  test('should have accessible preset buttons', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Check that preset buttons have proper ARIA labels
    const presetButtons = page.locator('.preset-card');
    
    // Get count once and use it, avoid repeated count() calls in Firefox
    const buttonCount = await presetButtons.count();
    expect(buttonCount).toBeGreaterThan(0); // Ensure we have buttons to test

    // Use Promise.all for better performance in Firefox instead of sequential loop
    const buttonChecks = [];
    for (let i = 0; i < Math.min(buttonCount, 10); i++) { // Limit to 10 to prevent Firefox timeout
      const button = presetButtons.nth(i);
      buttonChecks.push(
        Promise.all([
          expect(button).toBeVisible({ timeout: 5000 }),
          button.getAttribute('aria-label').then(ariaLabel => {
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel).toContain('Apply');
          })
        ])
      );
    }
    
    // Wait for all checks to complete
    await Promise.all(buttonChecks);
  });

  test('should handle rapid preset switching', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await waitForPresetsLoad(page);

    // Use WebKit-safe preset switching for better cross-browser compatibility
    await applyPresetWebkitSafe(page, 0);
    await applyPresetWebkitSafe(page, 1);
    await applyPresetWebkitSafe(page, 2);
    await applyPresetWebkitSafe(page, 3);

    // Check operations selection
    const selectedOperations = await page.locator('#operations option:checked').allTextContents();
    expect(selectedOperations).toContain('Multiplication (×)');
    expect(selectedOperations).toHaveLength(1);
  });

  test('should persist preset settings in localStorage', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Apply advanced preset
    const advancedPreset = page.locator('.preset-card').nth(2);
    await advancedPreset.click({ timeout: 5000 });

    // Wait for settings to be applied by checking for actual state change
    await expect(page.locator('#numProblems')).toHaveValue('25', { timeout: 5000 });

    // Verify settings are saved in localStorage
    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem('mathgenie-settings');
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.numProblems).toBe(25);
    expect(savedSettings.operations).toEqual(['+', '-', '*', '/']);
    expect(savedSettings.allowNegative).toBe(true);

    // Reload page and verify settings are restored
    await page.reload();
    await page.waitForSelector('#numProblems', { timeout: 10000 });

    await expect(page.locator('#numProblems')).toHaveValue('25');
    await ensureElementVisible(page, '#allowNegative');
    await expect(page.locator('#allowNegative')).toBeChecked();
  });

  test('should show visual feedback when preset is applied', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // First set a different value to ensure change is visible
    await page.fill('#numProblems', '10');
    await expect(page.locator('#numProblems')).toHaveValue('10', { timeout: 3000 });

    // Get initial values
    const initialNumProblems = await page.locator('#numProblems').inputValue();
    expect(initialNumProblems).toBe('10');

    // Apply intermediate preset (should change to 20)
    const intermediatePreset = page.locator('.preset-card').nth(1);
    await intermediatePreset.click({ timeout: 5000 });

    // Wait for changes to be visible by checking for actual state change
    await expect(page.locator('#numProblems')).toHaveValue('20', { timeout: 5000 });

    // Verify values have changed
    const newNumProblems = await page.locator('#numProblems').inputValue();
    expect(newNumProblems).toBe('20');
    expect(newNumProblems).not.toBe(initialNumProblems);

    // Problems should be regenerated automatically
    await page.waitForSelector('.problem-item', { timeout: 10000 });
    const problems = page.locator('.problem-item');
    await expect(problems.first()).toBeVisible();
  });
});
