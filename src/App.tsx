//
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
//
import './components/ProblemsDisplay.css';
import './components/QuizMode.css';
//
import ActionCards from '@/components/ActionCards';
import AppHeader from '@/components/AppHeader';
import ErrorMessage from '@/components/ErrorMessage';
import InfoPanel from '@/components/InfoPanel';
import ProblemsSection from '@/components/ProblemsSection';
import QuizMode from '@/components/QuizMode';
import SettingsSection from '@/components/SettingsSection';
import { NUMERIC_CONSTANTS } from '@/constants/appConstants';
import {
  useAppHandlers,
  useInitialGeneration,
  usePdfDownload,
  useQuizHandlers,
} from '@/hooks/useAppLogic';
import { saveQuizResult } from '@/utils/resultsStorage';
import TranslationLoader from './components/TranslationLoader';
import { useAppMessages } from './hooks/useAppMessages';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useSettings } from './hooks/useSettings';
import { useSettingsValidation } from './hooks/useSettingsValidation';
import { useTranslation } from './i18n';
import './styles/components.css';
import type { MessageValue, PaperSizeOptions, Problem, QuizResult, Settings } from './types';
import { setupWCAGEnforcement } from './utils/wcagEnforcement';

const SpeedInsights = React.lazy(() =>
  import('@vercel/speed-insights/react').then(module => ({ default: module.SpeedInsights }))
);

interface MessagesContainerProps {
  error: MessageValue;
  warning: MessageValue;
  successMessage: MessageValue;
  onDismissError: () => void;
  onDismissWarning: () => void;
  onDismissSuccess: () => void;
}

const MessagesContainer: React.FC<MessagesContainerProps> = ({
  error,
  warning,
  successMessage,
  onDismissError,
  onDismissWarning,
  onDismissSuccess,
}) => (
  <div className='messages-container'>
    <ErrorMessage error={error} type='error' onDismiss={onDismissError} />
    <ErrorMessage error={warning} type='warning' onDismiss={onDismissWarning} />
    <ErrorMessage error={successMessage} type='info' onDismiss={onDismissSuccess} />
  </div>
);

interface MainContentProps {
  isQuizMode: boolean;
  problems: Problem[];
  onQuizComplete: (result: QuizResult) => void;
  onExitQuiz: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  settings: Settings;
  onChange: (field: keyof Settings, value: Settings[keyof Settings]) => void;
  onApplyPreset: (preset: Settings) => void;
  paperSizeOptions: PaperSizeOptions;
  onGenerate: () => void;
  onDownload: () => Promise<void>;
  onStartQuiz: () => void;
  quizResult: QuizResult | null;
}

const MainContent: React.FC<MainContentProps> = ({
  isQuizMode,
  problems,
  onQuizComplete,
  onExitQuiz,
  t,
  settings,
  onChange,
  onApplyPreset,
  paperSizeOptions,
  onGenerate,
  onDownload,
  onStartQuiz,
  quizResult,
}) => {
  if (isQuizMode) {
    return <QuizMode problems={problems} onQuizComplete={onQuizComplete} onExitQuiz={onExitQuiz} />;
  }

  return (
    <div className='container'>
      <SettingsSection
        t={t}
        settings={settings}
        onChange={onChange}
        onApplyPreset={onApplyPreset}
        paperSizeOptions={paperSizeOptions}
      />

      <div className='results-section'>
        <ActionCards
          t={t}
          problemsCount={problems.length}
          onGenerate={onGenerate}
          onDownload={onDownload}
          onStartQuiz={onStartQuiz}
        />

        <ProblemsSection t={t} problems={problems} settings={settings} />

        <InfoPanel
          problems={problems}
          settings={settings}
          onGenerateProblems={onGenerate}
          onDownloadPdf={onDownload}
          quizResult={quizResult}
          onStartQuiz={onStartQuiz}
        />
      </div>
    </div>
  );
};

const LoadingScreen: React.FC<{ title: string; message: string }> = ({ title, message }) => (
  <div className='App'>
    <div className='loading-container'>
      <h1>{title}</h1>
      <p>{message}</p>
      <div className='loading-spinner' aria-label='Loading...'></div>
    </div>
  </div>
);

const useAppState = () => {
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [hasInitialGenerated, setHasInitialGenerated] = useState<boolean>(false);

  return {
    isQuizMode,
    setIsQuizMode,
    quizResult,
    setQuizResult,
    hasInitialGenerated,
    setHasInitialGenerated,
  } as const;
};

