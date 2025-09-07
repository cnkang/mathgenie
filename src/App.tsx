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
import { useTranslation } from './i18n';
import './styles/components.css';
import type { MessageValue, Operation, PaperSizeOptions, QuizResult, Settings } from './types';
import { setupWCAGEnforcement } from './utils/wcagEnforcement';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useSettings } from './hooks/useSettings';

const SpeedInsights = React.lazy(() =>
  import('@vercel/speed-insights/react').then(module => ({ default: module.SpeedInsights }))
);

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

  const downloadPdf = (): void => {
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
      import('jspdf').then(({ default: jsPDF }) => {
        const doc = new jsPDF({
          format: paperSizeOptions[settings.paperSize],
        });

        doc.setFontSize(settings.fontSize);
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();

        const marginLeft = 10;
        const marginTop = 10;
        const lineSpacing = settings.lineSpacing;
        const colWidth = (pageWidth - 3 * marginLeft) / 2;

        let currYLeft = marginTop;
        let currYRight = marginTop;

        problems.forEach((problem, index) => {
          if (index % 2 === 0) {
            if (currYLeft + lineSpacing > pageHeight) {
              doc.addPage();
              currYLeft = marginTop;
              currYRight = marginTop;
            }
            doc.text(problem.text, marginLeft, currYLeft);
            currYLeft += lineSpacing;
          } else {
            if (currYRight + lineSpacing > pageHeight) {
              doc.addPage();
              currYLeft = marginTop;
              currYRight = marginTop;
            }
            doc.text(problem.text, marginLeft + colWidth + marginLeft, currYRight);
            currYRight += lineSpacing;
          }
        });

        doc.save('problems.pdf');

        // Show success message only if i18n is loaded
        if (!isLoading) {
          setSuccessMessage({ key: 'messages.success.pdfGenerated' });
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      });
    } catch (err) {
      // Only show error if i18n is loaded
      if (!isLoading) {
        setError({ key: 'errors.pdfFailed' });
      }
      if (process.env.NODE_ENV === 'development') {
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
      setError(validationError);
    }
  }, [settings, isLoading]);

  // WCAG 2.2 AAA Enforcement
  useEffect(() => {
    const cleanup = setupWCAGEnforcement();
    return cleanup;
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
          setError(validationError);
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
      if (process.env.NODE_ENV === 'development') {
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
                    tabIndex={0}
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
                    onChange={e => handleChange('numProblems', parseInt(e.target.value, 10))}
                    aria-label={t('accessibility.numProblemsInput')}
                    tabIndex={0}
                    className='form-input'
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
                          parseInt(e.target.value, 10),
                          settings.numRange[1],
                        ])
                      }
                      aria-label={t('accessibility.minNumber')}
                      placeholder={t('settings.from')}
                      tabIndex={0}
                      className='form-input'
                    />
                    <span>{t('settings.to')}</span>
                    <input
                      type='number'
                      id='numRangeTo'
                      value={settings.numRange[1]}
                      onChange={e =>
                        handleChange('numRange', [
                          settings.numRange[0],
                          parseInt(e.target.value, 10),
                        ])
                      }
                      aria-label={t('accessibility.maxNumber')}
                      placeholder={t('settings.to')}
                      tabIndex={0}
                      className='form-input'
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
                          parseInt(e.target.value, 10),
                          settings.resultRange[1],
                        ])
                      }
                      aria-label={t('accessibility.minResult')}
                      placeholder={t('settings.from')}
                      tabIndex={0}
                      className='form-input'
                    />
                    <span>{t('settings.to')}</span>
                    <input
                      type='number'
                      id='resultRangeTo'
                      value={settings.resultRange[1]}
                      onChange={e =>
                        handleChange('resultRange', [
                          settings.resultRange[0],
                          parseInt(e.target.value, 10),
                        ])
                      }
                      aria-label={t('accessibility.maxResult')}
                      placeholder={t('settings.to')}
                      tabIndex={0}
                      className='form-input'
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
                          parseInt(e.target.value, 10),
                          settings.numOperandsRange[1],
                        ])
                      }
                      aria-label={t('accessibility.minOperands')}
                      placeholder={t('settings.from')}
                      tabIndex={0}
                      className='form-input'
                    />
                    <span>{t('settings.to')}</span>
                    <input
                      type='number'
                      id='numOperandsRangeTo'
                      value={settings.numOperandsRange[1]}
                      onChange={e =>
                        handleChange('numOperandsRange', [
                          settings.numOperandsRange[0],
                          parseInt(e.target.value, 10),
                        ])
                      }
                      aria-label={t('accessibility.maxOperands')}
                      placeholder={t('settings.to')}
                      tabIndex={0}
                      className='form-input'
                    />
                  </div>
                </div>
                <div className='form-row'>
                  <label htmlFor='allowNegative'>{t('settings.allowNegative')}:</label>
                  <input
                    type='checkbox'
                    id='allowNegative'
                    checked={settings.allowNegative}
                    onChange={e => handleChange('allowNegative', e.target.checked)}
                    aria-label={t('accessibility.allowNegativeLabel')}
                    tabIndex={0}
                    className='form-checkbox'
                  />
                  <small className='help-text'>{t('settings.allowNegativeDesc')}</small>
                </div>
                <div className='form-row'>
                  <label htmlFor='showAnswers'>{t('settings.showAnswers')}:</label>
                  <input
                    type='checkbox'
                    id='showAnswers'
                    checked={settings.showAnswers}
                    onChange={e => handleChange('showAnswers', e.target.checked)}
                    aria-label={t('accessibility.showAnswersLabel')}
                    tabIndex={0}
                    className='form-checkbox'
                  />
                  <small className='help-text'>{t('settings.showAnswersDesc')}</small>
                </div>
                <fieldset className='pdf-settings' tabIndex={0}>
                  <legend>{t('pdf.title')}</legend>
                  <div className='form-row'>
                    <label htmlFor='fontSize'>{t('pdf.fontSize')}:</label>
                    <input
                      type='number'
                      id='fontSize'
                      value={settings.fontSize}
                      onChange={e => handleChange('fontSize', parseInt(e.target.value, 10))}
                      aria-label={t('accessibility.fontSizeInput')}
                      tabIndex={0}
                      className='form-input'
                    />
                  </div>
                  <div className='form-row'>
                    <label htmlFor='lineSpacing'>{t('pdf.lineSpacing')}:</label>
                    <input
                      type='number'
                      id='lineSpacing'
                      value={settings.lineSpacing}
                      onChange={e => handleChange('lineSpacing', parseInt(e.target.value, 10))}
                      aria-label={t('accessibility.lineSpacingInput')}
                      tabIndex={0}
                      className='form-input'
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
                      tabIndex={0}
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
                    aria-label={`${t('buttons.generate')} - ${t('accessibility.generateButton')}`}
                    tabIndex={0}
                  >
                    <div className='action-card-content'>
                      <div className='action-icon'>🎲</div>
                      <div className='action-text'>
                        <h3>{t('buttons.generate')}</h3>
                        <p>{t('buttons.generateDescription')}</p>
                      </div>
                      <div className='action-indicator'>
                        <span className='action-arrow'>→</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={downloadPdf}
                    className='action-card download-card'
                    aria-label={`${t('buttons.download')} - ${t('accessibility.downloadButton')}`}
                    disabled={problems.length === 0}
                    tabIndex={0}
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
                  </button>

                  <button
                    onClick={startQuizMode}
                    disabled={problems.length === 0}
                    className='action-card quiz-card'
                    aria-label={t('infoPanel.quickActions.startQuiz')}
                    tabIndex={0}
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
                          tabIndex={0}
                          role='button'
                          aria-label={`${problems.length} problems generated`}
                        >
                          <span>📊</span>
                          <span>{problems.length} problems</span>
                        </div>
                        <div
                          className='problems-stat'
                          tabIndex={0}
                          role='button'
                          aria-label={`Operations: ${settings.operations.join(', ')}`}
                        >
                          <span>⚙️</span>
                          <span>{settings.operations.join(', ')}</span>
                        </div>
                        <div
                          className='problems-stat success-indicator'
                          tabIndex={0}
                          role='button'
                          aria-label={t('messages.success.generated')}
                        >
                          <span>✅</span>
                          <span>{t('messages.success.generated')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className='problems-content'
                    tabIndex={0}
                    role='region'
                    aria-label={t('accessibility.problemsList')}
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
                          {t('results.clickToStart', { generateButton: t('buttons.generate') })}
                        </div>
                      </div>
                    )}
                  </div>
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

          {process.env.NODE_ENV === 'production' && (
            <Suspense fallback={<div>{t('loading.insights')}</div>}>
              <SpeedInsights />
            </Suspense>
          )}
        </main>
      </div>
    </TranslationLoader>
  );
}

export default App;
