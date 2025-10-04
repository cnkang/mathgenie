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
      {groups.map((group, groupIndex) => {
        const groupKey = hasProblems(group) 
          ? `group-${group[0]?.id || 0}-${group.length}`
          : `empty-${settings.totalGroups}-${settings.problemsPerGroup}-${groupIndex + 1}`;
        
        return hasProblems(group) ? (
          <div key={groupKey} className='problem-group'>
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
          <div key={groupKey} className='empty-group-placeholder'>
            {getEmptyGroupText(groupIndex, t)}
          </div>
        );
      })}
    </>
  );
};

export default GroupedProblemsDisplay;
