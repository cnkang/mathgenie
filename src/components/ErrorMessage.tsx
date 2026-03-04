import React from 'react';
import { useTranslation } from '../i18n';
import type { MessageValue } from '../types';
import './ErrorMessage.css';

export interface ErrorMessageProps {
  error: MessageValue;
  type?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  showIcon?: boolean;
}

const WarningIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='16' height='16' fill='none' aria-hidden='true'>
    <path
      d='M12 8v5m0 3h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const BoltIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='16' height='16' fill='none' aria-hidden='true'>
    <path
      d='M13 2 4 14h6l-1 8 9-12h-6l1-8Z'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='16' height='16' fill='none' aria-hidden='true'>
    <circle cx='12' cy='12' r='9' stroke='currentColor' strokeWidth='2' />
    <path d='M12 10v6m0-9h.01' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
  </svg>
);

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  type = 'error',
  onDismiss,
  showIcon = true,
}) => {
  const { t } = useTranslation();

  // Helper function to check if error is MessageState
  const isMessageState = (
    value: MessageValue
  ): value is { key: string; params?: Record<string, string | number> } => {
    return value != null && typeof value !== 'string' && 'key' in value;
  };

  // Get the display text - either translate MessageState or use string directly
  const getDisplayText = (): string => {
    if (isMessageState(error)) {
      return error.key ? t(error.key, error.params) : '';
    }
    return String(error);
  };

  const displayText = getDisplayText();

  // Check if error is empty or would result in empty display text
  if (!error || !displayText) {
    return null;
  }

  const messageConfig = {
    error: {
      icon: <WarningIcon />,
      ariaKey: 'accessibility.errorMessage',
      fallback: 'Error message',
    },
    warning: {
      icon: <BoltIcon />,
      ariaKey: 'accessibility.warningMessage',
      fallback: 'Warning message',
    },
    info: {
      icon: <InfoIcon />,
      ariaKey: 'accessibility.infoMessage',
      fallback: 'Information message',
    },
  };

  const config = messageConfig[type] || messageConfig.error;

  const getIcon = (): React.ReactNode => config.icon;

  const getAriaLabel = (): string => t(config.ariaKey) || config.fallback;

  return (
    <div
      className={`message-container message-${type} ${type === 'error' ? 'error-message' : ''}`}
      role='alert'
      aria-live='polite'
      aria-atomic='true'
      aria-label={getAriaLabel()}
    >
      <div className='message-content'>
        {showIcon && <span className='message-icon'>{getIcon()}</span>}
        <span className='message-text'>{displayText}</span>
      </div>
      {onDismiss && (
        <button
          className='message-dismiss'
          onClick={onDismiss}
          aria-label={t('accessibility.dismissMessage') || 'Dismiss message'}
          type='button'
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
