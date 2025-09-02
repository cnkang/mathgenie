import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nProvider } from '../i18n';
import LanguageSelector from './LanguageSelector';

describe('LanguageSelector', () => {
  test('renders language selector', async () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>,
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  test('changes language when option is selected', async () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>,
    );

    // Wait for loading to complete
    await waitFor(() => {
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'zh' } });
      expect(select).toHaveValue('zh');
    });
  });

  test('displays all language options', async () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>,
    );

    // Wait for loading to complete
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(6); // en, zh, es, fr, de, ja
    });
  });
});
