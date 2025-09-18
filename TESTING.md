# 🧪 Testing Guide

## Overview

MathGenie uses a comprehensive testing strategy with an optimized test suite that balances thorough coverage with efficient execution.

## Test Suite Statistics

- **Total E2E Tests**: 595 (optimized from 623)
- **Execution Time**: ~2.6 minutes
- **Coverage**: 90% code coverage requirement
- **Accessibility**: WCAG 2.2 AAA compliance across all tests
- **Cross-browser**: Chrome, Firefox, Safari support

## 🚀 Quick Start

### Recommended Commands for Local Development

```bash
# Fast testing (no coverage, tuned for memory)
pnpm test:unit:fast

# If you see ERR_WORKER_OUT_OF_MEMORY on Node 22, you can temporarily ignore
# the upstream unhandled error while we track a fix in Vitest/tinypool:
pnpm test:unit:fast:ignore-errors

# Development mode (verbose output, suitable for debugging)
pnpm test:unit:dev

# Watch mode (automatically runs when files change)
pnpm test:unit:watch

# Quick validation (runs lint + lint:css-html + type-check + sonar:check + i18n:check + build + playwright:check + tests)
pnpm validate
```

### Complete Testing Commands

```bash
# Full unit tests (with coverage)
pnpm test

# Serial testing (for memory-constrained environments)
pnpm test:unit:serial

# Full validation (same as validate - runs lint + lint:css-html + type-check + sonar:check + i18n:check + build + playwright:check + tests)
pnpm validate:full

# E2E accessibility testing
pnpm test:e2e:accessibility

# Coverage report generation
pnpm test:coverage

# All E2E tests (optimized suite - 595 tests)
pnpm test:e2e

# Smoke tests (essential functionality)
pnpm test:smoke

# E2E with UI (interactive debugging)
pnpm test:e2e:ui

# Advanced code quality analysis
pnpm sonar:high              # HIGH priority issues only
pnpm sonar:verbose           # Detailed output with rule explanations
pnpm sonar:high:verbose      # HIGH priority with detailed output
```

## ⚙️ Test Configuration Optimization

### Memory Optimization

- **Development Environment**: 4GB memory limit, suitable for daily development
- **CI Environment**: 6GB memory limit, suitable for complete testing
- **Constrained Environment**: 3GB memory limit, minimal configuration

### Concurrency Strategy

- **Forks Pool**: Provides best isolation, avoids interference between tests
- **Threads Pool**: Faster but less isolation, suitable for CI
- **Serial Mode**: Most stable but slowest, suitable for debugging

### Recommended Workflow

#### Daily Development

```bash
# 1. Quick check
pnpm test:unit:fast

# 2. Detailed debugging (if there are failures)
pnpm test:unit:dev

# 3. Watch mode (continuous development)
pnpm test:unit:watch
```

#### Pre-commit Checks

```bash
# Quick validation
pnpm validate

# If there are issues, run full validation
pnpm validate:full
```

## 🔧 Troubleshooting

### Out of Memory (OOM)

```bash
# Prefer the memory‑tuned runner
pnpm test:unit:fast

# Or use serial mode for maximum stability
pnpm test:unit:serial

# For stubborn cases on Node 22, temporarily ignore unhandled errors
pnpm test:unit:fast:ignore-errors

# Alternatively, use Node 20.x LTS for fully stable runs
```

### Test Isolation Issues

```bash
# Use forks pool for better isolation
pnpm test:unit:dev

# Or completely serial
pnpm test:unit:serial
```

### Specific Test Debugging

```bash
# Run single test file
pnpm test:unit src/components/ComponentName.test.tsx

# Use verbose output
pnpm test:unit:dev src/components/ComponentName.test.tsx
```

## 📊 Performance Comparison

| Command            | Speed  | Memory Usage | Isolation | Use Case        |
| ------------------ | ------ | ------------ | --------- | --------------- |
| `test:unit:fast`   | ⚡⚡⚡ | Medium       | High      | Daily dev       |
| `test:unit:dev`    | ⚡⚡   | Medium       | High      | Test debugging  |
| `test:unit:watch`  | ⚡⚡⚡ | Low          | High      | Continuous dev  |
| `test:unit`        | ⚡     | High         | High      | Full validation |
| `test:unit:serial` | ⚡     | Lowest       | Highest   | Stability first |

