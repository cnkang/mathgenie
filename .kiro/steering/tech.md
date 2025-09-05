# MathGenie Tech Stack

## Core Technologies

- **React 19.1.1**: Latest React with concurrent features, automatic batching, and enhanced performance
- **TypeScript 5.9**: Strict type checking with comprehensive type definitions
- **Node.js 22.19.1**: Latest LTS with enhanced performance
- **Vite 7.1.4**: Lightning-fast build tool with HMR and optimized bundling
- **pnpm 10.15.1**: Fast, disk space efficient package manager

## Build System & Tooling

- **Build Tool**: Vite with React plugin and TypeScript support
- **Package Manager**: pnpm (required - do not use npm or yarn)
- **Linting**: ESLint with TypeScript rules, React hooks, and strict configuration
- **Formatting**: Prettier with automated formatting on save
- **Type Checking**: TypeScript strict mode with comprehensive coverage

## Testing Framework

- **Unit Testing**: Vitest with happy-dom environment
- **E2E Testing**: Playwright with cross-browser support (Chrome, Firefox, Safari)
- **Mobile Testing**: Comprehensive mobile device emulation (iPhone, iPad, Android)
- **Accessibility Testing**: WCAG 2.2 AAA compliance with @axe-core/playwright
- **Performance Testing**: Lighthouse CI integration for Core Web Vitals
- **Coverage**: V8 coverage provider with 90% threshold requirements
- **Test Environment**: happy-dom for lightweight DOM simulation

## Key Libraries

- **PDF Generation**: jsPDF 3.0.2 for client-side PDF creation
- **Analytics**: Vercel Speed Insights and Web Vitals tracking
- **Internationalization**: Custom i18n system with React 19 optimizations and 6-language support
- **Testing**: Playwright with mobile device emulation and accessibility testing

## Development Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000
pnpm preview          # Preview production build on port 4173

# Building
pnpm build            # Optimized production build with tree shaking
pnpm build:fast       # Fast build without optimizations

# Testing
pnpm test             # Run unit tests with coverage
pnpm test:watch       # Watch mode for unit tests
pnpm test:e2e         # Run E2E tests across browsers
pnpm test:e2e:ui      # E2E tests with Playwright UI
pnpm test:smoke       # Quick smoke tests

# Mobile Testing
pnpm test:mobile      # Test on all mobile devices
pnpm test:mobile:iphone    # iPhone device testing
pnpm test:mobile:ipad      # iPad device testing
pnpm test:mobile:android   # Android device testing

# Code Quality
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier formatting
pnpm type-check       # TypeScript compilation check
pnpm i18n:check       # Validate i18n translations
pnpm validate         # Full validation (lint + type-check + test + build + e2e)

# Performance & Quality
pnpm lighthouse      # Run Lighthouse performance tests
pnpm lighthouse:ci    # CI-friendly Lighthouse tests

# Utilities
pnpm clean            # Clean node_modules and build artifacts
pnpm reinstall        # Clean reinstall of dependencies
```

## Configuration Standards

- **TypeScript**: Strict mode enabled with path aliases (@/ prefix)
- **ESLint**: Single quotes, semicolons required, React 19 rules
- **Prettier**: Consistent formatting with ESLint integration
- **Vite**: Optimized chunking strategy with vendor splitting
- **Git Hooks**: Pre-commit linting and pre-push validation via Husky

## Performance Optimizations

- **Code Splitting**: Manual chunks for React, jsPDF, analytics, and i18n translations
- **Compression**: Brotli and Gzip compression enabled
- **Tree Shaking**: Aggressive dead code elimination
- **Bundle Analysis**: Built-in bundle analyzer for optimization
- **Concurrent Features**: React 19 useTransition and useDeferredValue
- **Translation Loading**: Dynamic loading of language files as separate chunks
- **Terser Minification**: Advanced minification with dead code elimination
