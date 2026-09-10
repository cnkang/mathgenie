# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in MathGenie, please report it by emailing the maintainers. Please do not create public GitHub issues for security vulnerabilities.

## Security Measures

### Dependency Security

MathGenie takes dependency security seriously and implements the following measures:

1. **Regular Security Audits**: Run `pnpm audit` before each release
2. **Automated Scanning**: GitHub Dependabot alerts for vulnerable dependencies
3. **CI/CD Security Checks**: Automated security scanning in the deployment pipeline
4. **Dependency Overrides**: Force secure versions of transitive dependencies when necessary

### Current Security Overrides

pnpm `overrides` in `package.json` force secure versions of transitive dependencies when necessary. Run `pnpm audit` before each release; see `package.json` for the current list.

> Note: The former `@lhci/cli`-specific overrides (`js-yaml`, `chrome-launcher`, `tmp`, `os-tmpdir`, `express`, `path-to-regexp`, `uuid`) were removed together with the `@lhci/cli` devDependency. `pnpm why <pkg>` confirms none of them remain in the dependency tree.

## Security Best Practices

### Development

- Never commit sensitive data (API keys, passwords, tokens)
- Use environment variables for configuration
- Validate and sanitize all user inputs
- Follow secure coding practices
- Keep dependencies up to date

### Deployment

- Use HTTPS for all production deployments
- Implement Content Security Policy (CSP)
- Enable security headers
- Regular security audits
- Monitor for security advisories

## Security Compliance

MathGenie follows industry-standard security practices:

- **OWASP**: Dependency management guidelines
- **npm Security**: Best practices for package management
- **Secure Development**: Code review and testing requirements

## Security Updates

Security updates are prioritized and released as soon as possible. Check the [CHANGELOG](CHANGELOG.md) for security-related updates.

## Contact

For security concerns, please contact the project maintainers directly rather than creating public issues.
