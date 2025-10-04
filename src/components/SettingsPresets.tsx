import React from 'react';
import { useTranslation } from '../i18n';
import type { Settings, SettingsPreset, SettingsPresetsProps } from '../types';
import './SettingsPresets.css';

/**
 * Settings Presets Component with TypeScript support
 * Provides quick preset configurations for common use cases
 */
const SettingsPresets: React.FC<SettingsPresetsProps> = ({ onApplyPreset }) => {
  const { t } = useTranslation();

  const presets: SettingsPreset[] = [
    {
      name: t('presets.beginner.name') || 'Beginner (1-10)',
      description: t('presets.beginner.description') || 'Simple addition and subtraction',
      settings: {
        operations: ['+', '-'],
        numProblems: 15,
        numRange: [1, 10],
        resultRange: [0, 20],
        numOperandsRange: [2, 2],
        allowNegative: false,
        showAnswers: false,
        fontSize: 18,
        lineSpacing: 16,
        paperSize: 'a4',
        enableGrouping: false,
        problemsPerGroup: 20,
        totalGroups: 1,
      },
    },
    {
      name: t('presets.intermediate.name') || 'Intermediate (1-50)',
      description: t('presets.intermediate.description') || 'All operations with medium numbers',
      settings: {
        operations: ['+', '-', '*'],
        numProblems: 20,
        numRange: [1, 50],
        resultRange: [0, 100],
        numOperandsRange: [2, 3],
        allowNegative: false,
        showAnswers: false,
        fontSize: 16,
        lineSpacing: 14,
        paperSize: 'a4',
        enableGrouping: false,
        problemsPerGroup: 20,
        totalGroups: 1,
      },
    },
    {
      name: t('presets.advanced.name') || 'Advanced (1-100)',
      description: t('presets.advanced.description') || 'All operations including division',
      settings: {
        operations: ['+', '-', '*', '/'],
        numProblems: 25,
        numRange: [1, 100],
        resultRange: [-50, 200],
        numOperandsRange: [2, 4],
        allowNegative: true,
        showAnswers: false,
        fontSize: 14,
        lineSpacing: 12,
        paperSize: 'a4',
        enableGrouping: false,
        problemsPerGroup: 20,
        totalGroups: 1,
      },
    },
    {
      name: t('presets.multiplication.name') || 'Multiplication Tables',
      description: t('presets.multiplication.description') || 'Focus on multiplication practice',
      settings: {
        operations: ['*'],
        numProblems: 30,
        numRange: [1, 12],
        resultRange: [1, 144],
        numOperandsRange: [2, 2],
        allowNegative: false,
        showAnswers: false,
        fontSize: 16,
        lineSpacing: 14,
        paperSize: 'a4',
        enableGrouping: false,
        problemsPerGroup: 20,
        totalGroups: 1,
      },
    },
  ];

  const handleApplyPreset = (settings: Partial<Settings>): void => {
    onApplyPreset(settings as Settings);
  };

  return (
    <div className='settings-presets'>
      <h2>{t('presets.title') || 'Quick Presets'}</h2>
      <div className='presets-grid'>
        {presets.map(preset => (
          <button
            key={preset.name}
            className='preset-card clickable-card'
            onClick={() => handleApplyPreset(preset.settings)}
            aria-label={`${t('presets.apply') || 'Apply'} ${preset.name} preset: ${preset.description}`}
          >
            <div className='preset-content'>
              <div className='preset-info'>
                <h3>{preset.name}</h3>
                <p>{preset.description}</p>
              </div>
              <div className='preset-indicator'>
                <span className='preset-icon'>✨</span>
                <span className='preset-action'>
                  {t('presets.clickToApply') || 'Click to apply'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsPresets;
