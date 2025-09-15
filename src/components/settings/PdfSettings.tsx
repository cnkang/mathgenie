import React from 'react';
import { useTranslation } from '@/i18n';
import type { Settings } from '@/types';
import { CSS_CLASSES, NUMERIC_CONSTANTS } from '@/constants/appConstants';

// Do not edit manually.
const STR_SR_ONLY = 'sr-only' as const;
const STR_FORM_ROW = 'form-row' as const;
const STR_FONTSIZE = 'fontSize' as const;
const STR_LINESPACING = 'lineSpacing' as const;
const STR_PAPERSIZE = 'paperSize' as const;

type OnChange = <K extends keyof Settings>(field: K, value: Settings[K]) => void;

type PdfSettingsProps = {
  settings: Settings;
  onChange: OnChange;
  paperSizeOptions: Record<string, string>;
};

const PdfSettings: React.FC<PdfSettingsProps> = ({ settings, onChange, paperSizeOptions }) => {
  const { t } = useTranslation();

  return (
    <details
      className='pdf-settings-collapsible'
      onToggle={e => {
        const isOpen = (e.target as HTMLDetailsElement).open;
        const announcement = isOpen
          ? t('accessibility.pdfSettingsExpanded') || 'PDF settings expanded'
          : t('accessibility.pdfSettingsCollapsed') || 'PDF settings collapsed';

        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = STR_SR_ONLY;
        announcer.textContent = announcement;
        document.body.appendChild(announcer);
        setTimeout(() => document.body.removeChild(announcer), 1000);
      }}
    >
      <summary
        className='pdf-settings-toggle'
        aria-controls='pdf-settings-content'
        aria-describedby='pdf-settings-desc'
        onKeyDown={e => {
          if (e.key === 'Escape' && (e.target as HTMLElement).closest('details')?.open) {
            (e.target as HTMLElement).closest('details')?.removeAttribute('open');
            e.preventDefault();
          }
        }}
      >
        <span aria-hidden='true'>📄</span>
        <span>{t('pdf.title')}</span>
        <span className='toggle-indicator' aria-hidden='true'>
          <span className='toggle-icon'>▼</span>
          <span className='sr-only toggle-status'>
            {t('accessibility.clickToExpand') || 'Click to expand'}
          </span>
        </span>
      </summary>
      <fieldset
        id='pdf-settings-content'
        className='pdf-settings'
        aria-labelledby='pdf-settings-toggle'
      >
        <legend className={STR_SR_ONLY}>{t('pdf.title')}</legend>
        <div id='pdf-settings-desc' className={STR_SR_ONLY}>
          {t('accessibility.pdfSettingsDesc') ||
            'PDF export settings including font size, line spacing, and paper size options'}
        </div>
        <div className={STR_FORM_ROW}>
          <label htmlFor={STR_FONTSIZE}>{t('pdf.fontSize')}:</label>
          <input
            type='number'
            id={STR_FONTSIZE}
            value={settings.fontSize}
            onChange={e =>
              onChange(STR_FONTSIZE, parseInt(e.target.value, NUMERIC_CONSTANTS.DECIMAL_RADIX))
            }
            aria-label={t('accessibility.fontSizeInput')}
            className={CSS_CLASSES.FORM_INPUT}
          />
        </div>
        <div className={STR_FORM_ROW}>
          <label htmlFor={STR_LINESPACING}>{t('pdf.lineSpacing')}:</label>
          <input
            type='number'
            id={STR_LINESPACING}
            value={settings.lineSpacing}
            onChange={e =>
              onChange(STR_LINESPACING, parseInt(e.target.value, NUMERIC_CONSTANTS.DECIMAL_RADIX))
            }
            aria-label={t('accessibility.lineSpacingInput')}
            className={CSS_CLASSES.FORM_INPUT}
          />
        </div>
        <div className={STR_FORM_ROW}>
          <label htmlFor={STR_PAPERSIZE}>{t('pdf.paperSize')}:</label>
          <select
            id={STR_PAPERSIZE}
            value={settings.paperSize}
            onChange={e => onChange(STR_PAPERSIZE, e.target.value as Settings['paperSize'])}
            aria-label={t('accessibility.paperSizeSelect')}
            className='form-select'
          >
            {Object.keys(paperSizeOptions).map(size => (
              <option key={size} value={size}>
                {size.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </fieldset>
    </details>
  );
};

export default PdfSettings;
