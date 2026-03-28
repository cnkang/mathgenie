# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **UI AAA documentation**: Added [`docs/UI_AAA_GUIDE.md`](docs/UI_AAA_GUIDE.md) covering style layering, component accessibility contract, runtime enforcement policy, and verification scope
- **Local artifact retention policy**: Documented local-only QA artifact handling and Git ignore workflow in `README.md` and `TESTING.md`
- **Explicit AAA contrast assertions**: Added E2E contrast threshold assertions (normal text `>= 7:1`, large text `>= 4.5:1`) in `tests/e2e/accessibility-unified.spec.ts`

### Fixed

- **InfoPanel stats double-counting**: Fixed `totalGenerated` counter incrementing on component remount (e.g., entering/exiting quiz mode) by tracking previous problems reference
- **SettingsSection aria-label**: Fixed raw translation key `"settings.title"` appearing as aria-label before translations load; now falls back to `"Settings"` when the key is unresolved
- **usePerformance `performanceMetrics`**: Fixed `useMemo` with empty deps that caused metrics to never update; replaced with a getter-based approach for live render count
- **Mobile content ordering**: Settings section now appears before results on mobile (≤480px), so users can configure before scrolling to generated problems
- **Import error UX**: Replaced blocking `alert(...)` behavior in settings import flow with inline live-region feedback (`role="alert"` + `aria-live`)

### Changed

- **Node.js baseline upgraded**: Updated runtime/tooling baseline to Node.js 24.14.1 LTS (`.nvmrc`, CI workflow, Dependabot workflow)
- **Test toolchain refresh**: Upgraded `vitest` and `@vitest/coverage-v8` to 4.1.2
- **InfoPanel simplified**: Removed duplicate quick-action buttons, tips section, and current config display; kept stats grid, progress bar, and conditional quiz results
- **useReact19Features cleaned up**: Removed placeholder code (`usePromise` that only throws, `createMemoizedCallback` no-op, `batchUpdates` wrapper); retained only the actively used `optimisticState`, `updateOptimistic`, `startTransition`, and `useErrorRecovery`
- **usePerformance cleaned up**: Removed unused `createOptimizedHandler` that returned an inert `{ handler, dependencies }` object
- **Console noise reduced**: Suppressed non-actionable `console.log` calls in `browserOptimizations.ts` (`logBrowserInfo`, Firefox CSS message) and `wcagEnforcement.ts` (mutation observer logging)
- **Removed unused jsdom dependency**: Disabled `auto-install-peers` in `.npmrc` to prevent pnpm from auto-installing vitest's optional peer dependency `jsdom` (project uses `happy-dom`). This eliminates the deprecated `whatwg-encoding@3.1.1` transitive dependency
- **Component-first accessibility styling**: Reduced global accessibility forcing and moved touch/focus/error semantics to component-level CSS contracts
- **Runtime enforcement policy**: `setupWCAGEnforcement` now runs only in explicitly enabled development diagnostics and is disabled by default in production flows
- **Iconography refresh**: Migrated key interaction surfaces from emoji affordances to accessible SVG icon set
- **i18n copy consistency**: Updated quiz completion copy across locales to remove decorative emoji prefix while preserving keys

### Removed

- **Broad global style forcing**: Removed wide global `!important`/universal selector accessibility overrides as primary compliance mechanism

### Security

- **picomatch Security Fix**: Added pnpm override selector to force vulnerable 4.x transitive versions to `4.0.4`
  - **Issue**: Transitive `picomatch@4.0.3` remained in tree via `vitest`
  - **Vulnerabilities**: `GHSA-c2c7-rcm5-vvqj` (ReDoS) and `GHSA-3v7f-55p6-f55p` (method injection)
  - **Solution**: Added `"picomatch@>=4.0.0 <4.0.4": "4.0.4"` in pnpm overrides
- **path-to-regexp Security Fix**: Added pnpm override to force `path-to-regexp` to `8.4.0`
  - **Issue**: Transitive `path-to-regexp@8.3.0` from `@lhci/cli -> express -> router`
  - **Vulnerabilities**: `GHSA-j3q9-mxjg-w52f` and `GHSA-27v5-c462-wpq7`
  - **Solution**: Added `"path-to-regexp": "^8.4.0"` in pnpm overrides
- **js-yaml Security Fix**: Added pnpm override to force js-yaml to version 4.1.1 or higher
  - **Issue**: `@lhci/utils@0.15.1` (transitive dependency of `@lhci/cli`) depends on vulnerable js-yaml 3.14.2
  - **Vulnerability**: js-yaml < 4.1.1 contains high-severity security issues with potential code execution via malicious YAML parsing
  - **Solution**: pnpm override ensures all js-yaml instances use secure version 4.1.1+
  - **Note**: Previously used pnpm patch, now simplified to use only pnpm override
  - **Impact**: Zero functional changes; all tests pass; Lighthouse CI continues to work correctly
  - **References**: See [SECURITY.md](SECURITY.md) for detailed information and removal criteria
  - **Verification**: Run `pnpm audit` and `pnpm why js-yaml` to verify the fix

## [1.0.0] - 2025-01-XX

### Added

- Initial release of MathGenie
- React 19.2.0 with concurrent features
- TypeScript 5.9 with strict type checking
- Node.js 22.19.1 support
- Comprehensive testing suite (unit, E2E, accessibility)
- WCAG 2.2 AAA accessibility compliance
- Multi-language support (6 languages)
- PDF generation with customization
- Mobile-optimized responsive design
- Performance monitoring with Vercel Speed Insights

### Security

- Implemented comprehensive security measures
- Regular dependency audits
- Automated security scanning in CI/CD
- Secure coding practices enforced

---

## Security Updates

For security-related updates and vulnerability disclosures, see [SECURITY.md](SECURITY.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute to this project.
