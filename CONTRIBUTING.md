# 🤝 Contributing to MathGenie

Thank you for your interest in contributing to MathGenie! This guide will help you get started with contributing to our React 19 + TypeScript project.

## 🚀 Quick Start

### Prerequisites

- **Node.js 22.19.0** or higher
- **pnpm 10.15.1** or higher
- **Git** for version control
- **TypeScript 5.9** knowledge

### Setup Development Environment

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/mathgenie.git
   cd mathgenie
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Start Development Server**

   ```bash
   pnpm dev
   ```

4. **Verify Setup**
   ```bash
   pnpm validate  # Runs all checks
   ```

## 📋 Development Workflow

### Before Making Changes

1. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Understand the Codebase**
   - Read [README.md](README.md) for project overview
   - Review [TESTING.md](TESTING.md) for testing strategy
   - Check existing code patterns and conventions

### Making Changes

1. **Follow Code Standards**
   - Use TypeScript strict mode
   - Follow existing naming conventions
   - Write self-documenting code with clear variable names

2. **Maintain Quality**
   ```bash
   pnpm lint      # Fix linting issues
   pnpm type-check # Verify TypeScript compilation
   pnpm test      # Run unit tests
   ```

### Before Submitting

1. **Complete Validation**

   ```bash
   pnpm validate  # Full validation pipeline
   ```

2. **Update Documentation** (if needed)
   - Update README.md for new features
   - Update TESTING.md for test changes
   - Add JSDoc comments for new functions/components

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # Follow conventional commit format
   ```

## 🎯 Contribution Guidelines

### Code Quality Standards

#### TypeScript Requirements

- **Strict Mode**: All code must pass TypeScript strict checks
- **Type Coverage**: 100% TypeScript coverage required
- **No `any` Types**: Use proper typing, avoid `any`
- **Interface Definitions**: Define clear interfaces for all data structures

#### React 19 Best Practices

- **Concurrent Features**: Use `useTransition`, `useDeferredValue` appropriately
- **Error Boundaries**: Implement proper error handling
- **Performance**: Leverage React 19 automatic batching
- **Hooks**: Follow React hooks rules and best practices

#### Code Style

- **ESLint**: All code must pass ESLint checks
- **Prettier**: Consistent formatting required
- **Naming**: Use descriptive, clear names for variables and functions
- **Comments**: Add JSDoc for public APIs and complex logic

### Testing Requirements

#### Unit Tests (Required)

- **Coverage**: Minimum 90% code coverage
- **Framework**: Vitest with happy-dom
- **Location**: Co-locate tests with source files (`*.test.tsx`)
- **Scope**: Test behavior, not implementation details

#### E2E Tests (For UI Changes)

- **Framework**: Playwright
- **Accessibility**: All tests must include WCAG 2.2 AAA compliance checks
- **Mobile**: Test on iPhone, iPad, and Android devices
- **Cross-browser**: Verify Chrome, Firefox, Safari compatibility

#### Test Writing Guidelines

```typescript
// ✅ Good: Test behavior
test('should display error when invalid input provided', async () => {
  // Test the user-facing behavior
});

// ❌ Bad: Test implementation
test('should call validateInput function', async () => {
  // Don't test internal implementation
});
```

### Accessibility Requirements (Critical)

#### WCAG 2.2 AAA Compliance

- **Color Contrast**: Minimum 7:1 ratio for normal text, 4.5:1 for large text
- **Touch Targets**: Minimum 44px for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility required
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators and logical tab order

#### Testing Accessibility

```bash
# Run accessibility tests
pnpm test:e2e:accessibility

# Manual testing checklist:
# - Navigate using only keyboard
# - Test with screen reader
# - Verify color contrast
# - Check touch target sizes
```

### Internationalization (i18n) Requirements

#### Translation Keys (Mandatory)

- **No Hardcoded Strings**: All user-facing text must use translation keys
- **All Languages**: Add keys to all 6 language files (en, zh, es, fr, de, ja)
- **Descriptive Keys**: Use hierarchical, descriptive key names
- **Fallback**: Provide English fallback for missing translations

```typescript
// ✅ Correct
const message = t('errors.validation.required') || 'This field is required';

