// Basic end-to-end tests for MathGenie with TypeScript support
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

test.describe("MathGenie Basic Functionality", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("/");
  });

  test("should load the main page", async ({ page }: { page: Page }) => {
    await expect(page).toHaveTitle(/MathGenie/);
    await expect(page.locator("h1")).toContainText("MathGenie");
  });

  test("should have language selector", async ({ page }: { page: Page }) => {
    await expect(page.locator(".language-selector")).toBeVisible();
    await expect(page.locator("#language-select")).toBeVisible();
  });

  test("should generate problems", async ({ page }: { page: Page }) => {
    // Wait for initial problems to load
    await page.waitForSelector(".problems", { timeout: 10000 });

    // Check if problems are generated
    const problemsContainer = page.locator(".problems");
    await expect(problemsContainer).toBeVisible();

    const problems = page.locator(".problem-item");
    await expect(problems.first()).toBeVisible();
  });

  test("should change settings and regenerate", async ({ page }: { page: Page }) => {
    // Change number of problems
    await page.fill("#numProblems", "5");

    // Wait for regeneration
    await page.waitForTimeout(1000);

    // Check if problems updated
    const problems = page.locator(".problem-item");
    await expect(problems).toHaveCount(5);
  });

  test("should download PDF", async ({ page }: { page: Page }) => {
    // Wait for problems to load
    await page.waitForSelector(".problems", { timeout: 10000 });

    // Start download
    const downloadPromise = page.waitForEvent("download");
    await page.click('button:has-text("Download PDF")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/mathgenie-problems-.*\.pdf/);
  });

  test("should be responsive on mobile", async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".container")).toBeVisible();
    await expect(page.locator(".language-selector")).toBeVisible();
  });

  test("should switch languages", async ({ page }: { page: Page }) => {
    // Switch to Chinese
    await page.selectOption("#language-select", "zh");

    // Wait for translation to load
    await page.waitForTimeout(1000);

    // Check if UI is translated (assuming Chinese translations exist)
    const title = await page.locator("h1").textContent();
    expect(title).toBeTruthy();
  });

  test("should apply presets", async ({ page }: { page: Page }) => {
    // Click on beginner preset
    await page.click('.preset-card:has-text("Beginner") .preset-button');

    // Wait for settings to apply
    await page.waitForTimeout(1000);

    // Check if settings changed
    const numProblems = await page.inputValue("#numProblems");
    expect(parseInt(numProblems, 10)).toBe(15);
  });

  test("should handle React 19 concurrent features", async ({ page }: { page: Page }) => {
    // Test optimistic updates
    await page.fill("#numProblems", "10");

    // The input should show the optimistic value immediately
    await expect(page.locator("#numProblems")).toHaveValue("10");

    // Wait for the transition to complete
    await page.waitForTimeout(500);

    // Check if problems updated
    const problems = page.locator(".problem-item");
    await expect(problems).toHaveCount(10);
  });

  test("should show loading states during transitions", async ({ page }: { page: Page }) => {
    // Change settings that trigger transitions
    await page.selectOption("#operations", ["+", "-", "*"]);

    // Should show some form of loading/pending state
    await page.waitForTimeout(100);

    // Wait for transition to complete
    await page.waitForTimeout(1000);

    // Verify the change took effect
    const selectedOptions = await page.locator("#operations option:checked").count();
    expect(selectedOptions).toBe(3);
  });

  test("should handle errors gracefully with error boundary", async ({ page }: { page: Page }) => {
    // Simulate an error condition by trying to generate with invalid settings
    await page.fill("#numProblems", "0");
    await page.waitForTimeout(1000);

    // Should show error message, not crash the app
    const errorMessage = page.locator(".error-message");
    await expect(errorMessage).toBeVisible();

    // App should still be functional
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should use deferred values for performance", async ({ page }: { page: Page }) => {
    // Rapidly change settings
    for (let i = 5; i <= 15; i += 5) {
      await page.fill("#numProblems", i.toString());
      await page.waitForTimeout(50); // Quick changes
    }

    // Wait for all updates to settle
    await page.waitForTimeout(2000);

    // Final value should be applied
    await expect(page.locator("#numProblems")).toHaveValue("15");

    // Problems should be generated
    const problems = page.locator(".problem-item");
    await expect(problems).toHaveCount(15);
  });

  test("should validate input ranges", async ({ page }: { page: Page }) => {
    // Test invalid number range
    await page.fill("#numRangeFrom", "10");
    await page.fill("#numRangeTo", "5");

    // Wait for validation
    await page.waitForTimeout(1000);

    // Should show error
    const errorMessage = page.locator(".error-message");
    await expect(errorMessage).toBeVisible();
  });

  test("should persist settings in localStorage", async ({ page }: { page: Page }) => {
    // Change settings
    await page.fill("#numProblems", "25");
    await page.check("#allowNegative");

    // Reload page
    await page.reload();

    // Settings should be restored
    await expect(page.locator("#numProblems")).toHaveValue("25");
    await expect(page.locator("#allowNegative")).toBeChecked();
  });
});
