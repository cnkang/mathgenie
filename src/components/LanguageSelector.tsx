import React from 'react';
import { useTranslation } from '../i18n';
import './LanguageSelector.css';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, languages, changeLanguage, t, isLoading } = useTranslation();

  if (isLoading) {
    return <div className="language-selector loading">{t('loading.translations')}</div>;
  }

  return (
    <div className="language-selector">
      <label htmlFor="language-select" className="language-label">
        {t('language.select')}:
      </label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
        aria-label={t('accessibility.languageSelect')}
      >
        {Object.values(languages).map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
