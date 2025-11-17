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

#### js-yaml Security Fix

**Issue**: The `@lhci/utils@0.15.1` package depends on js-yaml 3.14.2, which contains known security vulnerabilities.

**Vulnerability Details**:

- **Package**: js-yaml < 4.1.1
- **Severity**: High
- **Impact**: Potential code execution via malicious YAML parsing
- **CVE References**: See [js-yaml Security Advisory](https://github.com/nodeca/js-yaml/security/advisories)

**Solution**: pnpm override forces all js-yaml instances to version 4.1.1 or higher

**Implementation**:

```json
{
  "pnpm": {
    "overrides": {
      "js-yaml": "^4.1.1"
    }
  }
}
```

**Verification**:

```bash
# Verify all js-yaml instances use secure version
pnpm why js-yaml

# Run security audit
pnpm audit
```

**Removal Criteria**:

This override should be removed when one of the following conditions is met:

1. **Upstream Fix**: `@lhci/utils` is updated to depend on js-yaml 4.1.1 or higher
   - Check with: `pnpm why js-yaml`
   - Verify no instances of js-yaml < 4.1.1 remain

2. **Alternative Tool**: Project migrates to an alternative performance testing tool
   - Remove `@lhci/cli` dependency
   - Verify js-yaml is no longer in dependency tree

3. **Dependency Removal**: js-yaml is no longer a transitive dependency
   - Verify with: `pnpm why js-yaml` (should show no results)

**Monitoring Schedule**:

- **Monthly**: Run `pnpm audit` to check for new vulnerabilities
- **Quarterly**: Run `pnpm outdated` and `pnpm why js-yaml` to review override necessity
- **On Updates**: Check if `@lhci/utils` updates resolve the issue

**Validation Process**:

Before removing the override:

1. Remove the override from package.json
2. Delete pnpm-lock.yaml
3. Run `pnpm install`
4. Run `pnpm why js-yaml` to verify all instances are 4.1.1+
5. Run `pnpm audit` to verify zero js-yaml vulnerabilities
6. Run `pnpm validate` to ensure all tests pass

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
