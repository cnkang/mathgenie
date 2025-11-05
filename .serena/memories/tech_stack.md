# MathGenie Tech Stack

## Core Technologies
- **React 19.2.0**: Latest React with concurrent features, automatic batching, and enhanced performance
  - Concurrent rendering with `useTransition`
  - Optimistic updates with `useOptimistic`
  - Deferred values with `useDeferredValue`
  - Enhanced error boundaries and Suspense
- **TypeScript 5.9**: Strict type checking with comprehensive type definitions
  - Strict mode enabled with zero tolerance for type errors
  - Path aliases with `@/` prefix for clean imports
  - Comprehensive type coverage for all components and utilities
- **Node.js 22.19.1**: Latest LTS with enhanced performance and security
- **Vite 7.1.4**: Lightning-fast build tool with HMR and optimized bundling
  - React plugin with TypeScript support
  - Code splitting and tree shaking
  - Development server with instant HMR
- **pnpm 10.15.1**: Fast, disk space efficient package manager (REQUIRED)

## Build System & Tooling

### Build Tool: Vite
- **React Plugin**: Full React 19 support with TypeScript
- **TypeScript Support**: Native TypeScript compilation
- **HMR**: Instant hot module replacement
- **Code Splitting**: Automatic and manual chunk optimization
- **Tree Shaking**: Aggressive dead code elimination
- **Bundle Analysis**: Built-in analyzer for optimization

### Package Manager: pnpm (MANDATORY)
- **Performance**: Faster than npm/yarn with shared dependencies
- **Disk Efficiency**: Symlinked node_modules structure
- **Security**: Better dependency resolution and validation
- **Monorepo Support**: Built-in workspace management
- **NEVER use npm or yarn**: Project configured specifically for pnpm

### Linting & Formatting
- **ESLint**: TypeScript rules, React hooks, SonarJS plugin
- **Prettier**: Automated formatting on save
- **Stylelint**: CSS linting with modern configuration
- **html-validate**: HTML validation (replaces HTMLHint)
- **Pre-commit Hooks**: Mandatory quality gates via Husky

### Type Checking
- **TypeScript Strict Mode**: Comprehensive coverage required
- **Path Aliases**: `@/` prefix for clean imports
- **Declaration Files**: Generated for library compatibility
- **Source Maps**: Full debugging support in development

## Testing Framework

### Unit Testing: Vitest
- **Environment**: happy-dom for lightweight DOM simulation
- **Coverage**: V8 coverage provider with 90% threshold
- **Performance**: Faster than Jest with native ESM support
- **TypeScript**: Native TypeScript support without transpilation
- **Watch Mode**: Intelligent test re-running

