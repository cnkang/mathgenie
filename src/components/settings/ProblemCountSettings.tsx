import type { Settings } from '@/types';
import React from 'react';

type OnChange = <K extends keyof Settings>(field: K, value: Settings[K]) => void;

type ProblemCountSettingsProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  settings: Settings;
  onChange: OnChange;
};

const ProblemCountSettings: React.FC<ProblemCountSettingsProps> = ({ t, settings, onChange }) => {
  // Only show single problem count input when grouping is disabled
  if (settings.enableGrouping) {
    return null;
  }

  return (
    <div className='single-mode-field'>
      <div className='field'>
        <label htmlFor='numProblems' className='field-label'>
          {t('settings.numProblems')}
        </label>
        <input
          id='numProblems'
          type='number'
          inputMode='numeric'
          value={settings.numProblems}
          onChange={e => onChange('numProblems', Number(e.target.value))}
          aria-label={t('accessibility.numProblemsInput')}
          min={1}
          max={50000}
          className='single-input'
        />
      </div>
    </div>
  );
};

export default ProblemCountSettings;
