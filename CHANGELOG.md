# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **InfoPanel stats double-counting**: Fixed `totalGenerated` counter incrementing on component remount (e.g., entering/exiting quiz mode) by tracking previous problems reference
- **SettingsSection aria-label**: Fixed raw translation key `"settings.title"` appearing as aria-label before translations load; now falls back to `"Settings"` when the key is unresolved
- **usePerformance `performanceMetrics`**: Fixed `useMemo` with empty deps that caused metrics to never update; replaced with a getter-based approach for live render count
- **Mobile content ordering**: Settings section now appears before results on mobile (≤480px), so users can configure before scrolling to generated problems

### Changed

- **InfoPanel simplified**: Removed duplicate quick-action buttons, tips section, and current config display; kept stats grid, progress bar, and conditional quiz results
- **useReact19Features cleaned up**: Removed placeholder code (`usePromise` that only throws, `createMemoizedCallback` no-op, `batchUpdates` wrapper); retained only the actively used `optimisticState`, `updateOptimistic`, `startTransition`, and `useErrorRecovery`
- **usePerformance cleaned up**: Removed unused `createOptimizedHandler` that returned an inert `{ handler, dependencies }` object
- **Console noise reduced**: Suppressed non-actionable `console.log` calls in `browserOptimizations.ts` (`logBrowserInfo`, Firefox CSS message) and `wcagEnforcement.ts` (mutation observer logging)
- **Removed unused jsdom dependency**: Disabled `auto-install-peers` in `.npmrc` to prevent pnpm from auto-installing vitest's optional peer dependency `jsdom` (project uses `happy-dom`). This eliminates the deprecated `whatwg-encoding@3.1.1` transitive dependency

### Security

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
