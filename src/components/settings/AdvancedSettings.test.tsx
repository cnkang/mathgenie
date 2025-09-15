import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../tests/helpers/testUtils';
import AdvancedSettings from './AdvancedSettings';

vi.mock('@/i18n', async () => {
  const { mockUseTranslation } = await import('../../../tests/helpers/mockTranslations');
  return mockUseTranslation({
    'settings.advanced': 'Advanced',
    'settings.allowNegative': 'Allow Negative Results',
    'settings.allowNegativeDesc': 'Allow negative results description',
    'settings.showAnswers': 'Show Answers',
    'settings.showAnswersDesc': 'Show answers description',
    'accessibility.clickToExpand': 'Click to expand',
    'accessibility.advancedSettingsExpanded': 'Advanced settings expanded',
    'accessibility.advancedSettingsCollapsed': 'Advanced settings collapsed',
    'accessibility.allowNegativeLabel': 'Allow negative checkbox',
    'accessibility.showAnswersLabel': 'Show answers checkbox',
  });
});

describe.sequential('AdvancedSettings', () => {
  const settings = {
    allowNegative: false,
    showAnswers: false,
  } as any;

  test('toggles checkboxes and calls onChange', () => {
    const onChange = vi.fn();
    render(<AdvancedSettings settings={settings} onChange={onChange} />);

    const allow = screen.getByLabelText('Allow negative checkbox') as HTMLInputElement;
    const show = screen.getByLabelText('Show answers checkbox') as HTMLInputElement;

    fireEvent.click(allow);
    fireEvent.click(show);

    expect(onChange).toHaveBeenCalledWith('allowNegative', true);
    expect(onChange).toHaveBeenCalledWith('showAnswers', true);
  });

  test('announces expand/collapse for a11y on toggle', async () => {
    const { container } = render(<AdvancedSettings settings={settings} onChange={() => {}} />);
    const details = container.querySelector('details') as HTMLElement;
    details.dispatchEvent(new Event('toggle'));

    await waitFor(() => {
      expect(document.querySelector('[aria-live="polite"]')).toBeTruthy();
    });
  });

  test('closes advanced details on Escape key', () => {
    const { container } = render(<AdvancedSettings settings={settings} onChange={() => {}} />);
    const details = container.querySelector('details') as HTMLDetailsElement;
    const summary = container.querySelector('summary') as HTMLElement;
    details.setAttribute('open', '');
    expect(details.open).toBe(true);
    fireEvent.keyDown(summary, { key: 'Escape' });
    expect(details.hasAttribute('open')).toBe(false);
  });
});
