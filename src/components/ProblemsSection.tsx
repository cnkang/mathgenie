import type { Problem, Settings } from '@/types';
import React from 'react';
import GroupedProblemsDisplay from './problems/GroupedProblemsDisplay';

type ProblemsSectionProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  problems: Problem[];
  settings: Settings;
};

const ProblemsSection: React.FC<ProblemsSectionProps> = ({ t, problems, settings }) => {
  const problemsListLabel = t('accessibility.problemsList');
  const [copyState, setCopyState] = React.useState<'idle' | 'success' | 'error'>('idle');
  const copyStateResetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateWithFallback = React.useCallback(
    (key: string, fallback: string, params: Record<string, string | number> = {}): string => {
      const translated = t(key, params);
      return translated === key ? fallback : translated;
    },
    [t]
  );

  React.useEffect(() => {
    return () => {
      if (copyStateResetTimerRef.current !== null && typeof globalThis !== 'undefined') {
        globalThis.clearTimeout(copyStateResetTimerRef.current);
      }
    };
  }, []);

  const scheduleCopyStateReset = React.useCallback(() => {
    if (copyStateResetTimerRef.current !== null && typeof globalThis !== 'undefined') {
      globalThis.clearTimeout(copyStateResetTimerRef.current);
    }
    if (typeof globalThis === 'undefined') {
      return;
    }
    copyStateResetTimerRef.current = globalThis.setTimeout(() => {
      setCopyState('idle');
      copyStateResetTimerRef.current = null;
    }, 2200);
  }, []);

  const copyWithLegacyClipboard = React.useCallback((text: string): boolean => {
    if (typeof document === 'undefined') {
      return false;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    const copied =
      typeof document.execCommand === 'function' ? document.execCommand('copy') : false;
    document.body.removeChild(textArea);
    return copied;
  }, []);

  const copyProblems = React.useCallback(async () => {
    if (problems.length === 0) {
      return;
    }
    const textToCopy = problems
      .map((problem, index) => `${index + 1}. ${problem.text.trim()}`)
      .join('\n');

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else if (!copyWithLegacyClipboard(textToCopy)) {
        throw new Error('clipboard_unavailable');
      }
      setCopyState('success');
    } catch {
      setCopyState('error');
    } finally {
      scheduleCopyStateReset();
    }
  }, [copyWithLegacyClipboard, problems, scheduleCopyStateReset]);

  const copyButtonText =
    copyState === 'success'
      ? translateWithFallback('results.copied', 'Copied')
      : translateWithFallback('results.copyAll', 'Copy All');
  const copyFeedbackText =
    copyState === 'success'
      ? translateWithFallback('results.copySuccess', 'Problems copied to clipboard.')
      : copyState === 'error'
        ? translateWithFallback('results.copyError', 'Copy failed. Please copy manually.')
        : '';

  // Render grouped problems using the dedicated component
  const renderGroupedProblems = () => {
    return (
      <GroupedProblemsDisplay
        t={t}
        problems={problems}
        settings={settings}
        problemsListLabel={problemsListLabel}
      />
    );
  };

  const renderProblemsContent = (): React.ReactElement => {
    if (settings.enableGrouping) {
      return <>{renderGroupedProblems()}</>;
    }

    return (
      <ol className='problems-grid'>
        {problems.map(p => (
          <li key={p.id} className='problem-item'>
            <span className='problem-text'>{p.text}</span>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <section aria-labelledby='results-title' className='problems-section'>
      <div className='problems-container'>
        <div className='problems-header'>
          <h2 id='results-title'>
            {t('results.title', { count: problems.length }) ||
              `Generated Problems (${problems.length})`}
          </h2>
          <div className='problems-header-actions'>
            {settings.enableGrouping && problems.length > 0 && (
              <p className='grouping-info'>
                {t('results.groupingInfo', {
                  groups: settings.totalGroups,
                  perGroup: settings.problemsPerGroup,
                }) || `${settings.totalGroups} groups, ${settings.problemsPerGroup} problems each`}
              </p>
            )}
            <button
              type='button'
              className='copy-problems-button'
              onClick={() => void copyProblems()}
              disabled={problems.length === 0}
              aria-label={translateWithFallback(
                'accessibility.copyProblems',
                'Copy generated problems'
              )}
            >
              {copyButtonText}
            </button>
            {copyFeedbackText && (
              <span className={`copy-problems-feedback ${copyState}`} aria-live='polite'>
                {copyFeedbackText}
              </span>
            )}
          </div>
        </div>
        <div
          className='problems-content'
          aria-labelledby='results-title'
          aria-label={problemsListLabel}
          // SONAR-SAFE: Scrollable region must be focusable to satisfy WCAG 2.1.1 (scrollable-region-focusable).
          tabIndex={0}
          aria-live='polite'
        >
          {problems.length === 0 ? (
            <output aria-live='polite'>{t('results.noProblems')}</output>
          ) : (
            renderProblemsContent()
          )}
        </div>
      </div>
    </section>
  );
};

export default ProblemsSection;
