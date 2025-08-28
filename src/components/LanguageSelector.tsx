import React from 'react';
import { useTranslation } from '../i18n';
import type { LanguageSelectorProps } from '../types';

/**
 * Language Selector Component with TypeScript support
 * Provides a dropdown to switch between available languages
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className }) => {
  const { currentLanguage, languages, changeLanguage, t } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    changeLanguage(e.target.value);
  };

  return (
    <div className={`language-selector ${className || ''}`}>
      <label htmlFor="language-select" className="language-label">
        {t('language.select')}:
      </label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="language-dropdown"
        aria-label={t('accessibility.languageSelect')}
      >
        {Object.entries(languages).map(([code, language]) => (
          <option key={code} value={code}>
            {language.flag} {language.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;