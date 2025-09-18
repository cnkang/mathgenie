# MathGenie Testing Strategy & Best Practices

## Testing Philosophy

### Core Principles
- **Behavior over Implementation**: Test what the code does, not how it does it
- **User-Centric Testing**: Focus on user interactions and experiences
- **Accessibility First**: Every test must consider accessibility requirements
- **Cross-Browser Compatibility**: Test across Chromium, Firefox, and WebKit engines
- **Mobile-First**: Test on actual mobile devices and viewports
- **Performance Aware**: Include performance testing in all test suites

## Testing Stack

### Unit Testing
- **Framework**: Vitest with happy-dom environment
- **Coverage**: V8 coverage provider with 90% threshold
- **Environment**: happy-dom for lightweight DOM simulation
- **Mocking**: Vi mocks for external dependencies

### E2E Testing
- **Framework**: Playwright with cross-browser support
- **Browsers**: Chromium, Firefox, WebKit (all three required)
- **Mobile**: iPhone, iPad, Android device emulation
- **Accessibility**: @axe-core/playwright for WCAG 2.2 AAA compliance
- **Performance**: Lighthouse CI integration

### Testing Commands
```bash
# Unit Testing
pnpm test              # Run unit tests with coverage
pnpm test:watch        # Watch mode for development
pnpm test:unit         # Unit tests only
pnpm test:unit:ci      # CI-optimized unit tests

# E2E Testing
pnpm test:e2e          # All browsers (Chromium, Firefox, WebKit)
pnpm test:e2e:ui       # Playwright UI mode
pnpm test:smoke        # Quick smoke tests

# Mobile Testing
pnpm test:mobile       # All mobile devices
pnpm test:mobile:iphone    # iPhone testing (WebKit)
pnpm test:mobile:ipad      # iPad testing (WebKit)
pnpm test:mobile:android   # Android testing (Chromium)

# Accessibility Testing (Critical)
pnpm test:e2e:accessibility # WCAG 2.2 AAA compliance
```

## Unit Testing Standards

### Test Structure
```typescript
// ✅ Good test structure
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup common test state
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should handle user interaction correctly', async () => {
    // Arrange
    const props = { /* test props */ };
    
    // Act
    render(<ComponentName {...props} />);
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Assert
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

### Testing Patterns

#### Component Testing
```typescript
// ✅ Test user interactions
it('should generate problems when form is submitted', async () => {
  render(<ProblemGenerator />);
  
  await user.selectOptions(screen.getByLabelText(/operation/i), 'addition');
  await user.type(screen.getByLabelText(/count/i), '10');
  await user.click(screen.getByRole('button', { name: /generate/i }));
  
  expect(screen.getByText(/10 problems generated/i)).toBeInTheDocument();
});

// ✅ Test accessibility
it('should be accessible to screen readers', () => {
  render(<ComponentName />);
  
  expect(screen.getByRole('button')).toHaveAccessibleName();
  expect(screen.getByLabelText(/input field/i)).toBeInTheDocument();
});
```

#### Hook Testing
```typescript
// ✅ Test custom hooks
import { renderHook, act } from '@testing-library/react';

it('should manage state correctly', () => {
  const { result } = renderHook(() => useCustomHook());
  
  act(() => {
    result.current.updateValue('new value');
  });
  
  expect(result.current.value).toBe('new value');
});
```

#### useEffect Testing
```typescript
// ✅ Test useEffect patterns
it('should cleanup resources on unmount', () => {
  const cleanup = vi.fn();
  const { unmount } = render(<ComponentWithEffect onCleanup={cleanup} />);
  
  unmount();
  
  expect(cleanup).toHaveBeenCalled();
});