const useAppConstants = (isLoading: boolean) => {
  const paperSizeOptions: PaperSizeOptions = useMemo(
    () => ({
      a4: 'a4',
      letter: 'letter',
      legal: 'legal',
    }),
    []
  );

  const isDev = import.meta.env.DEV;
  const isI18nReady = !isLoading;

  return { paperSizeOptions, isDev, isI18nReady } as const;
};

const useAppDependencies = (isLoading: boolean) => {
  const settingsState = useSettings();
  const problemState = useProblemGenerator(
    settingsState.settings,
    isLoading,
    settingsState.validateSettings
  );
  const validationState = useSettingsValidation();
  const appState = useAppState();
  const constants = useAppConstants(isLoading);

  return {
    settingsState,
    problemState,
    validationState,
    appState,
    constants,
  } as const;
};

const useSuccessMessageManager = (
  setSuccessMessage: (message: MessageValue) => void
): {
  scheduleSuccessMessage: (message: MessageValue) => void;
  dismissSuccessMessage: () => void;
} => {
  const successTimeoutRef = useRef<number | null>(null);

  const clearSuccessTimeout = useCallback(() => {
    if (successTimeoutRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = null;
  }, []);

  useEffect(() => clearSuccessTimeout, [clearSuccessTimeout]);

  const scheduleSuccessMessage = useCallback(
    (message: MessageValue): void => {
      setSuccessMessage(message);
      if (!message || typeof window === 'undefined') {
        clearSuccessTimeout();
        return;
      }

      clearSuccessTimeout();
      successTimeoutRef.current = window.setTimeout(() => {
        setSuccessMessage('');
        successTimeoutRef.current = null;
      }, NUMERIC_CONSTANTS.SUCCESS_MESSAGE_TIMEOUT);
    },
    [clearSuccessTimeout, setSuccessMessage]
  );

  const dismissSuccessMessage = useCallback(() => {
    clearSuccessTimeout();
    setSuccessMessage('');
  }, [clearSuccessTimeout, setSuccessMessage]);

  return { scheduleSuccessMessage, dismissSuccessMessage };
};

const useMessagesController = () => {
  const messageState = useAppMessages();
  const { scheduleSuccessMessage, dismissSuccessMessage } = useSuccessMessageManager(
    messageState.setSuccessMessage
  );

  const dismissError = useCallback(() => messageState.setError(''), [messageState]);
  const dismissWarning = useCallback(() => messageState.setWarning(''), [messageState]);

  return {
    state: {
      error: messageState.error,
      warning: messageState.warning,
      successMessage: messageState.successMessage,
    },
    scheduleSuccessMessage,
    dismissSuccessMessage,
    dismissError,
    dismissWarning,
    showSuccessMessage: messageState.showSuccessMessage,
    clearMessages: messageState.clearMessages,
    setError: messageState.setError,
    setWarning: messageState.setWarning,
    setSuccessMessage: messageState.setSuccessMessage,
  } as const;
};

const useAppInitialization = (params: {
  isI18nReady: boolean;
  settings: Settings;
  validateSettings: (settings: Settings) => string;
  generateProblems: (showSuccessMessage?: boolean) => {
    error: MessageValue;
    warning: MessageValue;
    successMessage: MessageValue;
  };
  hasInitialGenerated: boolean;
  setHasInitialGenerated: (value: boolean) => void;
  setError: (message: MessageValue) => void;
  setWarning: (message: MessageValue) => void;
  scheduleSuccessMessage: (message: MessageValue) => void;
}) => {
  const {
    isI18nReady,
    settings,
    validateSettings,
    generateProblems,
    hasInitialGenerated,
    setHasInitialGenerated,
    setError,
    setWarning,
    scheduleSuccessMessage,
  } = params;

  useInitialGeneration(
    isI18nReady,
    settings,
    validateSettings,
    generateProblems,
    hasInitialGenerated,
    setHasInitialGenerated,
    setError,
    setWarning,
    scheduleSuccessMessage
  );

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      return;
    }
    return setupWCAGEnforcement();
  }, []);
};

