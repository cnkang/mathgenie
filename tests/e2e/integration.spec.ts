// Integration tests for error handling, localStorage, and presets
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

test.describe("Integration Tests", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("/");
    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForSelector("h1", { timeout: 10000 });
    await page.waitForSelector("#operations", { timeout: 10000 });
  });

  test("should handle error states with localStorage persistence", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Create an error state
    await page.fill("#numProblems", "0");
    await page.locator("#numProblems").blur();

    // Wait for error message
    await expect(page.locator(".error-message")).toBeVisible({ timeout: 5000 });

    // Change to valid value
    await page.fill("#numProblems", "15");
    await page.waitForTimeout(500);

    // Error should clear and settings should be saved
    await expect(page.locator(".error-message")).not.toBeVisible();

    // Verify settings are saved
    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem("mathgenie-settings");
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.numProblems).toBe(15);

    // Reload and verify persistence
    await page.reload();
    await page.waitForSelector("#numProblems", { timeout: 10000 });
    await expect(page.locator("#numProblems")).toHaveValue("15");
  });

  test("should apply presets and persist them with error validation", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Wait for presets to load
    await page.waitForSelector(".settings-presets", { timeout: 10000 });

    // Apply beginner preset
    await page.locator(".preset-card").first().locator(".preset-button").click();
    await page.waitForTimeout(1000);

    // Verify preset is applied and saved
    await expect(page.locator("#numProblems")).toHaveValue("15");

    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem("mathgenie-settings");
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.numProblems).toBe(15);

    // Create an error by modifying settings
    await page.fill("#numProblems", "0");
    await page.locator("#numProblems").blur();

    // Error should appear
    await expect(page.locator(".error-message")).toBeVisible({ timeout: 5000 });

    // Apply another preset to fix the error
    await page.locator(".preset-card").nth(1).locator(".preset-button").click();
    await page.waitForTimeout(1000);

    // Error should clear and new preset should be applied
    await expect(page.locator(".error-message")).not.toBeVisible();
    await expect(page.locator("#numProblems")).toHaveValue("20");
  });

  test("should maintain error states across language changes with persistence", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Create an error
    await page.fill("#numProblems", "0");
    await page.locator("#numProblems").blur();

    // Wait for error message
    await expect(page.locator(".error-message")).toBeVisible({ timeout: 5000 });

    // Change language
    await page.selectOption("#language-select", "zh");
    await page.waitForTimeout(3000);

    // Error should still be visible (possibly in different language)
    await expect(page.locator(".error-message")).toBeVisible();

    // Fix the error
    await page.fill("#numProblems", "20");
    await page.waitForTimeout(500);

    // Error should clear
    await expect(page.locator(".error-message")).not.toBeVisible();

    // Settings should be saved
    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem("mathgenie-settings");
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.numProblems).toBe(20);

    // Language should also be saved
    const savedLanguage = await page.evaluate(() => {
      return localStorage.getItem("mathgenie-language");
    });

    expect(savedLanguage).toBe("zh");
  });

  test("should handle preset application with validation errors", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Wait for presets to load
    await page.waitForSelector(".settings-presets", { timeout: 10000 });

    // First create an invalid state manually
    await page.fill("#numRangeFrom", "50");
    await page.fill("#numRangeTo", "10"); // Invalid: min > max
    await page.locator("#numRangeTo").blur();

    // Error should appear
    await expect(page.locator(".error-message")).toBeVisible({ timeout: 5000 });

    // Apply a preset - this should fix the error
    await page.locator(".preset-card").first().locator(".preset-button").click();
    await page.waitForTimeout(1000);

    // Error should be cleared by preset application
    await expect(page.locator(".error-message")).not.toBeVisible();

    // Verify preset settings are applied correctly
    await expect(page.locator("#numRangeFrom")).toHaveValue("1");
    await expect(page.locator("#numRangeTo")).toHaveValue("10");

    // Problems should be generated successfully
    await page.waitForSelector(".problem-item", { timeout: 10000 });
    const problems = page.locator(".problem-item");
    await expect(problems).toHaveCount(15);
  });

  test("should handle complex workflow: preset -> custom changes -> errors -> persistence", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Wait for presets to load
    await page.waitForSelector(".settings-presets", { timeout: 10000 });

    // Step 1: Apply intermediate preset
    await page.locator(".preset-card").nth(1).locator(".preset-button").click();
    await page.waitForTimeout(1000);

    // Verify preset is applied
    await expect(page.locator("#numProblems")).toHaveValue("20");

    // Step 2: Make custom changes
    await page.fill("#numProblems", "35");
    await page.check("#allowNegative");
    await page.waitForTimeout(500);

    // Step 3: Create an error
    await page.fill("#resultRangeFrom", "100");
    await page.fill("#resultRangeTo", "50"); // Invalid range
    await page.locator("#resultRangeTo").blur();

    // Error should appear
    await expect(page.locator(".error-message")).toBeVisible({ timeout: 5000 });

    // Step 4: Fix the error
    await page.fill("#resultRangeTo", "150");
    await page.waitForTimeout(500);

    // Error should clear
    await expect(page.locator(".error-message")).not.toBeVisible();

    // Step 5: Verify all settings are saved
    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem("mathgenie-settings");
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.numProblems).toBe(35);
    expect(savedSettings.allowNegative).toBe(true);
    expect(savedSettings.resultRange).toEqual([100, 150]);

    // Step 6: Reload and verify persistence
    await page.reload();
    await page.waitForSelector("#numProblems", { timeout: 10000 });

    await expect(page.locator("#numProblems")).toHaveValue("35");
    await expect(page.locator("#allowNegative")).toBeChecked();
    await expect(page.locator("#resultRangeFrom")).toHaveValue("100");
    await expect(page.locator("#resultRangeTo")).toHaveValue("150");

    // Step 7: Verify problems can be generated
    await page.waitForSelector(".problem-item", { timeout: 10000 });
    const problems = page.locator(".problem-item");
    await expect(problems).toHaveCount(35);
  });

  test("should handle localStorage corruption with preset recovery", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem("mathgenie-settings", "invalid-json");
    });

    // Reload page
    await page.reload();
    await page.waitForSelector("#numProblems", { timeout: 10000 });

    // Should fall back to defaults
    await expect(page.locator("#numProblems")).toHaveValue("20");

    // Wait for presets to load
    await page.waitForSelector(".settings-presets", { timeout: 10000 });

    // Apply a preset to recover
    await page.locator(".preset-card").first().locator(".preset-button").click();
    await page.waitForTimeout(1000);

    // Verify preset is applied and saved correctly
    await expect(page.locator("#numProblems")).toHaveValue("15");

    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem("mathgenie-settings");
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.numProblems).toBe(15);
  });

  test("should handle multiple validation errors with preset override", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Create multiple validation errors
    await page.fill("#numProblems", "0"); // Invalid count
    await page.fill("#numRangeFrom", "20");
    await page.fill("#numRangeTo", "10"); // Invalid range
    await page.locator("#operations").selectOption([]); // No operations

    // Trigger validation
    const generateButton = page.locator("button").filter({ hasText: "Generate Problems" }).first();
    await generateButton.scrollIntoViewIfNeeded();
    await generateButton.click();

    // Error should appear
    await expect(page.locator(".error-message")).toBeVisible({ timeout: 5000 });

    // Wait for presets to load
    await page.waitForSelector(".settings-presets", { timeout: 10000 });

    // Apply preset to fix all errors at once
    await page.locator(".preset-card").nth(2).locator(".preset-button").click(); // Advanced preset
    await page.waitForTimeout(1000);

    // All errors should be cleared
    await expect(page.locator(".error-message")).not.toBeVisible();

    // Verify valid settings are applied
    await expect(page.locator("#numProblems")).toHaveValue("25");
    await expect(page.locator("#numRangeFrom")).toHaveValue("1");
    await expect(page.locator("#numRangeTo")).toHaveValue("100");

    // Operations should be selected
    const selectedOperations = await page.locator("#operations option:checked").allTextContents();
    expect(selectedOperations.length).toBeGreaterThan(0);

    // Problems should be generated
    await page.waitForSelector(".problem-item", { timeout: 10000 });
    const problems = page.locator(".problem-item");
    await expect(problems).toHaveCount(25);
  });

  test("should maintain consistency across browser tabs with error states", async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Navigate both pages
    await page1.goto("/");
    await page2.goto("/");

    await page1.waitForSelector("#numProblems", { timeout: 10000 });
    await page2.waitForSelector("#numProblems", { timeout: 10000 });

    // Create error in first tab
    await page1.fill("#numProblems", "0");
    await page1.locator("#numProblems").blur();

    // Error should appear in first tab
    await expect(page1.locator(".error-message")).toBeVisible({ timeout: 5000 });

    // Fix error and apply preset in first tab
    await page1.waitForSelector(".settings-presets", { timeout: 10000 });
    await page1.locator(".preset-card").first().locator(".preset-button").click();
    await page1.waitForTimeout(1000);

    // Reload second tab
    await page2.reload();
    await page2.waitForSelector("#numProblems", { timeout: 10000 });

    // Settings should be synchronized
    await expect(page2.locator("#numProblems")).toHaveValue("15");

    // No error should be present in second tab
    await expect(page2.locator(".error-message")).not.toBeVisible();

    await context.close();
  });

  test("should handle rapid interactions without breaking state", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Wait for everything to load
    await page.waitForSelector(".settings-presets", { timeout: 10000 });

    // Rapid sequence of actions
    await page.fill("#numProblems", "0"); // Create error
    await page.locator(".preset-card").first().locator(".preset-button").click(); // Apply preset
    await page.fill("#numProblems", "999"); // Create another error
    await page.locator(".preset-card").nth(1).locator(".preset-button").click(); // Apply different preset
    await page.check("#allowNegative"); // Custom change
    await page.fill("#fontSize", "24"); // Another custom change

    // Wait for all changes to settle
    await page.waitForTimeout(2000);

    // Final state should be consistent
    await expect(page.locator("#numProblems")).toHaveValue("20"); // Intermediate preset value
    await expect(page.locator("#allowNegative")).toBeChecked(); // Custom change preserved
    await expect(page.locator("#fontSize")).toHaveValue("24"); // Custom change preserved

    // No errors should be present
    await expect(page.locator(".error-message")).not.toBeVisible();

    // Settings should be saved correctly
    const savedSettings = await page.evaluate(() => {
      const saved = localStorage.getItem("mathgenie-settings");
      return saved ? JSON.parse(saved) : null;
    });

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.numProblems).toBe(20);
    expect(savedSettings.allowNegative).toBe(true);
    expect(savedSettings.fontSize).toBe(24);

    // Problems should be generated
    await page.waitForSelector(".problem-item", { timeout: 10000 });
    const problems = page.locator(".problem-item");
    await expect(problems).toHaveCount(20);
  });
});
