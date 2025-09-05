import React from 'react';
import { useTranslation } from '../i18n';
import './TranslationLoader.css';

interface TranslationLoaderProps {
  children: React.ReactNode;
}

const TranslationLoader: React.FC<TranslationLoaderProps> = ({ children }) => {
  const { t, isLoading } = useTranslation();

  if (isLoading) {
    return (
      <div className='translation-loader'>
        <div className='translation-loader-content'>
          <div className='translation-loader-icon'>🌐</div>
          <h1 className='translation-loader-title'>{t('app.title') || 'MathGenie'}</h1>
          <p className='translation-loader-message'>
            {t('loading.translations') || 'Loading translations...'}
          </p>
          <div
            className='translation-loader-spinner'
            aria-label={t('loading.translations') || 'Loading...'}
          >
            <div className='spinner-dot'></div>
            <div className='spinner-dot'></div>
            <div className='spinner-dot'></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default TranslationLoader;
