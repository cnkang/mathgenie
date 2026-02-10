# 🤝 Contributing to MathGenie

Thank you for your interest in contributing to MathGenie! This guide will help you get started with contributing to our React 19 + TypeScript project.

## 🎯 Development Philosophy: "Good Tools Are Those That Accomplish the Task"

**Core Principle**: The primary objective is to complete tasks effectively, not to use specific tools or methods.

### Quick Decision Framework

```
Problem to Solve → Choose Approach → Try It → Evaluate Result
                                      ↓
                                   Working?
                                   ├─ YES → Continue
                                   └─ NO → Failed 2-3 times?
                                           ├─ YES → Switch Method
                                           └─ NO → Adjust & Retry
```

**Key Guidelines**:

- **Results Over Methods**: Task completion matters more than tool preference
- **Rapid Adaptation**: Switch approaches after 2-3 failures rather than persisting
- **Quality Standards**: Maintain security, functionality, and maintainability regardless of method used
- **Efficiency Focus**: Time spent fighting tools is time not spent solving problems

## 🚀 Quick Start

### Prerequisites

- **Node.js 22.19.0** or higher
- **pnpm 10.29.2** or higher
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
   pnpm lint           # Fix linting issues
   pnpm type-check     # Verify TypeScript compilation
   pnpm test           # Run unit tests
   pnpm sonar:high     # Check for critical code quality issues
   pnpm sonar:local    # Complete local validation (lint + SonarJS)
   ```

### Pragmatic Problem-Solving Approach

#### 🎯 Goal Preservation Principle (Critical)

**Before choosing any "simpler" approach, always ask:**

- Will this approach still achieve the original objective?
- Are we solving the problem or just avoiding it?
- What functionality or quality might we be sacrificing?
- Is there a way to simplify the method without compromising the goal?

**❌ Destructive Simplification (Never Do)**:

- Delete failing tests instead of fixing code
- Remove error-prone features instead of debugging
- Disable quality checks instead of improving code
- Cut requirements instead of improving implementation

**✅ Constructive Simplification (Always Do)**:

- Simplify implementation while preserving functionality
- Use different tools while maintaining quality standards
- Optimize processes without skipping essential steps
- Reduce complexity without reducing value

#### 🔧 Tool Selection Guidelines

**When MCP tools fail repeatedly**:

- **❌ Don't**: Keep trying the same tool with minor variations
- **✅ Do**: Switch to bash/sed/fsWrite after 2-3 failures
- **Why**: Time is valuable, results matter more than tool preference

**When complex regex isn't working**:

- **❌ Don't**: Spend hours perfecting the regex
- **✅ Do**: Use simple string replacement or rewrite the file
- **Why**: Simple solutions are often more maintainable

#### 🏗️ Architecture Decision Guidelines

**When design patterns don't fit**:

- **❌ Don't**: Force the pattern to work
- **✅ Do**: Use a simpler, more appropriate approach
- **Why**: Code should serve the problem, not the other way around

**When "best practices" cause complications**:

- **❌ Don't**: Insist on following them despite issues
- **✅ Do**: Adapt or use a different approach for this context
- **Why**: Context matters more than universal rules

#### 🐛 Debugging & Problem Solving

**When debugging approaches aren't working**:

- **❌ Don't**: Continue with the same method indefinitely
- **✅ Do**: Try different debugging methods, add logging, simplify
- **Why**: Different problems need different approaches

**When implementation takes much longer than expected**:

- **❌ Don't**: Push through with the current approach
- **✅ Do**: Reassess the problem and try a different solution
- **Why**: Efficiency matters for team productivity

### Emergency Protocols

#### When Completely Stuck (> 2 hours on same approach)

1. **Stop and Reassess**: What exactly are we trying to achieve?
2. **Simplify**: Can we solve a smaller version of this problem?
3. **Alternative Research**: What other approaches exist?
4. **Ask for Help**: Get a fresh perspective
5. **Break Down**: Divide the problem into smaller pieces

#### When Under Time Pressure

1. **Prioritize**: What's the minimum viable solution?
2. **Cut Scope**: What can be simplified or deferred?
3. **Use Known Tools**: Stick with familiar, reliable approaches
4. **Document Shortcuts**: Note what needs to be improved later
5. **Validate Core Requirements**: Ensure essential functionality works

### Red Flags (When to Switch Approaches)

🚩 **Immediate Switch Signals**:

- Same method failed 2-3 times
- Spending more time fighting tools than solving problems
- Team productivity being significantly impacted
- Solution becoming overly complex for the problem size

🚩 **Warning Signs**:

- Feeling frustrated with the current approach
- Making excuses for why the method "should" work
- Spending more time on setup than implementation
- Other team members can't understand the approach

### Before Submitting

1. **Complete Validation**

   ```bash
   pnpm validate       # Full validation pipeline (lint + type-check + i18n:check + build + playwright:check + tests)
   pnpm sonar:high     # Advanced code quality analysis
   pnpm sonar:local    # Complete local validation (lint + SonarJS)
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

