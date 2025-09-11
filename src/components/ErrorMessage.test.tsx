import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { MessageValue } from '../types';
import ErrorMessage from './ErrorMessage';

// Mock the translation hook
vi.mock('../i18n', async () => {
  const { mockUseTranslation } = await import('../../tests/helpers/mockTranslations');
  return mockUseTranslation({
    'messages.success.problemsGenerated': 'Successfully generated {{count}} problems!',
    'errors.generationFailed': 'Failed to generate problems. Please try again.',
  });
});

describe('ErrorMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test.each([
    ['error', 'Test error message', '⚠️'],
    ['warning', 'Test warning message', '⚡'],
    ['info', 'Test info message', 'ℹ️'],
  ] as Array<['error' | 'warning' | 'info', string, string]>)(
    'renders %s message correctly',
    (type, message, expectedIcon) => {
      render(<ErrorMessage error={message} type={type} />);

      expect(screen.getByText(message)).toBeDefined();
      expect(screen.getByText(expectedIcon)).toBeDefined();
    }
  );

  test('renders MessageState with translation and parameters', () => {
    const messageState: MessageValue = {
      key: 'messages.success.problemsGenerated',
      params: { count: 5 },
    };

    render(<ErrorMessage error={messageState} type='info' />);
    expect(screen.getByText('Successfully generated 5 problems!')).toBeDefined();
  });

  test.each([
    ['', null],
    [null, null],
    [undefined, null],
  ] as Array<[MessageValue | null | undefined, null]>)(
    'does not render when error is %s',
    (error, expected) => {
      const { container } = render(<ErrorMessage error={error as unknown as MessageValue} />);
      expect(container.firstChild).toBe(expected);
    }
  );

  test('has proper accessibility attributes', () => {
    render(<ErrorMessage error='Test error' type='error' />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.getAttribute('aria-live')).toBe('polite');
    expect(alert.getAttribute('aria-atomic')).toBe('true');
  });
});
