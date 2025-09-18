# MathGenie Development Workflow

## Pre-Development Setup

### Environment Verification
```bash
# Verify required versions
node --version    # Should be 22.19.1+
pnpm --version    # Should be 10.15.1+
```

### Project Activation
```bash
# If using Serena MCP
serena activate mathgenie

# Verify project structure
ls -la src/       # Check source structure
ls -la .kiro/     # Check Kiro configuration
```

## Daily Development Workflow

### 1. Start Development Session
```bash
# Pull latest changes
git pull origin main

# Install/update dependencies
pnpm install

# Start development server
pnpm dev
```

### 2. Feature Development Cycle

#### Before Writing Code
- [ ] Read relevant Kiro steering documents (`.kiro/steering/`)
- [ ] Check existing patterns in similar components
- [ ] Plan accessibility requirements (WCAG 2.2 AAA)
- [ ] Consider internationalization needs (6 languages)
- [ ] Review security implications

#### During Development
- [ ] Use TypeScript strict mode
- [ ] Follow React 19 patterns (`useTransition`, `useDeferredValue`, `useOptimistic`)
- [ ] Co-locate files (`.tsx`, `.css`, `.test.tsx`)
- [ ] Use `@/` path aliases
- [ ] Write tests alongside code (90% coverage target)
- [ ] Add translation keys to all 6 language files

#### Code Quality Checks (Real-time)
```bash
# Run during development
pnpm type-check      # TypeScript compilation
pnpm lint            # ESLint with auto-fix
pnpm format          # Prettier formatting
pnpm test:watch      # Unit tests in watch mode
```

### 3. Pre-Commit Quality Gates (Mandatory)

#### Quality Pipeline (Must Pass)
```bash
# 1. Format and fix basic issues
pnpm format
pnpm lint

# 2. CSS/HTML quality (auto-fix)
pnpm lint:css-html:fix

# 3. Critical code quality issues
pnpm sonar:high

# 4. TypeScript compilation
pnpm type-check

# 5. Translation validation
pnpm i18n:check

# 6. Unit tests with coverage
pnpm test

# 7. Complete validation
pnpm validate
```

#### Security Checklist
- [ ] No `execSync`, `exec`, or `spawn` with `shell: true`
- [ ] All user inputs validated with regex patterns
- [ ] No shell metacharacters in inputs
- [ ] Environment variables cleaned for child processes
- [ ] No hardcoded secrets or credentials

### 4. Accessibility Validation (WCAG 2.2 AAA)

#### Manual Checks
- [ ] Keyboard-only navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast ratios (7:1 for normal text)
- [ ] Touch targets ≥ 44px
- [ ] No information conveyed by color alone
- [ ] Reduced motion preferences respected

#### Automated Tests
```bash
# Cross-browser accessibility testing
pnpm test:e2e:accessibility

# Mobile device testing
pnpm test:mobile
```

### 5. Internationalization Validation

#### Translation Checklist
- [ ] All user-facing text uses `t('key')` function
- [ ] Translation keys added to all 6 language files
- [ ] Hierarchical key naming (e.g., `errors.validation.required`)
- [ ] Fallback text provided (`t('key') || 'Fallback'`)
- [ ] UI tested with longest translations (German)

#### Commands
```bash
pnpm i18n:check     # Validate all translations
```

### 6. Performance Validation

#### Performance Checks
```bash
pnpm lighthouse     # Core Web Vitals
pnpm build          # Production build verification
pnpm analyze        # Bundle analysis
```

#### Performance Targets
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms

### 7. Final Validation Before Push

#### Complete Testing Suite
```bash
# Full validation pipeline
pnpm validate:full

# E2E testing across browsers
pnpm test:e2e

# Mobile testing
pnpm test:mobile

# Accessibility compliance
pnpm test:e2e:accessibility
```

#### Git Operations
```bash
# Stage changes
git add .

# Commit with conventional format
git commit -m "feat: add new feature with accessibility support"

# Push to remote
git push origin feature-branch
```

## Code Review Workflow

### Self-Review Checklist
- [ ] Code follows MathGenie patterns
- [ ] All quality gates pass
- [ ] Accessibility requirements met
- [ ] Internationalization complete
- [ ] Security guidelines followed
- [ ] Documentation updated
- [ ] Tests provide adequate coverage

### Peer Review Focus Areas
- [ ] Architecture and design patterns
- [ ] Security implications
- [ ] Accessibility compliance
- [ ] Performance impact
- [ ] Code maintainability
- [ ] Test quality and coverage

## Troubleshooting Common Issues

### Quality Gate Failures
```bash
# CSS/HTML issues
pnpm lint:css-html:fix

# SonarQube critical issues
pnpm sonar:high:verbose

# TypeScript errors
pnpm type-check

# Test failures
pnpm test:watch
```

### Browser/Testing Issues
```bash
# Playwright browser issues
pnpm playwright:install
pnpm playwright:cache:clean

# Mobile testing issues
pnpm test:mobile:latest
```

### Build Issues
```bash
# Clean rebuild
pnpm clean
pnpm reinstall
pnpm build
```

## Emergency Procedures

### Never Use These Commands
```bash
# ❌ NEVER bypass quality gates
git commit --no-verify
git push --no-verify

# ❌ NEVER disable quality rules
# eslint-disable
# @ts-ignore without justification
```

### Instead, Fix Root Causes
```bash
# ✅ Fix quality issues
pnpm lint:css-html:fix
pnpm sonar:high:verbose

# ✅ Debug and fix tests
pnpm test:watch

# ✅ Fix TypeScript errors
pnpm type-check
```

## Documentation Maintenance

### When to Update Documentation
- Code changes affecting functionality
- New features or components
- Configuration changes
- Test strategy updates
- Performance optimizations
- Accessibility improvements

### Documentation Files to Consider
- `README.md` - Setup and usage
- `TESTING.md` - Test strategy
- `CONTRIBUTING.md` - Development guidelines
- JSDoc comments - API documentation
- Kiro steering documents - Project guidelines

## Continuous Improvement

### Regular Maintenance Tasks
- [ ] Update dependencies monthly
- [ ] Review and optimize bundle size
- [ ] Update browser compatibility
- [ ] Refresh accessibility testing
- [ ] Review security practices
- [ ] Update documentation

### Metrics to Monitor
- Code coverage percentage
- Bundle size trends
- Performance metrics
- Accessibility compliance
- Security vulnerability count
- Code quality scores