## 🎯 Best Practices

### During Development

1. Use `pnpm test:unit:fast` for quick feedback
2. Use `pnpm test:unit:watch` for continuous development
3. Use `pnpm test:unit:dev` for detailed information when encountering issues
4. **Write tests first** for new components to ensure coverage
5. **Test accessibility** during development, not as an afterthought
6. **Use MessageState objects** for new error/warning/success messages instead of strings

### Before Committing

1. Run `pnpm validate` for quick checks
2. If there are issues, run `pnpm validate:full` for complete validation
3. **Verify 90% coverage** with `pnpm test:coverage`
4. **Check accessibility** with `pnpm test:e2e:accessibility`
5. **Manual accessibility check** with keyboard navigation

### CI/CD

1. Use `pnpm test:unit:ci` for optimal CI performance
2. Use `pnpm test:unit:serial` in resource-constrained environments
3. **Monitor coverage trends** to prevent regression
4. **Track accessibility metrics** across releases

### Writing Effective Tests

#### Coverage Best Practices

- **Test Behavior**: Focus on user-facing functionality
- **Edge Cases**: Test boundary conditions and error states
- **Integration**: Test component interactions
- **Accessibility**: Include accessibility assertions in component tests

#### Accessibility Test Patterns

```typescript
// Example accessibility test
test('should be accessible to screen readers', async () => {
  render(<Component />);

  // Check ARIA labels
  expect(screen.getByLabelText('Submit form')).toBeInTheDocument();

  // Verify keyboard navigation
  await user.tab();
  expect(screen.getByRole('button')).toHaveFocus();

  // Run axe accessibility tests
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### Message System Test Patterns

```typescript
// Testing MessageState objects (new approach)
test('should handle error messages with translation keys', () => {
  const mockSetError = vi.fn();

  // Test MessageState object
  mockSetError({ key: 'errors.validation.required', params: { field: 'name' } });
  expect(mockSetError).toHaveBeenCalledWith({
    key: 'errors.validation.required',
    params: { field: 'name' },
  });

  // Test clearing messages
  mockSetError({ key: '' });
  expect(mockSetError).toHaveBeenCalledWith({ key: '' });
});

// Testing legacy string support
test('should support legacy string messages', () => {
  const mockSetError = vi.fn();

  // Legacy string support
  mockSetError('Legacy error message');
  expect(mockSetError).toHaveBeenCalledWith('Legacy error message');
});
```

## 📋 Test Categories

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
pnpm test:coverage
```

#### Hook Testing Patterns

MathGenie uses a balanced hook architecture that requires specific testing approaches:

**Simplified Hook Testing (for focused hooks like `useProblemGenerator`)**:

```typescript
describe('useProblemGenerator', () => {
  test('should generate problems and return success message', () => {
    const validateSettings = vi.fn(() => '');
    const { result } = renderHook(() => useProblemGenerator(settings, false, validateSettings));

    let messages: ReturnType<typeof result.current.generateProblems>;

    act(() => {
      messages = result.current.generateProblems();
    });

    expect(result.current.problems).toHaveLength(2);
    expect(messages.successMessage).toEqual({
      key: 'messages.success.problemsGenerated',
      params: { count: 2 },
    });
  });

  test('should handle validation errors', () => {
    const validateSettings = vi.fn(() => 'errors.noOperations');
    const { result } = renderHook(() => useProblemGenerator(settings, false, validateSettings));

    let messages: ReturnType<typeof result.current.generateProblems>;

    act(() => {
      messages = result.current.generateProblems();
    });

    expect(messages.error).toEqual({ key: 'errors.noOperations' });
  });

  test('should prevent generation during loading state', () => {
    const validateSettings = vi.fn(() => '');
    const { result } = renderHook(() => useProblemGenerator(settings, true, validateSettings)); // isLoading = true

    let messages: ReturnType<typeof result.current.generateProblems>;

    act(() => {
      messages = result.current.generateProblems();
    });

    expect(messages).toEqual({ error: '', warning: '', successMessage: '' });
    expect(validateSettings).not.toHaveBeenCalled();
  });
});
```

