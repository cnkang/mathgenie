# MathGenie Security Guidelines

## 🔒 Command Injection Prevention (Critical)

### Secure Command Execution (Mandatory)
- **NEVER** use `execSync`, `exec`, or `spawn` with `shell: true`
- **ALWAYS** use `spawnSync` or `spawn` with `shell: false`
- **ALWAYS** pass commands and arguments separately (no string concatenation)
- **ALWAYS** validate command arguments against strict whitelists

### Implementation Pattern
```typescript
// ❌ NEVER DO THIS - Vulnerable to injection
const result = execSync(`command ${userInput}`);

// ✅ ALWAYS DO THIS - Secure execution
const result = spawnSync('command', [validatedArg], {
  shell: false,
  timeout: 60000,
  env: buildSafeEnv({ removePath: true }),
});
```

### Input Validation Requirements
- **File Paths**: Use regex `/^[a-zA-Z0-9_\-./]+$/`
- **Block Metacharacters**: Reject `[;&|`$(){}[]<>*?~]`
- **Length Limits**: Enforce limits (e.g., 200 chars for paths)
- **Whitelist Validation**: Only allow pre-approved commands and arguments

## 🔒 Library Injection Prevention

### Environment Variable Security
**ALWAYS** remove dangerous environment variables from child processes:
- `LD_PRELOAD` (Linux library preloading)
- `LD_LIBRARY_PATH` (Linux library path)
- `DYLD_INSERT_LIBRARIES` (macOS library injection)
- `DYLD_LIBRARY_PATH` (macOS library path)

### Safe Environment Pattern
```typescript
// ✅ Safe environment handling
const safeEnv = {
  ...process.env,
  // Explicitly remove dangerous variables
  LD_PRELOAD: undefined,
  LD_LIBRARY_PATH: undefined,
  DYLD_INSERT_LIBRARIES: undefined,
  DYLD_LIBRARY_PATH: undefined,
};
```

## 🔒 Input Validation & Sanitization

### Validation Strategy
- **Validate at Boundaries**: API endpoints, file inputs, CLI arguments
- **Fail-fast Principle**: Reject invalid inputs immediately
- **Type Safety**: Use TypeScript interfaces + runtime validation
- **Whitelist Approach**: Allow only known-safe patterns

### Validation Functions
```typescript
// ✅ Example validation function
function validateFilePattern(input: string): boolean {
  const allowedPattern = /^[a-zA-Z0-9_\-./]+$/;
  const dangerousPattern = /[;&|`$(){}[\]<>*?~]/;

  return allowedPattern.test(input) && 
         !dangerousPattern.test(input) && 
         input.length <= 200;
}
```

## 🔒 Secure Process Execution

### Process Security Requirements
- **Timeout Protection**: Set reasonable timeouts (e.g., 60 seconds)
- **Resource Limits**: Prevent resource exhaustion
- **Error Handling**: Don't expose sensitive information in errors
- **Audit Logging**: Log security-relevant operations
- **Clean Environments**: Remove dangerous environment variables

### Security Checklist (Before Executing Commands)
- [ ] Command is in approved whitelist
- [ ] All arguments are validated
- [ ] No shell metacharacters present
- [ ] Environment variables cleaned
- [ ] Timeout configured
- [ ] Error handling implemented
- [ ] Logging configured

## Data Protection

### Sensitive Data Handling
- **NEVER** commit sensitive data (API keys, passwords, tokens)
- **Use Environment Variables**: For configuration and secrets
- **localStorage Caution**: Be careful with browser storage data
- **Log Sanitization**: Never log secrets or PII
- **Error Messages**: Don't expose sensitive information in errors

### Privacy Protection
- **No PII Collection**: Don't collect personally identifiable information
- **Analytics Privacy**: Use privacy-focused analytics (Vercel Speed Insights)
- **Local Processing**: Core functionality works client-side only
- **Data Minimization**: Collect only necessary data

## Dependency Security

### Dependency Management
- **Vulnerability Scanning**: Run `pnpm audit` before releases
- **Pin Versions**: Use exact versions for critical dependencies
- **Minimize Dependencies**: Add dependencies sparingly
- **License Compliance**: Only approved licenses (MIT, Apache 2.0, BSD)
- **Regular Updates**: Monthly security updates

### Supply Chain Security
- **SBOM Maintenance**: Software Bill of Materials tracking
- **Automated Scanning**: CI/CD pipeline vulnerability detection
- **Dependency Review**: Manual review of new dependencies
- **License Validation**: Automated license compliance checking

## Code Security

### Secure Coding Practices
- **No Dynamic Execution**: Never use `eval()`, `Function()`, or similar
- **Secure Random**: Use `crypto.getRandomValues()` instead of `Math.random()` for security
- **Input Validation**: Validate and sanitize all user inputs
- **Secure Parsers**: Use safe parsers for math expressions
- **Type Safety**: Leverage TypeScript for compile-time security

### Error Handling Security
- **Structured Errors**: Use typed/structured errors
- **Context Propagation**: Propagate errors with context, not sensitive data
- **Log Once**: Log errors once near boundaries
- **Sanitized Logging**: Sanitize all log output to prevent injection
- **No Secret Exposure**: Never log or expose secrets in errors

## Security Testing

### Automated Security Testing
- **Static Analysis**: SonarQube security rules
- **Dependency Scanning**: Automated vulnerability detection
- **Code Quality**: ESLint with security-focused rules
- **Input Validation Testing**: Test all input validation functions

### Manual Security Review
- **Code Review**: Security-focused code review process
- **Penetration Testing**: Regular security assessments
- **Vulnerability Assessment**: Periodic security audits
- **Threat Modeling**: Identify and mitigate security threats

## Security Incident Response

### Incident Handling
- **Immediate Response**: Quick response to security issues
- **Impact Assessment**: Evaluate scope and severity
- **Mitigation**: Implement immediate fixes
- **Communication**: Transparent communication about security issues
- **Post-incident**: Learn and improve security measures

### Security Updates
- **Emergency Patches**: Rapid deployment for critical security fixes
- **Regular Updates**: Scheduled security updates
- **Dependency Updates**: Keep dependencies current for security
- **Security Advisories**: Monitor and respond to security advisories

## Compliance & Standards

### Security Standards
- **OWASP Top 10**: Address common web application security risks
- **Secure Development**: Follow secure development lifecycle
- **Security by Design**: Build security into architecture from start
- **Defense in Depth**: Multiple layers of security controls

### Audit & Monitoring
- **Security Logging**: Comprehensive security event logging
- **Monitoring**: Real-time security monitoring
- **Alerting**: Automated alerts for security events
- **Compliance**: Regular compliance assessments

This security framework ensures MathGenie maintains the highest security standards while providing excellent user experience and functionality.