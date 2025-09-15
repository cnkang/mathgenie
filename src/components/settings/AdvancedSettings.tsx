import React from 'react';
import { useTranslation } from '@/i18n';
import type { Settings } from '@/types';

// Do not edit manually.
const STR_ADVANCED_SETTINGS_CONTENT = 'advanced-settings-content' as const;
const STR_ALLOWNEGATIVE = 'allowNegative' as const;
const STR_SHOWANSWERS = 'showAnswers' as const;

type OnChange = <K extends keyof Settings>(field: K, value: Settings[K]) => void;

type AdvancedSettingsProps = {
  settings: Settings;
  onChange: OnChange;
};

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ settings, onChange }) => {
  const { t } = useTranslation();

  return (
    <details
      className='advanced-settings'
      onToggle={e => {
        const isOpen = (e.target as HTMLDetailsElement).open;
        const announcement = isOpen
          ? t('accessibility.advancedSettingsExpanded') || 'Advanced settings expanded'
          : t('accessibility.advancedSettingsCollapsed') || 'Advanced settings collapsed';

        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = announcement;
        document.body.appendChild(announcer);
        setTimeout(() => document.body.removeChild(announcer), 1000);
      }}
    >
      <summary
        className='advanced-settings-toggle'
        aria-controls={STR_ADVANCED_SETTINGS_CONTENT}
        aria-describedby='advanced-settings-desc'
        onKeyDown={e => {
          if (e.key === 'Escape' && (e.target as HTMLElement).closest('details')?.open) {
            (e.target as HTMLElement).closest('details')?.removeAttribute('open');
            e.preventDefault();
          }
        }}
      >
        <span aria-hidden='true'>⚙️</span>
        <span>{t('settings.advanced')}</span>
        <span className='toggle-indicator' aria-hidden='true'>
          <span className='toggle-icon'>▼</span>
          <span className='sr-only toggle-status'>
            {t('accessibility.clickToExpand') || 'Click to expand'}
          </span>
        </span>
      </summary>
      <section
        id={STR_ADVANCED_SETTINGS_CONTENT}
        className={STR_ADVANCED_SETTINGS_CONTENT}
        aria-labelledby='advanced-settings-toggle'
      >
        <div id='advanced-settings-desc' className='sr-only'>
          {t('accessibility.advancedSettingsDesc') ||
            'Advanced settings for problem generation including negative numbers and answer display options'}
        </div>
        <div className='checkbox-item'>
          <input
            type='checkbox'
            id={STR_ALLOWNEGATIVE}
            checked={settings.allowNegative}
            onChange={e => onChange(STR_ALLOWNEGATIVE, e.target.checked)}
            aria-label={t('accessibility.allowNegativeLabel')}
          />
          <div className='checkbox-content'>
            <label htmlFor={STR_ALLOWNEGATIVE} className='checkbox-label'>
              {t('settings.allowNegative')}
            </label>
            <small className='checkbox-description'>{t('settings.allowNegativeDesc')}</small>
          </div>
        </div>
        <div className='checkbox-item'>
          <input
            type='checkbox'
            id={STR_SHOWANSWERS}
            checked={settings.showAnswers}
            onChange={e => onChange(STR_SHOWANSWERS, e.target.checked)}
            aria-label={t('accessibility.showAnswersLabel')}
          />
          <div className='checkbox-content'>
            <label htmlFor={STR_SHOWANSWERS} className='checkbox-label'>
              {t('settings.showAnswers')}
            </label>
            <small className='checkbox-description'>{t('settings.showAnswersDesc')}</small>
          </div>
        </div>
      </section>
    </details>
  );
};

export default AdvancedSettings;