**Composable Hook Testing (for complex multi-concern hooks)**:

```typescript
// Test helper hooks indirectly through main hooks
describe('useAppHandlers', () => {
  test('should handle validation feedback correctly', () => {
    // Test the composed behavior of useValidationFeedback
    const { result } = renderHook(() => useAppHandlers(...));

    act(() => {
      result.current.handleChange('numProblems', invalidValue);
    });

    expect(mockSetError).toHaveBeenCalledWith({ key: 'validation.error' });
  });

  test('should skip validation during loading', () => {
    // Test the composed behavior of useFieldValidation
    const { result } = renderHook(() => useAppHandlers(..., true)); // isLoading

    act(() => {
      result.current.handleChange('numProblems', value);
    });

    expect(mockValidateSettings).not.toHaveBeenCalled();
  });

  test('should handle settings changes with proper validation', () => {
    // Test the composed behavior of useSettingsChangeHandler
    const { result } = renderHook(() => useAppHandlers(...));

    act(() => {
      result.current.handleChange('operations', ['+', '-']);
    });

    expect(mockSetSettings).toHaveBeenCalledWith(
      expect.objectContaining({ operations: ['+', '-'] })
    );
    expect(mockClearMessages).toHaveBeenCalled();
  });

  test('should handle preset application with success message', () => {
    // Test the composed behavior of usePresetHandler
    const { result } = renderHook(() => useAppHandlers(...));
    const presetSettings = { operations: ['*'], numProblems: 10 };

    act(() => {
      result.current.handleApplyPreset(presetSettings);
    });

    expect(mockSetSettings).toHaveBeenCalledWith(presetSettings);
    expect(mockSetSuccessMessage).toHaveBeenCalledWith({
      key: 'messages.info.presetApplied',
      params: { name: 'Preset' }
    });
  });

  test('should not show success message during loading state', () => {
    // Test loading state handling in preset application
    const { result } = renderHook(() => useAppHandlers(..., true)); // isLoading
    const presetSettings = { operations: ['*'], numProblems: 10 };

    act(() => {
      result.current.handleApplyPreset(presetSettings);
    });

    expect(mockSetSettings).toHaveBeenCalledWith(presetSettings);
    expect(mockSetSuccessMessage).not.toHaveBeenCalled();
  });
});
```

**Key Testing Principles**:

**For Simplified Hooks (like `useProblemGenerator`)**:

- Test the main functionality through the hook's public API (`generateProblems`)
- Verify loading state handling prevents unnecessary operations
- Test validation error handling and message generation
- Test auto-regeneration behavior through useEffect
- Ensure proper state management and callback memoization

**For Composable Hooks (like `useAppHandlers`)**:

- Test composed behavior through public APIs (handleChange, handleApplyPreset)
- Verify loading state handling in validation and preset hooks
- Test error and warning message generation with MessageState objects
- Test settings change handling with proper validation flow
- Test preset application with success messaging
- Ensure proper callback dependencies and memoization
- Verify message clearing behavior in all scenarios

**Common Testing Patterns**:

- Always test both success and error scenarios
- Verify loading state handling across all hook types
- Test MessageState object generation for internationalization
- Ensure proper cleanup and state management
- Test callback dependencies and memoization behavior

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

- iPhone 16 Pro (393x852) - Light & Dark themes
- Samsung Galaxy S24 (384x854) - Light & Dark themes
- Galaxy Tab S9 Landscape (1024x600) - Light & Dark themes

**Tablet Devices**:

- Large iPad Landscape (1366x1024) - Light & Dark themes
- iPad Pro (1024x1366) - Light & Dark themes

**Desktop**:

- Standard desktop (1280x720) - Light & Dark themes

### 3. Mobile Testing Commands