const useGenerateProblemHandlers = (params: {
  generateProblems: (showSuccessMessage?: boolean) => {
    error: MessageValue;
    warning: MessageValue;
    successMessage: MessageValue;
  };
  problems: Problem[];
  settings: Settings;
  paperSizeOptions: PaperSizeOptions;
  messageActions: {
    showSuccessMessage: (msg: MessageValue) => void;
    clearMessages: () => void;
    setError: (msg: MessageValue) => void;
    setWarning: (msg: MessageValue) => void;
    scheduleSuccessMessage: (msg: MessageValue) => void;
  };
  isDev: boolean;
  initialization: {
    isI18nReady: boolean;
    validateSettings: (settings: Settings) => string;
    hasInitialGenerated: boolean;
    setHasInitialGenerated: (value: boolean) => void;
  };
}) => {
  const {
    generateProblems,
    problems,
    settings,
    paperSizeOptions,
    messageActions,
    isDev,
    initialization,
  } = params;

  const handleGenerateProblems = useCallback(() => {
    const messages = generateProblems();
    messageActions.setError(messages.error);
    messageActions.setWarning(messages.warning);
    messageActions.scheduleSuccessMessage(messages.successMessage);
  }, [generateProblems, messageActions]);

  const downloadPdf = usePdfDownload(
    problems,
    settings,
    paperSizeOptions,
    messageActions.showSuccessMessage,
    messageActions.setError,
    messageActions.clearMessages,
    isDev
  );

  useAppInitialization({
    isI18nReady: initialization.isI18nReady,
    settings,
    validateSettings: initialization.validateSettings,
    generateProblems,
    hasInitialGenerated: initialization.hasInitialGenerated,
    setHasInitialGenerated: initialization.setHasInitialGenerated,
    setError: messageActions.setError,
    setWarning: messageActions.setWarning,
    scheduleSuccessMessage: messageActions.scheduleSuccessMessage,
  });

  return { handleGenerateProblems, downloadPdf } as const;
};

const useQuizControls = (params: {
  problems: Problem[];
  isI18nReady: boolean;
  setError: (msg: MessageValue) => void;
  setIsQuizMode: (value: boolean) => void;
  setQuizResult: (value: QuizResult | null) => void;
  settings: Settings;
  isDev: boolean;
}) => {
  const { problems, isI18nReady, setError, setIsQuizMode, setQuizResult, settings, isDev } = params;

  const { startQuizMode, exitQuizMode } = useQuizHandlers(
    problems,
    isI18nReady,
    setError,
    setIsQuizMode,
    setQuizResult
  );

  const handleQuizComplete = useCallback(
    (result: QuizResult): void => {
      setQuizResult(result);
      saveQuizResult(result, settings, isDev);
    },
    [setQuizResult, settings, isDev]
  );

  return { startQuizMode, exitQuizMode, handleQuizComplete } as const;
};

const useMainContent = (params: {
  isQuizMode: boolean;
  problems: Problem[];
  handleQuizComplete: (result: QuizResult) => void;
  exitQuizMode: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  settings: Settings;
  handleChange: (field: keyof Settings, value: Settings[keyof Settings]) => void;
  handleApplyPreset: (preset: Settings) => void;
  paperSizeOptions: PaperSizeOptions;
  handleGenerateProblems: () => void;
  downloadPdf: () => Promise<void>;
  startQuizMode: () => void;
  quizResult: QuizResult | null;
}) => {
  const {
    isQuizMode,
    problems,
    handleQuizComplete,
    exitQuizMode,
    t,
    settings,
    handleChange,
    handleApplyPreset,
    paperSizeOptions,
    handleGenerateProblems,
    downloadPdf,
    startQuizMode,
    quizResult,
  } = params;

  return useMemo(
    (): MainContentProps => ({
      isQuizMode,
      problems,
      onQuizComplete: handleQuizComplete,
      onExitQuiz: exitQuizMode,
      t,
      settings,
      onChange: handleChange,
      onApplyPreset: handleApplyPreset,
      paperSizeOptions,
      onGenerate: handleGenerateProblems,
      onDownload: downloadPdf,
      onStartQuiz: startQuizMode,
      quizResult,
    }),
    [
      exitQuizMode,
      handleApplyPreset,
      handleChange,
      handleGenerateProblems,
      handleQuizComplete,
      downloadPdf,
      isQuizMode,
      paperSizeOptions,
      problems,
      quizResult,
      settings,
      startQuizMode,
      t,
    ]
  );
};

