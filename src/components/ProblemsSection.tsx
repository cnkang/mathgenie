import type { Problem, Settings } from '@/types';
import React from 'react';

type ProblemsSectionProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  problems: Problem[];
  settings: Settings;
};

const ProblemsSection: React.FC<ProblemsSectionProps> = ({ t, problems, settings }) => {
  const problemsListLabel = t('accessibility.problemsList');

  // 如果启用分组，将题目按组分割
  const renderGroupedProblems = () => {
    const groups: Problem[][] = [];
    for (let i = 0; i < settings.totalGroups; i++) {
      const startIndex = i * settings.problemsPerGroup;
      const endIndex = Math.min(startIndex + settings.problemsPerGroup, problems.length);
      groups.push(problems.slice(startIndex, endIndex));
    }

    return groups.map((group, groupIndex) => (
      <div key={groupIndex} className='problem-group'>
        <h3 className='group-title'>
          {t('results.groupTitle', { number: groupIndex + 1 }) || `Group ${groupIndex + 1}`}
        </h3>
        <ol className='problems-grid' start={groupIndex * settings.problemsPerGroup + 1}>
          {group.map(p => (
            <li key={p.id} className='problem-item'>
              <span className='problem-text'>{p.text}</span>
            </li>
          ))}
        </ol>
      </div>
    ));
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
          {settings.enableGrouping && problems.length > 0 && (
            <p className='grouping-info'>
              {t('results.groupingInfo', {
                groups: settings.totalGroups,
                perGroup: settings.problemsPerGroup,
              }) || `${settings.totalGroups} groups, ${settings.problemsPerGroup} problems each`}
            </p>
          )}
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
