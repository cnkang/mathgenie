# MathGenie Performance Optimization Guide

## Performance Philosophy

### Core Principles
- **User-Centric Metrics**: Focus on Core Web Vitals and user experience
- **Mobile-First Performance**: Optimize for mobile devices and slow networks
- **Accessibility Performance**: Ensure performance optimizations don't compromise accessibility
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Sustainable Performance**: Balance performance with maintainability

## Performance Targets

### Core Web Vitals (Required)
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Interaction to Next Paint (INP)**: < 200ms

### Additional Metrics
- **Time to Interactive (TTI)**: < 3.5s
- **Total Blocking Time (TBT)**: < 300ms
- **Speed Index**: < 2.5s
- **Bundle Size**: < 500KB gzipped

## React 19 Performance Optimizations

### Concurrent Features
```typescript
// ✅ Use useTransition for non-urgent updates
import { useTransition, startTransition } from 'react';

function ProblemGenerator() {
  const [isPending, startTransition] = useTransition();
  
  const handleGenerate = () => {
    startTransition(() => {
      // Non-urgent state update
      setProblems(generateProblems(count));
    });
  };
  
  return (
    <button onClick={handleGenerate} disabled={isPending}>
      {isPending ? 'Generating...' : 'Generate Problems'}
    </button>
  );
}
```

```typescript
// ✅ Use useDeferredValue for expensive computations
import { useDeferredValue, useMemo } from 'react';

function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  
  const results = useMemo(() => {
    return expensiveSearch(deferredQuery);
  }, [deferredQuery]);
  
  return <ResultsList results={results} />;
}
```

```typescript
// ✅ Use useOptimistic for immediate UI feedback
import { useOptimistic } from 'react';

function ProblemList({ problems, onDelete }) {
  const [optimisticProblems, addOptimistic] = useOptimistic(
    problems,
    (state, deletedId) => state.filter(p => p.id !== deletedId)
  );
  
  const handleDelete = (id) => {
    addOptimistic(id);
    onDelete(id); // Actual deletion
  };
  
  return (
    <ul>
      {optimisticProblems.map(problem => (
        <ProblemItem key={problem.id} problem={problem} onDelete={handleDelete} />
      ))}
    </ul>
  );
}
```

### Memoization Strategies
```typescript
// ✅ Strategic memoization
const MathProblem = memo(({ problem, onSolve }) => {
  const handleSolve = useCallback((answer) => {
    onSolve(problem.id, answer);
  }, [problem.id, onSolve]);
  
  return (
    <div>
      <span>{problem.expression}</span>
      <input onChange={(e) => handleSolve(e.target.value)} />
    </div>
  );
});

// ✅ Expensive computation memoization
const ProblemStats = ({ problems }) => {
  const stats = useMemo(() => {
    return calculateComplexStats(problems);
  }, [problems]);
  
  return <StatsDisplay stats={stats} />;
};
```

## Bundle Optimization

### Code Splitting Strategy
```typescript
// ✅ Route-based code splitting
const ProblemGenerator = lazy(() => import('@/components/ProblemGenerator'));
const QuizMode = lazy(() => import('@/components/QuizMode'));
const Settings = lazy(() => import('@/components/Settings'));

// ✅ Feature-based code splitting
const PDFExport = lazy(() => import('@/components/PDFExport'));
```

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'pdf-vendor': ['jspdf'],
          'analytics-vendor': ['@vercel/speed-insights', 'web-vitals'],
          
          // Feature chunks
          'i18n': ['@/i18n/translations/en', '@/i18n/translations/zh'],
          'utils': ['@/utils/mathGenerator', '@/utils/validation'],
        },
      },
    },
    
    // Compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

### Dynamic Imports
```typescript
// ✅ Dynamic translation loading
const loadTranslation = async (language: string) => {
  const translation = await import(`@/i18n/translations/${language}`);
  return translation.default;
};

// ✅ Dynamic utility loading
const loadMathUtils = async () => {
  const { generateProblems } = await import('@/utils/mathGenerator');
  return generateProblems;
};
```

## Image and Asset Optimization

### Image Optimization
```typescript
// ✅ Responsive images with proper sizing
<img
  src="/images/logo.webp"
  srcSet="/images/logo-320.webp 320w, /images/logo-640.webp 640w"
  sizes="(max-width: 320px) 280px, 320px"
  alt="MathGenie Logo"
  loading="lazy"
  decoding="async"
/>
```

### Asset Loading Strategy
```typescript
// ✅ Preload critical resources
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/api/problems" as="fetch" crossorigin />

// ✅ Prefetch non-critical resources
<link rel="prefetch" href="/components/Settings" />
```

## Network Performance

### API Optimization
```typescript
// ✅ Request batching
const useBatchedRequests = () => {
  const [batch, setBatch] = useState([]);
  
  const addToBatch = useCallback((request) => {
    setBatch(prev => [...prev, request]);
  }, []);
  
  useEffect(() => {
    if (batch.length > 0) {
      const timer = setTimeout(() => {
        processBatch(batch);
        setBatch([]);
      }, 100); // Batch requests for 100ms
      
      return () => clearTimeout(timer);
    }
  }, [batch]);
  
  return { addToBatch };
};
```

### Caching Strategy
```typescript
// ✅ Service Worker caching
// sw.js
const CACHE_NAME = 'mathgenie-v1';
const STATIC_ASSETS = ['/index.html', '/manifest.json'];

self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document') {
    // Network first for HTML
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first for assets
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

## Memory Management

### Memory Leak Prevention
```typescript
// ✅ Proper cleanup in useEffect
useEffect(() => {
  const controller = new AbortController();
  const timer = setInterval(() => updateTime(), 1000);
  
  fetchData({ signal: controller.signal })
    .then(setData)
    .catch(error => {
      if (error.name !== 'AbortError') {
        setError(error);
      }
    });
  
  return () => {
    controller.abort();
    clearInterval(timer);
  };
}, []);
```

### Large Dataset Handling
```typescript
// ✅ Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const ProblemList = ({ problems }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ProblemItem problem={problems[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={problems.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

