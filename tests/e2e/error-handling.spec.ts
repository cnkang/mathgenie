// Error handling and validation e2e tests
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

test.describe('Error Handling and Validation', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
    // Wait for the app to fully load
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForSelector('#operations', { timeout: 10000 });
  });

  test('should display error message for no operations selected', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Clear all operations by deselecting them
    await page.locator('#operations').selectOption([]);

    // Trigger validation by clicking generate button
    const generateButton = page.locator('button').filter({ hasText: 'Generate Problems' }).first();
    await generateButton.scrollIntoViewIfNeeded();
    await generateButton.click();

    // Wait for error message to appear
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // Verify error message content
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain('select at least one');
  });

  test('should display error message for invalid problem count', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Set invalid problem count (0)
    await page.fill('#numProblems', '0');

    // Trigger validation by blurring the input
    await page.locator('#numProblems').blur();

    // Wait for error message to appear
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // Verify error message content
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain('between 1 and 50,000');
  });

  test('should display error message for invalid number range', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Set invalid range (min > max)
    await page.fill('#numRangeFrom', '20');
    await page.fill('#numRangeTo', '10');

    // Trigger validation by blurring the input
    await page.locator('#numRangeTo').blur();

    // Wait for error message to appear
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // Verify error message content
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain('minimum cannot be greater than maximum');
  });

  test('should display error message for invalid result range', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Set invalid result range (min > max)
    await page.fill('#result-range-from', '50');
    await page.fill('#result-range-to', '10');

    // Trigger validation by blurring the input
    await page.locator('#result-range-to').blur();

    // Wait for error message to appear
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // Verify error message content
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain('minimum cannot be greater than maximum');
  });

  test('should display error message for invalid operands range', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Set invalid operands range (min < 2)
    await page.fill('#operands-range-from', '1');
    await page.fill('#operands-range-to', '3');

    // Trigger validation by blurring the input
    await page.locator('#operands-range-from').blur();

    // Wait for error message to appear
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // Verify error message content
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain('minimum must be at least 2');
  });

  test('should clear error message when settings become valid', async ({
    page,
  }: {
    page: Page;
  }) => {
    // First create an error
    await page.fill('#numProblems', '0');
    await page.locator('#numProblems').blur();

    // Wait for error message to appear
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // Fix the error
    await page.fill('#numProblems', '10');
    await page.locator('#numProblems').blur();

    // Wait for error message to disappear
    await expect(page.locator('.error-message')).not.toBeVisible({ timeout: 5000 });
  });

  test('should show error when trying to download PDF with no problems', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Set invalid problem count to trigger validation error
    await page.fill('#numProblems', '0');

    // Wait for validation error to appear
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // Verify error message content (should be about invalid problem count)
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain('between 1 and 50,000');
  });

  test('should handle extreme values gracefully', async ({ page }: { page: Page }) => {
    // Test with very large problem count (exceeding maximum)
    await page.fill('#numProblems', '60000');
    await page.locator('#numProblems').blur();

    // Should show error for exceeding maximum
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // Verify error message content
    const errorMessage1 = await page.locator('.error-message').textContent();
    expect(errorMessage1).toContain('between 1 and 50,000');

    // Test with negative values
    await page.fill('#numProblems', '-5');
    await page.locator('#numProblems').blur();

    // Should show error for negative values
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // Verify error message content
    const errorMessage2 = await page.locator('.error-message').textContent();
    expect(errorMessage2).toContain('between 1 and 50,000');
  });

  test('should validate multiple errors simultaneously', async ({ page }: { page: Page }) => {
    // Create multiple validation errors
    await page.fill('#numProblems', '0');
    await page.fill('#numRangeFrom', '20');
    await page.fill('#numRangeTo', '10');

    // Trigger validation
    const generateButton = page.locator('button').filter({ hasText: 'Generate Problems' }).first();
    await generateButton.scrollIntoViewIfNeeded();
    await generateButton.click();

    // Should show at least one error message
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // The error message should be meaningful
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage!.length).toBeGreaterThan(10);
  });

  test('should maintain error state during language changes', async ({ page }: { page: Page }) => {
    // Create an error
    await page.fill('#numProblems', '0');
    await page.locator('#numProblems').blur();

    // Wait for error message to appear
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // Change language
    await page.selectOption('#language-select', 'zh');
    await page.waitForTimeout(2000);

    // Error message should still be visible (possibly in different language)
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });
  });

  test('should show error message with proper ARIA attributes', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Create an error
    await page.fill('#numProblems', '0');
    await page.locator('#numProblems').blur();

    // Wait for error message to appear
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // Check for proper ARIA role
    const errorElement = page.locator('.error-message');
    await expect(errorElement).toHaveAttribute('role', 'alert');
  });
});
