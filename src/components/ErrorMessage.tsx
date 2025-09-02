import React from 'react';
import { useTranslation } from '../i18n';
import './ErrorMessage.css';

export interface ErrorMessageProps {
  error: string;
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
        <span className='message-text'>{error}</span>
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