### Code Quality Standards (Non-Negotiable)

Regardless of the approach chosen, always ensure:

- ✅ **Security**: No vulnerabilities introduced
- ✅ **Functionality**: Code works as required
- ✅ **Maintainability**: Team can understand and modify it
- ✅ **Testing**: Adequate test coverage
- ✅ **Documentation**: Decisions and trade-offs documented

#### Biome Quality Standards

- **Unified Checks**: Use `pnpm lint` for lint + format validation
- **Auto-fixing**: Use `pnpm lint:fix` during development
- **Pre-commit Integration**: Biome checks run automatically before commits

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

- **Biome**: All code must pass Biome lint/format checks
- **Naming**: Use descriptive, clear names for variables and functions
- **Comments**: Add JSDoc for public APIs and complex logic
- **Input Validation**: Use robust validation patterns like those in `useSettings` hook
- **Error Handling**: Implement graceful fallbacks and proper error recovery

#### Enhanced Code Quality (SonarQube Standards)

- **Cognitive Complexity**: Keep functions under 15 cognitive complexity points
- **Function Length**: Limit functions to 50 lines of code
- **Parameter Count**: Maximum 7 parameters per function
- **Return Statements**: Maximum 3 return statements per function
- **Nesting Level**: Maximum 3 levels of nested control structures
- **Expression Complexity**: Limit logical operators in expressions

Use `pnpm sonar:high` to check for violations of these standards.

### Real Development Examples

#### Example 1: File Modification

**Problem**: Need to update multiple files with similar changes
**Failed Approach**: Complex MCP regex replacement (failed 3 times)
**Successful Approach**: Simple bash loop with sed
**Result**: Task completed in 10 minutes vs. 2 hours of struggling

#### Example 2: Data Processing

**Problem**: Complex data transformation needed
**Failed Approach**: Trying to do everything in one complex function
**Successful Approach**: Break into simple, testable functions
**Result**: Easier to debug, test, and maintain

#### Example 3: UI Component

**Problem**: Component needs to handle many edge cases
**Failed Approach**: One complex component with many conditionals
**Successful Approach**: Compose smaller, focused components
**Result**: More reusable, easier to understand and test

### Hook Architecture Patterns

Follow the balanced hook architecture patterns established in the codebase:

**Option 1: Simplified Internal Organization (for focused hooks like `useProblemGenerator`)**

```typescript
export const useProblemGenerator = (
  settings: Settings,
  isLoading: boolean,
  validateSettings: (settings: Settings) => string
) => {
  const [problems, setProblems] = useState<Problem[]>([]);

  // ✅ Organize complex logic with useCallback for performance
  const processGeneration = useCallback(
    (showSuccessMessage: boolean) => {
      const validationError = validateSettings(settings);
      if (validationError) {
        return processValidationError(validationError);
      }
      return createGenerationOutcome({ settings, showSuccessMessage, setProblems });
    },
    [settings, validateSettings, setProblems]
  );

  const generateProblems = useCallback(
    (showSuccessMessage: boolean = true) => {
      if (isLoading) {
        return { ...EMPTY_MESSAGES };
      }
      return processGeneration(showSuccessMessage);
    },
    [isLoading, processGeneration]
  );

  // Auto-regeneration effect
  useEffect(() => {
    if (!isLoading) {
      generateProblems(false);
    }
  }, [settings, isLoading, validateSettings]);

  return { problems, generateProblems };
};
```

