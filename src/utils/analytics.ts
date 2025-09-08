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
    gtag?: (command: string, action: string, parameters?: Record<string, unknown>) => void;
  }
}

export const trackEvent = (eventName: string, properties: EventProperties = {}): void => {
  let optOut = false;
  try {
    optOut = Boolean(localStorage.getItem('analytics-opt-out'));
  } catch (error) {
    // Handle localStorage errors gracefully
    console.warn('Analytics: localStorage access failed', error);
    optOut = true;
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

  // Always log to console in development for easier debugging
  if (!import.meta.env.PROD) {
    console.log('Analytics Event:', event);
  }

  // Skip sending analytics if user opted out or we're not in production
  if (optOut || !import.meta.env.PROD) {
    return;
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
