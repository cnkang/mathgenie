import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../tests/helpers/testUtils';
import type { MessageValue } from '../types';
import ErrorMessage from './ErrorMessage';

const MockI18nProvider = vi.hoisted(
  () =>
    function MockI18nProvider({ children }: { children: React.ReactNode }) {
      return <div>{children}</div>;
    }
);

// Mock the i18n system
vi.mock('../i18n', async () => {
  const { mockUseTranslation } = await import('../../tests/helpers/mockTranslations');
  return {
    ...mockUseTranslation({
      'messages.success.problemsGenerated': 'Successfully generated {{count}} problems!',
      'errors.noProblemsGenerated': 'No problems could be generated with current settings.',
      'warnings.largeNumberOfProblems': 'Generating {{count}} problems may take some time.',
      'accessibility.errorMessage': 'Error message',
      'accessibility.warningMessage': 'Warning message',
      'accessibility.infoMessage': 'Information message',
      'accessibility.dismissMessage': 'Dismiss message',
    }),
    I18nProvider: MockI18nProvider,
  };
});

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
      <MockI18nProvider>
        <TestComponent />
      </MockI18nProvider>
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
      <MockI18nProvider>
        <TestComponent />
      </MockI18nProvider>
    );

    expect(screen.getByText('Generating 75 problems may take some time.')).toBeInTheDocument();
  });

  it('should maintain backward compatibility with string messages', () => {
    const TestComponent: React.FC = () => {
      const [message] = useState<MessageValue>('This is a legacy string message');

      return <ErrorMessage error={message} type='error' />;
    };

    render(
      <MockI18nProvider>
        <TestComponent />
      </MockI18nProvider>
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
      <MockI18nProvider>
        <TestComponent />
      </MockI18nProvider>
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
      <MockI18nProvider>
        <TestComponent />
      </MockI18nProvider>
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
      <MockI18nProvider>
        <TestComponent />
      </MockI18nProvider>
    );

    expect(
      screen.getByText('No problems could be generated with current settings.')
    ).toBeInTheDocument();
  });
});