**Option 2: Modular Helper Hooks (for complex multi-concern hooks like `useAppLogic`)**

```typescript
// ✅ Extract complex logic into focused helper hooks
const useValidationFeedback = (
  validateSettings: (s: Settings) => string,
  checkRestrictiveSettings: (s: Settings) => boolean,
  setError: (msg: MessageValue) => void,
  setWarning: (msg: MessageValue) => void
) => {
  return useCallback((pendingSettings: Settings): void => {
    // Focused validation logic
  }, [validateSettings, setError, checkRestrictiveSettings, setWarning]);
};

const useSettingsChangeHandler = (
  settings: Settings,
  setSettings: (s: Settings) => void,
  clearMessages: () => void,
  shouldValidateField: (field: keyof Settings) => boolean,
  provideValidationFeedback: (settings: Settings) => void
) => {
  return useCallback(<K extends keyof Settings>(field: K, value: Settings[K]): void => {
    // Settings change logic with validation
  }, [settings, clearMessages, shouldValidateField, provideValidationFeedback, setSettings]);
};

// ✅ Compose helper hooks in main hook
export const useAppHandlers = (...params) => {
  const provideValidationFeedback = useValidationFeedback(...);
  const shouldValidateField = useFieldValidation(...);

  // Main hook logic using composed helpers for settings management
  const handleChange = useCallback((field, value) => {
    // Uses composed validation and change handling logic
  }, [/* proper dependencies */]);

  const handleApplyPreset = useCallback((presetSettings) => {
    // Uses composed preset application logic
  }, [/* proper dependencies */]);

  return { handleChange, handleApplyPreset };
};
```

**When to Use Each Pattern**:

- **Simplified Internal Organization**: For hooks with a single primary concern (like problem generation)
  - Use when the hook has focused responsibility (e.g., `useProblemGenerator`)
  - Organize logic with internal `useCallback` functions for performance
  - Keep all related logic within the hook for easier maintenance
- **Modular Helper Hooks**: For hooks managing multiple related concerns (like app-wide state management)
  - Use when the hook manages multiple distinct concerns
  - Extract complex logic into focused helper hooks
  - Compose helper hooks for maximum reusability

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
- **Touch Targets**: Minimum 44px for all interactive elements (Firefox-optimized enforcement)
- **Keyboard Navigation**: Full keyboard accessibility required
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators and logical tab order
- **Cross-Browser Performance**: Firefox-specific optimizations for accessibility enforcement

#### Testing Accessibility

```bash
# Run accessibility tests (includes Firefox optimizations)
pnpm test:e2e:accessibility

# Test Firefox-specific accessibility performance
pnpm test:e2e:accessibility --project=firefox

# Manual testing checklist:
# - Navigate using only keyboard
# - Test with screen reader (especially in Firefox)
# - Verify color contrast
# - Check touch target sizes (Firefox-optimized enforcement)
# - Verify performance in Firefox with many interactive elements
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

#### Message System Architecture

MathGenie uses a sophisticated message system that supports both legacy strings and new internationalized message objects:

**MessageValue Type**:

```typescript
export type MessageValue = string | MessageState;

export interface MessageState {
  key: string; // Translation key (e.g., 'errors.validation.required')
  params?: Record<string, string | number>; // Optional parameters for interpolation
}
```

**Usage Patterns**:

```typescript
// ✅ Recommended: MessageState with translation key
setError({ key: 'errors.validation.invalidRange', params: { min: 1, max: 100 } });
setSuccessMessage({ key: 'messages.success.problemsGenerated', params: { count: 20 } });

// ✅ Clear messages
setError({ key: '' });
setWarning({ key: '' });

// ✅ Legacy string support (backward compatibility)
setError('Legacy error message'); // Still supported but not recommended
```

**Component Integration**:

The `ErrorMessage` component automatically handles both formats:

- **MessageState objects**: Translates using `t(key, params)`
- **Legacy strings**: Displays directly
- **Type safety**: Full TypeScript support with proper type guards

**Testing Message Systems**:

```typescript
// Test MessageState objects
expect(mockSetError).toHaveBeenCalledWith({
  key: 'errors.validation.required',
  params: { field: 'name' },
});

