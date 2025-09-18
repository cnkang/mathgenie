# MathGenie Code Style and Conventions

## Core Principles
- **Clarity over cleverness**: Optimize for correctness, maintainability, security
- **Critical thinking**: Evaluate alternatives before modifying code
- **Minimal changes**: Choose the smallest, most reversible change
- **Security first**: Validate inputs, avoid unsafe operations, never commit secrets

## TypeScript Configuration
- **Strict Mode**: Enabled with comprehensive type checking
- **Target**: ES2022 with DOM and WebWorker support
- **Module System**: ESNext with bundler resolution
- **Path Aliases**: Use `@/` prefix for clean imports
  - `@/components/*` for components
  - `@/hooks/*` for custom hooks
  - `@/utils/*` for utility functions
  - `@/types/*` for type definitions
  - `@/i18n/*` for internationalization

## File Naming Conventions
- **Components**: PascalCase (`ComponentName.tsx`)
- **Hooks**: camelCase with `use` prefix (`useHookName.ts`)
- **Utilities**: camelCase (`utilityName.ts`)
- **Types**: `index.ts` for centralized definitions
- **Tests**: Co-located with `.test.tsx` or `.test.ts` suffix
- **Styles**: Co-located with `.css` suffix

## Code Organization
- **Single Responsibility**: Each file has one clear purpose
- **Co-location**: Related files grouped together (component + styles + tests)
- **Separation of Concerns**: Logic, presentation, and styling separated
- **Atomic Design**: Components organized by complexity and reusability
- **Directory Hygiene**: ≤ 8 items per directory, group by domain/layer

## React 19 Patterns
- **Function Components**: Only function components with hooks
- **Concurrent Features**: Use `useTransition`, `useDeferredValue`, `useOptimistic`
- **Hook Composition**: Compose complex logic using multiple focused hooks
- **Memoization**: Use `useCallback` and `useMemo` for performance optimization

## useEffect Best Practices (Critical)
- **Custom Hook Abstraction**: Extract complex async + useEffect patterns into custom hooks
- **AbortController**: Use for fetch requests and cancellable operations
- **Race Condition Prevention**: Track latest request to discard stale results
- **State Management Pattern**: Consolidate loading, error, and success states
- **Cleanup Resource Management**: Always cleanup timers, listeners, and subscriptions
- **React Strict Mode Compatibility**: Ensure effects are idempotent and cleanup is safe
- **Dependency Array Best Practices**: Include all values from component scope, use useCallback/useMemo to stabilize dependencies
- **Error Boundary Integration**: Handle async errors properly, log and set error state instead of throwing

## State Management Patterns
- **Local State**: `useState` for component-specific state
- **Persistent State**: `useLocalStorage` hook for browser storage
- **Global State**: React Context for app-wide state (i18n, settings)
- **Optimistic Updates**: `useOptimistic` for immediate UI feedback

## Import/Export Conventions
- **Default Exports**: For components
- **Named Exports**: For utilities and hooks
- **Path Aliases**: Always use `@/` aliases instead of relative paths
- **Import Order**: External libraries first, then internal modules

