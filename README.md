# 🧮 MathGenie

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fcnkang%2Fmathgenie.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fcnkang%2Fmathgenie?ref=badge_shield)
[![Node.js 22.19.1](https://img.shields.io/badge/Node.js-22.19.1-green.svg)](https://nodejs.org/)
[![React 19.1.1](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![pnpm 10.15.1](https://img.shields.io/badge/pnpm-10.15.1-orange.svg)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MathGenie is a modern web application built with **React 19.1.1**, **TypeScript 5.9**, and **Node.js 22.19.1**, designed to help tutors generate math problems focusing on basic arithmetic operations. Enhanced with the latest React concurrent features and full TypeScript support for optimal performance, type safety, and developer experience.

## ✨ Features

### 🎯 Core Functionality

- **Select Operations**: Choose which operations (+, -, ✖, ➗) to include in the generated problems
- **Customize Number Range**: Define the range of numbers used as operands
- **Set Result Range**: Define the acceptable range for results
- **Number of Problems**: Specify how many problems to generate
- **Operands Range**: Set the range for the number of operands per problem
- **Negative Results**: Optionally allow negative results
- **Show Answers**: Choose whether to display answers next to the problems
- **PDF Customization**: Specify the font size, line spacing, and paper size of the generated PDF
- **Download PDF**: Generate and download a PDF file with the customized problems

### 🚀 React 19 & TypeScript Enhancements

- **⚡ Concurrent Rendering**: Non-blocking updates with `useTransition` for smooth interactions
- **🔄 Optimistic Updates**: Immediate UI feedback with `useOptimistic` hook
- **📊 Deferred Values**: Smart performance optimization with `useDeferredValue`
- **🛡️ Enhanced Error Boundaries**: Better error handling and recovery with TypeScript support
- **🎭 Improved Suspense**: Granular loading states for better UX
- **🎨 Automatic Batching**: Reduced re-renders for better performance
- **🔒 Type Safety**: Full TypeScript support with strict type checking
- **🌍 Multi-Language Support**: Available in English, Chinese, Spanish, French, German, and Japanese
- **📱 Mobile-Optimized**: Responsive design with React 19 performance improvements
- **♿ Accessibility**: Full keyboard navigation and screen reader support

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1 with concurrent features and TypeScript 5.9
- **Runtime**: Node.js 22.19.1 with enhanced performance
- **Build Tool**: Vite 7.1.4 for lightning-fast development with TypeScript support
- **Package Manager**: pnpm 10.15.1 for optimal performance and disk efficiency
- **Testing**: Vitest + Playwright for comprehensive testing with TypeScript
- **Styling**: Modern CSS with mobile-first responsive design
- **PDF Generation**: jsPDF for client-side PDF creation
- **Internationalization**: Custom i18n system with React 19 optimizations and TypeScript
- **Type Checking**: TypeScript 5.9 with strict configuration

## 📊 Performance Metrics

- **Startup Time**: ~15% faster with Node.js 22
- **Re-renders**: ~30% reduction with React 19 automatic batching
- **Bundle Size**: Optimized with tree shaking and code splitting
- **Core Web Vitals**: Excellent scores across all metrics
- **Accessibility**: WCAG 2.2 AAA compliant
- **Type Safety**: 100% TypeScript coverage with strict mode
- **Test Execution**: Optimized E2E suite (595 tests, 2.6min runtime)

## 🚀 Installation

### Prerequisites

- **Node.js 22.19.1** or higher
- **pnpm 10.15.1** or higher (install globally: `npm install -g pnpm`)
- **TypeScript 5.9** (installed automatically with dependencies)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/cnkang/mathgenie.git
   cd mathgenie
   ```

2. Install pnpm globally (if not already installed):

   ```bash
   npm install -g pnpm
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Development Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run all tests
pnpm test

# Type checking
pnpm type-check

# Lint and format code
pnpm lint
pnpm format

# Complete validation
pnpm validate
```

### 🔍 Code Quality

- **TypeScript strict mode**: Full type safety
- **ESLint + Prettier**: Consistent code style
- **Pre-commit hooks**: Automatic formatting and linting
- **Comprehensive testing**: Unit and E2E tests

## 🔧 TypeScript Configuration

The project uses a strict TypeScript configuration with the following features:

- **Strict Mode**: Full type checking with strict settings
- **Path Aliases**: Convenient imports with `@/` prefix
- **React 19 Support**: Full typing for React 19 features
- **Modern Target**: ES2022 with DOM support
- **Source Maps**: Full debugging support in development

### Type Safety Features

- **Comprehensive Type Definitions**: All components, hooks, and utilities are fully typed
- **Strict Null Checks**: Prevents null/undefined errors at compile time
- **Interface Definitions**: Clear contracts for all data structures
- **Generic Types**: Reusable type-safe components and hooks
- **Utility Types**: Advanced TypeScript patterns for better DX

## Usage

1. Open the application in your browser.

2. Customize the settings:
   - **Select Operations**: Choose the arithmetic operations to be used.
   - **Number Range**: Define the range of numbers for the operands.
   - **Result Range**: Specify the acceptable range for calculation results.
   - **Number of Problems**: Enter the number of problems you want to generate.
   - **Number of Operands**: Adjust the range for the number of operands in each problem.
   - **Allow Negative Results**: Check or uncheck to allow or disallow negative results.
   - **Show Answers**: Check or uncheck to display or hide answers.
   - **Font Size**: Define the font size for the PDF.
   - **Line Spacing**: Define the line spacing for the PDF.
   - **Paper Size**: Choose the paper size (A4, Letter, Legal).

3. Click `Generate Problems` to create the math problems.

4. Review the generated problems displayed on the page.

5. Click `Download PDF` to save the problems as a PDF file.

## Example

After configuring the settings:

1. Set the number range from 1 to 10.
2. Allow only addition and subtraction.
3. Generate 10 problems.
4. Display answers.
5. Save the results in a PDF file.

## 🎯 React 19 + TypeScript Features in Action

### React 19 Features

- **Concurrent Rendering**: Smooth, non-blocking updates
- **Optimistic Updates**: Instant UI feedback
- **Enhanced Performance**: Automatic batching and smart scheduling
- **Error Boundaries**: Robust error handling with TypeScript

## 🧪 Testing

### Test Suite Overview

MathGenie features a comprehensive, optimized test suite:

- **595 E2E tests** (optimized from 623, ~7% faster execution)
- **90% code coverage** with unit and integration tests
- **WCAG 2.2 AAA compliance** testing across all devices and themes
- **Cross-browser compatibility** (Chrome, Firefox, Safari)
- **Mobile device testing** (iPhone, iPad, Android)

### Unit & Integration Tests

```bash
# Unit tests with coverage
pnpm test

# Watch mode for development
pnpm test:watch
```

### E2E Tests

```bash
# All E2E tests (optimized suite - 595 tests)
pnpm test:e2e

# Smoke tests (essential functionality)
pnpm test:smoke

# E2E with UI (interactive debugging)
pnpm test:e2e:ui

# Specific test suites
pnpm test:e2e:accessibility    # WCAG 2.2 AAA compliance tests
pnpm test:e2e:integration      # Complex integration scenarios
pnpm test:e2e:presets          # Settings presets functionality
pnpm test:e2e:localstorage     # Data persistence tests
pnpm test:e2e:error-handling   # Error handling and validation

# Essential mobile devices (included in CI)
pnpm exec playwright test --project=mobile-iphone      # iPhone 16 Pro
pnpm exec playwright test --project=mobile-android     # Galaxy S24
pnpm exec playwright test --project=mobile-ipad        # Large iPad Landscape
pnpm exec playwright test --project=mobile-android-tablet # Galaxy Tab S9 Landscape
```

### Mobile Device Testing

Test on the latest iPhone and iPad devices with both portrait and landscape orientations:

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

# Latest devices only
pnpm test:mobile:latest

# Enhanced E2E mobile tests
pnpm test:mobile:e2e
pnpm test:mobile:e2e:iphone
pnpm test:mobile:e2e:ipad
```

### Supported Mobile Devices

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

### Advanced Testing

```bash
# Using the test script directly
./scripts/test-e2e.sh mobile iphone16     # iPhone 16 series
./scripts/test-e2e.sh mobile ipad         # All iPads
./scripts/test-e2e.sh mobile-e2e latest  # E2E on latest devices
```

## 🚀 Deployment

### Automatic Deployment with Vercel

This project uses **Vercel webhooks** for automatic deployment:

- **Production**: Automatically deploys from `main` branch
- **Preview**: Every PR gets a preview deployment
- **Zero Configuration**: Vercel handles build and deployment automatically

### Local Build Verification

```bash
# Verify build locally before pushing
pnpm build
pnpm preview
```

The build process includes:

- TypeScript compilation with strict type checking
- React 19 concurrent features optimization
- Tree shaking and code splitting
- Source map generation for debugging

### CI/CD Pipeline

GitHub Actions handles quality assurance with an optimized test suite:

- ✅ Code quality checks (ESLint, Prettier)
- ✅ TypeScript type checking
- ✅ Unit and integration tests (90% coverage)
- ✅ Optimized E2E testing (595 tests, ~2.6min execution)
- ✅ Cross-browser testing (Chrome, Firefox)
- ✅ Essential mobile device testing (iPhone, Android phone/tablet, iPad)
- ✅ Comprehensive accessibility compliance (WCAG 2.2 AAA)
- ✅ Security scanning
- ✅ Performance monitoring (Lighthouse)
- ✅ i18n translation validation

## 📈 Performance Monitoring

### Built-in Analytics with TypeScript

- **Vercel Speed Insights** for real-time performance metrics
- **Web Vitals** tracking with typed interfaces
- **React 19 Profiler** integration with TypeScript support

### Key Metrics

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Type Safety**: 100% TypeScript coverage

## 🌍 Internationalization

### Supported Languages

- 🇺🇸 English
- 🇨🇳 Chinese (Simplified)
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇯🇵 Japanese

## 🔧 Configuration

### Configuration

The project uses strict TypeScript configuration with React 19 optimizations enabled by default.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for comprehensive information on:

- 🚀 Development setup and workflow
- 📏 Code standards and best practices
- 🧪 Testing requirements and guidelines
- 🌍 Internationalization requirements
- ♿ Accessibility compliance (WCAG 2.2 AAA)
- 📝 Commit and PR guidelines
- 🐛 Issue reporting templates
- 📚 Documentation maintenance requirements

### Quick Start for Contributors

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/mathgenie.git
cd mathgenie

# Install dependencies and start development
pnpm install
pnpm dev

# Run validation before submitting
pnpm validate
```

### Key Requirements

- **React 19 + TypeScript**: Use concurrent features and strict typing
- **Testing**: 90% coverage with optimized E2E suite (see [TESTING.md](TESTING.md))
- **Accessibility**: WCAG 2.2 AAA compliance required
- **i18n**: All user-facing text must use translation keys
- **Mobile**: Test on iPhone, iPad, and Android devices
- **Documentation**: Update docs immediately with code changes

## 🐛 Troubleshooting

### Common Issues

**Node.js Version**

```bash
# Check Node.js version
node --version  # Should be 22.x.x

# Update Node.js
nvm install 22
nvm use 22
```

**TypeScript Errors**

```bash
# Check TypeScript compilation
pnpm type-check

# Build with type checking
pnpm build:types
```

**React 19 Features Not Working**

- Ensure you're using React 19.1.1 or higher
- Check TypeScript configuration for React 19 support
- Verify feature flags in `react19-config.ts`

## Dependencies

### Core Dependencies

- `react`: JavaScript library for building user interfaces with TypeScript support
- `react-dom`: React DOM rendering with TypeScript definitions
- `typescript`: TypeScript compiler and language support
- `jspdf`: JavaScript library for generating PDF documents
- `@types/react`: TypeScript definitions for React
- `@types/react-dom`: TypeScript definitions for React DOM

### Development Dependencies

- `@typescript-eslint/eslint-plugin`: TypeScript ESLint rules
- `@typescript-eslint/parser`: TypeScript parser for ESLint
- `@types/node`: Node.js TypeScript definitions
- `vitest`: Testing framework with TypeScript support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Kang Liu**

Third-party dependencies and their licenses are documented in the [NOTICE](NOTICE) file.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fcnkang%2Fmathgenie.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fcnkang%2Fmathgenie?ref=badge_large)

## 🙏 Acknowledgments

- **React Team** for the amazing React 19 features
- **TypeScript Team** for the excellent type system and tooling
- **Node.js Team** for the performance improvements in Node.js 22
- **Vite Team** for the lightning-fast build tool with TypeScript support
- **Community Contributors** for their valuable feedback and contributions

---

**Built with ❤️ using React 19.1.1, TypeScript 5.9, and Node.js 22.19.1**