const useComposeMainContentProps = (params: {
  translate: (key: string, params?: Record<string, string | number>) => string;
  isQuizMode: boolean;
  problems: Problem[];
  handleQuizComplete: (result: QuizResult) => void;
  exitQuizMode: () => void;
  settings: Settings;
  handleChange: (field: keyof Settings, value: Settings[keyof Settings]) => void;
  handleApplyPreset: (preset: Settings) => void;
  paperSizeOptions: PaperSizeOptions;
  handleGenerateProblems: () => void;
  downloadPdf: () => Promise<void>;
  startQuizMode: () => void;
  quizResult: QuizResult | null;
}) => {
  return useMainContent({
    isQuizMode: params.isQuizMode,
    problems: params.problems,
    handleQuizComplete: params.handleQuizComplete,
    exitQuizMode: params.exitQuizMode,
    t: params.translate,
    settings: params.settings,
    handleChange: params.handleChange,
    handleApplyPreset: params.handleApplyPreset,
    paperSizeOptions: params.paperSizeOptions,
    handleGenerateProblems: params.handleGenerateProblems,
    downloadPdf: params.downloadPdf,
    startQuizMode: params.startQuizMode,
    quizResult: params.quizResult,
  });
};

const buildMessages = (controller: ReturnType<typeof useMessagesController>) => ({
  error: controller.state.error,
  warning: controller.state.warning,
  successMessage: controller.state.successMessage,
  dismissError: controller.dismissError,
  dismissWarning: controller.dismissWarning,
  dismissSuccess: controller.dismissSuccessMessage,
});

const createMessageActions = (controller: ReturnType<typeof useMessagesController>) => ({
  showSuccessMessage: controller.showSuccessMessage,
  clearMessages: controller.clearMessages,
  setError: controller.setError,
  setWarning: controller.setWarning,
  scheduleSuccessMessage: controller.scheduleSuccessMessage,
});

const useFormHandlersBundle = (params: {
  settingsState: ReturnType<typeof useSettings>;
  validationState: ReturnType<typeof useSettingsValidation>;
  isLoading: boolean;
  messageActions: ReturnType<typeof createMessageActions>;
  setSuccessMessage: (msg: MessageValue) => void;
}): ReturnType<typeof useAppHandlers> => {
  const { settingsState, validationState, isLoading, messageActions, setSuccessMessage } = params;

  return useAppHandlers(
    settingsState.settings,
    settingsState.setSettings,
    messageActions.clearMessages,
    validationState.isValidationSensitiveField,
    settingsState.validateSettings,
    isLoading,
    validationState.checkRestrictiveSettings,
    messageActions.setError,
    messageActions.setWarning,
    setSuccessMessage
  );
};

const useQuizControlsBundle = (params: {
  appState: ReturnType<typeof useAppState>;
  problems: Problem[];
  isI18nReady: boolean;
  messageActions: ReturnType<typeof createMessageActions>;
  settings: Settings;
  isDev: boolean;
}) => {
  const { appState, problems, isI18nReady, messageActions, settings, isDev } = params;

  return useQuizControls({
    problems,
    isI18nReady,
    setError: messageActions.setError,
    setIsQuizMode: appState.setIsQuizMode,
    setQuizResult: appState.setQuizResult,
    settings,
    isDev,
  });
};

const useProblemAndFormHandlers = (params: {
  settingsState: ReturnType<typeof useSettings>;
  validationState: ReturnType<typeof useSettingsValidation>;
  problemState: ReturnType<typeof useProblemGenerator>;
  paperSizeOptions: PaperSizeOptions;
  messageActions: ReturnType<typeof createMessageActions>;
  isDev: boolean;
  isI18nReady: boolean;
  isLoading: boolean;
  hasInitialGenerated: boolean;
  setHasInitialGenerated: (value: boolean) => void;
}): {
  handleGenerateProblems: () => void;
  downloadPdf: ReturnType<typeof usePdfDownload>;
  handleChange: ReturnType<typeof useAppHandlers>['handleChange'];
  handleApplyPreset: ReturnType<typeof useAppHandlers>['handleApplyPreset'];
} => {
  const {
    problemState,
    settingsState,
    paperSizeOptions,
    messageActions,
    isDev,
    isI18nReady,
    validationState,
    isLoading,
    hasInitialGenerated,
    setHasInitialGenerated,
  } = params;

  const problemHandlers = useGenerateProblemHandlers({
    generateProblems: problemState.generateProblems,
    problems: problemState.problems,
    settings: settingsState.settings,
    paperSizeOptions,
    messageActions,
    isDev,
    initialization: {
      isI18nReady,
      validateSettings: settingsState.validateSettings,
      hasInitialGenerated,
      setHasInitialGenerated,
    },
  });

  const formHandlers = useFormHandlersBundle({
    settingsState,
    validationState,
    isLoading,
    messageActions,
    setSuccessMessage: messageActions.showSuccessMessage,
  });

  return {
    handleGenerateProblems: problemHandlers.handleGenerateProblems,
    downloadPdf: problemHandlers.downloadPdf,
    handleChange: formHandlers.handleChange,
    handleApplyPreset: formHandlers.handleApplyPreset,
  } as const;
};