```bash
# All mobile devices
pnpm test:mobile

# iPhone tests
pnpm test:mobile:iphone
pnpm test:mobile:iphone16    # iPhone 16 series
pnpm test:mobile:iphone15    # iPhone 15 series

# iPad tests
pnpm test:mobile:ipad
pnpm test:mobile:portrait    # Portrait orientation
pnpm test:mobile:landscape   # Landscape orientation

# Android tests
pnpm test:mobile:android

# Latest devices only
pnpm test:mobile:latest

# Enhanced E2E mobile tests
pnpm test:mobile:e2e
```

### 4. Supported Mobile Devices

**iPhone Models:**

- iPhone 16 Pro Max, iPhone 16 Pro, iPhone 16
- iPhone 15 Pro Max, iPhone 15 Pro, iPhone 15
- iPhone 14 Pro Max, iPhone 14 Pro
- iPhone 13 Pro

**iPad Models:**

- Large iPad (custom 1366x1024) - Portrait & Landscape
- iPad Pro 11" (2024) - Portrait & Landscape
- iPad Air (2024) - Portrait & Landscape
- iPad (2024) - Portrait & Landscape

**Android Models:**

- Samsung Galaxy S24, Galaxy S23
- Galaxy Tab S9 Landscape

## 📈 Coverage Requirements

### Mandatory Coverage Standards

- **Minimum Coverage**: 90% for all source files
- **Changed Lines**: 80% coverage required for new/modified code
- **Critical Components**: 95% coverage for core functionality
- **Utilities**: 100% coverage for utility functions

### Coverage Commands

```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
pnpm test:coverage:open

# Coverage for specific files
pnpm test:coverage src/components/ComponentName.test.tsx

# Watch mode with coverage
pnpm test:watch
```

### Coverage Exclusions

- Configuration files (`*.config.ts`, `vite.config.ts`)
- Type definition files (`*.d.ts`)
- Test files (`*.test.tsx`, `*.spec.ts`)
- Build scripts and development utilities

## ♿ Accessibility Testing (WCAG 2.2 AAA)

### Mandatory Accessibility Standards

- **WCAG 2.2 AAA Compliance**: All components must meet AAA standards
- **Color Contrast**: Minimum 7:1 ratio for normal text, 4.5:1 for large text
- **Touch Targets**: Minimum 44×44px for all interactive elements
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader**: Complete compatibility with assistive technologies

### Accessibility Testing Commands

```bash
# Run accessibility tests
pnpm test:e2e:accessibility

# Accessibility tests on multiple browsers
pnpm test:accessibility:cross-browser

# Mobile accessibility testing
pnpm test:accessibility:mobile
```

### Accessibility Test Requirements

#### Automated Testing

- **axe-core**: Run with WCAG 2.2 AAA rules on Chromium, Firefox (with performance optimizations), WebKit
- **Color Contrast**: Automated contrast ratio testing across all engines
- **Keyboard Navigation**: Automated keyboard accessibility testing with Firefox-specific optimizations
- **Screen Reader**: Test with screen reader simulation on all engines with enhanced Firefox performance
- **Firefox Performance**: Specialized WCAG enforcement optimizations including batched processing, reduced DOM queries, and optimized mutation observation

#### Manual Testing Checklist

- [ ] **Keyboard Only**: Complete navigation using only keyboard
- [ ] **Screen Reader**: Test with NVDA, JAWS, VoiceOver (Firefox optimized for better performance)
- [ ] **High Contrast**: Verify functionality in high contrast mode
- [ ] **200% Zoom**: Test at 200% zoom level without horizontal scrolling
- [ ] **Reduced Motion**: Test with reduced motion preferences
- [ ] **Touch Targets**: Verify 44px minimum on mobile devices (Firefox-optimized enforcement)
- [ ] **Focus Indicators**: Visible focus indicators with 3:1 contrast
- [ ] **Color Independence**: Information not conveyed by color alone
- [ ] **Firefox Performance**: Verify accessibility features work smoothly in Firefox with optimized processing

#### Mobile Accessibility

