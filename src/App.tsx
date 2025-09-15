//
import React, { Suspense, useEffect, useState } from 'react';
import './App.css';
import ErrorMessage from './components/ErrorMessage';
import InfoPanel from './components/InfoPanel';
//
import './components/ProblemsDisplay.css';
import QuizMode from './components/QuizMode';
import './components/QuizMode.css';
//
import TranslationLoader from './components/TranslationLoader';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useSettings } from './hooks/useSettings';
import { useSettingsValidation } from './hooks/useSettingsValidation';
import { useAppMessages } from './hooks/useAppMessages';
import { useTranslation } from './i18n';
import './styles/components.css';
import type { PaperSizeOptions, QuizResult, MessageValue } from './types';
import { setupWCAGEnforcement } from './utils/wcagEnforcement';
import SettingsSection from '@/components/SettingsSection';
import ProblemsSection from '@/components/ProblemsSection';
import ActionCards from '@/components/ActionCards';
import { NUMERIC_CONSTANTS } from '@/constants/appConstants';
import {
  useInitialGeneration,
  usePdfDownload,
  useQuizHandlers,
  useAppHandlers,
} from '@/hooks/useAppLogic';
import AppHeader from '@/components/AppHeader';
import { saveQuizResult } from '@/utils/resultsStorage';

const SpeedInsights = React.lazy(() =>
  import('@vercel/speed-insights/react').then(module => ({ default: module.SpeedInsights }))
);

// Import SpeedInsights lazily for performance

function App(): React.JSX.Element {
  const { t, isLoading } = useTranslation();
  const { settings, setSettings, validateSettings } = useSettings();
  const { problems, generateProblems } = useProblemGenerator(settings, isLoading, validateSettings);
  const { isValidationSensitiveField, checkRestrictiveSettings } = useSettingsValidation();
  const {
    error,
    warning,
    successMessage,
    setError,
    setWarning,
    setSuccessMessage,
    clearMessages,
    showSuccessMessage,
  } = useAppMessages();

  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [hasInitialGenerated, setHasInitialGenerated] = useState<boolean>(false);

  const paperSizeOptions: PaperSizeOptions = {
    a4: 'a4',
    letter: 'letter',
    legal: 'legal',
  };

  // Deduplicate commonly checked conditions to satisfy sonarjs/no-identical-conditions
  const IS_DEV = import.meta.env.DEV;
  const IS_I18N_READY = !isLoading;
  //

  const setAndScheduleSuccess = (msg: MessageValue): void => {
    setSuccessMessage(msg);
    if (msg) setTimeout(() => setSuccessMessage(''), NUMERIC_CONSTANTS.SUCCESS_MESSAGE_TIMEOUT);
  };

  //

  const downloadPdf = usePdfDownload(
    problems,
    settings,
    paperSizeOptions,
    showSuccessMessage,
    setError,
    clearMessages,
    IS_DEV
  );

  useInitialGeneration(
    IS_I18N_READY,
    settings,
    validateSettings,
    generateProblems,
    hasInitialGenerated,
    setHasInitialGenerated,
    setError,
    setWarning,
    setAndScheduleSuccess
  );

  // WCAG 2.2 AAA Enforcement (skip in unit tests to avoid MutationObserver loops)
  useEffect(() => {
    if (import.meta.env.MODE === 'test') return;
    return setupWCAGEnforcement();
  }, []);

  const { handleChange, handleApplyPreset } = useAppHandlers(
    settings,
    setSettings,
    clearMessages,
    isValidationSensitiveField,
    validateSettings,
    isLoading,
    checkRestrictiveSettings,
    setError,
    setWarning,
    setSuccessMessage
  );

  const { startQuizMode, exitQuizMode } = useQuizHandlers(
    problems,
    IS_I18N_READY,
    setError,
    setIsQuizMode as (v: boolean) => void,
    setQuizResult
  );

  const handleQuizComplete = (result: QuizResult): void => {
    setQuizResult(result);
    saveQuizResult(result, settings, IS_DEV);
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
        <AppHeader t={t} />

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
              <SettingsSection
                t={t}
                settings={settings}
                onChange={handleChange}
                onApplyPreset={handleApplyPreset}
                paperSizeOptions={paperSizeOptions}
              />

              <div className='results-section'>
                <ActionCards
                  t={t}
                  problemsCount={problems.length}
                  onGenerate={() => {
                    const messages = generateProblems();
                    setError(messages.error);
                    setWarning(messages.warning);
                    setAndScheduleSuccess(messages.successMessage);
                  }}
                  onDownload={downloadPdf}
                  onStartQuiz={startQuizMode}
                />

                <ProblemsSection t={t} problems={problems} settings={settings} />

                <InfoPanel
                  problems={problems}
                  settings={settings}
                  onGenerateProblems={() => {
                    const messages = generateProblems();
                    setError(messages.error);
                    setWarning(messages.warning);
                    setAndScheduleSuccess(messages.successMessage);
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
