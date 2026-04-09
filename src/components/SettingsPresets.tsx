import React from 'react';
import { useTranslation } from '../i18n';
import type { Settings, SettingsPreset, SettingsPresetsProps } from '../types';
import './SettingsPresets.css';

const PresetIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='16' height='16' fill='none' aria-hidden='true'>
    <path
      d='M5 12h14m0 0-5-5m5 5-5 5'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const areRangesEqual = (left: [number, number], right: [number, number]): boolean => {
  return left[0] === right[0] && left[1] === right[1];
};

const areOperationsEqual = (
  left: Settings['operations'],
  right: Settings['operations']
): boolean => {
  if (left.length !== right.length) {
    return false;
  }
  const sortedLeft = [...left].sort((operationA, operationB) =>
    operationA.localeCompare(operationB)
  );
  const sortedRight = [...right].sort((operationA, operationB) =>
    operationA.localeCompare(operationB)
  );
  return sortedLeft.every((operation, index) => operation === sortedRight[index]);
};

const areSettingsEqual = (left: Settings, right: Settings): boolean => {
  return (
    areOperationsEqual(left.operations, right.operations) &&
    left.numProblems === right.numProblems &&
    areRangesEqual(left.numRange, right.numRange) &&
    areRangesEqual(left.resultRange, right.resultRange) &&
    areRangesEqual(left.numOperandsRange, right.numOperandsRange) &&
    left.allowNegative === right.allowNegative &&
    left.showAnswers === right.showAnswers &&
    left.enableGrouping === right.enableGrouping &&
    left.problemsPerGroup === right.problemsPerGroup &&
    left.totalGroups === right.totalGroups
  );
};

/**
 * Settings Presets Component with TypeScript support
 * Provides quick preset configurations for common use cases
 */
const SettingsPresets: React.FC<SettingsPresetsProps> = ({ onApplyPreset, currentSettings }) => {
  const { t } = useTranslation();
  const [lastAppliedPresetName, setLastAppliedPresetName] = React.useState<string>('');

  const translateWithFallback = React.useCallback(
    (key: string, fallback: string, params: Record<string, string | number> = {}): string => {
      const translated = t(key, params);
      return translated === key ? fallback : translated;
    },
    [t]
  );

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

  const activePresetName = React.useMemo(() => {
    if (!currentSettings) {
      return '';
    }
    const matchedPreset = presets.find(preset =>
      areSettingsEqual(preset.settings, currentSettings)
    );
    return matchedPreset?.name ?? '';
  }, [currentSettings, presets]);

  const handleApplyPreset = (settings: Settings, presetName: string): void => {
    onApplyPreset(settings);
    setLastAppliedPresetName(presetName);
  };

  const applyLabel = translateWithFallback('presets.clickToApply', 'Click to apply');
  const appliedLabel = translateWithFallback('presets.applied', 'Applied');

  return (
    <div className='settings-presets'>
      <h2>{t('presets.title') || 'Quick Presets'}</h2>
      <div className='presets-grid'>
        {presets.map(preset => {
          const isActive = activePresetName === preset.name;
          return (
            <button
              key={preset.name}
              className={`preset-card clickable-card${isActive ? ' active' : ''}`}
              onClick={() => handleApplyPreset(preset.settings, preset.name)}
              aria-label={`${t('presets.apply') || 'Apply'} ${preset.name} preset: ${preset.description}`}
              aria-pressed={isActive}
            >
              <div className='preset-content'>
                <div className='preset-info'>
                  <h3>
                    <span>{preset.name}</span>
                    {isActive && <span className='preset-badge'>{appliedLabel}</span>}
                  </h3>
                  <p>{preset.description}</p>
                </div>
                <div className={`preset-indicator${isActive ? ' active' : ''}`}>
                  <span className='preset-icon'>
                    <PresetIcon />
                  </span>
                  <span className='preset-action'>{isActive ? appliedLabel : applyLabel}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {lastAppliedPresetName && (
        <p className='preset-feedback' aria-live='polite'>
          {translateWithFallback(
            'messages.info.presetApplied',
            `Applied preset "${lastAppliedPresetName}".`,
            {
              name: lastAppliedPresetName,
            }
          )}
        </p>
      )}
    </div>
  );
};

export default SettingsPresets;
