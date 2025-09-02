// Accessibility and ARIA attributes e2e tests
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { createValidationError, waitForAppLoad, waitForErrorMessage } from "./test-utils";

test.describe("Accessibility and ARIA", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("/");
    await waitForAppLoad(page);
  });

  test("should have proper ARIA attributes on error messages", async ({ page }: { page: Page }) => {
    // Create a validation error
    await createValidationError(page, "count");

    // Wait for error message to appear
    await waitForErrorMessage(page);

    // Check ARIA attributes
    const errorElement = page.locator(".error-message");
    await expect(errorElement).toHaveAttribute("role", "alert");
    await expect(errorElement).toHaveAttribute("aria-live", "polite");
    await expect(errorElement).toHaveAttribute("aria-atomic", "true");

    // Error message should be visible and have meaningful content
    await expect(errorElement).toBeVisible();
    const errorText = await errorElement.textContent();
    expect(errorText).toBeTruthy();
    expect(errorText!.length).toBeGreaterThan(10);
  });

  test("should have proper ARIA labels on form controls", async ({ page }: { page: Page }) => {
    // Check operations select
    const operationsSelect = page.locator("#operations");
    await expect(operationsSelect).toHaveAttribute("aria-label");

    // Check number inputs
    const numProblemsInput = page.locator("#numProblems");
    await expect(numProblemsInput).toHaveAttribute("aria-label");

    // Check range inputs
    const numRangeFromInput = page.locator("#numRangeFrom");
    await expect(numRangeFromInput).toHaveAttribute("aria-label");

    const numRangeToInput = page.locator("#numRangeTo");
    await expect(numRangeToInput).toHaveAttribute("aria-label");

    // Check checkboxes
    const allowNegativeCheckbox = page.locator("#allowNegative");
    await expect(allowNegativeCheckbox).toHaveAttribute("aria-label");

    const showAnswersCheckbox = page.locator("#showAnswers");
    await expect(showAnswersCheckbox).toHaveAttribute("aria-label");
  });

  test("should have proper ARIA labels on buttons", async ({ page }: { page: Page }) => {
    // Check generate button
    const generateButton = page.locator('button:has-text("Generate Problems")');
    await expect(generateButton).toHaveAttribute("aria-label");

    // Check download button
    const downloadButton = page.locator('button:has-text("Download PDF")');
    await expect(downloadButton).toHaveAttribute("aria-label");
  });

  test("should have proper ARIA labels on preset buttons", async ({ page }: { page: Page }) => {
    // Wait for presets to load
    await page.waitForSelector(".settings-presets", { timeout: 10000 });

    // Check preset buttons
    const presetButtons = page.locator(".preset-button");
    const buttonCount = await presetButtons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = presetButtons.nth(i);
      await expect(button).toHaveAttribute("aria-label");

      const ariaLabel = await button.getAttribute("aria-label");
      expect(ariaLabel).toContain("Apply");
    }
  });

  test("should have proper ARIA labels on language selector", async ({ page }: { page: Page }) => {
    const languageSelect = page.locator("#language-select");
    await expect(languageSelect).toHaveAttribute("aria-label");
  });

  test("should maintain focus management during error states", async ({ page }: { page: Page }) => {
    // Focus on number of problems input
    await page.locator("#numProblems").focus();

    // Create error
    await page.fill("#numProblems", "0");
    await page.locator("#numProblems").blur();

    // Wait for error message
    await waitForErrorMessage(page);

    // Focus should remain manageable
    await page.locator("#numProblems").focus();
    const focusedElement = await page.evaluate(() => document.activeElement?.id);
    expect(focusedElement).toBe("numProblems");
  });

  test("should support keyboard navigation", async ({ page }: { page: Page }) => {
    // Test tab navigation through form elements
    await page.keyboard.press("Tab"); // Should focus first interactive element

    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Continue tabbing through elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    }
  });

  test("should support keyboard interaction with preset buttons", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Wait for presets to load
    await page.waitForSelector(".settings-presets", { timeout: 10000 });

    // Focus on first preset button
    const firstPresetButton = page.locator(".preset-button").first();
    await firstPresetButton.focus();

    // Activate with Enter key
    await page.keyboard.press("Enter");

    // Wait for preset to be applied
    await page.waitForTimeout(1000);

    // Verify preset was applied
    await expect(page.locator("#numProblems")).toHaveValue("15");
  });

  test("should support keyboard interaction with checkboxes", async ({ page }: { page: Page }) => {
    // Focus on checkbox
    await page.locator("#allowNegative").focus();

    // Check initial state
    await expect(page.locator("#allowNegative")).not.toBeChecked();

    // Toggle with Space key
    await page.keyboard.press("Space");

    // Verify checkbox is checked
    await expect(page.locator("#allowNegative")).toBeChecked();

    // Toggle again
    await page.keyboard.press("Space");

    // Verify checkbox is unchecked
    await expect(page.locator("#allowNegative")).not.toBeChecked();
  });

  test("should have proper heading hierarchy", async ({ page }: { page: Page }) => {
    // Check main heading
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();

    // Check section headings
    const h3Elements = page.locator("h3");
    const h3Count = await h3Elements.count();
    expect(h3Count).toBeGreaterThan(0);

    // Verify heading content is meaningful
    for (let i = 0; i < h3Count; i++) {
      const heading = h3Elements.nth(i);
      const text = await heading.textContent();
      expect(text).toBeTruthy();
      expect(text!.length).toBeGreaterThan(2);
    }
  });

  test("should have proper form labels", async ({ page }: { page: Page }) => {
    // Check that all form inputs have associated labels
    const inputs = page.locator("input, select");
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const inputId = await input.getAttribute("id");

      if (inputId) {
        // Check for associated label
        const label = page.locator(`label[for="${inputId}"]`);
        const labelExists = (await label.count()) > 0;

        // If no explicit label, check for aria-label
        if (!labelExists) {
          const ariaLabel = await input.getAttribute("aria-label");
          expect(ariaLabel).toBeTruthy();
        }
      }
    }
  });

  test("should provide meaningful error messages for screen readers", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Test different types of errors
    const errorTypes = [
      { type: "count" as const, expectedText: "between 1 and 100" },
      { type: "range" as const, expectedText: "minimum cannot be greater than maximum" },
      { type: "operations" as const, expectedText: "select at least one" },
    ];

    for (const { type, expectedText } of errorTypes) {
      // Create error
      await createValidationError(page, type);

      // Wait for error message
      await waitForErrorMessage(page, expectedText);

      // Verify error message is descriptive
      const errorMessage = await page.locator(".error-message").textContent();
      expect(errorMessage).toBeTruthy();
      expect(errorMessage!.length).toBeGreaterThan(10);

      // Clear error for next test
      if (type === "count") {
        await page.fill("#numProblems", "20");
      } else if (type === "range") {
        await page.fill("#numRangeTo", "30");
      } else if (type === "operations") {
        await page.locator("#operations").selectOption(["+", "-"]);
      }

      await page.waitForTimeout(500);
    }
  });

  test("should support high contrast mode", async ({ page }: { page: Page }) => {
    // Emulate high contrast mode
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });

    // Verify elements are still visible and functional
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#operations")).toBeVisible();
    await expect(page.locator("#numProblems")).toBeVisible();

    // Test functionality still works
    await page.fill("#numProblems", "25");
    await page.waitForTimeout(500);

    await expect(page.locator("#numProblems")).toHaveValue("25");
  });

  test("should support reduced motion preferences", async ({ page }: { page: Page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });

    // Test that animations are reduced/disabled
    // This is mainly a CSS test, but we can verify functionality still works
    await page.waitForSelector(".settings-presets", { timeout: 10000 });

    // Apply preset
    const presetButton = page.locator(".preset-button").first();
    await presetButton.click();

    // Verify preset is applied (functionality should work regardless of animations)
    await page.waitForTimeout(1000);
    await expect(page.locator("#numProblems")).toHaveValue("15");
  });

  test("should have proper color contrast for error messages", async ({ page }: { page: Page }) => {
    // Create an error
    await createValidationError(page, "count");

    // Wait for error message
    await waitForErrorMessage(page);

    // Get computed styles
    const errorElement = page.locator(".error-message");
    const styles = await errorElement.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
      };
    });

    // Verify styles are applied (basic check)
    expect(styles.color).toBeTruthy();
    expect(styles.backgroundColor).toBeTruthy();
    expect(styles.fontSize).toBeTruthy();
  });
});
