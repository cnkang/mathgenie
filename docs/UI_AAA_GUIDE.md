# UI AAA Guide

## Scope

This guide documents the MathGenie UI refresh that combines:

- lively education visual direction
- component-first styling architecture
- WCAG 2.2 AAA accessibility contract
- realistic interaction semantics

## Architecture Shift

### Before

- global accessibility CSS attempted to force behavior with broad selectors and widespread `!important`
- runtime WCAG enforcement script was relied upon for correctness
- some UI affordances looked clickable without real actions

### After

- styling responsibility is moved to component-level contracts
- global CSS is reduced to baseline utilities: `.sr-only`, `:focus-visible`, reduced-motion/high-contrast media support
- runtime WCAG enforcement is diagnostic-only in development, not forced in production
- visual affordance aligns with interaction reality

## Style Layering Contract

1. `src/styles/globals.css`
   - tokens: color, typography, spacing, radius, elevation
   - brand direction: clean, playful education tone
2. `src/styles/accessibility-unified.css`
   - baseline accessibility primitives only
3. component CSS (`src/components/**/*.css`)
   - owns actionable size, focus treatment, and local state visuals

## Component Accessibility Contract

Each interactive component must satisfy:

1. touch target >= `44x44` px
2. clear keyboard focus (`:focus-visible`)
3. semantic role/labeling for controls
4. non-blocking error feedback via `role="alert"` + `aria-live` where applicable
5. reduced-motion compatibility

## Interaction Realism Rules

1. no `cursor: pointer` or hover-elevation on non-interactive elements
2. buttons/links/cards only appear actionable when they have actionable handlers
3. error/warning/success messaging is rendered in-page, not blocking `alert(...)` dialogs

## Visual System Notes

1. iconography uses inline SVG for core controls and states
2. emoji is decorative-only and must be `aria-hidden` if used
3. motion budget: `150-250ms`, `transform/opacity` first, reduced-motion fallback required
4. responsive validation breakpoints: `390`, `768`, `1024`, `1366`

## Runtime Enforcement Policy

Runtime WCAG DOM patching is disabled by default and not used as production correctness mechanism.

- dev diagnostics only:
  - `VITE_WCAG_RUNTIME_ENFORCEMENT=true pnpm dev`
- default:
  - rely on component contracts + automated accessibility tests

## AAA Verification

Automated validation includes explicit contrast thresholds in E2E:

1. normal text >= `7:1`
2. large text >= `4.5:1`

Also required:

1. keyboard full-flow regression
2. reader-announced error states (`role="alert"` + live region)
3. light/dark theme parity
4. reduced-motion compatibility

## Local QA Artifacts Policy

Keep debug artifacts locally for traceability and exclude from VCS:

1. `.tmp/qa-artifacts/<date>/`
2. `.tmp/playwright-local/`
3. ignored patterns:
   - `.codex-latest-*.png|jpg|jpeg|webp`
   - `.codex-*.trace|har|log|json`

Use `git status` before commit to confirm temporary artifacts are not tracked.
