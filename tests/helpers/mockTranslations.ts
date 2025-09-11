import { vi } from 'vitest';

export const mockUseTranslation = (
  translations: Record<string, string> = {}
) => ({
  useTranslation: vi.fn(() => ({
    t: (key: string, params?: Record<string, string | number>) => {
      let result = translations[key] ?? key;
      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          const placeholder = `{{${paramKey}}}`;
          result = result.replace(new RegExp(placeholder, 'g'), String(paramValue));
        });
      }
      return result;
    },
  })),
});
