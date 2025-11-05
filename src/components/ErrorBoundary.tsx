import React, { Component, ReactNode } from 'react';
import type { ErrorBoundaryProps, ErrorInfo } from '../types';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * React 19.2 Enhanced Error Boundary with TypeScript support
 * Provides better error handling and recovery mechanisms with concurrent features
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): React.ReactElement {
    const fallbackContent: ReactNode = this.props.fallback ?? (
      <div className='error-boundary'>
        <div className='error-content'>
          <h2>🚨 Something went wrong</h2>
          <p>We&apos;re sorry, but something unexpected happened.</p>

          {import.meta.env.DEV && this.state.error && (
            <details className='error-details'>
              <summary>Error Details (Development)</summary>
              <pre>{this.state.error.toString()}</pre>
              {this.state.errorInfo && <pre>{this.state.errorInfo.componentStack}</pre>}
            </details>
          )}

          <div className='error-actions'>
            <button onClick={this.handleRetry} className='retry-button'>
              🔄 Try Again
            </button>

            <button onClick={() => window.location.reload()} className='reload-button'>
              🔃 Reload Page
            </button>
          </div>
        </div>
      </div>
    );
    const content: ReactNode = this.state.hasError ? fallbackContent : this.props.children;
    return <>{content}</>;
  }
}

export default ErrorBoundary;

/**
 * React 19.2 Function Component Error Boundary Hook with TypeScript
 * For use with function components with enhanced concurrent error handling
 */
interface ErrorHandlerReturn {
  handleError: (error: Error) => void;
  resetError: () => void;
  error: Error | null;
}

export const useErrorHandler = (): ErrorHandlerReturn => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback((): void => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error): void => {
    setError(error);

    if (import.meta.env.PROD) {
      // Safe logging - only log error message, not full object
      console.error('Application error:', error.message);
    }
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError, error };
};