- **Touch Targets**: Verify 44px minimum on all devices
- **Orientation**: Test both portrait and landscape
- **Voice Control**: Test with voice control features
- **Mobile Screen Readers**: Test with iOS VoiceOver and Android TalkBack

### Accessibility Validation Process

1. **Component Level**: Each component must pass accessibility tests
2. **Integration Level**: Full user flows must be accessible
3. **Cross-Browser**: Test on Chromium, Firefox (with performance optimizations), and WebKit engines
4. **Mobile Testing**: Verify on iPhone, iPad, and Android devices
5. **Assistive Technology**: Test with actual screen readers

### Firefox Accessibility Optimizations

MathGenie includes specialized optimizations for Firefox to ensure optimal accessibility performance:

#### Performance Enhancements

- **Batched Processing**: Elements are processed in smaller batches (10 vs 25) for Firefox to prevent UI blocking
- **Optimized DOM Queries**: Simplified selectors reduce query complexity in Firefox
- **Enhanced Debouncing**: Longer debounce delays (500ms resize, 200ms mutation) for better Firefox performance
- **Reduced Mutation Observation**: Limited observation scope to improve Firefox responsiveness
- **Cached Style Calculations**: Computed styles are cached to minimize repeated calculations

#### Implementation Details

- **Browser Detection**: Automatic Firefox detection using `navigator.userAgent`
- **Conditional Processing**: Different processing strategies based on browser and element count
- **Memory Optimization**: `getBoundingClientRect()` used for better Firefox performance
- **Scheduling Strategy**: `requestAnimationFrame` for Firefox vs `setTimeout` for other browsers

#### Testing Firefox Optimizations

```bash
# Test accessibility specifically in Firefox
pnpm test:e2e:accessibility --project=firefox

# Verify Firefox-specific performance
pnpm test:e2e --grep "Firefox" --project=firefox
```

#### Monitoring Firefox Performance

The WCAG enforcement system logs Firefox-specific metrics in development mode:

```javascript
// Development console output example
WCAG Enforcement: Applied 44px minimum touch targets to 25 elements (Firefox optimized: true)
```

## 🔍 Test Architecture

### Test Isolation

- Use **forks pool** to ensure complete isolation between tests
- Each test file runs in an independent process
- Avoid global state pollution

### Mock Strategy

- Unified mocking of i18n system
- Complete isolation of external dependencies
- Precise component-level mocking

### Memory Management

- Dynamic memory limit adjustment
- Process-level garbage collection
- Resource cleanup after test completion

## 🔧 Test Configuration

### Playwright Configuration

- **Base URL**: `http://localhost:4173` (preview server)
- **Test Timeout**: 120 seconds per test (increased for complex accessibility tests)
- **Expect Timeout**: 20 seconds for assertions (increased for CI stability)
- **Server Timeout**: 180 seconds for webServer startup (increased for CI stability)
- **Retries**: 2 retries on failure
- **Parallel Workers**: 6 workers for optimal performance
- **Browser Engines**: Chromium, Firefox, WebKit

### Advanced Code Quality Analysis

The advanced Sonar checker provides static analysis focusing on maintainability metrics:

#### Supported HIGH Priority Rules

- **typescript:S3776**: Cognitive Complexity (max: 15)
- **typescript:S138**: Function Length (max: 50 lines)
- **typescript:S107**: Parameter Count (max: 7 parameters)
- **typescript:S3800**: Return Statements (max: 3)
- **typescript:S134**: Nesting Level (max: 3 levels)
- **typescript:S1067**: Expression Complexity (max: 3 operators)
- **typescript:S1871**: Identical Expressions detection

#### Usage Examples

```bash
# Quick HIGH priority check (recommended for daily use)
pnpm sonar:high

# Comprehensive check (all rules)
pnpm sonar:check

# Detailed HIGH priority analysis
pnpm sonar:high:verbose

# Detailed analysis of all rules
pnpm sonar:verbose
```

#### Documentation

For detailed usage and integration patterns, see [SonarQube Commands Guide](docs/SONAR_COMMANDS.md).

#### Implementation

