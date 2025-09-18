# MathGenie Task Completion Checklist

## Pre-Development Checklist

### Environment Setup
- [ ] Node.js 22.19.1+ installed and verified
- [ ] pnpm 10.15.1+ installed and verified
- [ ] Project dependencies installed (`pnpm install`)
- [ ] Development server starts successfully (`pnpm dev`)
- [ ] All browsers installed for testing (`pnpm playwright:install`)

### Project Understanding
- [ ] Read relevant Kiro steering documents (`.kiro/steering/`)
- [ ] Understand existing code patterns and architecture
- [ ] Review accessibility requirements (WCAG 2.2 AAA)
- [ ] Check internationalization needs (6 languages)
- [ ] Identify security considerations

## Development Phase Checklist

### Code Quality Standards
- [ ] TypeScript strict mode compliance
- [ ] React 19 patterns used (`useTransition`, `useDeferredValue`, `useOptimistic`)
- [ ] Files co-located (`.tsx`, `.css`, `.test.tsx`)
- [ ] Path aliases used (`@/` prefix)
- [ ] Single responsibility principle followed
- [ ] Functions ≤ 50 lines (target), ≤ 100 lines (cap)
- [ ] Cognitive complexity ≤ 15 per function
- [ ] No duplicate code blocks > 3 lines