interface AppViewModel {
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  loadingMessages: { title: string; message: string };
  messages: {
    error: MessageValue;
    warning: MessageValue;
    successMessage: MessageValue;
    dismissError: () => void;
    dismissWarning: () => void;
    dismissSuccess: () => void;
  };
  mainContentProps: MainContentProps;
  showSpeedInsights: boolean;
}

const useAppDependenciesAndActions = (
  isLoading: boolean,
  messagesController: ReturnType<typeof useMessagesController>
) => {
  const dependencies = useAppDependencies(isLoading);
  const messageActions = createMessageActions(messagesController);
  return { ...dependencies, messageActions };
};

const useAppMainHandlers = (
  dependencies: ReturnType<typeof useAppDependenciesAndActions>,
  isLoading: boolean,
  hasInitialGenerated: boolean,
  setHasInitialGenerated: (value: boolean) => void
): ReturnType<typeof useProblemAndFormHandlers> & ReturnType<typeof useQuizControlsBundle> => {
  const { settingsState, problemState, validationState, constants, messageActions } = dependencies;
  const { paperSizeOptions, isDev, isI18nReady } = constants;

  const problemAndFormHandlers = useProblemAndFormHandlers({
    settingsState,
    validationState,
    problemState,
    paperSizeOptions,
    messageActions,
    isDev,
    isI18nReady,
    isLoading,
    hasInitialGenerated,
    setHasInitialGenerated,
  });

  const quizControlsBundle = useQuizControlsBundle({
    appState: dependencies.appState,
    problems: problemState.problems,
    isI18nReady,
    messageActions,
    settings: settingsState.settings,
    isDev,
  });

  return { ...problemAndFormHandlers, ...quizControlsBundle };
};

const useAppMainContentProps = (
  translate: (key: string, params?: Record<string, string | number>) => string,
  isLoading: boolean,
  messagesController: ReturnType<typeof useMessagesController>
) => {
  const dependencies = useAppDependenciesAndActions(isLoading, messagesController);
  const { appState } = dependencies;
  const { hasInitialGenerated, setHasInitialGenerated } = appState;

  const handlers = useAppMainHandlers(
    dependencies,
    isLoading,
    hasInitialGenerated,
    setHasInitialGenerated
  );

  const mainContentProps = useComposeMainContentProps({
    translate,
    isQuizMode: appState.isQuizMode,
    problems: dependencies.problemState.problems,
    handleQuizComplete: handlers.handleQuizComplete,
    exitQuizMode: handlers.exitQuizMode,
    settings: dependencies.settingsState.settings,
    handleChange: handlers.handleChange,
    handleApplyPreset: handlers.handleApplyPreset,
    paperSizeOptions: dependencies.constants.paperSizeOptions,
    handleGenerateProblems: handlers.handleGenerateProblems,
    downloadPdf: handlers.downloadPdf,
    startQuizMode: handlers.startQuizMode,
    quizResult: appState.quizResult,
  });

  return {
    mainContentProps,
    showSpeedInsights: import.meta.env.PROD,
    loadingMessages: {
      title: translate('app.title'),
      message: translate('loading.translations'),
    },
  } as const;
};

const useAppViewModel = (): AppViewModel => {
  const { t, isLoading } = useTranslation();
  const messagesController = useMessagesController();
  const composition = useAppMainContentProps(t, isLoading, messagesController);

  return {
    t,
    isLoading,
    loadingMessages: composition.loadingMessages,
    messages: buildMessages(messagesController),
    mainContentProps: composition.mainContentProps,
    showSpeedInsights: composition.showSpeedInsights,
  };
};

function App(): React.JSX.Element {
  const { t, isLoading, loadingMessages, messages, mainContentProps, showSpeedInsights } =
    useAppViewModel();

  if (isLoading) {
    return <LoadingScreen title={loadingMessages.title} message={loadingMessages.message} />;
  }

  return (
    <TranslationLoader>
      <div className='App'>
        <AppHeader t={t} />

        <main className='main-content'>
          <MessagesContainer
            error={messages.error}
            warning={messages.warning}
            successMessage={messages.successMessage}
            onDismissError={messages.dismissError}
            onDismissWarning={messages.dismissWarning}
            onDismissSuccess={messages.dismissSuccess}
          />

          <MainContent {...mainContentProps} />

          {showSpeedInsights && (
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
