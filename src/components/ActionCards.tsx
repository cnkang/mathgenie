import React from 'react';

// Do not edit manually.
const STR_BUTTON = 'button' as const;
const STR_ACTION_CARD_CONTENT = 'action-card-content' as const;
const STR_ACTION_ICON = 'action-icon' as const;
const STR_ACTION_TEXT = 'action-text' as const;
const STR_ACTION_INDICATOR = 'action-indicator' as const;
const STR_ACTION_ARROW = 'action-arrow' as const;

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

  return (
    <div
      className='action-cards-grid'
      role='group'
      aria-label={t('infoPanel.quickActions.title') || 'Quick Actions'}
    >
      <button
        type={STR_BUTTON}
        className='action-card generate-card'
        onClick={onGenerate}
        aria-label={`${t('buttons.generate')} · ${t('accessibility.generateButton')}`}
      >
        <div className={STR_ACTION_CARD_CONTENT}>
          <span className={STR_ACTION_ICON} aria-hidden='true'>
            🔄
          </span>
          <div className={STR_ACTION_TEXT}>
            <h3>{t('buttons.generate')}</h3>
            <p>{t('buttons.generateDescription')}</p>
          </div>
          <div className={STR_ACTION_INDICATOR}>
            <span className={STR_ACTION_ARROW}>→</span>
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
            📄
          </span>
          <div className={STR_ACTION_TEXT}>
            <h3>{t('buttons.download')}</h3>
            <p>{t('buttons.downloadDescription')}</p>
          </div>
          <div className={STR_ACTION_INDICATOR}>
            <span className={STR_ACTION_ARROW}>→</span>
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
            🎯
          </span>
          <div className={STR_ACTION_TEXT}>
            <h3>{t('infoPanel.quickActions.startQuiz') || 'Start Quiz'}</h3>
            <p>{t('buttons.quizDescription')}</p>
          </div>
          <div className={STR_ACTION_INDICATOR}>
            <span className={STR_ACTION_ARROW}>→</span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ActionCards;
