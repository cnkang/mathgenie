import { describe, it, expect } from 'vitest';
import { applyDuplicateStringFixesToContent } from '../../../scripts/lib/duplicate-string-fixer';

const tsxSample = `
import React from 'react';

export default function Demo() {
  return (
    <div className="container">
      <div className='quick-action-card'>Card</div>
      <span className='quick-action-card'>Again</span>
      {['quick-action-card', 'other'].map(x => <i key={x}>{x}</i>)}
    </div>
  );
}
`;

describe('duplicate-string-fixer', () => {
  it('detects duplicates via AST and fixes them with constants', () => {
    const filePath = 'virtual/Demo.tsx';
    const { updated, replacedCount, constsAdded } = applyDuplicateStringFixesToContent(filePath, tsxSample, {
      minLength: 6,
      minCount: 3,
    });

    expect(replacedCount).toBeGreaterThanOrEqual(3);
    expect(constsAdded).toBe(1);
    expect(updated).toContain('// AUTO-GENERATED: duplicate strings extracted by sonar-check --fix');
    expect(updated).toMatch(/const\s+STR_QUICK_ACTION_CARD\s*=\s*["']quick-action-card["']\s+as\s+const;/);
    expect(updated).not.toContain("'quick-action-card'");
  });
});
