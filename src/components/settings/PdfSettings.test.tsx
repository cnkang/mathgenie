import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../tests/helpers/testUtils';
import PdfSettings from './PdfSettings';

vi.mock('@/i18n', async () => {
  const { mockUseTranslation } = await import('../../../tests/helpers/mockTranslations');
  return mockUseTranslation({
    'pdf.title': 'PDF Settings',
    'pdf.fontSize': 'Font Size (pt)',
    'pdf.lineSpacing': 'Line Spacing (pt)',
    'pdf.paperSize': 'Paper Size',
    'accessibility.clickToExpand': 'Click to expand',
    'accessibility.pdfSettingsExpanded': 'PDF settings expanded',
    'accessibility.pdfSettingsCollapsed': 'PDF settings collapsed',
    'accessibility.fontSizeInput': 'Font size input',
    'accessibility.lineSpacingInput': 'Line spacing input',
    'accessibility.paperSizeSelect': 'Paper size select',
  });
});

describe.sequential('PdfSettings', () => {
  const settings = {
    fontSize: 12,
    lineSpacing: 10,
    paperSize: 'a4' as const,
    enableGrouping: false,
    problemsPerGroup: 20,
    totalGroups: 1,
  } as any;

  const paperSizeOptions = { a4: 'A4', letter: 'Letter' };

  test('updates fields and calls onChange', () => {
    const onChange = vi.fn();
    render(
      <PdfSettings settings={settings} onChange={onChange} paperSizeOptions={paperSizeOptions} />
    );

    fireEvent.change(screen.getByLabelText('Font size input'), { target: { value: '14' } });
    fireEvent.change(screen.getByLabelText('Line spacing input'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Paper size select'), { target: { value: 'letter' } });

    expect(onChange).toHaveBeenCalledWith('fontSize', 14);
    expect(onChange).toHaveBeenCalledWith('lineSpacing', 12);
    expect(onChange).toHaveBeenCalledWith('paperSize', 'letter');
  });

  test('announces expand/collapse on toggle', async () => {
    const { container } = render(
      <PdfSettings settings={settings} onChange={() => {}} paperSizeOptions={paperSizeOptions} />
    );
    const summary = container.querySelector('summary') as HTMLElement;
    fireEvent.click(summary);
    await waitFor(() => {
      expect(document.querySelector('[aria-live="polite"]')).toBeTruthy();
    });
  });

  test('closes details on Escape key', () => {
    const { container } = render(
      <PdfSettings settings={settings} onChange={() => {}} paperSizeOptions={paperSizeOptions} />
    );
    const details = container.querySelector('details') as HTMLDetailsElement;
    const summary = container.querySelector('summary') as HTMLElement;
    details.setAttribute('open', '');
    expect(details.open).toBe(true);
    fireEvent.keyDown(summary, { key: 'Escape' });
    expect(details.hasAttribute('open')).toBe(false);
  });
});
