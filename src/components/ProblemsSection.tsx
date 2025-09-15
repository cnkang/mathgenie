import type { Problem, Settings } from '@/types';
import React from 'react';

type ProblemsSectionProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  problems: Problem[];
  settings: Settings;
};

const ProblemsSection: React.FC<ProblemsSectionProps> = ({ t, problems }) => {
  return (
    <section aria-labelledby='results-title' className='problems-section'>
      <div className='problems-container'>
        <div className='problems-header'>
          <h2 id='results-title'>
            {t('results.title', { count: problems.length }) ||
              `Generated Problems (${problems.length})`}
          </h2>
        </div>
        <div className='problems-content' tabIndex={0} aria-label={t('accessibility.problemsList')}>
          {problems.length === 0 ? (
            <p role='status'>{t('results.noProblems')}</p>
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