### Security Validation (Critical)
- [ ] **No `execSync`, `exec`, or `spawn` with `shell: true`**
- [ ] **All user inputs validated with regex patterns**
- [ ] **No shell metacharacters in inputs `[;&|`$(){}[]<>*?~]`**
- [ ] **Environment variables cleaned for child processes**
- [ ] **Process timeouts set (≤ 60 seconds)**
- [ ] **No hardcoded secrets or credentials**
- [ ] **Input length limits enforced (≤ 200 chars for paths)**
- [ ] **Whitelist validation for all external inputs**

### React & Hook Best Practices
- [ ] useEffect cleanup functions implemented
- [ ] AbortController used for fetch requests
- [ ] Race condition prevention implemented
- [ ] State management patterns followed
- [ ] Error boundaries integrated
- [ ] React Strict Mode compatibility ensured
- [ ] Dependency arrays properly managed
- [ ] Custom hooks extracted for complex logic

### Accessibility Compliance (WCAG 2.2 AAA)
- [ ] **Color contrast ratios: 7:1 for normal text, 4.5:1 for large text**
- [ ] **Touch targets ≥ 44px minimum**
- [ ] **Full keyboard navigation support**
- [ ] **Screen reader compatibility with proper ARIA**
- [ ] **No information conveyed by color alone**
- [ ] **Focus indicators visible and high contrast**
- [ ] **Reduced motion preferences respected**
- [ ] **Semantic HTML elements used appropriately**

### Internationalization (Critical)
- [ ] **All user-facing text uses `t('key')` function**
- [ ] **Translation keys added to ALL 6 language files**
- [ ] **Hierarchical key naming used (e.g., `errors.validation.required`)**
- [ ] **Fallback text provided (`t('key') || 'Fallback'`)**
- [ ] **UI tested with longest translations (German)**
- [ ] **No hardcoded strings in components**
- [ ] **Dynamic content uses proper i18n formatting**

## Testing Phase Checklist

### Unit Testing (90% Coverage Required)
- [ ] **All components have comprehensive tests**
- [ ] **All custom hooks tested**
- [ ] **All utilities tested**
- [ ] **Coverage ≥ 90% for new code**
- [ ] **Changed lines coverage ≥ 80%**
- [ ] **Tests focus on behavior, not implementation**
- [ ] **useEffect patterns properly tested**
- [ ] **Async operations tested with proper cleanup**

### E2E Testing (Cross-Browser)
- [ ] **Tests pass on Chromium engine**
- [ ] **Tests pass on Firefox engine**
- [ ] **Tests pass on WebKit engine**
- [ ] **Mobile device testing completed**
- [ ] **Touch interactions tested**
- [ ] **Keyboard navigation tested**

### Accessibility Testing (Mandatory)
- [ ] **axe-core tests pass with WCAG 2.2 AAA rules**
- [ ] **Keyboard-only navigation tested**
- [ ] **Screen reader compatibility verified**
- [ ] **Color contrast validation passed**
- [ ] **Touch target sizes verified on mobile**
- [ ] **Reduced motion preferences tested**

## Quality Gates Checklist (Must Pass)

### Code Quality Analysis
- [ ] **ESLint passes with zero errors**
- [ ] **Prettier formatting applied**
- [ ] **TypeScript compilation successful**
- [ ] **SonarQube: Zero critical issues**
- [ ] **CSS/HTML quality checks passed**
- [ ] **No code smells above acceptable levels**

### Pre-commit Validation (Mandatory Order)
1. [ ] `pnpm format` - Code formatting
2. [ ] `pnpm lint` - Linting fixes
3. [ ] `pnpm lint:css-html:fix` - CSS/HTML quality auto-fix
4. [ ] `pnpm sonar:high` - Critical code quality issues
5. [ ] `pnpm type-check` - TypeScript compilation
6. [ ] `pnpm i18n:check` - Translation validation
7. [ ] `pnpm test` - Unit tests with coverage
8. [ ] `pnpm validate` - Complete validation pipeline

### Pre-push Validation
- [ ] `pnpm validate:full` - Complete validation
- [ ] `pnpm build` - Production build verification
- [ ] `pnpm test:e2e:accessibility` - WCAG 2.2 AAA compliance
- [ ] `pnpm test:mobile` - Mobile device testing

## Performance Checklist

### Core Web Vitals (Required Targets)
- [ ] **First Contentful Paint (FCP) < 1.5s**
- [ ] **Largest Contentful Paint (LCP) < 2.5s**
- [ ] **First Input Delay (FID) < 100ms**
- [ ] **Cumulative Layout Shift (CLS) < 0.1**
- [ ] **Interaction to Next Paint (INP) < 200ms**

### Bundle Optimization
- [ ] Bundle size < 500KB gzipped
- [ ] Code splitting implemented appropriately
- [ ] Tree shaking enabled and effective
- [ ] Manual chunks configured for vendors
- [ ] Dynamic imports used for large dependencies

### Performance Testing
- [ ] Lighthouse tests pass Core Web Vitals
- [ ] Bundle analysis completed
- [ ] Performance regression tests pass
- [ ] Mobile performance verified

## Documentation Checklist

### Documentation Updates (Critical)
- [ ] **README.md updated for feature changes**
- [ ] **TESTING.md updated for test strategy changes**
- [ ] **JSDoc comments added/updated for new APIs**
- [ ] **Configuration comments updated**
- [ ] **Code examples reflect current implementation**
- [ ] **Related documentation files reviewed**

### Documentation Synchronization
- [ ] **Documentation updated in same commit as code changes**
- [ ] **No deferred documentation updates**
- [ ] **Documentation accuracy verified**
- [ ] **Examples and snippets tested**

## Security Checklist (Critical)

### Command Execution Security
- [ ] **Only `spawnSync`/`spawn` with `shell: false` used**
- [ ] **Command arguments validated against whitelists**
- [ ] **No string concatenation for commands**
- [ ] **Environment variables cleaned**
- [ ] **Process timeouts configured**
- [ ] **Error handling doesn't expose sensitive info**

### Input Validation & Sanitization
- [ ] **All inputs validated at boundaries**
- [ ] **Regex patterns used for validation**
- [ ] **Length limits enforced**
- [ ] **Dangerous characters blocked**
- [ ] **Type safety with runtime validation**

### Dependency Security
- [ ] `pnpm audit` passes with no high/critical vulnerabilities
- [ ] Dependencies are up-to-date
- [ ] No abandoned or unmaintained dependencies
- [ ] License compliance verified

## Final Validation Checklist

### Complete Testing Suite
- [ ] All unit tests pass
- [ ] All E2E tests pass across browsers
- [ ] All accessibility tests pass
- [ ] All mobile tests pass
- [ ] Performance tests meet targets

### Quality Assurance
- [ ] Code review completed
- [ ] Security review completed
- [ ] Accessibility review completed
- [ ] Performance review completed
- [ ] Documentation review completed

### Deployment Readiness
- [ ] Production build successful
- [ ] All CI/CD checks pass
- [ ] No breaking changes introduced
- [ ] Migration guide provided (if needed)
- [ ] Rollback plan documented

## Emergency Procedures

### Quality Gate Failures
**NEVER use `--no-verify` or bypass quality gates**

Instead, fix underlying issues:
- [ ] CSS issues: `pnpm lint:css:fix`
- [ ] HTML issues: `pnpm lint:html`
- [ ] SonarQube issues: `pnpm sonar:high:verbose`
- [ ] TypeScript errors: `pnpm type-check`
- [ ] Test failures: `pnpm test:watch`

### Browser/Testing Issues
- [ ] Reinstall browsers: `pnpm playwright:install`
- [ ] Clear browser cache: `pnpm playwright:cache:clean`
- [ ] Debug browser issues: `pnpm playwright:cache:debug`

### Build Issues
- [ ] Clean rebuild: `pnpm clean && pnpm reinstall`
- [ ] Check dependencies: `pnpm deps:check`
- [ ] Verify Node.js/pnpm versions

## Post-Completion Checklist

### Code Review Preparation
- [ ] Self-review completed using this checklist
- [ ] All quality gates passed
- [ ] Documentation updated and accurate
- [ ] Tests provide adequate coverage
- [ ] Security implications considered

### Handoff Documentation
- [ ] Feature description provided
- [ ] Testing instructions included
- [ ] Known limitations documented
- [ ] Future improvement suggestions noted

### Continuous Improvement
- [ ] Lessons learned documented
- [ ] Process improvements identified
- [ ] Quality metrics recorded
- [ ] Performance benchmarks established

## Maintenance Checklist

### Regular Tasks
- [ ] Dependencies updated monthly
- [ ] Security audit completed
- [ ] Performance metrics reviewed
- [ ] Accessibility compliance verified
- [ ] Documentation accuracy checked

### Quality Monitoring
- [ ] Code coverage trends monitored
- [ ] Performance regression alerts configured
- [ ] Accessibility compliance tracked
- [ ] Security vulnerability monitoring active