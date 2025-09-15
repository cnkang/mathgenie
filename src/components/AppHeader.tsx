import React from 'react';
import LanguageSelector from './LanguageSelector';
import './AppHeader.css';

type AppHeaderProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
};

const AppHeader: React.FC<AppHeaderProps> = ({ t }) => {
  return (
    <header className='app-header' role='banner'>
      <div className='app-header-inner'>
        <h1 className='app-title' aria-label={t('app.title')}>
          {t('app.title')}
        </h1>
        <p className='app-subtitle'>{t('app.subtitle')}</p>
        <LanguageSelector />
      </div>
    </header>
  );
};

export default AppHeader;
