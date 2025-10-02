import type { Problem, Settings } from '@/types';
import {
  getEmptyGroupText,
  getGroupTitle,
  hasProblems,
  splitProblemsIntoGroups,
} from '@/utils/groupingUtils';
import React from 'react';

type GroupedProblemsDisplayProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  problems: Problem[];
  settings: Settings;
  problemsListLabel: string;
};

const GroupedProblemsDisplay: React.FC<GroupedProblemsDisplayProps> = ({
  t,
  problems,
  settings,
  problemsListLabel,
}) => {
  const groups = splitProblemsIntoGroups(problems, settings);

  return (
    <>
      {groups.map((group, groupIndex) =>
        hasProblems(group) ? (
          <div key={`group-${groupIndex}`} className='problem-group'>
            <h3 className='group-title'>{getGroupTitle(groupIndex, t)}</h3>
            <ol
              className='problems-grid'
              start={groupIndex * settings.problemsPerGroup + 1}
              aria-label={`${problemsListLabel} - ${getGroupTitle(groupIndex, t)}`}
            >
              {group.map(p => (
                <li key={p.id} className='problem-item'>
                  <span className='problem-text'>{p.text}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div key={`empty-group-${groupIndex}`} className='empty-group-placeholder'>
            {getEmptyGroupText(groupIndex, t)}
          </div>
        )
      )}
    </>
  );
};

export default GroupedProblemsDisplay;
