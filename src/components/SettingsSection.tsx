import React from 'react';
import type { Settings } from '@/types';
import SettingsPresets from './SettingsPresets';
import PdfSettings from './settings/PdfSettings';
import AdvancedSettings from './settings/AdvancedSettings';
import RangeInput from './form/RangeInput';
import './SettingsSection.css';

// Do not edit manually.
const STR_OPERATIONS = 'operations' as const;
const STR_NUMPROBLEMS = 'numProblems' as const;

const STR_FROM = 'From' as const;
const STR_TO = 'To' as const;

type OnChange = <K extends keyof Settings>(field: K, value: Settings[K]) => void;

type SettingsSectionProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  settings: Settings;
  onChange: OnChange;
  onApplyPreset: (settings: Settings) => void;
  paperSizeOptions: Record<string, string>;
};

const SettingsSection: React.FC<SettingsSectionProps> = ({
  t,
  settings,
  onChange,
  onApplyPreset,
  paperSizeOptions,
}) => {
  const MIN_LABEL = t('settings.from') || STR_FROM;
  const MAX_LABEL = t('settings.to') || STR_TO;

  return (
    <section className='settings-section' aria-label={t('settings.title') || 'Settings'}>
      <div className='field'>
        <label htmlFor={STR_OPERATIONS} className='field-label'>
          {t('operations.title')}
        </label>
        <select
          id={STR_OPERATIONS}
          multiple
          aria-label={t('accessibility.selectOperations')}
          value={settings.operations}
          onChange={e => {
            const options = Array.from(e.target.selectedOptions).map(
              o => o.value as Settings['operations'][number]
            );
            onChange(STR_OPERATIONS, options);
          }}
        >
          <option value='+'>{t('operations.addition') || 'Addition (+)'}</option>
          <option value='-'>{t('operations.subtraction') || 'Subtraction (-)'}</option>
          <option value='*'>{t('operations.multiplication') || 'Multiplication (×)'}</option>
          <option value='/'>{t('operations.division') || 'Division (÷)'}</option>
        </select>
        <small className='field-help'>{t('operations.help')}</small>
      </div>

      <div className='field'>
        <label htmlFor={STR_NUMPROBLEMS} className='field-label'>
          {t('settings.numProblems')}
        </label>
        <input
          id={STR_NUMPROBLEMS}
          type='number'
          inputMode='numeric'
          value={settings.numProblems}
          onChange={e => onChange(STR_NUMPROBLEMS, Number(e.target.value))}
          aria-label={t('accessibility.numProblemsInput')}
          min={1}
          max={100}
        />
      </div>

      <RangeInput
        id='numRange'
        idFrom='numRangeFrom'
        idTo='numRangeTo'
        label={t('settings.numberRange')}
        value={settings.numRange}
        onChange={next => onChange('numRange', next)}
        ariaMinLabel={MIN_LABEL}
        ariaMaxLabel={MAX_LABEL}
      />

      <RangeInput
        id='result-range'
        label={t('settings.resultRange')}
        value={settings.resultRange}
        onChange={next => onChange('resultRange', next)}
        ariaMinLabel={MIN_LABEL}
        ariaMaxLabel={MAX_LABEL}
      />

      <RangeInput
        id='operands-range'
        label={t('settings.operandsRange')}
        value={settings.numOperandsRange}
        onChange={next => onChange('numOperandsRange', next)}
        ariaMinLabel={MIN_LABEL}
        ariaMaxLabel={MAX_LABEL}
      />

      <SettingsPresets onApplyPreset={onApplyPreset} />
      <PdfSettings settings={settings} onChange={onChange} paperSizeOptions={paperSizeOptions} />
      <AdvancedSettings settings={settings} onChange={onChange} />
    </section>
  );
};

export default SettingsSection;