### E2E Testing: Playwright
- **Cross-browser**: Chrome, Firefox, Safari support
- **Mobile Testing**: Comprehensive device emulation
  - iPhone models (16 Pro Max, 16 Pro, 16, 15 series)
  - iPad models (Pro 11", Air, standard)
  - Android devices (Galaxy S24, Pixel series)
- **Browser Engines**: 
  - iOS testing: WebKit engine (Safari-like behavior)
  - Android testing: Chromium engine (Chrome-like behavior)
  - Desktop: Native browser engines

### Accessibility Testing: WCAG 2.2 AAA
- **@axe-core/playwright**: Automated accessibility testing
- **Cross-engine Validation**: Chromium, Firefox, WebKit
- **Manual Testing**: Keyboard navigation, screen readers
- **Color Contrast**: 7:1 ratio for normal text, 4.5:1 for large text
- **Touch Targets**: 44px minimum validation
- **Reduced Motion**: Preference testing

### Performance Testing
- **Lighthouse CI**: Core Web Vitals integration
- **Performance Budgets**: Automated performance regression detection
- **Bundle Analysis**: Size and optimization monitoring
- **Web Vitals**: Real-time performance metrics

## Key Libraries

### PDF Generation: jsPDF 3.0.2
- **Client-side**: No server dependency
- **Customization**: Font size, line spacing, paper size options
- **Performance**: Optimized for large problem sets
- **Security**: No external dependencies or network calls

### Analytics: Vercel Speed Insights
- **Real-time Metrics**: Performance monitoring in production
- **Web Vitals**: Core Web Vitals tracking
- **TypeScript Support**: Fully typed interfaces
- **Privacy-focused**: No personal data collection

### Internationalization: Custom i18n System
- **React 19 Optimized**: Leverages concurrent features
- **6 Languages**: English, Chinese, Spanish, French, German, Japanese
- **Dynamic Loading**: Language files loaded as separate chunks
- **Parameter Interpolation**: `{{variable}}` syntax support
- **Fallback System**: Graceful degradation to English
- **Type Safety**: Full TypeScript support for translation keys

## Configuration Standards

### TypeScript Configuration
- **Strict Mode**: All strict flags enabled
- **Target**: ES2022 with DOM and WebWorker support
- **Module Resolution**: Bundler resolution for Vite compatibility
- **Path Aliases**: `@/` prefix for all internal imports
- **Declaration Maps**: Source map support for type definitions

### ESLint Configuration
- **TypeScript Rules**: Comprehensive TypeScript linting
- **React 19 Rules**: Latest React patterns and hooks
- **SonarJS Plugin**: Code quality and security rules
- **Single Quotes**: Consistent string formatting
- **Semicolons**: Required for statement termination
- **Max Warnings**: Zero warnings allowed

### Prettier Configuration
- **ESLint Integration**: Consistent with linting rules
- **Single Quotes**: String formatting consistency
- **Semicolons**: Statement termination
- **Trailing Commas**: ES5 compatibility
- **Tab Width**: 2 spaces for indentation

### Vite Configuration
- **Chunking Strategy**: Manual chunks for optimization
  - React chunk: Core React libraries
  - jsPDF chunk: PDF generation library
  - Analytics chunk: Performance monitoring
  - i18n chunks: Language files (separate per language)
- **Vendor Splitting**: Third-party libraries separated
- **Compression**: Brotli and Gzip enabled
- **Source Maps**: Development debugging support

### Git Hooks (Husky)
- **Pre-commit**: Linting, formatting, quality checks
- **Pre-push**: Type checking, testing, build verification
- **Commit-msg**: Conventional commit format validation
- **Quality Gates**: Cannot be bypassed with `--no-verify`

## Performance Optimizations

### Code Splitting
- **Manual Chunks**: Strategic library separation
- **Dynamic Imports**: Lazy loading for large dependencies
- **Route-based**: Component-level code splitting
- **Translation Loading**: Language files as separate chunks

### Bundle Optimization
- **Tree Shaking**: Aggressive dead code elimination
- **Terser Minification**: Advanced minification with dead code elimination
- **Compression**: Brotli and Gzip compression enabled
- **Bundle Analysis**: Built-in analyzer for size monitoring

### React 19 Features
- **Concurrent Rendering**: Non-blocking updates with `useTransition`
- **Automatic Batching**: Reduced re-renders for better performance
- **Optimistic Updates**: Immediate UI feedback with `useOptimistic`
- **Deferred Values**: Smart performance optimization with `useDeferredValue`

### Caching Strategy
- **Service Worker**: Comprehensive caching with fallback strategies
- **Browser Caching**: Optimized cache headers
- **Build Caching**: Vite's intelligent build caching
- **Dependency Caching**: pnpm's efficient dependency management

## Security Framework

### Command Execution Security
- **No Shell Spawning**: Never use `execSync`, `exec`, or `spawn` with `shell: true`
- **Secure Execution**: Use `spawnSync` with `shell: false` and explicit arguments
- **Input Validation**: Strict regex patterns and whitelists
- **Environment Isolation**: Remove dangerous environment variables
- **Timeout Protection**: Prevent hanging processes

### Input Validation & Sanitization
- **Boundary Validation**: All user inputs validated at entry points
- **Whitelist Approach**: Only allow known-safe patterns
- **Type Safety**: TypeScript interfaces + runtime validation
- **Length Limits**: Enforce reasonable input limits
- **Metacharacter Blocking**: Prevent shell injection attacks

### Dependency Security
- **Vulnerability Scanning**: Automated scans in CI/CD pipeline
- **License Compliance**: Only approved licenses allowed
- **Regular Updates**: Monthly dependency updates with automated PRs
- **SBOM Maintenance**: Software Bill of Materials tracking
- **Minimal Dependencies**: Add dependencies sparingly

## Development Workflow Integration

### Quality Gates (Mandatory)
- **SonarQube Analysis**: HIGH priority issues must be resolved
- **CSS/HTML Quality**: Automated validation with auto-fix
- **TypeScript Compilation**: Zero errors required
- **Test Coverage**: 90% threshold mandatory
- **Accessibility Compliance**: WCAG 2.2 AAA required

### CI/CD Pipeline
- **GitHub Actions**: Automated quality assurance
- **Cross-browser Testing**: Chromium, Firefox, WebKit
- **Mobile Device Testing**: iPhone, iPad, Android
- **Performance Monitoring**: Lighthouse CI integration
- **Security Scanning**: Automated vulnerability detection

### Development Commands
- **Quality Checks**: `pnpm sonar:high`, `pnpm lint:css-html:fix`
- **Testing**: `pnpm test`, `pnpm test:e2e:accessibility`
- **Validation**: `pnpm validate` (complete pipeline)
- **Build**: `pnpm build` (optimized production build)

## Architecture Principles

### React 19 Patterns
- **Function Components**: Only function components with hooks
- **Concurrent Features**: Leverage `useTransition`, `useDeferredValue`, `useOptimistic`
- **Hook Composition**: Complex logic composed from focused hooks
- **Error Boundaries**: Comprehensive error handling with TypeScript

### State Management
- **Local State**: `useState` for component-specific state
- **Persistent State**: `useLocalStorage` hook for browser storage
- **Global State**: React Context for app-wide state (i18n, settings)
- **Optimistic Updates**: `useOptimistic` for immediate UI feedback

### Security-First Architecture
- **Input Validation**: All user inputs validated and sanitized
- **Command Execution**: Secure patterns prevent injection attacks
- **Environment Isolation**: Clean environments for child processes
- **No Secrets**: Configuration via environment variables only

### Accessibility-First Design
- **WCAG 2.2 AAA**: Highest accessibility standard compliance
- **Universal Design**: Accessible by default, not as afterthought
- **Cross-platform**: Consistent experience across all devices
- **Assistive Technology**: Full screen reader and keyboard support