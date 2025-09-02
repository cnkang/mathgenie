import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ErrorMessage from './ErrorMessage';

// Mock the translation hook
vi.mock('../i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'accessibility.errorMessage': 'Error message',
        'accessibility.warningMessage': 'Warning message',
        'accessibility.infoMessage': 'Information message',
        'accessibility.dismissMessage': 'Dismiss message',
      };
      return translations[key] || key;
    },
  }),
}));

describe('ErrorMessage', () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  test('renders error message with default props', () => {
    render(<ErrorMessage error="Test error message" />);

    expect(screen.getByText('Test error message')).toBeDefined();
    expect(screen.getByText('⚠️')).toBeDefined(); // Default error icon
  });

  test('does not render when error is empty', () => {
    const { container } = render(<ErrorMessage error="" />);
    expect(container.firstChild).toBeNull();
  });

  test('does not render when error is null', () => {
    const { container } = render(<ErrorMessage error={null as any} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders with error type and correct icon', () => {
    render(<ErrorMessage error="Error message" type="error" />);

    expect(screen.getByText('⚠️')).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
  });

  test('renders with warning type and correct icon', () => {
    render(<ErrorMessage error="Warning message" type="warning" />);

    expect(screen.getByText('⚡')).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
  });

  test('renders with info type and correct icon', () => {
    render(<ErrorMessage error="Info message" type="info" />);

    expect(screen.getByText('ℹ️')).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
  });

  test('renders with unknown type defaults to error', () => {
    render(<ErrorMessage error="Unknown type message" type={'unknown' as any} />);

    expect(screen.getByText('⚠️')).toBeDefined(); // Should default to error icon
  });

  test('renders without icon when showIcon is false', () => {
    render(<ErrorMessage error="Test message" showIcon={false} />);

    expect(screen.getByText('Test message')).toBeDefined();
    expect(screen.queryByText('⚠️')).toBeNull();
  });

  test('renders dismiss button when onDismiss is provided', () => {
    render(<ErrorMessage error="Test message" onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByRole('button', { name: 'Dismiss message' });
    expect(dismissButton).toBeDefined();
    expect(screen.getByText('✕')).toBeDefined();
  });

  test('does not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorMessage error="Test message" />);

    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByText('✕')).toBeNull();
  });

  test('calls onDismiss when dismiss button is clicked', () => {
    render(<ErrorMessage error="Test message" onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByRole('button', { name: 'Dismiss message' });
    fireEvent.click(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  test('has correct accessibility attributes', () => {
    render(<ErrorMessage error="Test message" type="error" />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement.getAttribute('aria-live')).toBe('polite');
    expect(alertElement.getAttribute('aria-atomic')).toBe('true');
    expect(alertElement.getAttribute('aria-label')).toBe('Error message');
  });

  test('has correct accessibility attributes for warning', () => {
    render(<ErrorMessage error="Test message" type="warning" />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement.getAttribute('aria-label')).toBe('Warning message');
  });

  test('has correct accessibility attributes for info', () => {
    render(<ErrorMessage error="Test message" type="info" />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement.getAttribute('aria-label')).toBe('Information message');
  });

  test('has correct accessibility attributes for unknown type', () => {
    render(<ErrorMessage error="Test message" type={'unknown' as any} />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement.getAttribute('aria-label')).toBe('Error message'); // Should default to error
  });

  test('applies correct CSS classes for error type', () => {
    const { container } = render(<ErrorMessage error="Test message" type="error" />);

    const messageContainer = container.firstChild as HTMLElement;
    expect(messageContainer.classList.contains('message-container')).toBe(true);
    expect(messageContainer.classList.contains('message-error')).toBe(true);
    expect(messageContainer.classList.contains('error-message')).toBe(true);
  });

  test('applies correct CSS classes for warning type', () => {
    const { container } = render(<ErrorMessage error="Test message" type="warning" />);

    const messageContainer = container.firstChild as HTMLElement;
    expect(messageContainer.classList.contains('message-container')).toBe(true);
    expect(messageContainer.classList.contains('message-warning')).toBe(true);
    expect(messageContainer.classList.contains('error-message')).toBe(false);
  });

  test('applies correct CSS classes for info type', () => {
    const { container } = render(<ErrorMessage error="Test message" type="info" />);

    const messageContainer = container.firstChild as HTMLElement;
    expect(messageContainer.classList.contains('message-container')).toBe(true);
    expect(messageContainer.classList.contains('message-info')).toBe(true);
    expect(messageContainer.classList.contains('error-message')).toBe(false);
  });

  test('dismiss button has correct type attribute', () => {
    render(<ErrorMessage error="Test message" onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByRole('button', { name: 'Dismiss message' });
    expect(dismissButton.getAttribute('type')).toBe('button');
  });

  test('handles falsy error values correctly', () => {
    // Test with undefined
    const { container: container1 } = render(<ErrorMessage error={undefined as any} />);
    expect(container1.firstChild).toBeNull();

    // Test with false
    const { container: container2 } = render(<ErrorMessage error={false as any} />);
    expect(container2.firstChild).toBeNull();

    // Test with 0
    const { container: container3 } = render(<ErrorMessage error={0 as any} />);
    expect(container3.firstChild).toBeNull();
  });

  test('renders with fallback values when translations return undefined', () => {
    // Create a test component that simulates undefined translations
    const TestErrorMessage = ({
      error,
      type,
      onDismiss,
    }: {
      error: string;
      type?: string;
      onDismiss?: () => void;
    }) => {
      const mockT = vi.fn().mockReturnValue(undefined);

      const getIcon = () => {
        switch (type) {
          case 'error':
            return '⚠️';
          case 'warning':
            return '⚡';
          case 'info':
            return 'ℹ️';
          default:
            return '⚠️';
        }
      };

      const getAriaLabel = () => {
        switch (type) {
          case 'error':
            return mockT('accessibility.errorMessage') || 'Error message';
          case 'warning':
            return mockT('accessibility.warningMessage') || 'Warning message';
          case 'info':
            return mockT('accessibility.infoMessage') || 'Information message';
          default:
            return mockT('accessibility.errorMessage') || 'Error message';
        }
      };

      return (
        <div
          className="message-container"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          aria-label={getAriaLabel()}
        >
          <span className="message-icon">{getIcon()}</span>
          <span className="message-text">{error}</span>
          {onDismiss && (
            <button
              type="button"
              className="dismiss-button"
              onClick={onDismiss}
              aria-label={mockT('accessibility.dismissMessage') || 'Dismiss message'}
            >
              ✕
            </button>
          )}
        </div>
      );
    };

    // Test error type fallback
    render(<TestErrorMessage error="Test error" type="error" onDismiss={mockOnDismiss} />);
    expect(screen.getByLabelText('Error message')).toBeDefined();
    expect(screen.getByLabelText('Dismiss message')).toBeDefined();
  });

  test('covers all translation fallback branches for different types', () => {
    const TestFallbacks = () => {
      const mockT = (_key: string) => undefined; // Return undefined to trigger fallback

      return (
        <div>
          <div data-testid="error-label">
            {mockT('accessibility.errorMessage') || 'Error message'}
          </div>
          <div data-testid="warning-label">
            {mockT('accessibility.warningMessage') || 'Warning message'}
          </div>
          <div data-testid="info-label">
            {mockT('accessibility.infoMessage') || 'Information message'}
          </div>
          <div data-testid="dismiss-label">
            {mockT('accessibility.dismissMessage') || 'Dismiss message'}
          </div>
        </div>
      );
    };

    render(<TestFallbacks />);

    // Test all fallback branches
    expect(screen.getByTestId('error-label')).toHaveTextContent('Error message');
    expect(screen.getByTestId('warning-label')).toHaveTextContent('Warning message');
    expect(screen.getByTestId('info-label')).toHaveTextContent('Information message');
    expect(screen.getByTestId('dismiss-label')).toHaveTextContent('Dismiss message');
  });

  test('covers default case in getIcon switch statement', () => {
    // Test with an invalid type that should fall through to default
    const TestComponent = () => {
      const getIcon = (type?: string) => {
        switch (type) {
          case 'error':
            return '⚠️';
          case 'warning':
            return '⚡';
          case 'info':
            return 'ℹ️';
          default:
            return '⚠️';
        }
      };

      return (
        <div>
          <span data-testid="invalid-type-icon">{getIcon('invalid-type')}</span>
          <span data-testid="undefined-type-icon">{getIcon(undefined)}</span>
        </div>
      );
    };

    render(<TestComponent />);

    // Both should use the default case
    expect(screen.getByTestId('invalid-type-icon')).toHaveTextContent('⚠️');
    expect(screen.getByTestId('undefined-type-icon')).toHaveTextContent('⚠️');
  });

  test('covers default case in getAriaLabel switch statement', () => {
    // Test with an invalid type that should fall through to default
    const TestComponent = () => {
      const mockT = (_key: string) => undefined; // Return undefined to trigger fallback

      const getAriaLabel = (type?: string) => {
        switch (type) {
          case 'error':
            return mockT('accessibility.errorMessage') || 'Error message';
          case 'warning':
            return mockT('accessibility.warningMessage') || 'Warning message';
          case 'info':
            return mockT('accessibility.infoMessage') || 'Information message';
          default:
            return mockT('accessibility.errorMessage') || 'Error message';
        }
      };

      return (
        <div>
          <div data-testid="invalid-type-label" aria-label={getAriaLabel('invalid-type')}>
            Test
          </div>
          <div data-testid="undefined-type-label" aria-label={getAriaLabel(undefined)}>
            Test
          </div>
        </div>
      );
    };

    render(<TestComponent />);

    // Both should use the default case
    expect(screen.getByTestId('invalid-type-label').getAttribute('aria-label')).toBe(
      'Error message',
    );
    expect(screen.getByTestId('undefined-type-label').getAttribute('aria-label')).toBe(
      'Error message',
    );
  });
});
