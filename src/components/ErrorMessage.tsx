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

  if (!error) {
    return null;
  }

  // Helper function to check if error is MessageState
  const isMessageState = (
    value: MessageValue
  ): value is { key: string; params?: Record<string, string | number> } => {
    return typeof value === 'object' && value !== null && 'key' in value;
  };

  // Get the display text - either translate MessageState or use string directly
  const getDisplayText = (): string => {
    if (isMessageState(error)) {
      return t(error.key, error.params);
    }
    return error;
  };

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
        return t('accessibility.errorMessage') || 'Error message';
      case 'warning':
        return t('accessibility.warningMessage') || 'Warning message';
      case 'info':
        return t('accessibility.infoMessage') || 'Information message';
      default:
        return t('accessibility.errorMessage') || 'Error message';
    }
  };

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
        <span className='message-text'>{getDisplayText()}</span>
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
