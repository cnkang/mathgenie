# 🧪 Testing Guide

## Overview

MathGenie uses a comprehensive testing strategy with an optimized test suite that balances thorough coverage with efficient execution.

## Test Suite Statistics

- **Total E2E Tests**: 595
- **Execution Time**: ~3 minutes
- **Coverage**: 90% code coverage requirement
- **Accessibility**: WCAG 2.2 AAA compliance across all tests

## Test Categories

### 1. Unit & Integration Tests

**Location**: `src/**/*.test.tsx`
**Framework**: Vitest with happy-dom
**Coverage**: 90% minimum threshold

```bash
# Run unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm coverage
```

### 2. End-to-End Tests

**Location**: `tests/e2e/`
**Framework**: Playwright
**Browsers**: Chrome, Firefox, Safari

#### Test Files Structure

- `accessibility-unified.spec.ts` - Comprehensive WCAG 2.2 AAA compliance
- `basic.spec.ts` - Core functionality tests
- `error-handling.spec.ts` - Error validation and recovery
- `integration.spec.ts` - Complex integration scenarios
- `localstorage-persistence.spec.ts` - Data persistence tests
- `presets-functionality.spec.ts` - Settings presets functionality

#### Device Coverage

**Mobile Devices** (Optimized Selection):

- iPhone 12 (390x844) - Light & Dark themes
- Samsung Galaxy S21 (384x854) - Light & Dark themes

**Tablet Devices**:

- iPad (768x1024) - Light & Dark themes
- iPad Pro (1024x1366) - Light & Dark themes

**Desktop**:

- Standard desktop (1280x720) - Light & Dark themes

### 3. Accessibility Testing

**Standard**: WCAG 2.2 AAA compliance
**Tools**: @axe-core/playwright
**Coverage**: All devices, themes, and interaction states

#### Key Accessibility Tests

- Color contrast ratios (7:1 for normal text, 4.5:1 for large text)
- Touch target sizes (minimum 44px)
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Error message accessibility

### 4. Mobile Testing

```bash
# All mobile devices
pnpm test:mobile

# Specific devices
pnpm test:mobile:iphone
pnpm test:mobile:ipad
pnpm test:mobile:android
```

## Test Optimization Strategy

### What Was Optimized

1. **Device Reduction**: Removed iPhone SE (similar to iPhone 12)
2. **Duplicate Removal**: Eliminated redundant basic functionality tests
3. **Theme Optimization**: Maintained dual-theme testing for accessibility compliance
4. **Integration Cleanup**: Removed overlapping integration tests

### What Was Preserved

1. **WCAG 2.2 AAA Compliance**: 100% maintained across all devices
2. **Core Functionality**: Complete coverage of essential features
3. **Error Handling**: Comprehensive validation and recovery testing
4. **Cross-browser Support**: Full compatibility testing

## Running Tests

### Development Workflow

```bash
# Quick validation during development
pnpm test:smoke

# Full validation before commit
pnpm validate

# Interactive debugging
pnpm test:e2e:ui
```

### CI/CD Pipeline

```bash
# CI-optimized test run
pnpm test:e2e:ci

# Specific test suites
pnpm test:e2e:accessibility
pnpm test:e2e:integration
pnpm test:e2e:presets
```

### Debugging Tests

```bash
# Run with browser UI
pnpm test:e2e:headed

# Debug mode with breakpoints
pnpm test:e2e:debug

# View test reports
pnpm test:e2e:report
```

## Test Configuration

### Playwright Configuration

- **Base URL**: `http://localhost:3000`
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries on failure
- **Parallel Workers**: 6 workers for optimal performance

### Coverage Requirements

- **Unit Tests**: 90% minimum coverage
- **E2E Tests**: All critical user paths covered
- **Accessibility**: 100% WCAG 2.2 AAA compliance
- **Cross-browser**: Chrome, Firefox, Safari support

## Best Practices

### Writing Tests

1. **Use Page Object Model**: Centralize selectors in `test-utils.ts`
2. **Wait for Elements**: Always wait for elements to be visible/stable
3. **Accessibility First**: Include accessibility checks in all tests
4. **Mobile Considerations**: Test touch interactions and viewport sizes
5. **Error States**: Test both success and failure scenarios

### Test Maintenance

1. **Regular Review**: Monthly review of test effectiveness
2. **Performance Monitoring**: Track test execution times
3. **Coverage Analysis**: Ensure new features have adequate tests
4. **Accessibility Updates**: Keep up with WCAG guideline changes

## Troubleshooting

### Common Issues

**Flaky Tests**:

- Increase wait times for slow elements
- Use `waitForSelector` instead of fixed timeouts
- Check for race conditions in async operations

**Accessibility Failures**:

- Verify color contrast ratios meet AAA standards
- Ensure all interactive elements have proper ARIA labels
- Test keyboard navigation thoroughly

**Mobile Test Issues**:

- Verify touch target sizes (minimum 44px)
- Test both portrait and landscape orientations
- Check viewport-specific CSS behavior

### Performance Optimization

**Test Execution Speed**:

- Run tests in parallel when possible
- Use `test.describe.configure({ mode: 'parallel' })` for independent tests
- Optimize test setup and teardown

**Resource Usage**:

- Close browser contexts properly
- Clean up test data between runs
- Monitor memory usage during long test runs

## Contributing to Tests

### Adding New Tests

1. **Identify Test Category**: Unit, E2E, or accessibility
2. **Follow Naming Conventions**: Descriptive test names
3. **Include Accessibility**: All E2E tests should include accessibility checks
4. **Test Multiple Devices**: Ensure mobile compatibility
5. **Update Documentation**: Update this guide for significant changes

### Test Review Checklist

- [ ] Tests cover both success and error scenarios
- [ ] Accessibility compliance verified (WCAG 2.2 AAA)
- [ ] Mobile device compatibility tested
- [ ] Cross-browser compatibility verified
- [ ] Performance impact assessed
- [ ] Documentation updated if needed

## Continuous Improvement

The test suite is continuously optimized for:

- **Execution Speed**: Faster feedback for developers
- **Coverage Quality**: Meaningful tests over quantity
- **Accessibility Standards**: Staying current with WCAG guidelines
- **Device Support**: Testing on latest devices and browsers
- **Maintenance Efficiency**: Reducing test maintenance overhead

---

For questions about testing, please refer to the [Contributing Guide](CONTRIBUTING.md) or open an issue.
