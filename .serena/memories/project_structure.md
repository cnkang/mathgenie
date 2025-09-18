# MathGenie Project Structure

## Root Directory Organization
```
├── src/                    # Source code
├── public/                 # Static assets
├── tests/e2e/             # End-to-end tests
├── scripts/               # Build and utility scripts
├── coverage/              # Test coverage reports
├── dist/                  # Production build output
├── .lighthouseci/         # Lighthouse CI reports
├── .kiro/                 # Kiro IDE configuration
├── .serena/               # Serena MCP configuration and memories
├── .husky/                # Git hooks
├── playwright-report/     # Playwright test reports
├── test-results/          # Test execution results
└── Configuration files    # Various config files
```

## Source Code Structure (`src/`)
```
src/
├── components/            # React components
│   ├── form/             # Form-related components (RangeInput)
│   ├── quiz/             # Quiz-specific components (QuizHeader, QuizResults, etc.)
│   └── settings/         # Settings components (AdvancedSettings, PdfSettings)
├── hooks/                # Custom React hooks
├── i18n/                 # Internationalization
│   └── translations/     # Language files (en, zh, es, fr, de, ja)
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── styles/               # Global CSS styles
├── constants/            # Application constants
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
└── *.css                 # Global styles
```

## Component Organization Principles

### Atomic Design Pattern
- **Atoms**: Basic building blocks (NumberInput, LoadingButton)
- **Molecules**: Simple combinations (RangeInput, ErrorMessage)
- **Organisms**: Complex components (SettingsSection, QuizMode)
- **Templates**: Page layouts and structures
- **Pages**: Complete page implementations

### Co-location Strategy
- **Component Files**: `ComponentName.tsx`
- **Styles**: `ComponentName.css` (same directory)
- **Tests**: `ComponentName.test.tsx` (same directory)
- **Types**: Component-specific types in same file or adjacent `types.ts`

### Directory Hygiene (≤ 8 items per directory)
- Group related components in subdirectories
- Extract shared components to appropriate level
- Use index files for clean exports when needed

## Key Directories Deep Dive

### `/src/components/`
**Main React Components with Co-located Files**
- `ActionCards.tsx` + `ActionCards.test.tsx`
- `AppHeader.tsx` + `AppHeader.css` + `AppHeader.test.tsx`
- `ErrorBoundary.tsx` + `ErrorBoundary.test.tsx`
- `ErrorMessage.tsx` + `ErrorMessage.css` + `ErrorMessage.test.tsx`
- `InfoPanel.tsx` + `InfoPanel.css` + `InfoPanel.test.tsx`
- `LanguageSelector.tsx` + `LanguageSelector.css` + `LanguageSelector.test.tsx`
- `NumberInput.tsx` + `NumberInput.css` + `NumberInput.test.tsx`
- `PerformanceMonitor.tsx` + `PerformanceMonitor.test.tsx`
- `QuizMode.tsx` + `QuizMode.css` + `QuizMode.test.tsx`
- `SettingsManager.tsx` + `SettingsManager.css` + `SettingsManager.test.tsx`
- `SettingsPresets.tsx` + `SettingsPresets.css` + `SettingsPresets.test.tsx`
- `SettingsSection.tsx` + `SettingsSection.css` + `SettingsSection.test.tsx`
- `TranslationLoader.tsx` + `TranslationLoader.css` + `TranslationLoader.test.tsx`

**Subdirectories:**
- `form/` - Form-related components (RangeInput)
- `quiz/` - Quiz-specific components (QuizHeader, QuizNavigation, QuizResults, useQuizController)
- `settings/` - Settings components (AdvancedSettings, PdfSettings)

### `/src/hooks/`
**Custom React Hooks with Comprehensive Testing**
- `useAppLogic.ts` + `useAppLogic.test.ts` - Main application logic composition
- `useAppMessages.ts` + `useAppMessages.test.ts` - Message state management
- `useDebounce.ts` + `useDebounce.test.ts` - Debouncing utility
- `useLocalStorage.ts` + `useLocalStorage.test.ts` - Browser storage persistence
- `useOptimisticState.ts` + `useOptimisticState.test.ts` - React 19 optimistic updates
- `useProblemGenerator.ts` + `useProblemGenerator.test.ts` - Math problem generation
- `useProgressBar.ts` + `useProgressBar.test.ts` - Progress indication
- `useSettings.ts` + `useSettings.test.ts` - Settings management with validation
- `useSettingsValidation.ts` + `useSettingsValidation.test.ts` - Settings validation logic

### `/src/utils/`
**Utility Functions with Security Focus**
- `analytics.ts` + `analytics.test.ts` - Performance monitoring
- `debounce.ts` + `debounce.test.ts` - Debouncing utility
- `pdf.ts` + `pdf.test.ts` - PDF generation with jsPDF
- `problemUtils.ts` + `problemUtils.test.ts` - Math problem utilities
- `resultsStorage.ts` + `resultsStorage.test.ts` - Quiz results persistence
- `serviceWorker.ts` - Service worker registration (secure)
- `settingsManager.ts` + `settingsManager.test.ts` - Settings import/export
- `wcagEnforcement.ts` + `wcagEnforcement.test.ts` - Accessibility enforcement

