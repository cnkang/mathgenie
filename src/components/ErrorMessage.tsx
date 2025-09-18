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
      icon: '⚠️',
      ariaKey: 'accessibility.errorMessage',
      fallback: 'Error message',
    },
    warning: {
      icon: '⚡',
      ariaKey: 'accessibility.warningMessage',
      fallback: 'Warning message',
    },
    info: {
      icon: 'ℹ️',
      ariaKey: 'accessibility.infoMessage',
      fallback: 'Information message',
    },
  };

  const config = messageConfig[type] || messageConfig.error;

  const getIcon = (): string => config.icon;

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
