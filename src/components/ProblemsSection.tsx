import type { Problem, Settings } from '@/types';
import React from 'react';

type ProblemsSectionProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  problems: Problem[];
  settings: Settings;
};

const ProblemsSection: React.FC<ProblemsSectionProps> = ({ t, problems }) => {
  const problemsListLabel = t('accessibility.problemsList');

  return (
    <section aria-labelledby='results-title' className='problems-section'>
      <div className='problems-container'>
        <div className='problems-header'>
          <h2 id='results-title'>
            {t('results.title', { count: problems.length }) ||
              `Generated Problems (${problems.length})`}
          </h2>
        </div>
        <div
          className='problems-content'
          role='region'
          aria-labelledby='results-title'
          aria-label={problemsListLabel}
          // SONAR-SAFE: Scrollable region must be focusable to satisfy WCAG 2.1.1 (scrollable-region-focusable).
          tabIndex={0}
          aria-live='polite'
        >
          {problems.length === 0 ? (
            <output aria-live='polite'>{t('results.noProblems')}</output>
          ) : (
            <ol className='problems-grid'>
              {problems.map(p => (
                <li key={p.id} className='problem-item'>
                  <span className='problem-text'>{p.text}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProblemsSection;
