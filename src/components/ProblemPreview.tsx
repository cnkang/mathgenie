import React, { useMemo, useDeferredValue, Suspense } from 'react';
import { useTranslation } from '../i18n';
import type { ProblemPreviewProps, Problem } from '../types';

/**
 * Problem Preview Component - Enhanced with React 19 features and TypeScript
 * Shows a live preview of what problems will look like
 * Uses deferred values for better performance
 */
const ProblemPreview: React.FC<ProblemPreviewProps> = ({ settings, generateSampleProblem }) => {
  const { t } = useTranslation();

  // React 19: Defer expensive computations to avoid blocking urgent updates
  const deferredSettings = useDeferredValue(settings);

  // Generate sample problems for preview with deferred settings
  const sampleProblems = useMemo((): Problem[] => {
    if (!generateSampleProblem) return [];
    
    const samples: Problem[] = [];
    for (let i = 0; i < Math.min(3, deferredSettings.numProblems); i++) {
      const problem = generateSampleProblem();
      if (problem) {
        samples.push({ id: i, text: problem });
      }
    }
    return samples;
  }, [deferredSettings, generateSampleProblem]);

  return (
    <div className="problem-preview">
      <h3>{t('preview.title') || 'Preview'}</h3>
      <Suspense fallback={
        <div className="preview-loading">
          <div className="loading-spinner" aria-hidden="true"></div>
          <span>Generating preview...</span>
        </div>
      }>
        <div className="preview-container">
          <div className="preview-problems">
            {sampleProblems.map((problem) => (
              <div key={problem.id} className="preview-problem">
                {problem.text}
              </div>
            ))}
          </div>
          <div className="preview-info">
            <small>
              {t('preview.info') || 'Sample problems based on current settings'}
            </small>
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default ProblemPreview;