// ❌ Wrong
const message = 'This field is required';
```

#### Translation Process

1. Add key to `src/i18n/translations/en.ts`
2. Add same key to all other language files
3. Use `t()` function in components
4. Test language switching functionality

### Performance Standards

#### React 19 Optimizations

- **Concurrent Features**: Use for non-urgent updates
- **Automatic Batching**: Leverage for better performance
- **Code Splitting**: Implement for large features
- **Memoization**: Use `useMemo`/`useCallback` judiciously

#### Bundle Size

- **Tree Shaking**: Ensure imports are tree-shakeable
- **Dynamic Imports**: Use for large dependencies
- **Bundle Analysis**: Check impact with `pnpm analyze`

## 🐛 Bug Reports

### Before Reporting

1. **Search Existing Issues**: Check if already reported
2. **Reproduce**: Ensure the bug is reproducible
3. **Environment**: Note browser, device, OS details

### Bug Report Template

```markdown
## Bug Description

Clear description of the issue

## Steps to Reproduce

1. Go to...
2. Click on...
3. See error

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- Browser: Chrome 120
- Device: iPhone 15 Pro
- OS: iOS 17
- Version: 1.0.0

## Additional Context

Screenshots, console errors, etc.
```

## ✨ Feature Requests

### Before Requesting

1. **Check Roadmap**: Review existing plans
2. **Search Issues**: Look for similar requests
3. **Consider Scope**: Ensure it fits project goals

### Feature Request Template

```markdown
## Feature Description

Clear description of the proposed feature

## Use Case

Why is this feature needed?

## Proposed Solution

How should it work?

## Alternatives Considered

Other approaches you've thought about

## Additional Context

Mockups, examples, etc.
```

## 🔄 Pull Request Process

### PR Requirements

- [ ] **Code Quality**: Passes all linting and type checks
- [ ] **Tests**: Includes appropriate tests with 90%+ coverage
- [ ] **Accessibility**: WCAG 2.2 AAA compliant
- [ ] **i18n**: All text properly internationalized
- [ ] **Documentation**: Updated relevant documentation
- [ ] **Performance**: No significant performance regression

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Accessibility tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Comprehensive testing verification
4. **Documentation**: Ensure docs are updated if needed

## 📚 Documentation Guidelines

### When to Update Documentation

- **New Features**: Update README.md and relevant guides
- **API Changes**: Update JSDoc and type definitions
- **Test Changes**: Update TESTING.md if test strategy changes
- **Breaking Changes**: Update migration guides

### Documentation Standards

- **Clear Language**: Write for developers of all skill levels
- **Code Examples**: Include practical, working examples
- **Up-to-date**: Keep documentation synchronized with code
- **Structured**: Use consistent formatting and organization

### File Creation Guidelines

⚠️ **Be Cautious with New Files**: Before creating new documentation files, consider:

1. **Can existing files be extended?** Often better to add sections to existing docs
2. **Is this information temporary?** Avoid files for short-term information
3. **Will this be maintained?** Each new file adds maintenance overhead
4. **Is there a clear audience?** Ensure the file serves a specific purpose

**Preferred approach**: Extend existing documentation rather than creating new files unless there's a clear, long-term need.

## 🎨 Design Guidelines

### UI/UX Principles

- **Mobile-First**: Design for mobile, enhance for desktop
- **Accessibility**: WCAG 2.2 AAA compliance from the start
- **Performance**: Optimize for Core Web Vitals
- **Consistency**: Follow existing design patterns

### Component Development

- **Reusability**: Create reusable, composable components
- **Props Interface**: Define clear, typed prop interfaces
- **Error States**: Handle loading, error, and empty states
- **Responsive**: Ensure components work on all screen sizes

## 🚨 Security Guidelines

### Code Security

- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Sanitize dynamic content
- **Dependencies**: Keep dependencies updated
- **Secrets**: Never commit sensitive information

### Reporting Security Issues

For security vulnerabilities, please email [security@mathgenie.com] instead of creating public issues.

## 🌍 Community Guidelines

### Code of Conduct

- **Respectful**: Treat all contributors with respect
- **Inclusive**: Welcome contributors from all backgrounds
- **Constructive**: Provide helpful, actionable feedback
- **Professional**: Maintain professional communication

### Getting Help

- **Documentation**: Check README.md and TESTING.md first
- **Issues**: Search existing issues for answers
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for clarification during review

## 🏆 Recognition

### Contributors

All contributors are recognized in our:

- GitHub contributors list
- Release notes for significant contributions
- Special recognition for major features or improvements

### Maintainers

Active contributors may be invited to become maintainers with:

- Commit access to the repository
- Ability to review and merge PRs
- Responsibility for project direction and quality

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/cnkang/mathgenie/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cnkang/mathgenie/discussions)
- **Email**: [contribute@mathgenie.com]

---

Thank you for contributing to MathGenie! Your efforts help make math education more accessible and effective for everyone. 🧮✨
