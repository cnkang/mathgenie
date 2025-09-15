import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor } from '../../tests/helpers/testUtils';
import type { I18nContextType } from '../types';
import TranslationLoader from './TranslationLoader';

// Mock the useTranslation hook
const mockUseTranslation = vi.fn();

vi.mock('../i18n', () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe('TranslationLoader', () => {
  const mockT = vi.fn();

  const createMockI18nContext = (isLoading: boolean): I18nContextType => ({
    t: mockT,
    isLoading,
    currentLanguage: 'en',
    languages: {
      en: { code: 'en', name: 'English', flag: '🇺🇸' },
      zh: { code: 'zh', name: '中文', flag: '🇨🇳' },
      es: { code: 'es', name: 'Español', flag: '🇪🇸' },
      fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
      de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      ja: { code: 'ja', name: '日本語', flag: '🇯🇵' },
    },
    translations: {},
    changeLanguage: vi.fn(),
  });

  const createMockI18nContextWithT = (isLoading: boolean, t: any): I18nContextType => ({
    t,
    isLoading,
    currentLanguage: 'en',
    languages: {
      en: { code: 'en', name: 'English', flag: '🇺🇸' },
    },
    translations: {},
    changeLanguage: vi.fn(),
  });

  beforeEach(() => {
    mockT.mockClear();
    mockUseTranslation.mockClear();
  });

  test('renders children when not loading', () => {
    mockUseTranslation.mockReturnValue(createMockI18nContext(false));

    render(
      <TranslationLoader>
        <div data-testid='child-content'>Test Content</div>
      </TranslationLoader>
    );

    expect(screen.getByTestId('child-content')).toBeDefined();
    expect(screen.getByText('Test Content')).toBeDefined();
  });

  test('renders loading screen when loading', () => {
    mockT.mockImplementation((key: string) => {
      if (key === 'app.title') return 'MathGenie';
      if (key === 'loading.translations') return 'Loading translations...';
      return key;
    });
    mockUseTranslation.mockReturnValue(createMockI18nContextWithT(true, mockT));

    const { container } = render(
      <TranslationLoader>
        <div data-testid='child-content'>Test Content</div>
      </TranslationLoader>
    );

    // Child content should not be rendered when loading
    expect(container.querySelector('[data-testid="child-content"]')).toBeNull();
    expect(container.querySelector('.translation-loader')).toBeInTheDocument();
    expect(container.querySelector('.translation-loader-title')?.textContent).toBe('MathGenie');
    expect(container.querySelector('.translation-loader-message')?.textContent).toBe(
      'Loading translations...'
    );
  });

  test('displays loading spinner when loading', () => {
    mockT.mockImplementation((key: string) => {
      if (key === 'app.title') return 'MathGenie';
      if (key === 'loading.translations') return 'Loading translations...';
      return key;
    });
    mockUseTranslation.mockReturnValue(createMockI18nContextWithT(true, mockT));

    const { container } = render(
      <TranslationLoader>
        <div>Test Content</div>
      </TranslationLoader>
    );

    const spinner = container.querySelector('.translation-loader-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner?.getAttribute('aria-label')).toBe('Loading translations...');

    const spinnerDots = container.querySelectorAll('.spinner-dot');
    expect(spinnerDots).toHaveLength(3);
  });

  test('calls translation function with correct key', () => {
    mockT.mockReturnValue('Chargement des traductions...');
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: true,
    } as unknown as I18nContextType);

    render(
      <TranslationLoader>
        <div>Test Content</div>
      </TranslationLoader>
    );

    expect(mockT).toHaveBeenCalledWith('loading.translations');
  });

  test('falls back to default text when translation is not available', () => {
    mockT.mockReturnValue(null);
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: true,
    } as unknown as I18nContextType);

    render(
      <TranslationLoader>
        <div>Test Content</div>
      </TranslationLoader>
    );

    const { container } = render(
      <TranslationLoader>
        <div>Test Content</div>
      </TranslationLoader>
    );

    expect(container.querySelector('.translation-loader-message')?.textContent).toBe(
      'Loading translations...'
    );
  });

  test('falls back to default text when translation returns undefined', () => {
    mockT.mockReturnValue(undefined);
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: true,
    } as unknown as I18nContextType);

    const { container } = render(
      <TranslationLoader>
        <div>Test Content</div>
      </TranslationLoader>
    );

    expect(container.querySelector('.translation-loader-message')?.textContent).toBe(
      'Loading translations...'
    );
  });

  test('applies correct CSS classes to loading elements', () => {
    mockT.mockImplementation((key: string) => {
      if (key === 'app.title') return 'MathGenie';
      if (key === 'loading.translations') return 'Loading translations...';
      return key;
    });
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: true,
    } as unknown as I18nContextType);

    const { container } = render(
      <TranslationLoader>
        <div>Test Content</div>
      </TranslationLoader>
    );

    expect((container.firstChild as Element)?.classList.contains('translation-loader')).toBe(true);
    expect(container.querySelector('.translation-loader-title')?.textContent).toBe('MathGenie');
    expect(container.querySelector('.translation-loader-message')?.textContent).toBe(
      'Loading translations...'
    );

    const content = container.querySelector('.translation-loader-content');
    expect(content).toBeDefined();

    const icon = container.querySelector('.translation-loader-icon');
    expect(icon).toBeDefined();
    expect(icon?.textContent).toBe('🌐');
  });

  test('renders multiple children correctly when not loading', () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: false,
    } as unknown as I18nContextType);

    render(
      <TranslationLoader>
        <div data-testid='child-1'>First Child</div>
        <div data-testid='child-2'>Second Child</div>
        <span data-testid='child-3'>Third Child</span>
      </TranslationLoader>
    );

    expect(screen.getByTestId('child-1')).toBeDefined();
    expect(screen.getByTestId('child-2')).toBeDefined();
    expect(screen.getByTestId('child-3')).toBeDefined();
    expect(screen.getByText('First Child')).toBeDefined();
    expect(screen.getByText('Second Child')).toBeDefined();
    expect(screen.getByText('Third Child')).toBeDefined();
  });

  test('handles empty children when not loading', () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: false,
    } as unknown as I18nContextType);

    const { container } = render(<TranslationLoader>{null}</TranslationLoader>);

    // Should render empty fragment - container should be empty or have empty text
    expect(container.textContent).toBe('');
  });

  test('handles string children when not loading', () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: false,
    } as unknown as I18nContextType);

    render(<TranslationLoader>Just a string</TranslationLoader>);

    expect(screen.getByText('Just a string')).toBeDefined();
  });

  test('handles number children when not loading', () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: false,
    } as unknown as I18nContextType);

    render(<TranslationLoader>{42}</TranslationLoader>);

    expect(screen.getByText('42')).toBeDefined();
  });

  test('transitions from loading to loaded state', async () => {
    mockT.mockReturnValue('Loading translations...');

    // Start with loading state
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: true,
    } as unknown as I18nContextType);

    const { rerender, container } = render(
      <TranslationLoader>
        <div data-testid='child-content'>Test Content</div>
      </TranslationLoader>
    );

    // Verify loading state - should have exactly 1 loading message
    expect(container.querySelectorAll('.translation-loader-message')).toHaveLength(1);
    expect(container.querySelector('[data-testid="child-content"]')).toBeNull();

    // Change to loaded state
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: false,
    } as unknown as I18nContextType);

    rerender(
      <TranslationLoader>
        <div data-testid='child-content'>Test Content</div>
      </TranslationLoader>
    );

    // Verify loaded state
    await waitFor(() => {
      expect(container.querySelector('.translation-loader-message')).toBeNull();
      expect(container.querySelector('[data-testid="child-content"]')).toBeDefined();
    });
  });

  test('handles complex nested children when not loading', () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: false,
    } as unknown as I18nContextType);

    render(
      <TranslationLoader>
        <div>
          <header>
            <h1>Title</h1>
          </header>
          <main>
            <section>
              <p>Paragraph content</p>
            </section>
          </main>
        </div>
      </TranslationLoader>
    );

    expect(screen.getByText('Title')).toBeDefined();
    expect(screen.getByText('Paragraph content')).toBeDefined();
    expect(screen.getByRole('banner')).toBeDefined();
    expect(screen.getByRole('main')).toBeDefined();
  });

  test('preserves event handlers in children when not loading', async () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: false,
    } as unknown as I18nContextType);

    const handleClick = vi.fn();

    render(
      <TranslationLoader>
        <button onClick={handleClick} data-testid='test-button'>
          Click me
        </button>
      </TranslationLoader>
    );

    const button = screen.getByTestId('test-button');
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('loading screen has proper accessibility attributes', () => {
    mockT.mockReturnValue('Loading translations...');
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: true,
    } as unknown as I18nContextType);

    render(
      <TranslationLoader>
        <div>Test Content</div>
      </TranslationLoader>
    );

    const spinner = screen.getByLabelText('Loading translations...');
    expect(spinner.getAttribute('aria-label')).toBe('Loading translations...');
  });

  test('handles boolean children when not loading', () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: false,
    } as unknown as I18nContextType);

    const { container } = render(
      <TranslationLoader>
        {true}
        {false}
      </TranslationLoader>
    );

    // Boolean children should not render anything
    expect(container.textContent).toBe('');
  });

  test('handles array children when not loading', () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: false,
    } as unknown as I18nContextType);

    render(<TranslationLoader>{['Item 1', 'Item 2', 'Item 3']}</TranslationLoader>);

    expect(screen.getByText('Item 1Item 2Item 3')).toBeDefined();
  });

  test('handles React fragment children when not loading', () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      isLoading: false,
    } as unknown as I18nContextType);

    render(
      <TranslationLoader>
        <React.Fragment>
          <span>Fragment child 1</span>
          <span>Fragment child 2</span>
        </React.Fragment>
      </TranslationLoader>
    );

    expect(screen.getByText('Fragment child 1')).toBeDefined();
    expect(screen.getByText('Fragment child 2')).toBeDefined();
  });
});
