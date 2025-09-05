import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../i18n';
import type { MessageValue } from '../types';
import ErrorMessage from './ErrorMessage';

// Mock the i18n system
vi.mock('../i18n', () => ({
  useTranslation: () => ({
    t: (key: string, params: Record<string, string | number> = {}) => {
      const translations: Record<string, string> = {
        'messages.success.problemsGenerated': 'Successfully generated {{count}} problems!',
        'errors.noProblemsGenerated': 'No problems could be generated with current settings.',
        'warnings.largeNumberOfProblems': 'Generating {{count}} problems may take some time.',
        'accessibility.errorMessage': 'Error message',
        'accessibility.warningMessage': 'Warning message',
        'accessibility.infoMessage': 'Information message',
        'accessibility.dismissMessage': 'Dismiss message',
      };

      let result = translations[key] || key;

      // Handle parameter substitution
      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          const placeholder = '{{' + paramKey + '}}';
          result = result.replace(new RegExp(placeholder, 'g'), String(paramValue));
        });
      }

      return result;
    },
    changeLanguage: vi.fn(),
    isLoading: false,
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Dynamic Message System', () => {
  it('should handle MessageState messages with proper translation', () => {
    const TestComponent: React.FC = () => {
      const [message, setMessage] = useState<MessageValue>('');

      return (
        <div>
          <ErrorMessage error={message} type='info' />
          <button
            onClick={() =>
              setMessage({
                key: 'messages.success.problemsGenerated',
                params: { count: 10 },
              })
            }
          >
            Show Success
          </button>
        </div>
      );
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Successfully generated 10 problems!')).toBeInTheDocument();
  });

  it('should handle parameter interpolation correctly', () => {
    const TestComponent: React.FC = () => {
      const [message] = useState<MessageValue>({
        key: 'warnings.largeNumberOfProblems',
        params: { count: 75 },
      });

      return <ErrorMessage error={message} type='warning' />;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByText('Generating 75 problems may take some time.')).toBeInTheDocument();
  });

  it('should maintain backward compatibility with string messages', () => {
    const TestComponent: React.FC = () => {
      const [message] = useState<MessageValue>('This is a legacy string message');

      return <ErrorMessage error={message} type='error' />;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByText('This is a legacy string message')).toBeInTheDocument();
  });

  it('should handle empty and null message values', () => {
    const TestComponent: React.FC = () => {
      return (
        <div>
          <ErrorMessage error='' type='error' />
          <ErrorMessage error={null as any} type='warning' />
          <ErrorMessage error={undefined as any} type='info' />
        </div>
      );
    };

    const { container } = render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    // No messages should be rendered
    expect(container.querySelectorAll('[role="alert"]')).toHaveLength(0);
  });

  it('should handle MessageState with missing translation keys', () => {
    const TestComponent: React.FC = () => {
      const [message] = useState<MessageValue>({
        key: 'nonexistent.key',
        params: { test: 'value' },
      });

      return <ErrorMessage error={message} type='error' />;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    // Should display the key itself when translation is missing
    expect(screen.getByText('nonexistent.key')).toBeInTheDocument();
  });

  it('should handle MessageState without parameters', () => {
    const TestComponent: React.FC = () => {
      const [message] = useState<MessageValue>({
        key: 'errors.noProblemsGenerated',
      });

      return <ErrorMessage error={message} type='error' />;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(
      screen.getByText('No problems could be generated with current settings.')
    ).toBeInTheDocument();
  });
});
