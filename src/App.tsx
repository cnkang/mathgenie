import React, { useState, useEffect, Suspense, useCallback, useMemo, useTransition, useDeferredValue } from 'react';
import { I18nProvider, useTranslation } from './i18n';
import LanguageSelector from './components/LanguageSelector';
import SettingsPresets from './components/SettingsPresets';
import ProblemPreview from './components/ProblemPreview';
import SettingsManager from './components/SettingsManager';
import ErrorBoundary from './components/ErrorBoundary';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDebounce } from './hooks/useDebounce';
import type { Settings, Problem, Operation, PaperSize } from './types';
import './App.css';

const SpeedInsights = React.lazy(() =>
  import('@vercel/speed-insights/react').then((module) => ({ default: module.SpeedInsights }))
);

const DEFAULT_SETTINGS: Settings = {
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

function AppContent(): React.JSX.Element {
  const { t, isLoading: translationsLoading } = useTranslation();
  const [settings, setSettings] = useLocalStorage<Settings>('mathgenie-settings', DEFAULT_SETTINGS);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
  const [isPending, startTransition] = useTransition();
  const deferredSettings = useDeferredValue(settings);
  const debouncedSettings = useDebounce(deferredSettings, 300);

  const paperSizeOptions = useMemo((): Record<PaperSize, string> => ({
    'a4': 'A4',
    'letter': 'Letter',
    'legal': 'Legal',
  }), []);

  const calculateExpression = (operands: number[], operators: Operation[]): number => {
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

  const generateProblem = useCallback((): string => {
    try {
      const crypto = window.crypto || (window as any).msCrypto;
      const random = (min: number, max: number): number => {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const val = array[0] / (0xFFFFFFFF + 1);
        return min + Math.floor((max - min + 1) * val);
      };

      const numOperands = random(settings.numOperandsRange[0], settings.numOperandsRange[1]);
      if (numOperands < 2) return '';

      const MAX_ATTEMPTS = 1000;
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const operands = Array.from({ length: numOperands }, () =>
          random(settings.numRange[0], settings.numRange[1])
        );

        const operationSymbols = Array.from({ length: numOperands - 1 }, () =>
          settings.operations[random(0, settings.operations.length - 1)]
        );

        const result = calculateExpression(operands, operationSymbols);

        if (Number.isFinite(result) && 
            settings.resultRange[0] <= result && 
            result <= settings.resultRange[1]) {
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
    } catch (err) {
      console.error('Error generating problem:', err);
      return '';
    }
  }, [settings]);

  const generateProblems = useCallback(async (): Promise<void> => {
    if (settings.operations.length === 0) {
      setError(t('errors.noOperations'));
      return;
    }

    if (settings.numProblems < 1 || settings.numProblems > 100) {
      setError(t('errors.invalidProblemsCount'));
      return;
    }

    if (settings.numRange[0] > settings.numRange[1]) {
      setError(t('errors.invalidNumberRange'));
      return;
    }

    if (settings.resultRange[0] > settings.resultRange[1]) {
      setError(t('errors.invalidResultRange'));
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const generatedProblems = Array.from({ length: settings.numProblems }, (_, index) => {
        const problem = generateProblem();
        return problem ? { id: index, text: problem } : null;
      }).filter((p): p is Problem => p !== null);

      if (generatedProblems.length === 0) {
        setError(t('errors.generationFailed'));
      } else if (generatedProblems.length < settings.numProblems) {
        setError(t('errors.partialGeneration', { 
          generated: generatedProblems.length.toString(), 
          requested: settings.numProblems.toString()
        }));
      }

      setProblems(generatedProblems);
    } catch (err) {
      setError(t('errors.generalError'));
      console.error('Problem generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [settings, generateProblem, t]);

  const downloadPdf = useCallback(async (): Promise<void> => {
    if (problems.length === 0) {
      setError(t('errors.downloadFailed'));
      return;
    }

    try {
      setError(null);
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        format: settings.paperSize,
      });

      doc.setFontSize(settings.fontSize);
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();

      const marginLeft = 15;
      const marginTop = 20;
      const marginBottom = 20;
      const lineSpacing = settings.lineSpacing;
      const colWidth = (pageWidth - 3 * marginLeft) / 2;

      doc.setFontSize(settings.fontSize + 4);
      doc.text(`${t('app.title')} - ${t('results.title', { count: problems.length.toString() })}`, marginLeft, marginTop);
      
      doc.setFontSize(settings.fontSize - 2);
      const dateStr = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated on: ${dateStr}`, marginLeft, marginTop + 10);
      doc.text(`Total Problems: ${problems.length}`, marginLeft, marginTop + 18);

      doc.setFontSize(settings.fontSize);
      
      let currYLeft = marginTop + 35;
      let currYRight = marginTop + 35;

      problems.forEach((problem, index) => {
        const isLeftColumn = index % 2 === 0;
        const currentY = isLeftColumn ? currYLeft : currYRight;
        
        if (currentY + lineSpacing > pageHeight - marginBottom) {
          doc.addPage();
          currYLeft = marginTop;
          currYRight = marginTop;
        }

        const xPosition = isLeftColumn ? marginLeft : marginLeft + colWidth + marginLeft;
        const yPosition = isLeftColumn ? currYLeft : currYRight;
        
        doc.text(`${index + 1}. ${problem.text}`, xPosition, yPosition);
        
        if (isLeftColumn) {
          currYLeft += lineSpacing;
        } else {
          currYRight += lineSpacing;
        }
      });

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `mathgenie-problems-${timestamp}.pdf`;
      
      doc.save(filename);
      
    } catch (err) {
      setError(t('errors.pdfError'));
      console.error('PDF generation error:', err);
    }
  }, [problems, settings, t]);

  const applyPreset = useCallback((presetSettings: Settings): void => {
    setSettings(presetSettings);
    setError(null);
  }, [setSettings]);

  useEffect(() => {
    if (!translationsLoading) {
      startTransition(() => {
        generateProblems();
      });
    }
  }, [debouncedSettings, generateProblems, translationsLoading, startTransition]);

  const handleChange = useCallback(<K extends keyof Settings>(field: K, value: Settings[K]): void => {
    setError(null);
    setSettings((prevSettings) => ({
      ...prevSettings,
      [field]: value,
    }));
  }, [setSettings]);

  if (translationsLoading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('loading.translations')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <LanguageSelector />
      
      <header>
        <h1>{t('app.title')}</h1>
        <p className="subtitle">{t('app.subtitle')}</p>
      </header>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      <main id="main-content" className="container">
        <SettingsPresets onApplyPreset={applyPreset} />
        
        <div className="form-row">
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
            className="operations-select"
            aria-label={t('accessibility.selectOperations')}
          >
            <option value="+">{t('operations.addition')}</option>
            <option value="-">{t('operations.subtraction')}</option>
            <option value="*">{t('operations.multiplication')}</option>
            <option value="/">{t('operations.division')}</option>
          </select>
          <small>{t('operations.help')}</small>
        </div>

        <div className="form-row">
          <label htmlFor="numProblems">{t('settings.numProblems')}:</label>
          <input
            type="number"
            id="numProblems"
            value={settings.numProblems}
            onChange={(e) => handleChange('numProblems', parseInt(e.target.value, 10))}
            min="1"
            max="100"
            aria-label={t('accessibility.numProblemsInput')}
          />
        </div>

        <div className="form-row">
          <label>{t('settings.numberRange')}:</label>
          <div className="range-inputs">
            <input
              type="number"
              id="numRangeFrom"
              value={settings.numRange[0]}
              onChange={(e) => handleChange('numRange', [parseInt(e.target.value, 10), settings.numRange[1]])}
              placeholder={t('settings.from')}
              aria-label={t('accessibility.minNumber')}
            />
            <span>{t('settings.to')}</span>
            <input
              type="number"
              id="numRangeTo"
              value={settings.numRange[1]}
              onChange={(e) => handleChange('numRange', [settings.numRange[0], parseInt(e.target.value, 10)])}
              placeholder={t('settings.to')}
              aria-label={t('accessibility.maxNumber')}
            />
          </div>
        </div>

        <div className="form-row">
          <label>{t('settings.resultRange')}:</label>
          <div className="range-inputs">
            <input
              type="number"
              id="resultRangeFrom"
              value={settings.resultRange[0]}
              onChange={(e) => handleChange('resultRange', [parseInt(e.target.value, 10), settings.resultRange[1]])}
              placeholder={t('settings.from')}
              aria-label={t('accessibility.minResult')}
            />
            <span>{t('settings.to')}</span>
            <input
              type="number"
              id="resultRangeTo"
              value={settings.resultRange[1]}
              onChange={(e) => handleChange('resultRange', [settings.resultRange[0], parseInt(e.target.value, 10)])}
              placeholder={t('settings.to')}
              aria-label={t('accessibility.maxResult')}
            />
          </div>
        </div>

        <div className="form-row">
          <label>{t('settings.operandsRange')}:</label>
          <div className="range-inputs">
            <input
              type="number"
              id="numOperandsRangeFrom"
              value={settings.numOperandsRange[0]}
              onChange={(e) => handleChange('numOperandsRange', [parseInt(e.target.value, 10), settings.numOperandsRange[1]])}
              min="2"
              max="5"
              placeholder={t('settings.from')}
              aria-label={t('accessibility.minOperands')}
            />
            <span>{t('settings.to')}</span>
            <input
              type="number"
              id="numOperandsRangeTo"
              value={settings.numOperandsRange[1]}
              onChange={(e) => handleChange('numOperandsRange', [settings.numOperandsRange[0], parseInt(e.target.value, 10)])}
              min="2"
              max="5"
              placeholder={t('settings.to')}
              aria-label={t('accessibility.maxOperands')}
            />
          </div>
        </div>

        <div className="checkbox-container">
          <input
            type="checkbox"
            id="allowNegative"
            checked={settings.allowNegative}
            onChange={(e) => handleChange('allowNegative', e.target.checked)}
            aria-label={t('accessibility.allowNegativeLabel')}
          />
          <label htmlFor="allowNegative">{t('settings.allowNegative')}</label>
        </div>

        <div className="checkbox-container">
          <input
            type="checkbox"
            id="showAnswers"
            checked={settings.showAnswers}
            onChange={(e) => handleChange('showAnswers', e.target.checked)}
            aria-label={t('accessibility.showAnswersLabel')}
          />
          <label htmlFor="showAnswers">{t('settings.showAnswers')}</label>
        </div>

        <h3>{t('pdf.title')}</h3>
        
        <div className="form-row">
          <label htmlFor="fontSize">{t('pdf.fontSize')}:</label>
          <input
            type="number"
            id="fontSize"
            value={settings.fontSize}
            onChange={(e) => handleChange('fontSize', parseInt(e.target.value, 10))}
            min="8"
            max="24"
            aria-label={t('accessibility.fontSizeInput')}
          />
        </div>

        <div className="form-row">
          <label htmlFor="lineSpacing">{t('pdf.lineSpacing')}:</label>
          <input
            type="number"
            id="lineSpacing"
            value={settings.lineSpacing}
            onChange={(e) => handleChange('lineSpacing', parseInt(e.target.value, 10))}
            min="8"
            max="30"
            aria-label={t('accessibility.lineSpacingInput')}
          />
        </div>

        <div className="form-row">
          <label htmlFor="paperSize">{t('pdf.paperSize')}:</label>
          <select
            id="paperSize"
            value={settings.paperSize}
            onChange={(e) => handleChange('paperSize', e.target.value as PaperSize)}
            aria-label={t('accessibility.paperSizeSelect')}
          >
            {Object.keys(paperSizeOptions).map((size) => (
              <option key={size} value={size}>
                {size.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="button-group">
          <button 
            onClick={generateProblems} 
            disabled={isGenerating}
            className={isGenerating ? 'loading' : ''}
            aria-label={t('accessibility.generateButton')}
          >
            {isGenerating && <span className="loading-spinner" aria-hidden="true"></span>}
            {isGenerating ? t('buttons.generating') : t('buttons.generate')}
          </button>
          
          <button 
            onClick={downloadPdf} 
            disabled={problems.length === 0}
            aria-label={t('accessibility.downloadButton')}
          >
            {problems.length > 0 ? t('buttons.download', { count: problems.length.toString() }) : t('buttons.downloadEmpty')}
          </button>
        </div>

        {problems.length > 0 && (
          <div className="problems">
            <h3>{t('results.title', { count: problems.length.toString() })}</h3>
            {problems.map((problem) => (
              <div key={problem.id} className="problem-item">
                {problem.text}
              </div>
            ))}
          </div>
        )}

        <ProblemPreview 
          settings={settings} 
          generateSampleProblem={showPreview ? generateProblem : null} 
        />

        <SettingsManager 
          settings={settings}
          onImportSettings={setSettings}
        />

        <Suspense fallback={<div>{t('loading.insights')}</div>}>
          <SpeedInsights />
        </Suspense>
      </main>
    </div>
  );
}

function App(): React.JSX.Element {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        if (process.env.NODE_ENV === 'production') {
          console.error('Application Error:', error, errorInfo);
        }
      }}
    >
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;