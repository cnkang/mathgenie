// Analytics utilities for tracking user interactions
// Privacy-focused analytics without personal data collection

interface EventProperties {
  [key: string]: string | number | boolean;
}

interface AnalyticsEvent {
  name: string;
  timestamp: number;
  properties: EventProperties;
}

interface Settings {
  operations: string[];
  numRange: [number, number];
  allowNegative: boolean;
  showAnswers: boolean;
  paperSize?: string;
  fontSize?: number;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, properties: EventProperties = {}): void => {
  try {
    // Only track in production and if user hasn't opted out
    if (!import.meta.env.PROD || localStorage.getItem('analytics-opt-out')) {
      return;
    }
  } catch (error) {
    // Handle localStorage errors gracefully
    console.warn('Analytics: localStorage access failed', error);
    return;
  }

  // Simple event tracking without personal data
  const event: AnalyticsEvent = {
    name: eventName,
    timestamp: Date.now(),
    properties: {
      ...properties,
      userAgent: navigator.userAgent.substring(0, 50), // Truncated for privacy
      language: navigator.language,
      screenSize: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    },
  };

  // Log to console in development
  if (!import.meta.env.PROD) {
    console.log('Analytics Event:', event);
  }

  // Send to analytics service (if configured)
  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }
};

export const trackProblemGeneration = (settings: Settings, problemCount: number): void => {
  trackEvent('problems_generated', {
    operations: settings.operations.join(','),
    problem_count: problemCount,
    number_range: `${settings.numRange[0]}-${settings.numRange[1]}`,
    allow_negative: settings.allowNegative,
    show_answers: settings.showAnswers,
  });
};

export const trackPdfDownload = (problemCount: number, settings: Settings): void => {
  trackEvent('pdf_downloaded', {
    problem_count: problemCount,
    paper_size: settings.paperSize || 'a4',
    font_size: settings.fontSize || 12,
  });
};

export const trackLanguageChange = (fromLanguage: string, toLanguage: string): void => {
  trackEvent('language_changed', {
    from: fromLanguage,
    to: toLanguage,
  });
};

export const trackPresetUsed = (presetId: string): void => {
  trackEvent('preset_applied', {
    preset: presetId,
  });
};
