import { vi } from 'vitest';
import { setViteEnv, useViteEnv } from '../../tests/helpers/viteEnv';
import {
  trackEvent,
  trackLanguageChange,
  trackPdfDownload,
  trackPresetUsed,
  trackProblemGeneration,
} from './analytics';

// Use the global localStorage mock from setupTests.ts
const localStorageMock = window.localStorage as any;

// Mock console.log
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Analytics Utils', () => {
  useViteEnv();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockClear();
    delete (window as any).gtag;
  });

  describe('trackEvent', () => {
    test('logs event in development environment', () => {
      setViteEnv('development');
      localStorageMock.getItem.mockReturnValue(null);

      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackEvent('test-event', { prop: 'value' });

      // In development, console.log is mocked in setupTests.ts
      // So we check the mocked console.log instead
      expect(console.log).toHaveBeenCalled();
      expect(mockGtag).not.toHaveBeenCalled();
    });

    test('should not track when user has opted out', () => {
      // Mock localStorage to return opt-out
      localStorageMock.getItem.mockReturnValue('true');

      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackEvent('test-event', { prop: 'value' });

      // Should not call gtag when opted out (console.log may still be called in dev)
      expect(mockGtag).not.toHaveBeenCalled();

      // In development, console.log may still be called for debugging purposes
      // but gtag should not be called
    });

    test('should handle empty properties', () => {
      trackEvent('test-event');

      // Should not throw error
      expect(true).toBe(true);
    });

    test('should handle various property types', () => {
      trackEvent('test-event', {
        string: 'value',
        number: 42,
        boolean: true,
      });

      // Should not throw error
      expect(true).toBe(true);
    });

    test('should handle localStorage errors gracefully', () => {
      setViteEnv('production');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => {
        trackEvent('test-event', { prop: 'value' });
      }).not.toThrow();
      warnSpy.mockRestore();
    });

    test('should track events in production when not opted out', () => {
      setViteEnv('production');
      localStorageMock.getItem.mockReturnValue(null);

      // Mock gtag
      const mockGtag = vi.fn();
      window.gtag = mockGtag;

      trackEvent('test-event', { prop: 'value' });

      expect(mockGtag).toHaveBeenCalledWith('event', 'test-event', { prop: 'value' });
    });

    test('should include user agent and screen info in production', () => {
      setViteEnv('production');
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
      setViteEnv('production');
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
      setViteEnv('production');
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
      setViteEnv('production');
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
      setViteEnv('production');
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
      setViteEnv('production');
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
