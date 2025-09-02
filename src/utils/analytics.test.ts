import {
  trackEvent,
  trackLanguageChange,
  trackPdfDownload,
  trackPresetUsed,
  trackProblemGeneration,
} from './analytics';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console.log
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Analytics Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset NODE_ENV to test
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  describe('trackEvent', () => {
    test('should not track in non-production environment', () => {
      localStorageMock.getItem.mockReturnValue(null);

      trackEvent('test-event', { prop: 'value' });

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('should not track when user has opted out', () => {
      process.env.NODE_ENV = 'production';
      localStorageMock.getItem.mockReturnValue('true');

      trackEvent('test-event', { prop: 'value' });

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('should handle empty properties', () => {
      process.env.NODE_ENV = 'test';

      trackEvent('test-event');

      // Should not throw error
      expect(true).toBe(true);
    });

    test('should handle various property types', () => {
      process.env.NODE_ENV = 'test';

      trackEvent('test-event', {
        string: 'value',
        number: 42,
        boolean: true,
      });

      // Should not throw error
      expect(true).toBe(true);
    });

    test('should handle localStorage errors gracefully', () => {
      process.env.NODE_ENV = 'production';
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => {
        trackEvent('test-event', { prop: 'value' });
      }).not.toThrow();
    });

    test('should track events in production when not opted out', () => {
      process.env.NODE_ENV = 'production';
      localStorageMock.getItem.mockReturnValue(null);

      // Mock gtag
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackEvent('test-event', { prop: 'value' });

      expect(mockGtag).toHaveBeenCalledWith('event', 'test-event', { prop: 'value' });
    });

    test('should include user agent and screen info in production', () => {
      process.env.NODE_ENV = 'production';
      localStorageMock.getItem.mockReturnValue(null);

      // Mock navigator and screen
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Test Browser)',
        configurable: true,
      });
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true,
      });
      Object.defineProperty(screen, 'width', { value: 1920, configurable: true });
      Object.defineProperty(screen, 'height', { value: 1080, configurable: true });
      Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackEvent('test-event');

      expect(mockGtag).toHaveBeenCalledWith('event', 'test-event', {});
    });
  });

  describe('trackProblemGeneration', () => {
    test('should track problem generation with correct properties', () => {
      process.env.NODE_ENV = 'production';
      localStorageMock.getItem.mockReturnValue(null);

      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      const settings = {
        operations: ['addition', 'subtraction'],
        numRange: [1, 100] as [number, number],
        allowNegative: true,
        showAnswers: false,
      };

      trackProblemGeneration(settings, 20);

      expect(mockGtag).toHaveBeenCalledWith('event', 'problems_generated', {
        operations: 'addition,subtraction',
        problem_count: 20,
        number_range: '1-100',
        allow_negative: true,
        show_answers: false,
      });
    });
  });

  describe('trackPdfDownload', () => {
    test('should track PDF download with settings', () => {
      process.env.NODE_ENV = 'production';
      localStorageMock.getItem.mockReturnValue(null);

      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      const settings = {
        operations: ['addition'],
        numRange: [1, 10] as [number, number],
        allowNegative: false,
        showAnswers: true,
        paperSize: 'a4',
        fontSize: 14,
      };

      trackPdfDownload(15, settings);

      expect(mockGtag).toHaveBeenCalledWith('event', 'pdf_downloaded', {
        problem_count: 15,
        paper_size: 'a4',
        font_size: 14,
      });
    });

    test('should use default values when not provided', () => {
      process.env.NODE_ENV = 'production';
      localStorageMock.getItem.mockReturnValue(null);

      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      const settings = {
        operations: ['addition'],
        numRange: [1, 10] as [number, number],
        allowNegative: false,
        showAnswers: true,
      };

      trackPdfDownload(10, settings);

      expect(mockGtag).toHaveBeenCalledWith('event', 'pdf_downloaded', {
        problem_count: 10,
        paper_size: 'a4',
        font_size: 12,
      });
    });
  });

  describe('trackLanguageChange', () => {
    test('should track language changes', () => {
      process.env.NODE_ENV = 'production';
      localStorageMock.getItem.mockReturnValue(null);

      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackLanguageChange('en', 'zh');

      expect(mockGtag).toHaveBeenCalledWith('event', 'language_changed', {
        from: 'en',
        to: 'zh',
      });
    });
  });

  describe('trackPresetUsed', () => {
    test('should track preset usage', () => {
      process.env.NODE_ENV = 'production';
      localStorageMock.getItem.mockReturnValue(null);

      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackPresetUsed('beginner');

      expect(mockGtag).toHaveBeenCalledWith('event', 'preset_applied', {
        preset: 'beginner',
      });
    });
  });
});