The SonarQube checker is implemented in `scripts/sonar-check.ts` and provides:

- **Static Analysis**: Analyzes TypeScript/TSX files for quality issues
- **Priority Filtering**: Focus on HIGH priority issues with `--high` flag
- **Detailed Output**: Verbose reporting with `--verbose` flag
- **ESLint Integration**: Checks for unused variables and other ESLint rules
- **File Grouping**: Organizes results by file for easy navigation

### Message System Testing

#### MessageValue Type Testing

The application uses a sophisticated message system that supports both legacy strings and new `MessageState` objects:

```typescript
// MessageValue type definition
export type MessageValue = string | MessageState;

export interface MessageState {
  key: string; // Translation key
  params?: Record<string, string | number>; // Optional parameters
}
```

#### Testing Message Handlers

When testing components that use the message system, ensure tests cover both formats:

```typescript
// Test MessageState objects (recommended approach)
expect(mockSetError).toHaveBeenCalledWith({
  key: 'errors.validation.invalidRange',
  params: { min: 1, max: 100 },
});

// Test clearing messages
expect(mockSetError).toHaveBeenCalledWith({ key: '' });
expect(mockSetWarning).toHaveBeenCalledWith({ key: '' });

// Test legacy string support (backward compatibility)
expect(mockSetError).toHaveBeenCalledWith('Legacy error message');
```

#### Internationalization Testing Requirements

- **Translation Key Validation**: Verify all message keys exist in translation files
- **Parameter Interpolation**: Test dynamic parameter substitution
- **Fallback Behavior**: Ensure graceful handling of missing translations
- **Type Safety**: Verify TypeScript compliance for message objects

#### Migration Guide for Existing Tests

When updating tests that use the message system, change from string expectations to MessageState objects:

```typescript
// ❌ Old approach (will fail)
expect(mockSetError).toHaveBeenCalledWith('');
expect(mockSetWarning).toHaveBeenCalledWith('');

// ✅ New approach (correct)
expect(mockSetError).toHaveBeenCalledWith({ key: '' });
expect(mockSetWarning).toHaveBeenCalledWith({ key: '' });

// ✅ For messages with content
expect(mockSetError).toHaveBeenCalledWith({
  key: 'errors.validation.required',
  params: { field: 'name' },
});
```

#### Testing Data Validation Patterns

When testing components that handle data validation (like settings), ensure comprehensive coverage:

```typescript
// Test valid data handling
test('should handle valid settings data', () => {
  const validSettings = { operations: ['+', '-'], numProblems: 20 };
  const result = validateAndMergeSettings(validSettings);
  expect(result.operations).toEqual(['+', '-']);
});

// Test invalid data recovery
test('should recover from invalid array data', () => {
  const invalidSettings = { operations: 'not-an-array' };
  const result = validateAndMergeSettings(invalidSettings);
  expect(result.operations).toEqual(defaultSettings.operations);
});

// Test localStorage error recovery
test('should handle localStorage corruption gracefully', () => {
  localStorage.setItem('test-key', 'invalid-json{');
  const result = loadSettings();
  expect(result).toEqual(defaultSettings);
  expect(localStorage.getItem('test-key')).toBeNull(); // Should be cleared
});

// Test type guard functions
test('should validate arrays correctly', () => {
  expect(isValidArray([1, 2, 3])).toBe(true);
  expect(isValidArray([1, 2], 2)).toBe(true);
  expect(isValidArray([1, 2], 3)).toBe(false);
  expect(isValidArray('not-array')).toBe(false);
});

// Test operation-specific validation
test('should validate operation arrays correctly', () => {
  expect(isValidOperationArray(['+', '-'])).toBe(true);
  expect(isValidOperationArray(['×', '÷'])).toBe(true);
  expect(isValidOperationArray(['*', '/'])).toBe(true);
  expect(isValidOperationArray(['invalid'])).toBe(false);
  expect(isValidOperationArray('not-array')).toBe(false);
  expect(isValidOperationArray(['+', 123])).toBe(false);
});
```

### Test Optimization Strategy

#### What Was Optimized

