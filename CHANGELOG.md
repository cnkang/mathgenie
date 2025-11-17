# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- **js-yaml Security Fix**: Added pnpm override to force js-yaml to version 4.1.1 or higher
  - **Issue**: `@lhci/utils@0.15.1` depends on vulnerable js-yaml 3.14.2
  - **Vulnerability**: js-yaml < 4.1.1 contains high-severity security issues with potential code execution via malicious YAML parsing
  - **Solution**: pnpm override ensures all js-yaml instances use secure version 4.1.1+
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
