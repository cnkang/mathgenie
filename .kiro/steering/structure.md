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
├── .husky/                # Git hooks
├── playwright-report/     # Playwright test reports
├── test-results/          # Test execution results
└── Configuration files    # Various config files
```

## Source Code Structure (`src/`)

```
src/
├── components/            # React components
├── hooks/                # Custom React hooks
├── i18n/                 # Internationalization
│   └── translations/     # Language files
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
└── *.css                 # Global styles
```

## Component Organization

- **Atomic Design**: Components are organized by complexity and reusability
- **Co-location**: Component-specific styles (.css) and tests (.test.tsx) are placed alongside components
- **Naming**: PascalCase for components, camelCase for utilities and hooks
- **Exports**: Default exports for components, named exports for utilities

## File Naming Conventions

- **Components**: `ComponentName.tsx` with matching `ComponentName.css` and `ComponentName.test.tsx`
- **Hooks**: `useHookName.ts` with matching `useHookName.test.ts`
- **Types**: `index.ts` for centralized type definitions
- **Utils**: `utilityName.ts` with matching `utilityName.test.ts`
- **Translations**: `languageCode.ts` (e.g., `en.ts`, `zh.ts`)

## Import Path Aliases

Use TypeScript path aliases for cleaner imports:

```typescript
// Use these aliases instead of relative paths
import { Component } from '@/components/Component';
import { useHook } from '@/hooks/useHook';
import { utility } from '@/utils/utility';
import { Type } from '@/types';
import { useTranslation } from '@/i18n';
```

## Testing Structure

- **Unit Tests**: Co-located with source files using `.test.tsx` or `.test.ts`
- **E2E Tests**: Separate `tests/e2e/` directory with Playwright specs
- **Test Utilities**: Shared test helpers in `tests/e2e/test-utils.ts`
- **Coverage**: Exclude config files, test files, and type definitions

## Configuration Files

- **TypeScript**: `tsconfig.json` with strict mode and path aliases
- **Vite**: `vite.config.ts` with React plugin and optimization settings
- **ESLint**: `eslint.config.ts` with TypeScript and React rules
- **Playwright**: `playwright.config.ts` and `playwright.e2e.config.ts` for E2E testing
- **Lighthouse**: `lighthouserc.yml` for performance testing
- **Package**: `package.json` with pnpm as package manager
- **PostCSS**: `postcss.config.cjs` for CSS processing
- **Prettier**: `.prettierrc.json` for code formatting
- **Git**: `.gitignore`, `.editorconfig` for development standards

## Asset Organization

- **Public Assets**: Static files in `public/` (favicon, manifest, service worker)
- **Component Assets**: Images and icons co-located with components when component-specific
- **Global Styles**: CSS files in `src/` root for global styling

## State Management Patterns

- **Local State**: React useState for component-specific state
- **Persistent State**: Custom useLocalStorage hook for browser storage
- **Global State**: React Context for app-wide state (i18n, settings)
- **Optimistic Updates**: React 19 useOptimistic for immediate UI feedback

## Code Organization Principles

1. **Single Responsibility**: Each file has one clear purpose
2. **Co-location**: Related files are grouped together
3. **Separation of Concerns**: Logic, presentation, and styling are separated
4. **Type Safety**: Comprehensive TypeScript coverage with strict mode
5. **Testability**: All components and utilities have corresponding tests
