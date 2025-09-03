---
inclusion: always
---

# MathGenie Development Guidelines

## Architecture & Code Style

### React 19 Patterns

- Use concurrent features: `useTransition`, `useDeferredValue`, `useOptimistic`
- Function components with hooks only
- Co-locate files: `Component.tsx`, `Component.css`, `Component.test.tsx`
- TypeScript strict mode with comprehensive coverage

### File Organization

- Import paths: Use `@/` aliases (e.g., `@/components/Component`)
- Component structure: Atomic design by complexity/reusability
- Co-location: Styles and tests alongside components
- Directory grouping: Related functionality together

### State Management

- Local: `useState` for component state
- Persistent: `useLocalStorage` hook for browser storage
- Global: React Context for i18n and settings
- Optimistic: `useOptimistic` for immediate UI feedback

## Testing Standards

### Requirements

- Every component/utility needs tests
- Vitest with `happy-dom` environment
- 90% coverage threshold mandatory
- Test behavior, not implementation

### E2E Testing

- Playwright cross-browser (Chrome, Firefox, Safari)
- WCAG 2.1 AA accessibility compliance
- Use existing test utilities in `tests/e2e/test-utils.ts`

## Development Workflow

### Commands (pnpm only)

- `pnpm dev` - Development server
- `pnpm test` - Unit tests
- `pnpm test:e2e` - End-to-end tests
- `pnpm validate` - Full validation pipeline
- `pnpm build` - Production build

### Code Quality

- ESLint: Single quotes, semicolons required
- Prettier: Consistent formatting
- Git hooks: Pre-commit linting, pre-push validation

## MathGenie Patterns

### Problem Generation

- Use utilities in `src/utils/mathGenerator.ts`
- Follow `NumberInput` validation patterns
- Implement math accessibility features

### PDF Generation

- Use jsPDF following existing patterns
- Handle errors gracefully
- Optimize for large problem sets

### Internationalization

- Custom i18n system with React 19 optimizations
- Support all 6 languages: en, zh, es, fr, de, ja
- Follow existing translation key patterns

### Settings

- Use `settingsManager` utility
- Implement presets following existing patterns
- Persist with `useLocalStorage`

## Performance

### React 19 Optimizations

- `useTransition` for non-urgent updates
- `useDeferredValue` for expensive computations
- Leverage automatic batching

### Bundle Optimization

- Manual chunks: React, jsPDF, analytics
- Tree shaking enabled
- Vendor separation in Vite config

## Accessibility (WCAG 2.1 AA)

### Requirements

- Semantic HTML with ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Proper focus management

### Implementation

- Use existing accessibility patterns
- Test with keyboard-only navigation
- Follow ARIA best practices

## Error Handling

### User Errors

- Use `ErrorBoundary` for React errors
- Use `ErrorMessage` component for feedback
- Provide clear, actionable messages

### Development

- Fail fast with descriptive messages
- Include debugging context
- TypeScript for compile-time prevention

## Security (Critical)

### Code Security

- **NEVER** use `eval()`, `Function()`, or dynamic execution
- **NEVER** use `Math.random()` for security (use `crypto.getRandomValues()`)
- **ALWAYS** validate and sanitize user inputs
- **ALWAYS** use secure parsers for math expressions

### Dependencies

- Run `pnpm audit` before releases
- Pin exact versions for critical dependencies
- Minimize dependency count

### Data Protection

- **NEVER** commit sensitive data (API keys, passwords)
- Use environment variables for config
- Be cautious with localStorage data

## Critical Rules

### NEVER

- Use npm/yarn (pnpm only)
- Bypass commit hooks with `--no-verify`
- Disable tests instead of fixing
- Break accessibility standards
- Use dynamic code execution
- Create ReDoS-vulnerable regex patterns
- Commit sensitive information

### ALWAYS

- Run `pnpm validate` before committing
- Follow existing component patterns
- Include comprehensive tests
- Maintain TypeScript strict compliance
- Consider performance impact
- Validate user inputs
- Review for security implications

## Decision Priority

1. **Accessibility** - Works for all users?
2. **Security** - Safe and secure?
3. **Performance** - Optimized for use case?
4. **Testability** - Easily testable?
5. **Consistency** - Matches existing patterns?