## CSS Performance

### Critical CSS
```css
/* ✅ Critical above-the-fold styles */
.header {
  display: flex;
  align-items: center;
  height: 64px;
  background: var(--primary-color);
}

.main-content {
  min-height: calc(100vh - 64px);
  padding: 1rem;
}
```

### CSS Optimization
```css
/* ✅ Efficient selectors */
.problem-card { /* Class selector - fast */ }
#main-header { /* ID selector - fastest */ }

/* ❌ Avoid expensive selectors */
div > p + span { /* Complex selector - slow */ }
[data-attribute*="value"] { /* Attribute selector - slow */ }
```

### Animation Performance
```css
/* ✅ Use transform and opacity for animations */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ✅ Use will-change for complex animations */
.complex-animation {
  will-change: transform;
}

.complex-animation.animating {
  animation: complexMove 2s ease-in-out;
}

.complex-animation:not(.animating) {
  will-change: auto; /* Remove when not animating */
}
```

## Performance Monitoring

### Real User Monitoring
```typescript
// ✅ Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric) => {
  // Send to your analytics service
  analytics.track('web-vital', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
  });
};

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Performance API
```typescript
// ✅ Custom performance measurements
const measureFeature = (name: string, fn: () => void) => {
  performance.mark(`${name}-start`);
  fn();
  performance.mark(`${name}-end`);
  performance.measure(name, `${name}-start`, `${name}-end`);
  
  const measure = performance.getEntriesByName(name)[0];
  console.log(`${name} took ${measure.duration}ms`);
};

// Usage
measureFeature('problem-generation', () => {
  generateProblems(100);
});
```

## Performance Testing

### Lighthouse CI
```yaml
# lighthouserc.yml
ci:
  collect:
    numberOfRuns: 3
    settings:
      chromeFlags: '--no-sandbox --headless'
  assert:
    assertions:
      first-contentful-paint: ['error', { maxNumericValue: 1500 }]
      largest-contentful-paint: ['error', { maxNumericValue: 2500 }]
      cumulative-layout-shift: ['error', { maxNumericValue: 0.1 }]
      first-input-delay: ['error', { maxNumericValue: 100 }]
  upload:
    target: temporary-public-storage
```

### Performance Tests
```typescript
// ✅ Performance regression tests
test('should generate problems within performance budget', async () => {
  const start = performance.now();
  
  const problems = generateProblems(1000);
  
  const end = performance.now();
  const duration = end - start;
  
  expect(duration).toBeLessThan(100); // 100ms budget
  expect(problems).toHaveLength(1000);
});
```

## Mobile Performance

### Touch Performance
```typescript
// ✅ Optimize touch interactions
const handleTouchStart = useCallback((e) => {
  // Prevent 300ms click delay
  e.preventDefault();
  handleClick();
}, [handleClick]);

return (
  <button
    onTouchStart={handleTouchStart}
    onClick={handleClick}
    style={{ touchAction: 'manipulation' }}
  >
    Generate
  </button>
);
```

### Viewport Optimization
```html
<!-- ✅ Optimal viewport settings -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## Performance Debugging

### Performance DevTools
```typescript
// ✅ Performance profiling
const ProfiledComponent = ({ children }) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      performance.mark('component-render-start');
      
      return () => {
        performance.mark('component-render-end');
        performance.measure(
          'component-render',
          'component-render-start',
          'component-render-end'
        );
      };
    }
  });
  
  return children;
};
```

### Bundle Analysis
```bash
# Analyze bundle size
pnpm analyze

# Check for duplicate dependencies
pnpm ls --depth=0

# Audit dependencies
pnpm audit
```

## Performance Checklist

### Before Release
- [ ] Core Web Vitals meet targets
- [ ] Bundle size under 500KB gzipped
- [ ] Images optimized and properly sized
- [ ] Critical CSS inlined
- [ ] Service Worker caching implemented
- [ ] Performance tests passing
- [ ] Mobile performance verified
- [ ] Accessibility performance maintained

### Regular Monitoring
- [ ] Weekly Lighthouse CI reports
- [ ] Monthly bundle size analysis
- [ ] Quarterly performance audit
- [ ] Real user metrics tracking
- [ ] Performance regression alerts

## Performance Anti-Patterns

### Avoid These Patterns
```typescript
// ❌ Expensive operations in render
function Component({ items }) {
  const expensiveValue = items.map(item => expensiveCalculation(item)); // Recalculated every render
  return <div>{expensiveValue}</div>;
}

// ❌ Creating objects in render
function Component() {
  return <Child style={{ margin: 10 }} />; // New object every render
}

// ❌ Inline functions as props
function Component() {
  return <Child onClick={() => doSomething()} />; // New function every render
}
```

### Use These Instead
```typescript
// ✅ Memoized expensive operations
function Component({ items }) {
  const expensiveValue = useMemo(() => 
    items.map(item => expensiveCalculation(item)), 
    [items]
  );
  return <div>{expensiveValue}</div>;
}

// ✅ Stable object references
const STYLE = { margin: 10 };
function Component() {
  return <Child style={STYLE} />;
}

// ✅ Stable function references
function Component() {
  const handleClick = useCallback(() => doSomething(), []);
  return <Child onClick={handleClick} />;
}
```