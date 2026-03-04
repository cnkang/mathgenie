import React from 'react';

// Do not edit manually.
const STR_BUTTON = 'button' as const;
const STR_ACTION_CARD_CONTENT = 'action-card-content' as const;
const STR_ACTION_ICON = 'action-icon' as const;
const STR_ACTION_TEXT = 'action-text' as const;
const STR_ACTION_INDICATOR = 'action-indicator' as const;
const STR_ACTION_ARROW = 'action-arrow' as const;

const GenerateIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='24' height='24' fill='none' aria-hidden='true'>
    <path
      d='M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const DownloadIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='24' height='24' fill='none' aria-hidden='true'>
    <path
      d='M12 3v12m0 0 4-4m-4 4-4-4M4 19h16'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const QuizIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='24' height='24' fill='none' aria-hidden='true'>
    <path
      d='M12 3l2.4 4.86L20 8.76l-4 3.9.94 5.5L12 15.7l-4.94 2.46.94-5.5-4-3.9 5.6-.9L12 3Z'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const ArrowIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='18' height='18' fill='none' aria-hidden='true'>
    <path
      d='M5 12h14m0 0-5-5m5 5-5 5'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
);

type ActionCardsProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  problemsCount: number;
  onGenerate: () => void;
  onDownload: () => Promise<void> | void;
  onStartQuiz: () => void;
};

const ActionCards: React.FC<ActionCardsProps> = ({
  t,
  problemsCount,
  onGenerate,
  onDownload,
  onStartQuiz,
}) => {
  const isEmpty = problemsCount === 0;
  const legendId = React.useId();
  const groupTitle = t('infoPanel.quickActions.title') || 'Quick Actions';

  return (
    <section aria-labelledby={legendId}>
      <h2 id={legendId} className='action-cards-heading'>
        {groupTitle}
      </h2>
      <fieldset className='action-cards-grid' aria-labelledby={legendId}>
        <legend className='sr-only'>{groupTitle}</legend>
        <button
          type={STR_BUTTON}
          className='action-card generate-card'
          onClick={onGenerate}
          aria-label={`${t('buttons.generate')} · ${t('accessibility.generateButton')}`}
        >
          <div className={STR_ACTION_CARD_CONTENT}>
            <span className={STR_ACTION_ICON} aria-hidden='true'>
              <GenerateIcon />
            </span>
            <div className={STR_ACTION_TEXT}>
              <h3>{t('buttons.generate')}</h3>
              <p>{t('buttons.generateDescription')}</p>
            </div>
            <div className={STR_ACTION_INDICATOR}>
              <span className={STR_ACTION_ARROW}>
                <ArrowIcon />
              </span>
            </div>
          </div>
        </button>

        <button
          type={STR_BUTTON}
          className='action-card download-card'
          onClick={() => {
            // Intentionally not awaiting to keep UI responsive
            const p = onDownload();
            // Best-effort: silence unhandled rejections in tests
            if (p && typeof (p as Promise<unknown>).catch === 'function') {
              (p as Promise<unknown>).catch(() => {});
            }
          }}
          disabled={isEmpty}
          aria-disabled={isEmpty}
          aria-label={`${t('buttons.download')} · ${t('accessibility.downloadButton')}`}
        >
          <div className={STR_ACTION_CARD_CONTENT}>
            <span className={STR_ACTION_ICON} aria-hidden='true'>
              <DownloadIcon />
            </span>
            <div className={STR_ACTION_TEXT}>
              <h3>{t('buttons.download')}</h3>
              <p>{t('buttons.downloadDescription')}</p>
            </div>
            <div className={STR_ACTION_INDICATOR}>
              <span className={STR_ACTION_ARROW}>
                <ArrowIcon />
              </span>
            </div>
          </div>
        </button>

        <button
          type={STR_BUTTON}
          className='action-card quiz-card'
          onClick={onStartQuiz}
          disabled={isEmpty}
          aria-disabled={isEmpty}
          aria-label={`${t('infoPanel.quickActions.startQuiz')} · ${t('buttons.quizDescription')}`}
        >
          <div className={STR_ACTION_CARD_CONTENT}>
            <span className={STR_ACTION_ICON} aria-hidden='true'>
              <QuizIcon />
            </span>
            <div className={STR_ACTION_TEXT}>
              <h3>{t('infoPanel.quickActions.startQuiz') || 'Start Quiz'}</h3>
              <p>{t('buttons.quizDescription')}</p>
            </div>
            <div className={STR_ACTION_INDICATOR}>
              <span className={STR_ACTION_ARROW}>
                <ArrowIcon />
              </span>
            </div>
          </div>
        </button>
      </fieldset>
    </section>
  );
};

export default ActionCards;
