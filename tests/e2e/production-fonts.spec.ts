import { expect, test } from "@playwright/test";

test("loads the self-hosted heading and body fonts", async ({ page }) => {
  await page.goto("/");
  const loaded = await page.evaluate(async () => {
    const heading = await document.fonts.load('800 24px "Baloo 2 Variable"', "MathGenie");
    const body = await document.fonts.load('400 16px "Nunito Sans Variable"', "MathGenie");
    return [heading.length, body.length];
  });
  expect(loaded).toEqual([1, 1]);
});
