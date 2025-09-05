// Presets functionality e2e tests
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

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

    // Check that presets title is displayed
    const presetsTitle = page.locator('.settings-presets h3');
    await expect(presetsTitle).toBeVisible();
    await expect(presetsTitle).toContainText('Quick Presets');
  });

  test('should display all preset cards with correct content', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Check that all preset cards are visible
    const presetCards = page.locator('.preset-card');
    await expect(presetCards).toHaveCount(4);

    // Check beginner preset
    const beginnerCard = presetCards.nth(0);
    await expect(beginnerCard.locator('h4')).toContainText('Beginner');
    await expect(beginnerCard.locator('p')).toContainText('Simple addition and subtraction');
    await expect(beginnerCard.locator('.preset-action')).toContainText('Click to apply');

    // Check intermediate preset
    const intermediateCard = presetCards.nth(1);
    await expect(intermediateCard.locator('h4')).toContainText('Intermediate');
    await expect(intermediateCard.locator('p')).toContainText('All operations with medium numbers');

    // Check advanced preset
    const advancedCard = presetCards.nth(2);
    await expect(advancedCard.locator('h4')).toContainText('Advanced');
    await expect(advancedCard.locator('p')).toContainText('All operations including division');

    // Check multiplication preset
    const multiplicationCard = presetCards.nth(3);
    await expect(multiplicationCard.locator('h4')).toContainText('Multiplication');
    await expect(multiplicationCard.locator('p')).toContainText('Focus on multiplication practice');
  });

  test('should apply beginner preset correctly', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Click beginner preset
    const beginnerButton = page.locator('.preset-card').first();
    await expect(beginnerButton).toBeVisible();
    await beginnerButton.click();

    // Wait for settings to be applied
    await page.waitForTimeout(1000);

    // Verify beginner preset settings are applied
    await expect(page.locator('#numProblems')).toHaveValue('15');
    await expect(page.locator('#numRangeFrom')).toHaveValue('1');
    await expect(page.locator('#numRangeTo')).toHaveValue('10');
    await expect(page.locator('#resultRangeFrom')).toHaveValue('0');
    await expect(page.locator('#resultRangeTo')).toHaveValue('20');
    await expect(page.locator('#numOperandsRangeFrom')).toHaveValue('2');
    await expect(page.locator('#numOperandsRangeTo')).toHaveValue('2');
    await expect(page.locator('#allowNegative')).not.toBeChecked();
    await expect(page.locator('#showAnswers')).not.toBeChecked();
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

    // Click intermediate preset
    const intermediateButton = page.locator('.preset-card').nth(1);
    await expect(intermediateButton).toBeVisible();
    await intermediateButton.click();

    // Wait for settings to be applied
    await page.waitForTimeout(1000);

    // Verify intermediate preset settings are applied
    await expect(page.locator('#numProblems')).toHaveValue('20');
    await expect(page.locator('#numRangeFrom')).toHaveValue('1');
    await expect(page.locator('#numRangeTo')).toHaveValue('50');
    await expect(page.locator('#resultRangeFrom')).toHaveValue('0');
    await expect(page.locator('#resultRangeTo')).toHaveValue('100');
    await expect(page.locator('#numOperandsRangeFrom')).toHaveValue('2');
    await expect(page.locator('#numOperandsRangeTo')).toHaveValue('3');

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

    // Click advanced preset
    const advancedButton = page.locator('.preset-card').nth(2);
    await expect(advancedButton).toBeVisible();
    await advancedButton.click();

    // Wait for settings to be applied
    await page.waitForTimeout(1000);

    // Verify advanced preset settings are applied
    await expect(page.locator('#numProblems')).toHaveValue('25');
    await expect(page.locator('#numRangeFrom')).toHaveValue('1');
    await expect(page.locator('#numRangeTo')).toHaveValue('100');
    await expect(page.locator('#resultRangeFrom')).toHaveValue('-50');
    await expect(page.locator('#resultRangeTo')).toHaveValue('200');
    await expect(page.locator('#numOperandsRangeFrom')).toHaveValue('2');
    await expect(page.locator('#numOperandsRangeTo')).toHaveValue('4');
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

    // Click multiplication preset
    const multiplicationButton = page.locator('.preset-card').nth(3);
    await expect(multiplicationButton).toBeVisible();
    await multiplicationButton.click();

    // Wait for settings to be applied
    await page.waitForTimeout(1000);

    // Verify multiplication preset settings are applied
    await expect(page.locator('#numProblems')).toHaveValue('30');
    await expect(page.locator('#numRangeFrom')).toHaveValue('1');
    await expect(page.locator('#numRangeTo')).toHaveValue('12');
    await expect(page.locator('#resultRangeFrom')).toHaveValue('1');
    await expect(page.locator('#resultRangeTo')).toHaveValue('144');
    await expect(page.locator('#numOperandsRangeFrom')).toHaveValue('2');
    await expect(page.locator('#numOperandsRangeTo')).toHaveValue('2');
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
    await beginnerButton.click();

    // Wait for problems to be generated automatically
    await page.waitForSelector('.problem-item', { timeout: 10000 });

    // Verify problems are generated
    const problems = page.locator('.problem-item');
    await expect(problems).toHaveCount(15); // Beginner preset has 15 problems

    // Verify problems contain only addition and subtraction
    const problemTexts = await problems.allTextContents();
    for (const problemText of problemTexts) {
      expect(problemText).toMatch(/[+\-]/); // Should contain + or -
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
    await page.locator('.preset-card').first().click();
    await page.waitForTimeout(1000);

    // Verify beginner settings
    await expect(page.locator('#numProblems')).toHaveValue('15');

    // Apply intermediate preset
    await page.locator('.preset-card').nth(1).click();
    await page.waitForTimeout(1000);

    // Verify intermediate settings
    await expect(page.locator('#numProblems')).toHaveValue('20');
    await expect(page.locator('#numRangeTo')).toHaveValue('50');

    // Apply advanced preset
    await page.locator('.preset-card').nth(2).click();
    await page.waitForTimeout(1000);

    // Verify advanced settings
    await expect(page.locator('#numProblems')).toHaveValue('25');
    await expect(page.locator('#allowNegative')).toBeChecked();
  });

  test('should work correctly after language change', async ({ page }: { page: Page }) => {
    // Wait for initial load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Change language to Chinese
    await page.selectOption('#language-select', 'zh');
    await page.waitForTimeout(3000); // Wait for translations to load

    // Presets should still be visible and functional
    await expect(page.locator('.settings-presets')).toBeVisible();

    // Apply a preset
    const firstPresetButton = page.locator('.preset-card').first();
    await expect(firstPresetButton).toBeVisible();
    await firstPresetButton.click();

    // Wait for settings to be applied
    await page.waitForTimeout(1000);

    // Verify settings are applied correctly
    await expect(page.locator('#numProblems')).toHaveValue('15');

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
    const buttonCount = await presetButtons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = presetButtons.nth(i);
      await expect(button).toBeVisible();

      // Check that button has aria-label
      const ariaLabel = await button.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('Apply');
    }
  });

  test('should handle rapid preset switching', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Rapidly switch between presets
    const presetButtons = page.locator('.preset-card');

    await presetButtons.nth(0).click();
    await page.waitForTimeout(200);

    await presetButtons.nth(1).click();
    await page.waitForTimeout(200);

    await presetButtons.nth(2).click();
    await page.waitForTimeout(200);

    await presetButtons.nth(3).click();
    await page.waitForTimeout(1000); // Wait for final preset to apply

    // Verify final preset (multiplication) is applied
    await expect(page.locator('#numProblems')).toHaveValue('30');

    // Check operations selection
    const selectedOperations = await page.locator('#operations option:checked').allTextContents();
    expect(selectedOperations).toContain('Multiplication (×)');
    expect(selectedOperations).toHaveLength(1);
  });

  test('should persist preset settings in localStorage', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // Apply advanced preset
    await page.locator('.preset-card').nth(2).click();
    await page.waitForTimeout(1000);

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
    await expect(page.locator('#allowNegative')).toBeChecked();
  });

  test('should show visual feedback when preset is applied', async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector('.settings-presets', { timeout: 10000 });

    // First set a different value to ensure change is visible
    await page.fill('#numProblems', '10');
    await page.waitForTimeout(500);

    // Get initial values
    const initialNumProblems = await page.locator('#numProblems').inputValue();
    expect(initialNumProblems).toBe('10');

    // Apply intermediate preset (should change to 20)
    await page.locator('.preset-card').nth(1).click();

    // Wait for changes to be visible
    await page.waitForTimeout(1000);

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
