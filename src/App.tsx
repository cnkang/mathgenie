import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import "./components/ProblemsDisplay.css";
import "./components/QuizMode.css";
import "./styles/components.css";
import ActionCards from "@/components/ActionCards";
import AppHeader from "@/components/AppHeader";
import ErrorMessage from "@/components/ErrorMessage";
import InfoPanel from "@/components/InfoPanel";
import ProblemsSection from "@/components/ProblemsSection";
import SettingsSection from "@/components/SettingsSection";
import PerformanceMonitor from "./components/PerformanceMonitor";
import TranslationLoader from "./components/TranslationLoader";
import { useAppHandlers, usePdfDownload, useQuizHandlers } from "@/hooks/useAppLogic";
import { useAppMessages } from "./hooks/useAppMessages";
import { useProblemGenerator } from "./hooks/useProblemGenerator";
import { useSettings } from "./hooks/useSettings";
import { useSettingsValidation } from "./hooks/useSettingsValidation";
import { useTranslation } from "./i18n";
import { saveQuizResult } from "@/utils/resultsStorage";
import type { PaperSizeOptions, QuizResult } from "./types";
import { setupWCAGEnforcement } from "./utils/wcagEnforcement";
const QuizMode = React.lazy(() => import("./components/QuizMode"));
const SpeedInsights = React.lazy(() =>
  import("@vercel/speed-insights/react").then((module) => ({ default: module.SpeedInsights })),
);
const paperSizeOptions: PaperSizeOptions = { a4: "a4", letter: "letter", legal: "legal" };

function App(): React.JSX.Element {
  const { t, isLoading } = useTranslation();
  const { settings, setSettings, validateSettings } = useSettings();
  const generation = useProblemGenerator(settings, isLoading, validateSettings);
  const { problems } = generation;
  const {
    error,
    warning,
    successMessage,
    setError,
    setWarning,
    setSuccessMessage,
    showSuccessMessage,
    clearMessages,
  } = useAppMessages();
  const validation = useSettingsValidation();
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const formHandlers = useAppHandlers({
    settings,
    setSettings,
    clearMessages,
    ...validation,
    validateSettings,
    isLoading,
    setError,
    setWarning,
    setSuccessMessage: showSuccessMessage,
  });
  const quizHandlers = useQuizHandlers(
    problems,
    !isLoading,
    setError,
    setIsQuizMode,
    setQuizResult,
  );
  const pdfLabels = useMemo(
    () => ({
      group: (index: number, empty: boolean) =>
        t(empty ? "problems.emptyGroup" : "results.groupTitle", { number: index, group: index }),
      empty: t("results.noProblems"),
    }),
    [t],
  );
  const download = usePdfDownload(
    problems,
    settings,
    paperSizeOptions,
    showSuccessMessage,
    setError,
    clearMessages,
    { isDev: import.meta.env.DEV, labels: pdfLabels },
  );
  const downloadPdf = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await download();
    } finally {
      setIsDownloading(false);
    }
  }, [download, isDownloading]);
  const handleGenerate = useCallback(() => {
    clearMessages();
    generation.generateProblems();
  }, [clearMessages, generation.generateProblems]);
  const onQuizComplete = useCallback(
    (result: QuizResult) => {
      setQuizResult(result);
      saveQuizResult(result, settings, import.meta.env.DEV);
    },
    [settings],
  );
  const messages = generation.messages;
  useEffect(() => {
    if (!messages) return;
    setError(messages.error);
    setWarning(messages.warning);
    showSuccessMessage(messages.successMessage);
  }, [messages, setError, setWarning, showSuccessMessage]);
  useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_WCAG_RUNTIME_ENFORCEMENT === "true")
      return setupWCAGEnforcement();
  }, []);
  const loading = useMemo(
    () => (
      <div className="loading-container">
        <h1>{t("app.title")}</h1>
        <p>{t("loading.translations")}</p>
      </div>
    ),
    [t],
  );
  // Keep a running quiz mounted while a different language loads.
  if (isLoading && problems.length === 0) return <div className="App">{loading}</div>;
  return (
    <PerformanceMonitor enabled={import.meta.env.DEV} showDetails>
      <TranslationLoader keepMounted={problems.length > 0}>
        <div className="App">
          <AppHeader t={t} />
          <main className="main-content">
            <div className="messages-container">
              <ErrorMessage error={error} type="error" onDismiss={() => setError("")} />
              <ErrorMessage error={warning} type="warning" onDismiss={() => setWarning("")} />
              <ErrorMessage
                error={successMessage}
                type="info"
                onDismiss={() => setSuccessMessage("")}
              />
            </div>
            {isQuizMode ? (
              <Suspense fallback={loading}>
                <QuizMode
                  problems={problems}
                  onQuizComplete={onQuizComplete}
                  onExitQuiz={quizHandlers.exitQuizMode}
                />
              </Suspense>
            ) : (
              <div className="container">
                <SettingsSection
                  t={t}
                  settings={settings}
                  onChange={formHandlers.handleChange}
                  onApplyPreset={formHandlers.handleApplyPreset}
                  paperSizeOptions={paperSizeOptions}
                />
                <div className="results-section">
                  <ActionCards
                    t={t}
                    problemsCount={problems.length}
                    onGenerate={handleGenerate}
                    onDownload={downloadPdf}
                    onStartQuiz={quizHandlers.startQuizMode}
                    isGenerating={generation.isGenerating}
                    isDownloading={isDownloading}
                  />
                  {generation.isGenerating && (
                    <div role="status" aria-live="polite">
                      <progress
                        value={generation.progress}
                        max={100}
                        aria-label={t("buttons.generating")}
                      />
                      <button type="button" onClick={generation.cancelGeneration}>
                        {t("buttons.cancelGeneration")}
                      </button>
                    </div>
                  )}
                  <ProblemsSection t={t} problems={problems} settings={settings} />
                  <InfoPanel problems={problems} settings={settings} quizResult={quizResult} />
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
    </PerformanceMonitor>
  );
}
export default App;
