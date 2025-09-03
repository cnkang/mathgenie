---
inclusion: always
---

# MathGenie Development Guidelines

## Code Style & Architecture

### React 19 Patterns

- Use React 19 concurrent features: `useTransition`, `useDeferredValue`, `useOptimistic`
- Prefer function components with hooks over class components
- Co-locate component files: `Component.tsx`, `Component.css`, `Component.test.tsx`
- Use TypeScript strict mode with comprehensive type coverage

### File Organization

- Use `@/` path aliases for imports (configured in tsconfig.json)
- Follow atomic design: components by complexity and reusability
- Place component-specific styles alongside components
- Group related functionality in dedicated directories

### State Management

- Local state: `useState` for component-specific state
- Persistent state: `useLocalStorage` hook for browser storage
- Global state: React Context for app-wide state (i18n, settings)
- Optimistic updates: `useOptimistic` for immediate UI feedback

## Testing Requirements

### Unit Tests (Vitest)

- Every component and utility must have corresponding tests
- Use `happy-dom` environment for DOM simulation
- Maintain 90% coverage threshold
- Test behavior, not implementation details

### E2E Tests (Playwright)

- Cross-browser testing (Chrome, Firefox, Safari)
- Accessibility testing with WCAG 2.1 AA compliance
- Use page object model pattern from existing tests

### Test Naming

- Descriptive test names: `should generate addition problems when operation is selected`
- Group related tests with `describe` blocks
- Use existing test utilities in `tests/e2e/test-utils.ts`

## Development Workflow

### Commands (Use pnpm only)

- Development: `pnpm dev`
- Testing: `pnpm test` (unit), `pnpm test:e2e` (end-to-end)
- Validation: `pnpm validate` (lint + type-check + test + build + e2e)
- Building: `pnpm build` (production), `pnpm build:fast` (development)

### Code Quality

- ESLint with auto-fix: single quotes, semicolons required
- Prettier formatting with consistent style
- TypeScript strict mode compilation
- Git hooks enforce pre-commit linting and pre-push validation

## MathGenie-Specific Patterns

### Problem Generation

- Use existing math utilities in `src/utils/`
- Follow range validation patterns from `NumberInput` component
- Implement accessibility features for math content

### PDF Generation

- Use jsPDF library following existing patterns
- Implement proper error handling for PDF operations
- Consider performance for large problem sets

### Internationalization

- Use custom i18n system with React 19 optimizations
- Add translations to all 6 supported languages
- Follow existing translation key patterns

### Settings Management

- Use `settingsManager` utility for configuration
- Implement preset functionality following existing patterns
- Ensure settings persistence with `useLocalStorage`

## Performance Guidelines

### React 19 Optimizations

- Use `useTransition` for non-urgent updates
- Implement `useDeferredValue` for expensive computations
- Leverage automatic batching for state updates

### Bundle Optimization

- Manual code splitting for React, jsPDF, and analytics
- Tree shaking for dead code elimination
- Vendor chunk separation in Vite config

## Accessibility Standards

### WCAG 2.1 AA Compliance

- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Color contrast requirements
- Focus management

### Implementation

- Use existing accessibility patterns from components
- Test with screen readers and keyboard-only navigation
- Follow ARIA best practices for interactive elements

## Error Handling

### User-Facing Errors

- Use `ErrorBoundary` component for React error boundaries
- Implement `ErrorMessage` component for user feedback
- Provide clear, actionable error messages

### Development Errors

- Fail fast with descriptive messages
- Include context for debugging
- Use TypeScript for compile-time error prevention

## Decision Framework

When implementing features, prioritize:

1. **Accessibility** - Does this work for all users?
2. **Performance** - Is this optimized for the target use case?
3. **Testability** - Can this be easily tested?
4. **Consistency** - Does this match existing patterns?
5. **Maintainability** - Will this be easy to modify later?

## Critical Rules

**NEVER**:

- Use npm or yarn (pnpm only)
- Bypass commit hooks with `--no-verify`
- Disable tests instead of fixing them
- Break accessibility standards
- Introduce new dependencies without justification

**ALWAYS**:

- Run `pnpm validate` before committing
- Follow existing component and utility patterns
- Include comprehensive tests for new functionality
- Maintain TypeScript strict mode compliance
- Consider performance impact of changes
