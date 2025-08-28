import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '../i18n';
import LanguageSelector from './LanguageSelector';

describe('LanguageSelector', () => {
  test('renders language selector', () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('changes language when option is selected', () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'zh' } });

    expect(select).toHaveValue('zh');
  });

  test('displays all language options', () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(6); // en, zh, es, fr, de, ja
  });
});