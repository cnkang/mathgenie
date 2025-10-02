import type { Settings } from '@/types';
import React from 'react';
import SettingsPresets from './SettingsPresets';
import './SettingsSection.css';
import RangeInput from './form/RangeInput';
import AdvancedSettings from './settings/AdvancedSettings';
import PdfSettings from './settings/PdfSettings';

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

      <div
        className={`field grouping-toggle ${settings.enableGrouping ? 'grouping-enabled' : 'grouping-disabled'}`}
      >
        <div className='grouping-header'>
          <label className='field-label grouping-label'>
            <div className='checkbox-wrapper'>
              <input
                type='checkbox'
                checked={settings.enableGrouping}
                onChange={e => onChange('enableGrouping', e.target.checked)}
                aria-label={t('accessibility.enableGroupingLabel')}
                className='grouping-checkbox'
              />
              <span className='checkbox-indicator'></span>
            </div>
            <span className='grouping-text'>
              {t('settings.enableGrouping')}
              <span className='grouping-status'>
                {settings.enableGrouping
                  ? t('settings.groupingEnabled') || '✓ 已启用'
                  : t('settings.groupingDisabled') || '○ 未启用'}
              </span>
            </span>
          </label>
        </div>
        <small className='field-help grouping-help'>{t('settings.groupingHelp')}</small>
      </div>

      <div className={`grouping-content ${settings.enableGrouping ? 'expanded' : 'collapsed'}`}>
        {settings.enableGrouping ? (
          <div className='grouping-fields'>
            <div className='field-group'>
              <div className='field'>
                <label htmlFor='problemsPerGroup' className='field-label'>
                  {t('settings.problemsPerGroup')}
                </label>
                <input
                  id='problemsPerGroup'
                  type='number'
                  inputMode='numeric'
                  value={settings.problemsPerGroup}
                  onChange={e => onChange('problemsPerGroup', Number(e.target.value))}
                  aria-label={t('accessibility.problemsPerGroupInput')}
                  min={1}
                  max={1000}
                  className='grouping-input'
                />
              </div>

              <div className='field'>
                <label htmlFor='totalGroups' className='field-label'>
                  {t('settings.totalGroups')}
                </label>
                <input
                  id='totalGroups'
                  type='number'
                  inputMode='numeric'
                  value={settings.totalGroups}
                  onChange={e => onChange('totalGroups', Number(e.target.value))}
                  aria-label={t('accessibility.totalGroupsInput')}
                  min={1}
                  max={100}
                  className='grouping-input'
                />
              </div>
            </div>

            <div className='field total-calculation'>
              <div className='calculation-display'>
                <span className='calculation-label'>
                  {t('settings.totalProblemsCalculated', {
                    total: settings.problemsPerGroup * settings.totalGroups,
                  })}
                </span>
                <span className='calculation-formula'>
                  ({settings.problemsPerGroup} × {settings.totalGroups})
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className='single-mode-field'>
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
                max={50000}
                className='single-input'
              />
            </div>
          </div>
        )}
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