## Security Guidelines (Critical)
- **Command Execution**: NEVER use `execSync`, `exec`, or `spawn` with `shell: true`
- **Input Validation**: Validate all user inputs with strict regex patterns, length limits, character whitelists
- **Shell Metacharacters**: Block dangerous characters `[;&|`$(){}[]<>*?~]`
- **Environment Variables**: Remove dangerous variables (`LD_PRELOAD`, `LD_LIBRARY_PATH`, `DYLD_*`) from child processes
- **Process Security**: Set timeouts, use clean environments, implement proper error handling
- **No Secrets**: Never commit or log secrets/PII

## Code Quality Standards (Mandatory)
- **SonarQube Compliance**: Zero critical issues before commit
- **Cognitive Complexity**: ≤ 15 per function
- **Cyclomatic Complexity**: ≤ 10 per function
- **Function Length**: Target ≤ 50 lines, cap at 100 lines
- **Parameter Count**: ≤ 7 parameters per function
- **No Duplicate Code**: Blocks > 3 lines
- **CSS & HTML Quality**: Mandatory pre-commit checks with auto-fix
- **Quality Gate Enforcement**: NEVER disable rules to force commits - fix underlying issues

## Error Handling
- **Error Boundaries**: Use `ErrorBoundary` for React errors
- **Type Safety**: Leverage TypeScript for compile-time error prevention
- **Graceful Degradation**: Always provide fallback states
- **User-Friendly Messages**: Clear, actionable error messages
- **Structured Errors**: Use typed/structured errors, propagate with context
- **Log Once**: Log errors once near boundaries, never log secrets

## Performance Guidelines
- **Bundle Optimization**: Manual chunks for React, jsPDF, analytics
- **Tree Shaking**: Ensure dead code elimination
- **Code Splitting**: Dynamic imports for large dependencies
- **Memoization**: Strategic use of React memoization hooks
- **File Size Limits**: Target ≤ 400 SLoC per file, cap at 800 SLoC

## Accessibility Standards (WCAG 2.2 AAA)
- **Full Compliance**: WCAG 2.2 AAA required for all features
- **Keyboard Navigation**: All functionality accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Touch Targets**: Minimum 44px for interactive elements
- **Color Contrast**: 7:1 ratio for normal text, 4.5:1 for large text
- **Focus Management**: Logical focus order and visible indicators
- **Reduced Motion**: Respect user preferences

## Internationalization (Critical)
- **Translation Keys**: Use `t('key')` function for all user-facing text
- **Hierarchical Keys**: Dot notation (e.g., `errors.validation.required`)
- **Parameter Interpolation**: Support dynamic values with `{{variable}}`
- **Fallback Text**: Always provide fallback with `t('key') || 'Fallback'`
- **All Languages**: Add keys to all 6 language files simultaneously
- **Zero Hardcoded Strings**: No hardcoded user-facing text in components

## Testing Conventions
- **Co-location**: Tests alongside source files
- **Behavior Testing**: Test behavior, not implementation
- **Coverage**: 90% threshold required, changed lines ≥ 80%
- **Accessibility Testing**: Include a11y tests for all components
- **Mobile Testing**: Test on iPhone, iPad, and Android devices
- **Cross-browser**: Chromium, Firefox, WebKit engines
- **useEffect Testing**: Mock timers, test cleanup functions, verify async state transitions

## Architecture Principles
- **Single Responsibility Principle**: One reason to change per module
- **Dependency Inversion**: Program to interfaces, inject dependencies
- **Composition over Inheritance**: Favor composition patterns
- **Hexagonal Architecture**: Domain isolated from frameworks and I/O
- **Pure Functions**: Prefer pure functions where feasible
- **Configuration**: Via environment with schema validation and safe defaults

## Code Smells & Remedies
- **Rigidity/Shotgun Surgery**: Raise cohesion, add seams/ports
- **Redundancy (DRY)**: Extract shared functions/modules
- **Circular Dependencies**: Break via interfaces/events
- **Fragility**: Reduce hidden coupling, strengthen tests
- **Obscurity**: Rename for intent, simplify control flow
- **God Objects**: Split by responsibility, clarify contracts
- **Shell Injection**: Replace with secure command execution patterns

## Dependencies & Boundaries
- **Standard Library First**: Prefer built-in solutions
- **External Calls**: Wrap behind adapters with timeouts, retries, circuit breakers
- **Public APIs**: Keep small and stable, version or deprecate with migration guidance
- **Vulnerability Scans**: Automated scans in CI/CD pipeline
- **Regular Updates**: Monthly dependency updates with automated PRs
- **License Compliance**: Only approved licenses, maintain SBOM