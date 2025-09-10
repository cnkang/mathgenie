import LoadingButton from '@/components/LoadingButton';
import { generatePdf } from '@/utils/pdf';
import React, { Suspense, useEffect, useState } from 'react';
import './App.css';
import ErrorMessage from './components/ErrorMessage';
import InfoPanel from './components/InfoPanel';
import LanguageSelector from './components/LanguageSelector';
import './components/ProblemsDisplay.css';
import QuizMode from './components/QuizMode';
import './components/QuizMode.css';
import SettingsPresets from './components/SettingsPresets';
import TranslationLoader from './components/TranslationLoader';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useSettings } from './hooks/useSettings';
import { useTranslation } from './i18n';
import './styles/components.css';
import type { MessageValue, Operation, PaperSizeOptions, QuizResult, Settings } from './types';
import { setupWCAGEnforcement } from './utils/wcagEnforcement';

const SpeedInsights = React.lazy(() =>
  import('@vercel/speed-insights/react').then(module => ({ default: module.SpeedInsights }))
);

// Constants to avoid duplicate strings
const FORM_INPUT_CLASS = 'form-input';
const DECIMAL_RADIX = 10;
const SETTINGS_FROM_KEY = 'settings.from';
const SETTINGS_TO_KEY = 'settings.to';
const BUTTONS_GENERATE_KEY = 'buttons.generate';

