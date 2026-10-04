import { expect, test } from '@playwright/test';
import { verifyFormValues } from './test-utils';

test('form verification awaits independent text and checkbox assertions', async ({ page }) => {
  await page.setContent('<input id="count" value="3"><input id="enabled" type="checkbox" checked><input id="disabled" type="checkbox">');
  await verifyFormValues(page, { count: 3, enabled: true, disabled: false });
  await expect(verifyFormValues(page, { count: 4 })).rejects.toThrow();
});