### `/src/i18n/`
**Internationalization System (6 Languages)**
- `index.tsx` + `index.test.tsx` - i18n system implementation
- `translations/` - Language files:
  - `en.ts` - English (base language)
  - `zh.ts` - Chinese (Simplified)
  - `es.ts` - Spanish
  - `fr.ts` - French
  - `de.ts` - German
  - `ja.ts` - Japanese

### `/src/types/`
**TypeScript Type Definitions**
- `index.ts` - Centralized type definitions
- `index.test.ts` - Type validation tests
- `vitest.d.ts` - Vitest type extensions

### `/src/styles/`
**Global CSS Organization**
- `accessibility-unified.css` - WCAG 2.2 AAA compliance styles
- `action-cards.css` - Action card component styles
- `base-components.css` - Base component styles
- `components.css` - General component styles
- `globals.css` - Global application styles
- `international-layout.css` - i18n layout adaptations
- `layout.css` - Layout and grid systems
- `utilities.css` - Utility classes

### `/tests/e2e/`
**End-to-End Testing (Playwright)**
- Cross-browser testing (Chromium, Firefox, WebKit)
- Mobile device testing (iPhone, iPad, Android)
- WCAG 2.2 AAA accessibility compliance testing
- Integration test scenarios

### `/scripts/`
**Build and Utility Scripts (Security-Focused)**
- `check-browsers.ts` - Browser installation verification
- `check-i18n.ts` - Translation validation
- `css-html-quality-check.ts` - CSS/HTML quality validation
- `debug-playwright-cache.sh` - Browser cache debugging
- `exec-utils.ts` - Secure command execution utilities
- `playwright-cache-helper.sh` - Browser cache management
- `sonar-check.ts` - SonarQube analysis
- `test-e2e.sh` - E2E test runner
- `unified-test.ts` - Unified test execution

## Configuration Files

### Core Configuration
- **TypeScript**: `tsconfig.json` - Strict mode with path aliases
- **Vite**: `vite.config.ts` - React plugin with optimization
- **ESLint**: `eslint.config.ts` - TypeScript and React rules
- **Prettier**: `.prettierrc.json` - Code formatting
- **Package**: `package.json` - pnpm as package manager

### Testing Configuration
- **Playwright**: `playwright.config.ts`, `playwright.e2e.config.ts`, `playwright.test.config.ts`
- **Vitest**: Configuration in `vite.config.ts`
- **Coverage**: V8 provider with 90% threshold

### Quality & Performance
- **Lighthouse**: `lighthouserc.yml` - Performance testing
- **SonarQube**: `sonar-project.properties` - Code quality
- **Stylelint**: `.stylelintrc.json` - CSS linting
- **HTML Validate**: `.htmlvalidate.json` - HTML validation

### Git & Development
- **Git**: `.gitignore`, `.editorconfig`
- **Husky**: `.husky/` - Git hooks
- **Lint Staged**: Configuration in `package.json`

## Import Path Strategy

### Path Aliases (Mandatory)
```typescript
// ✅ Use these aliases instead of relative paths
import { Component } from '@/components/Component';
import { useHook } from '@/hooks/useHook';
import { utility } from '@/utils/utility';
import { Type } from '@/types';
import { useTranslation } from '@/i18n';
```

### Import Order Convention
1. External libraries (React, third-party)
2. Internal modules with `@/` aliases
3. Relative imports (only when necessary)
4. Type-only imports (with `type` keyword)

## Asset Organization

### Public Assets (`public/`)
- Static files: favicon, manifest, service worker
- No processing by build system
- Direct URL access

### Component Assets
- Co-located with components when component-specific
- Imported through build system for optimization
- Automatic optimization and caching

### Global Styles (`src/styles/`)
- Organized by purpose and scope
- CSS custom properties for theming
- Mobile-first responsive design
- WCAG 2.2 AAA compliance built-in

## Architecture Patterns

### State Management
- **Local State**: `useState` for component-specific state
- **Persistent State**: `useLocalStorage` hook for browser storage
- **Global State**: React Context for app-wide state (i18n, settings)
- **Optimistic Updates**: `useOptimistic` for immediate UI feedback

### Component Patterns
- **Function Components**: Only function components with hooks
- **Hook Composition**: Complex logic composed from focused hooks
- **Render Props**: For flexible component composition
- **Error Boundaries**: Comprehensive error handling

### Security Patterns
- **Input Validation**: All user inputs validated at boundaries
- **Command Execution**: Secure patterns with `spawnSync`
- **Environment Isolation**: Clean environments for child processes
- **No Secrets**: Configuration via environment variables

## Code Organization Principles

1. **Single Responsibility**: Each file has one clear purpose
2. **Co-location**: Related files grouped together
3. **Separation of Concerns**: Logic, presentation, styling separated
4. **Type Safety**: Comprehensive TypeScript coverage with strict mode
5. **Testability**: All components and utilities have corresponding tests
6. **Security First**: Security considerations in all architectural decisions
7. **Accessibility First**: WCAG 2.2 AAA compliance built into structure
8. **Performance Conscious**: Bundle optimization and code splitting
9. **Maintainability**: Clear naming, documentation, and patterns
10. **Scalability**: Structure supports growth and team collaboration