function App(): React.JSX.Element {
  const { t, isLoading } = useTranslation();

  const { settings, setSettings, validateSettings } = useSettings();
  const { problems, generateProblems } = useProblemGenerator(settings, isLoading, validateSettings);
  const [error, setError] = useState<MessageValue>('');
  const [warning, setWarning] = useState<MessageValue>('');
  const [successMessage, setSuccessMessage] = useState<MessageValue>('');

  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [hasInitialGenerated, setHasInitialGenerated] = useState<boolean>(false);

  const paperSizeOptions: PaperSizeOptions = {
    a4: 'a4',
    letter: 'letter',
    legal: 'legal',
  };

  const downloadPdf = async (): Promise<void> => {
    if (problems.length === 0) {
      // Only show error if i18n is loaded
      if (!isLoading) {
        setError({ key: 'errors.noProblemsToPdf' });
      }
      return;
    }

    // Clear previous messages
    setError('');
    setWarning('');
    setSuccessMessage('');

    try {
      await generatePdf(problems, settings, paperSizeOptions);
      if (!isLoading) {
        setSuccessMessage({ key: 'messages.success.pdfGenerated' });
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      // Only show error if i18n is loaded
      if (!isLoading) {
        setError({ key: 'errors.pdfFailed' });
      }
      if (import.meta.env.DEV) {
        console.error('PDF generation error:', err);
      }
    }
  };

  useEffect(() => {
    // Only generate problems after i18n is fully loaded
    if (isLoading) {
      return;
    }

    const validationError = validateSettings(settings);
    if (!validationError) {
      const messages = generateProblems(hasInitialGenerated);
      setError(messages.error);
      setWarning(messages.warning);
      if (messages.successMessage) {
        setSuccessMessage(messages.successMessage);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setSuccessMessage('');
      }
      if (!hasInitialGenerated) {
        setHasInitialGenerated(true);
      }
    } else {
      setError({ key: validationError });
    }
  }, [settings, isLoading, validateSettings, generateProblems, hasInitialGenerated]);

  // WCAG 2.2 AAA Enforcement
  useEffect(() => {
    return setupWCAGEnforcement();
  }, []);

  const handleChange = <K extends keyof Settings>(field: K, value: Settings[K]): void => {
    const newSettings = {
      ...settings,
      [field]: value,
    };

    // Clear previous messages
    setError('');
    setWarning('');
    setSuccessMessage('');

    // Validate immediately for validation-sensitive fields
    if (
      field === 'numProblems' ||
      field === 'numRange' ||
      field === 'resultRange' ||
      field === 'numOperandsRange' ||
      field === 'operations'
    ) {
      const validationError = validateSettings(newSettings);
      if (validationError) {
        // Only show error if i18n is loaded
        if (!isLoading) {
          setError({ key: validationError });
        }
      } else {
        // Check for restrictive settings
        const isRestrictive =
          newSettings.resultRange[1] - newSettings.resultRange[0] < 10 ||
          newSettings.numRange[1] - newSettings.numRange[0] < 5;

        if (isRestrictive && newSettings.numProblems > 20 && !isLoading) {
          setWarning({ key: 'warnings.restrictiveSettings' });
        }
      }
    }

    setSettings(newSettings);
  };

  const handleApplyPreset = (presetSettings: Settings): void => {
    setSettings(presetSettings);

    // Clear messages and show success only if i18n is loaded
    setError('');
    setWarning('');
    if (!isLoading) {
      setSuccessMessage({
        key: 'messages.info.presetApplied',
        params: { name: 'Preset' },
      });
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const startQuizMode = (): void => {
    if (problems.length === 0) {
      // Only show error if i18n is loaded
      if (!isLoading) {
        setError({ key: 'errors.noProblemsForQuiz' });
      }
      return;
    }
    setIsQuizMode(true);
    setQuizResult(null);
  };

  const exitQuizMode = (): void => {
    setIsQuizMode(false);
  };

  const handleQuizComplete = (result: QuizResult): void => {
    setQuizResult(result);
    // Save quiz results to localStorage
    try {
      const savedResults = localStorage.getItem('mathgenie-quiz-results');
      const results = savedResults ? JSON.parse(savedResults) : [];
      results.push({
        ...result,
        timestamp: new Date().toISOString(),
        settings: settings,
      });
      // Keep only the last 20 records
      if (results.length > 20) {
        results.splice(0, results.length - 20);
      }
      localStorage.setItem('mathgenie-quiz-results', JSON.stringify(results));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to save quiz result:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className='App'>
        <div className='loading-container'>
          <h1>{t('app.title')}</h1>
          <p>{t('loading.translations')}</p>
          <div className='loading-spinner' aria-label='Loading...'></div>
        </div>
      </div>
    );
  }

  return (
    <TranslationLoader>
      <div className='App'>
        <header className='app-header'>
          <div className='header-content'>
            <div className='title-section'>
              <h1>{t('app.title')}</h1>
              <p className='subtitle'>{t('app.subtitle')}</p>
            </div>
            <LanguageSelector />
          </div>
        </header>

        <main className='main-content'>
          {/* Message display area */}
          <div className='messages-container'>
            <ErrorMessage error={error} type='error' onDismiss={() => setError('')} />
            <ErrorMessage error={warning} type='warning' onDismiss={() => setWarning('')} />
            <ErrorMessage
              error={successMessage}
              type='info'
              onDismiss={() => setSuccessMessage('')}
            />
          </div>

          {isQuizMode ? (
            <QuizMode
              problems={problems}
              onQuizComplete={handleQuizComplete}
              onExitQuiz={exitQuizMode}
            />
          ) : (
            <div className='container'>
              <div className='settings-section'>
                <SettingsPresets onApplyPreset={handleApplyPreset} />

                <div className='form-row'>
                  <label htmlFor='operations'>{t('operations.title')}:</label>
                  <select
                    id='operations'
                    multiple
                    value={settings.operations}
                    onChange={e =>
                      handleChange(
                        'operations',
                        Array.from(e.target.selectedOptions, option => option.value as Operation)
                      )
                    }
                    aria-label={t('accessibility.selectOperations')}
                    title={t('operations.help')}
                    className='operations-select'
                  >
                    <option value='+'>{t('operations.addition')}</option>
                    <option value='-'>{t('operations.subtraction')}</option>
                    <option value='*'>{t('operations.multiplication')}</option>
                    <option value='/'>{t('operations.division')}</option>
                  </select>
                  <small className='help-text'>{t('operations.help')}</small>
                </div>
                <div className='form-row'>
                  <label htmlFor='numProblems'>{t('settings.numProblems')}:</label>
                  <input
                    type='number'
                    id='numProblems'
                    value={settings.numProblems}
                    onChange={e =>
                      handleChange('numProblems', parseInt(e.target.value, DECIMAL_RADIX))
                    }
                    aria-label={t('accessibility.numProblemsInput')}
                    className={FORM_INPUT_CLASS}
                  />
                </div>
                <div className='form-row'>
                  <label htmlFor='numRange'>{t('settings.numberRange')}:</label>
                  <div className='range-inputs'>
                    <input
                      type='number'
                      id='numRangeFrom'
                      value={settings.numRange[0]}
                      onChange={e =>
                        handleChange('numRange', [
                          parseInt(e.target.value, DECIMAL_RADIX),
                          settings.numRange[1],
                        ])
                      }
                      aria-label={t('accessibility.minNumber')}
                      placeholder={t(SETTINGS_FROM_KEY)}
                      className={FORM_INPUT_CLASS}
                    />
                    <span>{t(SETTINGS_TO_KEY)}</span>
                    <input
                      type='number'
                      id='numRangeTo'
                      value={settings.numRange[1]}
                      onChange={e =>
                        handleChange('numRange', [
                          settings.numRange[0],
                          parseInt(e.target.value, DECIMAL_RADIX),
                        ])
                      }
                      aria-label={t('accessibility.maxNumber')}
                      placeholder={t(SETTINGS_TO_KEY)}
                      className={FORM_INPUT_CLASS}
                    />
                  </div>
                </div>
                <div className='form-row'>
                  <label htmlFor='resultRange'>{t('settings.resultRange')}:</label>
                  <div className='range-inputs'>
                    <input
                      type='number'
                      id='resultRangeFrom'
                      value={settings.resultRange[0]}
                      onChange={e =>
                        handleChange('resultRange', [
                          parseInt(e.target.value, DECIMAL_RADIX),
                          settings.resultRange[1],
                        ])
                      }
                      aria-label={t('accessibility.minResult')}
                      placeholder={t(SETTINGS_FROM_KEY)}
                      className={FORM_INPUT_CLASS}
                    />
                    <span>{t(SETTINGS_TO_KEY)}</span>
                    <input
                      type='number'
                      id='resultRangeTo'
                      value={settings.resultRange[1]}
                      onChange={e =>
                        handleChange('resultRange', [
                          settings.resultRange[0],
                          parseInt(e.target.value, DECIMAL_RADIX),
                        ])
                      }
                      aria-label={t('accessibility.maxResult')}
                      placeholder={t(SETTINGS_TO_KEY)}
                      className={FORM_INPUT_CLASS}
                    />
                  </div>
                </div>
                <div className='form-row'>
                  <label htmlFor='numOperandsRange'>{t('settings.operandsRange')}:</label>
                  <div className='range-inputs'>
                    <input
                      type='number'
                      id='numOperandsRangeFrom'
                      value={settings.numOperandsRange[0]}
                      onChange={e =>
                        handleChange('numOperandsRange', [
                          parseInt(e.target.value, DECIMAL_RADIX),
                          settings.numOperandsRange[1],
                        ])
                      }
                      aria-label={t('accessibility.minOperands')}
                      placeholder={t(SETTINGS_FROM_KEY)}
                      className={FORM_INPUT_CLASS}
                    />
                    <span>{t(SETTINGS_TO_KEY)}</span>
                    <input
                      type='number'
                      id='numOperandsRangeTo'
                      value={settings.numOperandsRange[1]}
                      onChange={e =>
                        handleChange('numOperandsRange', [
                          settings.numOperandsRange[0],
                          parseInt(e.target.value, DECIMAL_RADIX),
                        ])
                      }
                      aria-label={t('accessibility.maxOperands')}
                      placeholder={t(SETTINGS_TO_KEY)}
                      className={FORM_INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* Advanced settings - collapsible with WCAG 2.2 AAA compliance */}
                <details
                  className='advanced-settings'
                  onToggle={e => {
                    const isOpen = (e.target as HTMLDetailsElement).open;
                    // Announce state change for screen readers
                    const announcement = isOpen
                      ? t('accessibility.advancedSettingsExpanded') || 'Advanced settings expanded'
                      : t('accessibility.advancedSettingsCollapsed') ||
                        'Advanced settings collapsed';

                    // Create temporary announcement for screen readers
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
                    aria-controls='advanced-settings-content'
                    aria-describedby='advanced-settings-desc'
                    onKeyDown={e => {
                      // Enhanced keyboard support
                      if (
                        e.key === 'Escape' &&
                        (e.target as HTMLElement).closest('details')?.open
                      ) {
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
                    id='advanced-settings-content'
                    className='advanced-settings-content'
                    aria-labelledby='advanced-settings-toggle'
                  >
                    <div id='advanced-settings-desc' className='sr-only'>
                      {t('accessibility.advancedSettingsDesc') ||
                        'Advanced settings for problem generation including negative numbers and answer display options'}
                    </div>
                    <div className='checkbox-item'>
                      <input
                        type='checkbox'
                        id='allowNegative'
                        checked={settings.allowNegative}
                        onChange={e => handleChange('allowNegative', e.target.checked)}
                        aria-label={t('accessibility.allowNegativeLabel')}
                      />
                      <div className='checkbox-content'>
                        <label htmlFor='allowNegative' className='checkbox-label'>
                          {t('settings.allowNegative')}
                        </label>
                        <small className='checkbox-description'>
                          {t('settings.allowNegativeDesc')}
                        </small>
                      </div>
                    </div>
                    <div className='checkbox-item'>
                      <input
                        type='checkbox'
                        id='showAnswers'
                        checked={settings.showAnswers}
                        onChange={e => handleChange('showAnswers', e.target.checked)}
                        aria-label={t('accessibility.showAnswersLabel')}
                      />
                      <div className='checkbox-content'>
                        <label htmlFor='showAnswers' className='checkbox-label'>
                          {t('settings.showAnswers')}
                        </label>
                        <small className='checkbox-description'>
                          {t('settings.showAnswersDesc')}
                        </small>
                      </div>
                    </div>
                  </section>
                </details>
                {/* PDF settings - collapsible with WCAG 2.2 AAA compliance */}
                <details
                  className='pdf-settings-collapsible'
                  onToggle={e => {
                    const isOpen = (e.target as HTMLDetailsElement).open;
                    // Announce state change for screen readers
                    const announcement = isOpen
                      ? t('accessibility.pdfSettingsExpanded') || 'PDF settings expanded'
                      : t('accessibility.pdfSettingsCollapsed') || 'PDF settings collapsed';

                    // Create temporary announcement for screen readers
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
                    className='pdf-settings-toggle'
                    aria-controls='pdf-settings-content'
                    aria-describedby='pdf-settings-desc'
                    onKeyDown={e => {
                      // Enhanced keyboard support
                      if (
                        e.key === 'Escape' &&
                        (e.target as HTMLElement).closest('details')?.open
                      ) {
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
                    <legend className='sr-only'>{t('pdf.title')}</legend>
                    <div id='pdf-settings-desc' className='sr-only'>
                      {t('accessibility.pdfSettingsDesc') ||
                        'PDF export settings including font size, line spacing, and paper size options'}
                    </div>
                    <div className='form-row'>
                      <label htmlFor='fontSize'>{t('pdf.fontSize')}:</label>
                      <input
                        type='number'
                        id='fontSize'
                        value={settings.fontSize}
                        onChange={e =>
                          handleChange('fontSize', parseInt(e.target.value, DECIMAL_RADIX))
                        }
                        aria-label={t('accessibility.fontSizeInput')}
                        className={FORM_INPUT_CLASS}
                      />
                    </div>
                    <div className='form-row'>
                      <label htmlFor='lineSpacing'>{t('pdf.lineSpacing')}:</label>
                      <input
                        type='number'
                        id='lineSpacing'
                        value={settings.lineSpacing}
                        onChange={e =>
                          handleChange('lineSpacing', parseInt(e.target.value, DECIMAL_RADIX))
                        }
                        aria-label={t('accessibility.lineSpacingInput')}
                        className={FORM_INPUT_CLASS}
                      />
                    </div>
                    <div className='form-row'>
                      <label htmlFor='paperSize'>{t('pdf.paperSize')}:</label>
                      <select
                        id='paperSize'
                        value={settings.paperSize}
                        onChange={e =>
                          handleChange('paperSize', e.target.value as Settings['paperSize'])
                        }
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
              </div>

              <div className='results-section'>
                <div className='action-cards-grid'>
                  <button
                    onClick={() => {
                      const messages = generateProblems();
                      setError(messages.error);
                      setWarning(messages.warning);
                      setSuccessMessage(messages.successMessage);
                      if (messages.successMessage) {
                        setTimeout(() => setSuccessMessage(''), 5000);
                      }
                    }}
                    className='action-card generate-card'
                    aria-label={`${t(BUTTONS_GENERATE_KEY)} - ${t('accessibility.generateButton')}`}
                  >
                    <div className='action-card-content'>
                      <div className='action-icon'>🎲</div>
                      <div className='action-text'>
                        <h3>{t(BUTTONS_GENERATE_KEY)}</h3>
                        <p>{t('buttons.generateDescription')}</p>
                      </div>
                      <div className='action-indicator'>
                        <span className='action-arrow'>→</span>
                      </div>
                    </div>
                  </button>

                  <LoadingButton
                    onClick={downloadPdf}
                    className='action-card download-card'
                    aria-label={`${t('buttons.download')} - ${t('accessibility.downloadButton')}`}
                    disabled={problems.length === 0}
                    loadingContent={
                      <div className='action-card-content'>
                        <div className='action-icon'>📄</div>
                        <div className='action-text'>
                          <div
                            className='loading-spinner'
                            aria-live='polite'
                            aria-label={t('messages.loading')}
                          ></div>
                        </div>
                      </div>
                    }
                  >
                    <div className='action-card-content'>
                      <div className='action-icon'>📄</div>
                      <div className='action-text'>
                        <h3>{t('buttons.download')}</h3>
                        <p>{t('buttons.downloadDescription')}</p>
                      </div>
                      <div className='action-indicator'>
                        <span className='action-arrow'>→</span>
                      </div>
                    </div>
                  </LoadingButton>

                  <button
                    onClick={startQuizMode}
                    disabled={problems.length === 0}
                    className='action-card quiz-card'
                    aria-label={t('infoPanel.quickActions.startQuiz')}
                  >
                    <div className='action-card-content'>
                      <div className='action-icon'>🎯</div>
                      <div className='action-text'>
                        <h3>{t('infoPanel.quickActions.startQuiz')}</h3>
                        <p>{t('buttons.quizDescription')}</p>
                      </div>
                      <div className='action-indicator'>
                        <span className='action-arrow'>→</span>
                      </div>
                    </div>
                  </button>
                </div>

                <div className='problems-container'>
                  <div className='problems-header'>
                    <h2 className='problems-title'>
                      {problems.length > 0
                        ? t('results.title', { count: problems.length })
                        : t('results.noProblems')}
                    </h2>
                    {problems.length > 0 && (
                      <div className='problems-stats'>
                        <div
                          className='problems-stat'
                          aria-label={`${problems.length} problems generated`}
                        >
                          <span>📊</span>
                          <span>{problems.length} problems</span>
                        </div>
                        <div
                          className='problems-stat'
                          aria-label={`Operations: ${settings.operations.join(', ')}`}
                        >
                          <span>⚙️</span>
                          <span>{settings.operations.join(', ')}</span>
                        </div>
                        <div
                          className='problems-stat success-indicator'
                          aria-label={t('messages.success.generated')}
                        >
                          <span>✅</span>
                          <span>{t('messages.success.generated')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <section
                    className='problems-content'
                    aria-label={t('accessibility.problemsList')}
                    role='region'
                    tabIndex={0} // @deviation
                    // Rule: S6845 (tabIndex should only be on interactive elements)
                    // Reason: This scrollable region must be focusable for keyboard users to pass WCAG (axe: scrollable-region-focusable)
                    // Risk: Minimal; allows focus to a non-interactive scrolling container
                    // Refactor Plan: Keep as-is; accessibility requires focusability for scrollable content
                    // Owner: a11y; Target: 2025-12-31
                  >
                    {problems.length > 0 ? (
                      <div className='problems-grid'>
                        {problems.map(problem => (
                          <div key={problem.id} className='problem-item'>
                            {problem.text}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='no-problems'>
                        <div className='no-problems-icon'>🎯</div>
                        <div className='no-problems-text'>{t('results.noProblems')}</div>
                        <div className='no-problems-hint'>
                          {t('results.clickToStart', { generateButton: t(BUTTONS_GENERATE_KEY) })}
                        </div>
                      </div>
                    )}
                  </section>
                </div>

                <InfoPanel
                  problems={problems}
                  settings={settings}
                  onGenerateProblems={() => {
                    const messages = generateProblems();
                    setError(messages.error);
                    setWarning(messages.warning);
                    setSuccessMessage(messages.successMessage);
                    if (messages.successMessage) {
                      setTimeout(() => setSuccessMessage(''), 5000);
                    }
                  }}
                  onDownloadPdf={downloadPdf}
                  quizResult={quizResult}
                  onStartQuiz={startQuizMode}
                />
              </div>
            </div>
          )}

          {import.meta.env.PROD && (
            <Suspense fallback={null}>
              <SpeedInsights />
            </Suspense>
          )}
        </main>
      </div>
    </TranslationLoader>
  );
}

export default App;
