import { vi } from 'vitest';
import { fireEvent, render, waitFor } from '../../tests/helpers/testUtils';
import LanguageSelector from './LanguageSelector';

// Mock the i18n system
const mockChangeLanguage = vi.fn();

vi.mock('../i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'language.select': 'Language',
        'accessibility.languageSelect': 'Select language',
        'loading.translations': 'Loading...',
      };
      return translations[key] || key;
    },
    currentLanguage: 'en',
    changeLanguage: mockChangeLanguage,
    isLoading: false,
    languages: {
      en: { code: 'en', name: 'English', flag: '🇺🇸' },
      zh: { code: 'zh', name: '中文', flag: '🇨🇳' },
      es: { code: 'es', name: 'Español', flag: '🇪🇸' },
      fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
      de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      ja: { code: 'ja', name: '日本語', flag: '🇯🇵' },
    },
  }),
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    mockChangeLanguage.mockClear();
  });

  test('renders language selector', async () => {
    const { container } = render(<LanguageSelector />);

    await waitFor(() => {
      expect(container.querySelector('select')).toBeInTheDocument();
      expect(container.textContent).toContain('Language:');
    });
  });

  test('changes language when option is selected', async () => {
    const { container } = render(<LanguageSelector />);

    await waitFor(() => {
      const select = container.querySelector('select');
      expect(select).toBeInstanceOf(HTMLSelectElement);

      if (!(select instanceof HTMLSelectElement)) {
        throw new Error('Expected language selector element to be a <select> element');
      }

      expect(select.value).toBe('en');

      fireEvent.change(select, { target: { value: 'zh' } });
      expect(mockChangeLanguage).toHaveBeenCalledWith('zh');
    });
  });

  test('displays all language options', async () => {
    const { container } = render(<LanguageSelector />);

    await waitFor(() => {
      const options = container.querySelectorAll('option');
      expect(options).toHaveLength(6); // en, zh, es, fr, de, ja

      // Check specific options
      expect(container.textContent).toContain('English');
      expect(container.textContent).toContain('中文');
    });
  });
});
