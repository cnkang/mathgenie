# MathGenie Development Commands

## Development Commands

### Development Server

```bash
pnpm dev              # Start dev server on port 3000
pnpm preview          # Preview production build on port 4173
```

### Building

```bash
pnpm build            # Optimized production build with tree shaking
pnpm build:fast       # Fast build without optimizations
pnpm build:types      # Generate TypeScript declaration files
```

### Testing (90% Coverage Required)

```bash
pnpm test             # Run unit tests with coverage
pnpm test:watch       # Watch mode for unit tests
pnpm test:unit        # Unit tests with coverage
pnpm test:unit:ci     # Unit tests for CI environment
pnpm test:e2e         # Run E2E tests across browsers (Chromium, Firefox, WebKit)
pnpm test:e2e:ui      # E2E tests with Playwright UI
pnpm test:smoke       # Quick smoke tests
pnpm test:all         # Run all tests (unit + E2E)
```

### Mobile Testing (WCAG 2.2 AAA Compliance)

```bash
pnpm test:mobile      # Test on all mobile devices
pnpm test:mobile:iphone    # iPhone device testing (WebKit engine)
pnpm test:mobile:ipad      # iPad device testing (WebKit engine)
pnpm test:mobile:android   # Android device testing (Chromium engine)
pnpm test:mobile:latest    # Latest devices only
pnpm test:e2e:accessibility # WCAG 2.2 AAA compliance tests (mandatory)
```

### Code Quality (Zero Critical Issues Required)

```bash
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier formatting
pnpm type-check       # TypeScript compilation check
pnpm i18n:check       # Validate i18n translations (all 6 languages)
pnpm validate         # Full validation pipeline (mandatory before commit)
```

### SonarQube Analysis (Critical Issues Must Be Fixed)

```bash
pnpm sonar:high       # HIGH priority issues only (recommended for daily use)
pnpm sonar:check      # Check all SonarQube rules
pnpm sonar:verbose    # Detailed output with rule explanations
pnpm sonar:high:verbose # HIGH priority with detailed output
pnpm sonar:scan       # Full SonarQube scan (CI/CD)
```

### CSS & HTML Quality (Mandatory Pre-commit)

```bash
pnpm lint:css-html:fix # Auto-fix CSS issues and validate HTML (use in pre-commit)
pnpm lint:css-html     # Validation-only quality checks (use in pre-push)
pnpm lint:css:fix      # CSS-specific auto-fixing
pnpm lint:html         # HTML-specific validation
```

### Performance & Quality

```bash
pnpm lighthouse      # Run Lighthouse performance tests
pnpm lighthouse:ci    # CI-friendly Lighthouse tests
```

### Playwright Browser Management

```bash
pnpm playwright:install    # Install all browsers (Chromium, Firefox, WebKit)
pnpm playwright:install:ci # Install browsers for CI
pnpm playwright:check      # Check browser installation status
pnpm playwright:cache:debug # Debug browser cache issues
```

### Utilities

```bash
pnpm clean            # Clean node_modules and build artifacts
pnpm reinstall        # Clean reinstall of dependencies
pnpm deps:check       # Check for outdated dependencies
pnpm analyze          # Bundle analysis
```

### Git Hooks (Mandatory Quality Gates)

```bash
pnpm pre-commit       # Run pre-commit checks (format + lint-staged + quality)
pnpm pre-push         # Run pre-push validation (type-check + i18n + test + build)
```

### Complete Validation Pipeline

```bash
pnpm validate         # Complete validation pipeline (mandatory before commit)
pnpm validate:full    # Full validation with all checks
```

## Security Commands (Command Injection Prevention)

### Secure Command Execution Patterns

```typescript
// ❌ NEVER DO THIS - Vulnerable to injection
const result = execSync(`command ${userInput}`);

// ✅ ALWAYS DO THIS - Secure execution
const result = spawnSync('command', [validatedArg], {
  shell: false,
  timeout: 60000,
  env: buildSafeEnv(),
});
```

### Input Validation Examples

```typescript
// ✅ Secure validation patterns
const validateFilePattern = (input: string): boolean => {
  const allowedPattern = /^[a-zA-Z0-9_\-./]+$/;
  const dangerousPattern = /[;&|`$(){}[\]<>*?~]/;

  return allowedPattern.test(input) && !dangerousPattern.test(input) && input.length <= 200;
};

// ✅ Safe environment handling
const buildSafeEnv = () => ({
  ...process.env,
  LD_PRELOAD: undefined,
  LD_LIBRARY_PATH: undefined,
  DYLD_INSERT_LIBRARIES: undefined,
  DYLD_LIBRARY_PATH: undefined,
});
```

## System Commands (macOS/Darwin)

### File Operations

```bash
ls -la                # List files with details
find . -name "*.ts"   # Find TypeScript files
grep -r "pattern"     # Search for patterns in files
```

### Git Operations

```bash
git status            # Check repository status
git add .             # Stage all changes
git commit -m "msg"   # Commit with message (use conventional format)
git push              # Push to remote
git pull              # Pull from remote
```

### Process Management

```bash
ps aux | grep node    # Find Node.js processes
kill -9 <pid>         # Kill process by PID
lsof -i :3000         # Check what's using port 3000
```

### System Information

```bash
node --version        # Check Node.js version (should be 22.19.1+)
pnpm --version        # Check pnpm version (should be 10.15.1+)
which pnpm            # Find pnpm location
```

## Quality Gate Commands (Must Pass Before Commit)

### Pre-commit Quality Checks (Mandatory Order)

```bash
# 1. Format code
pnpm format