// Test clearing messages
expect(mockSetError).toHaveBeenCalledWith({ key: '' });
expect(mockSetWarning).toHaveBeenCalledWith({ key: '' });
```

### Performance Standards

#### React 19 Optimizations

- **Concurrent Features**: Use for non-urgent updates
- **Automatic Batching**: Leverage for better performance
- **Code Splitting**: Implement for large features
- **Memoization**: Use `useMemo`/`useCallback` judiciously

#### Accessibility Performance

- **Cross-Browser Optimization**: Firefox-specific optimizations for WCAG enforcement
- **Batched Processing**: Efficient processing of accessibility enhancements
- **DOM Query Optimization**: Reduced complexity for better performance
- **Mutation Observation**: Optimized observation patterns for different browsers

#### Bundle Size

- **Tree Shaking**: Ensure imports are tree-shakeable
- **Dynamic Imports**: Use for large dependencies
- **Bundle Analysis**: Check impact with `pnpm analyze`

### Data Validation and Error Handling

#### Settings Management Pattern

Follow the robust validation pattern established in `useSettings` hook:

```typescript
// ✅ Robust validation with type guards
const isValidArray = (value: unknown, expectedLength?: number): value is unknown[] => {
  return Array.isArray(value) && (expectedLength === undefined || value.length === expectedLength);
};

// ✅ Specific validation for operation arrays
const isValidOperationArray = (value: unknown): value is Operation[] => {
  if (!Array.isArray(value)) {
    return false;
  }
  const validOperations: Operation[] = ['+', '-', '*', '/', '×', '÷'];
  return value.every(op => typeof op === 'string' && validOperations.includes(op as Operation));
};

// ✅ Comprehensive validation and fallback
const validateAndMergeSettings = (parsed: unknown): Settings => {
  const parsedObj = parsed as Record<string, unknown>;

  return {
    ...defaultSettings,
    ...parsedObj,
    // Validate each property with fallback to defaults
    operations: isValidOperationArray(parsedObj.operations)
      ? parsedObj.operations
      : defaultSettings.operations,
    numRange: isValidArray(parsedObj.numRange, 2)
      ? (parsedObj.numRange as [number, number])
      : defaultSettings.numRange,
  };
};
```

#### Error Recovery Patterns

- **Graceful Degradation**: Always provide fallback to safe defaults
- **localStorage Handling**: Clear corrupted data and continue with defaults
- **Type Safety**: Use type guards for runtime validation
- **User Feedback**: Provide clear error messages for validation failures

### Team Communication

#### When Switching Approaches

**Communicate**:

- What approach was tried and why it didn't work
- What alternative is being attempted
- Expected timeline for the new approach
- Any help or resources needed

**Document**:

- Decision rationale in commit messages or comments
- Trade-offs made due to time or complexity constraints
- Lessons learned for future similar problems

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
- [ ] **Pragmatic Approach**: Used most effective tools and methods for the task

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Approach & Tools Used

- [ ] Used standard MCP tools successfully
- [ ] Switched to alternative tools (bash/sed/fsWrite) due to MCP failures
- [ ] Applied pragmatic problem-solving approach
- [ ] Documented tool selection reasoning

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
- [ ] Quality standards maintained regardless of tools used
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
- **Dependencies**: Keep dependencies updated and use pnpm overrides for security fixes when needed
- **Security Overrides**: The project uses pnpm overrides (e.g., `js-yaml ^4.1.1`) to enforce secure versions of transitive dependencies
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

## 💡 Remember

> "The best code is code that works, is secure, and can be maintained by your team. Everything else is secondary."

The goal is not to use the most sophisticated tools or follow the most elegant patterns. The goal is to deliver working, maintainable, secure software efficiently.

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/cnkang/mathgenie/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cnkang/mathgenie/discussions)
- **Email**: [contribute@mathgenie.com]

---

Thank you for contributing to MathGenie! Your efforts help make math education more accessible and effective for everyone. 🧮✨