1. **Test Count Reduction**: Optimized from 623 to 595 tests (~7% faster execution)
2. **Device Selection**: Focus on latest iPhone and iPad models
3. **Duplicate Removal**: Eliminated redundant basic functionality tests
4. **Theme Optimization**: Maintained dual-theme testing for accessibility compliance
5. **Integration Cleanup**: Removed overlapping integration tests

#### What Was Preserved

1. **WCAG 2.2 AAA Compliance**: 100% maintained across all devices
2. **Core Functionality**: Complete coverage of essential features
3. **Error Handling**: Comprehensive validation and recovery testing
4. **Cross-browser Support**: Full compatibility testing
5. **Mobile Coverage**: Essential iPhone, iPad, and Android testing

## 🎮 Running Tests

### Development Workflow

```bash
# Quick validation during development
pnpm test:smoke

# Full validation before commit
pnpm validate

# Interactive debugging
pnpm test:e2e:ui

# Run with browser UI
pnpm test:e2e:headed

# Debug mode with breakpoints
pnpm test:e2e:debug

# View test reports
pnpm test:e2e:report
```

### CI/CD Pipeline

```bash
# CI-optimized test run
pnpm test:e2e:ci

# Specific test suites
pnpm test:e2e:accessibility    # WCAG 2.2 AAA compliance tests
pnpm test:e2e:integration      # Complex integration scenarios
pnpm test:e2e:presets          # Settings presets functionality
pnpm test:e2e:localstorage     # Data persistence tests
pnpm test:e2e:error-handling   # Error handling and validation
```

## 🚨 Quality Gates

### Pre-Commit Requirements

- [ ] **Coverage**: Minimum 90% overall, 80% for changed lines
- [ ] **Accessibility**: All axe-core tests pass with WCAG 2.2 AAA rules
- [ ] **Unit Tests**: All unit tests pass
- [ ] **Type Checking**: TypeScript compilation successful
- [ ] **Linting**: ESLint passes with zero errors

### CI/CD Requirements

- [ ] **Cross-Browser Testing**: Tests pass on Chromium, Firefox, WebKit
- [ ] **Mobile Testing**: Accessibility tests pass on mobile devices
- [ ] **Performance**: No significant performance regression
- [ ] **Coverage Regression**: Coverage cannot decrease
- [ ] **Accessibility Regression**: No new accessibility violations

### Failure Handling

- **Coverage Below 90%**: Build fails, must add tests
- **Accessibility Violations**: Build fails, must fix violations
- **Test Failures**: Build fails, must fix failing tests
- **Performance Regression**: Warning, review required

## 🛠️ Best Practices for Writing Tests

### Test Development Guidelines

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

## 🔍 Troubleshooting Common Issues

### Flaky Tests

- Increase wait times for slow elements
- Use `waitForSelector` instead of fixed timeouts
- Check for race conditions in async operations

### Accessibility Failures

- Verify color contrast ratios meet AAA standards (7:1 for normal text)
- Ensure all interactive elements have proper ARIA labels
- Test keyboard navigation thoroughly
- Check touch target sizes (minimum 44px)

### Mobile Test Issues

- Verify touch target sizes (minimum 44px)
- Test both portrait and landscape orientations
- Check viewport-specific CSS behavior
- Test with actual mobile devices when possible

### Performance Optimization

**Test Execution Speed**:

- Run tests in parallel when possible
- Use `test.describe.configure({ mode: 'parallel' })` for independent tests
- Optimize test setup and teardown

**Resource Usage**:

- Close browser contexts properly
- Clean up test data between runs
- Monitor memory usage during long test runs

## 🤝 Contributing to Tests

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

## 🔄 Continuous Improvement

The test suite is continuously optimized for:

- **Execution Speed**: Faster feedback for developers (~2.6min execution)
- **Coverage Quality**: Meaningful tests over quantity (595 optimized tests)
- **Accessibility Standards**: Staying current with WCAG 2.2 AAA guidelines
- **Device Support**: Testing on latest devices and browsers
- **Maintenance Efficiency**: Reducing test maintenance overhead
