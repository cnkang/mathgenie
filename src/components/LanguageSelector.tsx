import React from 'react';
import { useTranslation } from '../i18n';
import './LanguageSelector.css';

// Do not edit manually.
const STR_LANGUAGE_SELECT = 'language-select' as const;

const LanguageSelector: React.FC = () => {
  const { currentLanguage, languages, changeLanguage, t, isLoading } = useTranslation();

  if (isLoading) {
    return <div className='language-selector loading'>{t('loading.translations')}</div>;
  }

  return (
    <div className='language-selector'>
      <label htmlFor={STR_LANGUAGE_SELECT} className='language-label'>
        {t('language.select')}:
      </label>
      <select
        id={STR_LANGUAGE_SELECT}
        value={currentLanguage}
        onChange={e => changeLanguage(e.target.value)}
        className={STR_LANGUAGE_SELECT}
        aria-label={t('accessibility.languageSelect')}
      >
        {Object.values(languages).map(language => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