# 2. Fix linting issues
pnpm lint

# 3. Fix CSS/HTML quality issues (auto-fix)
pnpm lint:css-html:fix

# 4. Check for critical code quality issues
pnpm sonar:high

# 5. Verify TypeScript compilation
pnpm type-check

# 6. Validate translations
pnpm i18n:check

# 7. Run unit tests with coverage
pnpm test

# 8. Complete validation pipeline
pnpm validate
```

### Pre-push Validation

```bash
# Final validation before push
pnpm validate:full    # Complete validation pipeline
pnpm build            # Verify production build
pnpm test:e2e:accessibility # WCAG 2.2 AAA compliance
```

## Emergency Commands & Troubleshooting

### Quality Issue Resolution (NEVER Use --no-verify)

```bash
# If quality checks fail, fix the underlying issues:

# For CSS issues
pnpm lint:css:fix

# For HTML issues
pnpm lint:html

# For SonarQube issues (get detailed descriptions)
pnpm sonar:high:verbose

# For TypeScript issues
pnpm type-check

# For test failures
pnpm test:watch  # Debug failing tests

# For translation issues
pnpm i18n:check
```

### Browser Issues

```bash
# If Playwright browsers missing
pnpm playwright:install

# If browser cache issues
# Debug browser problems
pnpm playwright:cache:debug
```

### Build Issues

```bash
# Clean rebuild
pnpm clean
pnpm reinstall
pnpm build

# Dependency issues
pnpm deps:check
pnpm audit
```

### Performance Issues

```bash
# Bundle analysis
pnpm analyze

# Performance testing
pnpm lighthouse
pnpm lighthouse:ci
```

## Development Workflow Commands

### Daily Development Cycle

```bash
# 1. Start development
git pull origin main
pnpm install
pnpm dev

# 2. During development
pnpm type-check      # Real-time TypeScript checking
pnpm test:watch      # Unit tests in watch mode

# 3. Before commit (mandatory)
pnpm validate        # Complete quality pipeline

# 4. Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature-branch
```

### Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Development with quality checks
pnpm dev             # Start dev server
pnpm test:watch      # Run tests in watch mode
pnpm lint            # Fix linting issues as you go

# 3. Pre-commit validation
pnpm validate:full   # Complete validation

# 4. Accessibility testing
pnpm test:e2e:accessibility
pnpm test:mobile

# 5. Performance validation
pnpm lighthouse
pnpm build
```

## CI/CD Commands

### Continuous Integration

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Quality gates
pnpm validate:full
pnpm sonar:scan
pnpm test:e2e
pnpm test:e2e:accessibility
pnpm lighthouse:ci

# Build verification
pnpm build
```

### Deployment Preparation

```bash
# Pre-deployment checks
pnpm validate:full
pnpm build
pnpm test:e2e
pnpm lighthouse:ci

# Security audit
pnpm audit
```

## Debugging Commands

### Test Debugging

```bash
# Debug specific test
pnpm test ComponentName.test.tsx

# Debug E2E tests with UI
pnpm test:e2e:ui

# Debug accessibility tests
pnpm test:e2e:accessibility --debug

# Debug mobile tests
pnpm test:mobile:iphone --debug
```

### Performance Debugging

```bash
# Analyze bundle
pnpm analyze

# Debug performance
pnpm lighthouse --view

# Check Core Web Vitals
pnpm lighthouse:ci
```

### Quality Debugging

```bash
# Detailed SonarQube analysis
pnpm sonar:verbose

# CSS/HTML quality details
pnpm lint:css-html

# TypeScript detailed errors
pnpm type-check --pretty
```

## Security Best Practices Commands

### Security Validation

```bash
# Dependency security audit
pnpm audit

# Check for known vulnerabilities
pnpm audit --audit-level high

# Security-focused linting
pnpm lint --config .eslintrc.security.js
```

### Secure Development

```bash
# Validate inputs before processing
# Use spawnSync with shell: false
# Clean environment variables
# Set process timeouts
# Implement proper error handling
```

## Documentation Commands

### Documentation Maintenance

```bash
# Update documentation after changes
# Check README.md for accuracy
# Update TESTING.md for test changes
# Update JSDoc comments
# Verify code examples work
```

### Documentation Validation

```bash
# Lint markdown files
pnpm lint:md

# Check documentation links
pnpm docs:check-links

# Validate code examples
pnpm docs:validate-examples
```