// ✅ Test async effects
it('should handle async operations', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ data: 'test' });
  
  render(<AsyncComponent fetch={mockFetch} />);
  
  await waitFor(() => {
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

### Coverage Requirements

#### Mandatory Coverage (90% Threshold)
- **Components**: All React components must have comprehensive tests
- **Hooks**: Custom hooks must test all functionality and edge cases
- **Utilities**: Business logic utilities must be thoroughly tested
- **Services**: API services and data management must be tested
- **State Management**: Context providers and state logic must be tested

#### Coverage Exclusions (Allowed)
- Configuration files (`vite.config.ts`, `eslint.config.ts`)
- Pure TypeScript type files without logic
- Development tools and build scripts
- Test utilities and mock implementations
- Simple index files that only export/import

#### Meaningful Testing Guidelines
```typescript
// ✅ Test business logic and user interactions
it('should calculate math problems correctly', () => {
  const result = generateAdditionProblem(5, 10);
  expect(result.answer).toBe(15);
});

// ❌ Don't test trivial getters
it('should return the value', () => {
  expect(getValue()).toBe(value); // Pointless test
});
```

## E2E Testing Standards

### Browser Engine Requirements
- **Chromium**: Desktop and Android simulation
- **Firefox**: Gecko engine for comprehensive compatibility
- **WebKit**: iOS and Safari simulation

### Mobile Device Testing
```typescript
// ✅ Mobile-specific tests
test.describe('Mobile Navigation', () => {
  test.use({ 
    ...devices['iPhone 13'],
    // Use WebKit for iOS devices
  });

  test('should handle touch interactions', async ({ page }) => {
    await page.goto('/');
    await page.tap('[data-testid="mobile-menu"]');
    await expect(page.locator('.menu-open')).toBeVisible();
  });
});
```

### Accessibility Testing (WCAG 2.2 AAA)
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page);
  });

  test('should meet WCAG 2.2 AAA standards', async ({ page }) => {
    await page.goto('/');
    await checkA11y(page, null, {
      rules: {
        'color-contrast-enhanced': { enabled: true }, // AAA level
      },
    });
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });
});
```

### Cross-Browser Testing
```typescript
// ✅ Test across all browsers
['chromium', 'firefox', 'webkit'].forEach(browserName => {
  test.describe(`${browserName} browser`, () => {
    test.use({ browserName });

    test('should work consistently', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toBeVisible();
    });
  });
});
```

## Performance Testing

### Core Web Vitals
```typescript
test('should meet Core Web Vitals thresholds', async ({ page }) => {
  await page.goto('/');
  
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries);
      }).observe({ entryTypes: ['navigation', 'paint'] });
    });
  });
  
  // Assert performance metrics
  expect(metrics.fcp).toBeLessThan(1500); // First Contentful Paint
  expect(metrics.lcp).toBeLessThan(2500); // Largest Contentful Paint
});
```

### Lighthouse Integration
```bash
# Performance testing commands
pnpm lighthouse      # Run Lighthouse tests
pnpm lighthouse:ci   # CI-friendly Lighthouse tests
```

## Testing Best Practices

### Test Organization
```typescript
// ✅ Organize tests by feature/component
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.css
│   └── ProblemGenerator/
│       ├── ProblemGenerator.tsx
│       ├── ProblemGenerator.test.tsx
│       └── ProblemGenerator.css
```

### Test Data Management
```typescript
// ✅ Use test utilities for common data
import { createMockProblem, createMockUser } from '@/test-utils';

const mockProblem = createMockProblem({
  operation: 'addition',
  operands: [5, 3],
  answer: 8,
});
```

### Async Testing Patterns
```typescript
// ✅ Handle async operations properly
test('should load data asynchronously', async ({ page }) => {
  await page.goto('/');
  
  // Wait for loading to complete
  await page.waitForSelector('[data-testid="loading"]', { state: 'hidden' });
  
  // Assert final state
  await expect(page.locator('[data-testid="content"]')).toBeVisible();
});
```

### Error Testing
```typescript
// ✅ Test error scenarios
test('should handle API errors gracefully', async ({ page }) => {
  await page.route('/api/problems', route => {
    route.fulfill({ status: 500, body: 'Server Error' });
  });
  
  await page.goto('/');
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

## Internationalization Testing

### Multi-Language Testing
```typescript
// ✅ Test with different languages
['en', 'zh', 'es', 'fr', 'de', 'ja'].forEach(lang => {
  test(`should work in ${lang} language`, async ({ page }) => {
    await page.goto(`/?lang=${lang}`);
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Layout Testing with Long Text
```typescript
// ✅ Test with German (longest text)
test('should handle long German text', async ({ page }) => {
  await page.goto('/?lang=de');
  
  // Verify no text overflow
  const buttons = page.locator('button');
  for (const button of await buttons.all()) {
    const box = await button.boundingBox();
    expect(box.width).toBeLessThan(400); // Reasonable max width
  }
});
```

## CI/CD Integration

### GitHub Actions Testing
```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: |
    pnpm test:unit:ci
    pnpm test:e2e
    pnpm test:e2e:accessibility
    pnpm test:mobile
```

### Quality Gates
- Unit tests must pass with 90% coverage
- E2E tests must pass on all browsers
- Accessibility tests must pass WCAG 2.2 AAA
- Mobile tests must pass on all device types
- Performance tests must meet Core Web Vitals thresholds

## Debugging Tests

### Debug Commands
```bash
# Debug unit tests
pnpm test:watch

# Debug E2E tests with UI
pnpm test:e2e:ui

# Debug specific test file
pnpm test Button.test.tsx

# Debug with verbose output
pnpm test --reporter=verbose
```

### Common Issues & Solutions

#### Flaky Tests
```typescript
// ✅ Use proper waits
await page.waitForSelector('[data-testid="element"]');
await page.waitForLoadState('networkidle');

// ✅ Use retry logic for unstable operations
await expect(async () => {
  await page.click('button');
  await expect(page.locator('.result')).toBeVisible();
}).toPass({ timeout: 10000 });
```

#### Memory Leaks
```typescript
// ✅ Cleanup after tests
afterEach(() => {
  cleanup(); // React Testing Library cleanup
  vi.clearAllMocks();
});
```

## Test Maintenance

### Regular Tasks
- [ ] Update test dependencies monthly
- [ ] Review and update test data
- [ ] Optimize slow tests
- [ ] Update browser versions
- [ ] Review coverage reports
- [ ] Update accessibility standards

### Metrics to Monitor
- Test execution time
- Test flakiness rate
- Coverage percentage trends
- Browser compatibility issues
- Accessibility compliance rate