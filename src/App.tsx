import React, { Suspense, useEffect, useState } from 'react';
import './App.css';
import './components/ButtonFix.css';
import ErrorMessage from './components/ErrorMessage';
import InfoPanel from './components/InfoPanel';
import LanguageSelector from './components/LanguageSelector';
import './components/ProblemsDisplay.css';
import QuizMode from './components/QuizMode';
import './components/QuizMode.css';
import SettingsPresets from './components/SettingsPresets';
import TranslationLoader from './components/TranslationLoader';
import { useTranslation } from './i18n';
import type { Operation, PaperSizeOptions, Problem, QuizResult, Settings } from './types';

const SpeedInsights = React.lazy(() =>
  import('@vercel/speed-insights/react').then((module) => ({ default: module.SpeedInsights }))
);

function App(): React.JSX.Element {
  const { t, isLoading } = useTranslation();

  const defaultSettings: Settings = {
    operations: ['+', '-'],
    numProblems: 20,
    numRange: [1, 20],
    resultRange: [0, 20],
    numOperandsRange: [2, 3],
    allowNegative: false,
    showAnswers: false,
    fontSize: 16,
    lineSpacing: 12,
    paperSize: 'a4',
  };

  // Load settings from localStorage or use defaults
  const loadSettings = (): Settings => {
    try {
      const saved = localStorage.getItem('mathgenie-settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
    return defaultSettings;
  };

  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [problems, setProblems] = useState<Problem[]>([]);
  const [error, setError] = useState<string>('');
  const [warning, setWarning] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const paperSizeOptions: PaperSizeOptions = {
    a4: 'a4',
    letter: 'letter',
    legal: 'legal',
  };

  // Save settings to localStorage
  const saveSettings = (newSettings: Settings): void => {
    try {
      localStorage.setItem('mathgenie-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  };

  // Validate settings
  const validateSettings = (newSettings: Settings): string => {
    if (newSettings.operations.length === 0) {
      return t('errors.noOperations') || 'Please select at least one operation.';
    }
    if (newSettings.numProblems <= 0 || newSettings.numProblems > 100) {
      return t('errors.invalidProblemCount') || 'Number of problems must be between 1 and 100.';
    }
    if (newSettings.numRange[0] > newSettings.numRange[1]) {
      return (
        t('errors.invalidNumberRange') ||
        'Invalid number range: minimum cannot be greater than maximum.'
      );
    }
    if (newSettings.resultRange[0] > newSettings.resultRange[1]) {
      return (
        t('errors.invalidResultRange') ||
        'Invalid result range: minimum cannot be greater than maximum.'
      );
    }
    if (
      newSettings.numOperandsRange[0] > newSettings.numOperandsRange[1] ||
      newSettings.numOperandsRange[0] < 2
    ) {
      return (
        t('errors.invalidOperandsRange') ||
        'Invalid operands range: minimum must be at least 2 and not greater than maximum.'
      );
    }
    return '';
  };

  const calculateExpression = (operands: number[], operators: string[]): number => {
    let result = operands[0];

    for (let i = 0; i < operators.length; i++) {
      const operator = operators[i];
      const operand = operands[i + 1];

      switch (operator) {
        case '+':
          result += operand;
          break;
        case '-':
          result -= operand;
          break;
        case '*':
          result *= operand;
          break;
        case '/':
          result = result / operand;
          break;
        default:
          return NaN;
      }
    }

    return result;
  };

  const generateProblem = (): string => {
    const crypto = window.crypto || (window as any).msCrypto;
    const random = (min: number, max: number): number => {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const val = array[0] / (0xffffffff + 1);
      return min + Math.floor((max - min + 1) * val);
    };

    const numOperands = random(settings.numOperandsRange[0], settings.numOperandsRange[1]);
    if (numOperands < 2) {
      return '';
    }

    const MAX_ATTEMPTS = 10000;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const operands = Array.from({ length: numOperands }, () =>
        random(settings.numRange[0], settings.numRange[1])
      );

      const operationSymbols = Array.from(
        { length: numOperands - 1 },
        () => settings.operations[random(0, settings.operations.length - 1)]
      );

      const result = calculateExpression(operands, operationSymbols);

      if (settings.resultRange[0] <= result && result <= settings.resultRange[1]) {
        if (settings.allowNegative || result >= 0) {
          let problem = operands[0].toString();
          operationSymbols.forEach((operator, index) => {
            problem += ` ${operator} ${operands[index + 1]}`;
          });

          problem = problem.replace(/\*/g, '✖').replace(/\//g, '➗');

          return settings.showAnswers ? `${problem} = ${result}` : `${problem} = `;
        }
      }
    }

    return '';
  };

  const generateProblems = (): void => {
    // Clear previous messages
    setError('');
    setWarning('');
    setSuccessMessage('');

    // Validate settings first
    const validationError = validateSettings(settings);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Show warning for large number of problems
    if (settings.numProblems > 50) {
      setWarning(t('warnings.largeNumberOfProblems', { count: settings.numProblems }));
    }

    try {
      const generatedProblems = Array.from({ length: settings.numProblems }, () =>
        generateProblem()
      )
        .filter((problem) => problem !== '')
        .map((problem, index) => ({ id: index, text: problem }));

      if (generatedProblems.length === 0) {
        setError(t('errors.noProblemsGenerated'));
      } else if (generatedProblems.length < settings.numProblems) {
        // Partial generation - show warning
        setWarning(
          t('errors.partialGeneration', {
            generated: generatedProblems.length,
            requested: settings.numProblems,
          })
        );
        setProblems(generatedProblems);
      } else {
        // Full success
        setSuccessMessage(
          t('messages.success.problemsGenerated', { count: generatedProblems.length })
        );
        setProblems(generatedProblems);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(t('errors.generationFailed'));
      console.error('Problem generation error:', err);
    }
  };

  const downloadPdf = (): void => {
    if (problems.length === 0) {
      setError(t('errors.noProblemsToPdf'));
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

        // Show success message
        setSuccessMessage(t('messages.success.settingsExported'));
        setTimeout(() => setSuccessMessage(''), 3000);
      });
    } catch (err) {
      setError(t('errors.pdfFailed'));
      console.error('PDF generation error:', err);
    }
  };

  useEffect(() => {
    // Only auto-generate if there's no current error and settings are valid
    const validationError = validateSettings(settings);
    if (!validationError) {
      generateProblems();
    } else {
      setError(validationError);
    }
  }, [settings]);

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
        setError(validationError);
      } else {
        // Check for restrictive settings
        const isRestrictive =
          newSettings.resultRange[1] - newSettings.resultRange[0] < 10 ||
          newSettings.numRange[1] - newSettings.numRange[0] < 5;

        if (isRestrictive && newSettings.numProblems > 20) {
          setWarning(t('warnings.restrictiveSettings'));
        }
      }
    }

    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleApplyPreset = (presetSettings: Settings): void => {
    setSettings(presetSettings);
    saveSettings(presetSettings);

    // Clear messages and show success
    setError('');
    setWarning('');
    setSuccessMessage(t('messages.info.presetApplied', { name: 'Preset' }));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const startQuizMode = (): void => {
    if (problems.length === 0) {
      setError('请先生成题目再开始答题模式');
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
    // 可以在这里保存答题记录到localStorage
    try {
      const savedResults = localStorage.getItem('mathgenie-quiz-results');
      const results = savedResults ? JSON.parse(savedResults) : [];
      results.push({
        ...result,
        timestamp: new Date().toISOString(),
        settings: settings,
      });
      // 只保留最近20次记录
      if (results.length > 20) {
        results.splice(0, results.length - 20);
      }
      localStorage.setItem('mathgenie-quiz-results', JSON.stringify(results));
    } catch (error) {
      console.warn('Failed to save quiz result:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="App">
        <div className="loading-container">
          <h1>{t('app.title')}</h1>
          <p>{t('loading.translations')}</p>
          <div className="loading-spinner" aria-label="Loading..."></div>
        </div>
      </div>
    );
  }

  return (
    <TranslationLoader>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <div className="title-section">
              <h1>{t('app.title')}</h1>
              <p className="subtitle">{t('app.subtitle')}</p>
            </div>
            <LanguageSelector />
          </div>
        </header>

        <main className="main-content">
          {/* Message display area */}
          <div className="messages-container">
            <ErrorMessage error={error} type="error" onDismiss={() => setError('')} />
            <ErrorMessage error={warning} type="warning" onDismiss={() => setWarning('')} />
            <ErrorMessage
              error={successMessage}
              type="info"
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
            <div className="container">
              <div className="settings-section">
                <SettingsPresets onApplyPreset={handleApplyPreset} />

                <div>
                  <label htmlFor="operations">{t('operations.title')}:</label>
                  <select
                    id="operations"
                    multiple
                    value={settings.operations}
                    onChange={(e) =>
                      handleChange(
                        'operations',
                        Array.from(e.target.selectedOptions, (option) => option.value as Operation)
                      )
                    }
                    aria-label={t('accessibility.selectOperations')}
                    title={t('operations.help')}
                  >
                    <option value="+">{t('operations.addition')}</option>
                    <option value="-">{t('operations.subtraction')}</option>
                    <option value="*">{t('operations.multiplication')}</option>
                    <option value="/">{t('operations.division')}</option>
                  </select>
                  <small className="help-text">{t('operations.help')}</small>
                </div>
                <div>
                  <label htmlFor="numProblems">{t('settings.numProblems')}:</label>
                  <input
                    type="number"
                    id="numProblems"
                    value={settings.numProblems}
                    onChange={(e) => handleChange('numProblems', parseInt(e.target.value, 10))}
                    aria-label={t('accessibility.numProblemsInput')}
                  />
                </div>
                <div>
                  <label htmlFor="numRange">{t('settings.numberRange')}:</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      id="numRangeFrom"
                      value={settings.numRange[0]}
                      onChange={(e) =>
                        handleChange('numRange', [
                          parseInt(e.target.value, 10),
                          settings.numRange[1],
                        ])
                      }
                      aria-label={t('accessibility.minNumber')}
                      placeholder={t('settings.from')}
                    />
                    <span>{t('settings.to')}</span>
                    <input
                      type="number"
                      id="numRangeTo"
                      value={settings.numRange[1]}
                      onChange={(e) =>
                        handleChange('numRange', [
                          settings.numRange[0],
                          parseInt(e.target.value, 10),
                        ])
                      }
                      aria-label={t('accessibility.maxNumber')}
                      placeholder={t('settings.to')}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="resultRange">{t('settings.resultRange')}:</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      id="resultRangeFrom"
                      value={settings.resultRange[0]}
                      onChange={(e) =>
                        handleChange('resultRange', [
                          parseInt(e.target.value, 10),
                          settings.resultRange[1],
                        ])
                      }
                      aria-label={t('accessibility.minResult')}
                      placeholder={t('settings.from')}
                    />
                    <span>{t('settings.to')}</span>
                    <input
                      type="number"
                      id="resultRangeTo"
                      value={settings.resultRange[1]}
                      onChange={(e) =>
                        handleChange('resultRange', [
                          settings.resultRange[0],
                          parseInt(e.target.value, 10),
                        ])
                      }
                      aria-label={t('accessibility.maxResult')}
                      placeholder={t('settings.to')}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="numOperandsRange">{t('settings.operandsRange')}:</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      id="numOperandsRangeFrom"
                      value={settings.numOperandsRange[0]}
                      onChange={(e) =>
                        handleChange('numOperandsRange', [
                          parseInt(e.target.value, 10),
                          settings.numOperandsRange[1],
                        ])
                      }
                      aria-label={t('accessibility.minOperands')}
                      placeholder={t('settings.from')}
                    />
                    <span>{t('settings.to')}</span>
                    <input
                      type="number"
                      id="numOperandsRangeTo"
                      value={settings.numOperandsRange[1]}
                      onChange={(e) =>
                        handleChange('numOperandsRange', [
                          settings.numOperandsRange[0],
                          parseInt(e.target.value, 10),
                        ])
                      }
                      aria-label={t('accessibility.maxOperands')}
                      placeholder={t('settings.to')}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="allowNegative">{t('settings.allowNegative')}:</label>
                  <input
                    type="checkbox"
                    id="allowNegative"
                    checked={settings.allowNegative}
                    onChange={(e) => handleChange('allowNegative', e.target.checked)}
                    aria-label={t('accessibility.allowNegativeLabel')}
                  />
                  <small className="help-text">{t('settings.allowNegativeDesc')}</small>
                </div>
                <div>
                  <label htmlFor="showAnswers">{t('settings.showAnswers')}:</label>
                  <input
                    type="checkbox"
                    id="showAnswers"
                    checked={settings.showAnswers}
                    onChange={(e) => handleChange('showAnswers', e.target.checked)}
                    aria-label={t('accessibility.showAnswersLabel')}
                  />
                  <small className="help-text">{t('settings.showAnswersDesc')}</small>
                </div>
                <fieldset className="pdf-settings">
                  <legend>{t('pdf.title')}</legend>
                  <div>
                    <label htmlFor="fontSize">{t('pdf.fontSize')}:</label>
                    <input
                      type="number"
                      id="fontSize"
                      value={settings.fontSize}
                      onChange={(e) => handleChange('fontSize', parseInt(e.target.value, 10))}
                      aria-label={t('accessibility.fontSizeInput')}
                    />
                  </div>
                  <div>
                    <label htmlFor="lineSpacing">{t('pdf.lineSpacing')}:</label>
                    <input
                      type="number"
                      id="lineSpacing"
                      value={settings.lineSpacing}
                      onChange={(e) => handleChange('lineSpacing', parseInt(e.target.value, 10))}
                      aria-label={t('accessibility.lineSpacingInput')}
                    />
                  </div>
                  <div>
                    <label htmlFor="paperSize">{t('pdf.paperSize')}:</label>
                    <select
                      id="paperSize"
                      value={settings.paperSize}
                      onChange={(e) =>
                        handleChange('paperSize', e.target.value as Settings['paperSize'])
                      }
                      aria-label={t('accessibility.paperSizeSelect')}
                    >
                      {Object.keys(paperSizeOptions).map((size) => (
                        <option key={size} value={size}>
                          {size.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </fieldset>
              </div>

              <div className="results-section">
                <div className="button-group">
                  <button onClick={generateProblems} aria-label={t('accessibility.generateButton')}>
                    {t('buttons.generate')}
                  </button>
                  <button
                    onClick={downloadPdf}
                    aria-label={t('accessibility.downloadButton')}
                    disabled={problems.length === 0}
                  >
                    {t('buttons.download')}
                  </button>
                  <button
                    onClick={startQuizMode}
                    disabled={problems.length === 0}
                    className="quiz-mode-btn"
                    aria-label="开始答题模式"
                  >
                    🎯 开始答题
                  </button>
                </div>

                <div className="problems-container">
                  <div className="problems-header">
                    <h2 className="problems-title">
                      {problems.length > 0
                        ? t('results.title', { count: problems.length })
                        : t('results.noProblems')}
                    </h2>
                    {problems.length > 0 && (
                      <div className="problems-stats">
                        <div className="problems-stat">
                          <span>📊</span>
                          <span>{problems.length} problems</span>
                        </div>
                        <div className="problems-stat">
                          <span>⚙️</span>
                          <span>{settings.operations.join(', ')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="problems-content">
                    {problems.length > 0 ? (
                      <div className="problems-grid">
                        {problems.map((problem) => (
                          <div key={problem.id} className="problem-item">
                            {problem.text}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-problems">
                        <div className="no-problems-icon">🎯</div>
                        <div className="no-problems-text">{t('results.noProblems')}</div>
                        <div className="no-problems-hint">
                          Click &ldquo;{t('buttons.generate')}&rdquo; to start
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <InfoPanel
                  problems={problems}
                  settings={settings}
                  onGenerateProblems={generateProblems}
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
