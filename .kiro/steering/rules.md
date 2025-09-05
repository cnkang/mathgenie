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
- **WCAG 2.2 AAA accessibility compliance (mandatory)**
- Mobile device testing with touch target validation
- Screen reader compatibility testing
- Keyboard navigation testing
- Color contrast validation
- Reduced motion preference testing
- Use existing test utilities in `tests/e2e/test-utils.ts`

#### Mobile Device Testing Configuration

- **iOS Device Testing**: WebKit engine for iPhone/iPad tests
- **Android Device Testing**: Chromium engine for Android device tests (Chrome-like behavior)
- **Touch Target Validation**: Verify 44px minimum on actual mobile viewports
- **Gesture Testing**: Test swipe, pinch, and touch interactions on mobile devices

#### Browser Engine Requirements

- **iOS Device Testing**: Use WebKit engine for iPhone/iPad tests (more realistic iOS experience)
- **Android Device Testing**: Use Chromium engine for Android device tests
- **Desktop Testing**: Use native browser engines (Chromium, Firefox, WebKit)
- **Accessibility Testing**: Run on Chromium (Desktop/Android simulation), Firefox (Gecko engine), and WebKit (iOS/Safari simulation)
- **Firefox Testing**: Include Firefox (Gecko engine) for comprehensive cross-browser compatibility
- **CI Configuration**: Install Chromium, Firefox, and WebKit browsers for comprehensive testing
- **Test Reports**: Generate separate accessibility reports for each browser engine

#### CI/CD Browser Configuration

- **CI Environment**: Install Chromium, Firefox, and WebKit browsers using `pnpm playwright:install:ci`
- **Accessibility CI**: Run accessibility tests on Chromium, Firefox, and WebKit engines in parallel
  - Chromium: Desktop and Android simulation accessibility testing
  - Firefox: Gecko engine accessibility testing for comprehensive browser coverage
  - WebKit: iOS and Safari simulation accessibility testing
- **Mobile Device Testing**: Configure proper browser engines for realistic mobile testing
  - iPhone/iPad tests: WebKit engine (Safari-like behavior)
  - Android tests: Chromium engine (Chrome-like behavior)
- **Cross-Engine Validation**: Ensure accessibility compliance across different rendering engines
- **Performance Testing**: Run Core Web Vitals tests on both engines for comprehensive performance validation
- **Parallel Execution**: Run accessibility tests simultaneously on both engines to reduce CI time
- **Firefox Testing**: Include Firefox for complete cross-browser compatibility validation (Gecko engine)

## Documentation Maintenance (Critical)

### Documentation Update Requirements

#### When Documentation MUST Be Updated

- **Code Changes**: Any modification to functionality, APIs, or behavior
- **Test Changes**: Updates to test strategy, coverage, or structure
- **Configuration Changes**: Modifications to build, deployment, or development setup
- **Feature Addition/Removal**: New features or deprecated functionality
- **Performance Changes**: Optimizations that affect user experience or development workflow
- **Accessibility Updates**: Changes to WCAG compliance or accessibility features
- **i18n Changes**: Updates to supported languages or translation processes

#### Documentation Synchronization Rules

- **ALWAYS** update documentation in the same commit as code changes
- **NEVER** defer documentation updates to "later" - they must be immediate
- **ALWAYS** verify documentation accuracy after making changes
- **ALWAYS** update examples and code snippets to reflect current implementation
- **ALWAYS** review related documentation files for potential impacts

#### Documentation Files to Consider

When making changes, check if these files need updates:

1. **README.md** - For feature changes, setup modifications, or command updates
2. **TESTING.md** - For test strategy, coverage, or framework changes
3. **CONTRIBUTING.md** - For development workflow or requirement changes
4. **JSDoc Comments** - For API changes or new functions/components
5. **Type Definitions** - For interface or type changes
6. **Configuration Comments** - For build or deployment changes

### File Creation Guidelines

#### Be Cautious with New Files

- **Think First**: Before creating any new file, carefully evaluate if it's truly necessary
- **Avoid Temporary Documentation**: Process documentation, analysis, and explanations should be provided directly in responses rather than creating files
- **Minimize File Proliferation**: Each new file adds maintenance overhead and project complexity
- **Consider Alternatives**: Can the information be integrated into existing files or provided inline?
- **Evaluate Existing Files**: Can current documentation be extended instead of creating new files?

#### When to Create Files

**✅ Create files when:**

- Core functionality that will be maintained long-term
- Configuration files required by tools
- Essential documentation that users will reference repeatedly
- Reusable components or utilities
- Complex processes that require detailed, structured documentation
- Information that serves a distinct, long-term purpose

**❌ Avoid creating files for:**

- Process explanations or analysis (provide in chat instead)
- Temporary documentation or changelogs
- One-time use scripts or utilities
- Architectural decision records (discuss directly)
- Information that can be added to existing documentation
- Short-term or transitional information

#### File Creation Checklist

Before creating a new file, ask:

1. Will this file be referenced or maintained long-term?
2. Does this information belong in an existing file?
3. Can I provide this information directly in my response instead?
4. Does this file add genuine value to the project structure?
5. Can existing documentation be extended to include this information?
6. Will this file be actively maintained and kept up-to-date?
7. Does this serve a distinct purpose that justifies a separate file?

#### Documentation Extension Strategy

**Preferred Approach**: Extend existing documentation rather than creating new files

- **README.md**: Add new sections for features, commands, or setup changes
- **TESTING.md**: Extend with new testing strategies or requirements
- **CONTRIBUTING.md**: Add new guidelines or processes
- **JSDoc**: Enhance existing function/component documentation
- **Configuration Files**: Add comments and explanations inline

**Only Create New Files When**:

- Information doesn't fit logically in existing files
- File would become too large or unwieldy with additions
- Information serves a completely different audience or purpose
- Existing files would lose focus or clarity with additions

## Development Workflow

### Commands (pnpm only)

- `pnpm dev` - Development server
- `pnpm test` - Unit tests with coverage
- `pnpm test:e2e` - End-to-end tests (all browsers)
- `pnpm test:e2e:accessibility` - Accessibility tests (Chromium + Firefox + WebKit for comprehensive coverage)
- `pnpm validate` - Full validation pipeline
- `pnpm build` - Production build
- `pnpm playwright:install` - Install all Playwright browsers (Chromium, Firefox, WebKit)
- `pnpm playwright:install:ci` - Install browsers for CI (Chromium, Firefox, WebKit)

### Code Quality

- ESLint: Single quotes, semicolons required
- Prettier: Consistent formatting
- Git hooks: Pre-commit linting, pre-push validation

## MathGenie Patterns

### Problem Generation

- Use utilities in `src/utils/mathGenerator.ts`
- Follow `NumberInput` validation patterns
- **Implement comprehensive math accessibility features**
- **Ensure mathematical expressions are screen reader accessible**
- **Provide alternative text for mathematical symbols**
- **Support keyboard navigation for problem interaction**

### PDF Generation

- Use jsPDF following existing patterns
- Handle errors gracefully
- Optimize for large problem sets

### Internationalization (Critical)

#### Strict i18n Requirements

- **NEVER** use hardcoded user-facing text strings in components
- **ALWAYS** use translation keys via `useTranslation()` hook
- **ALWAYS** add new keys to ALL 6 language files: en, zh, es, fr, de, ja
- **NEVER** commit code with missing translation keys

#### Implementation Standards

- Custom i18n system with React 19 optimizations
- Support all 6 languages: en, zh, es, fr, de, ja
- Follow existing translation key patterns in `src/i18n/translations/`
- Use descriptive, hierarchical key names (e.g., `errors.quiz.noProblems`)
- Provide fallback to English with development warnings for missing keys

#### Translation Coverage

- Every user-facing string MUST have translations in all 6 languages
- Error messages, button text, labels, and tooltips MUST be internationalized
- Placeholder text and accessibility labels MUST use translation keys
- Dynamic content with interpolation MUST use proper i18n formatting

#### Code Review Requirements

- Reject any PR with hardcoded user-facing strings
- Verify all new translation keys exist in all language files
- Test language switching functionality for new features
- Ensure proper fallback behavior for missing translations

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

## UI/UX Design Principles

### Modern Design Standards

- **Card-based Interactions**: Embrace card-style design patterns as the primary interaction model
- **Large Touch Targets**: Design with mobile-first approach using generous clickable areas
- **Simplified UI Complexity**: Reduce cognitive load by minimizing unnecessary UI elements
- **Intuitive Interaction Patterns**: Prioritize direct, single-step interactions over multi-step processes

### Mobile-First Design Philosophy

- **Touch-Friendly Design**: All interactive elements optimized for finger navigation
- **Responsive by Default**: Design scales seamlessly across all device sizes
- **Gesture-Aware**: Support natural mobile gestures and interactions
- **Performance-Conscious**: Optimize for mobile network and processing constraints

### Interaction Design Patterns

- **Clickable Cards**: Prefer large, card-based clickable areas over small buttons
- **Visual Feedback**: Provide clear hover, focus, and active states for all interactions
- **Progressive Disclosure**: Show information progressively to avoid overwhelming users
- **Consistent Patterns**: Maintain consistent interaction patterns throughout the application

### Design Implementation Guidelines

- **Eliminate Small Buttons**: Replace small action buttons with large, card-based interactions
- **Increase Touch Areas**: Ensure all interactive elements exceed minimum accessibility requirements
- **Streamline User Flows**: Reduce the number of steps required to complete common tasks
- **Modern Visual Language**: Use contemporary design patterns that users expect from modern applications

## Accessibility (WCAG 2.2 AAA - Critical)

### WCAG 2.2 AAA Compliance Requirements

#### Color and Contrast (Level AAA)

- **Enhanced Color Contrast**: Minimum 7:1 contrast ratio for normal text, 4.5:1 for large text
- **Color Independence**: Never rely solely on color to convey information
- **Text Alternatives**: Provide text alternatives for all color-coded information
- **Focus Indicators**: High contrast focus indicators (minimum 3:1 contrast with adjacent colors)

#### Interaction and Navigation (Level AAA)

- **Touch Target Size**: Minimum 44×44px for all interactive elements (WCAG 2.2)
- **Target Spacing**: Minimum 24px spacing between adjacent touch targets
- **Keyboard Navigation**: Full keyboard accessibility without mouse dependency
- **Focus Management**: Logical focus order and visible focus indicators
- **Timeout Extensions**: Allow users to extend or disable time limits

#### Content and Structure (Level AAA)

- **Reading Level**: Content should be understandable at lower secondary education level
- **Abbreviations**: Provide expanded forms for abbreviations and acronyms
- **Pronunciation**: Provide pronunciation guides for ambiguous words
- **Context Help**: Provide context-sensitive help for form inputs

#### Responsive and Adaptive (Level AAA)

- **Reflow**: Content must reflow to 320px width without horizontal scrolling
- **Text Spacing**: Support user text spacing adjustments up to 200%
- **Orientation**: Support both portrait and landscape orientations
- **Motion**: Respect reduced motion preferences

### Implementation Standards

#### Color Contrast Testing

```css
/* Example: AAA compliant dark mode colors */
@media (prefers-color-scheme: dark) {
  .message-info {
    background-color: #1e293b; /* Dark background */
    color: #f1f5f9; /* Light text - 7:1+ contrast */
  }
}
```

#### Touch Target Implementation

```css
/* Ensure all interactive elements meet AAA standards */
button,
input,
select,
[role='button'] {
  min-height: 44px;
  min-width: 44px;
  /* Ensure adequate spacing between targets */
  margin: 12px;
}
```

#### Keyboard Navigation

- **Tab Order**: Logical and predictable tab sequence
- **Skip Links**: Provide skip navigation links for main content
- **Keyboard Shortcuts**: Document and implement consistent shortcuts
- **Focus Trapping**: Proper focus management in modals and dialogs

#### Screen Reader Support

- **ARIA Labels**: Comprehensive and descriptive ARIA labels
- **Live Regions**: Use `aria-live` for dynamic content updates
- **Landmarks**: Proper use of semantic HTML and ARIA landmarks
- **Alternative Text**: Meaningful alt text for all images and icons

### Testing Requirements

#### Automated Testing

- **axe-core**: Run axe-core with WCAG 2.2 AAA rules enabled on Chromium, Firefox, and WebKit
- **Color Contrast**: Automated contrast ratio testing across all three rendering engines
- **Keyboard Navigation**: Automated keyboard accessibility testing on all engines
- **Screen Reader**: Test with screen reader simulation on Chromium (NVDA/JAWS simulation), Firefox (Gecko accessibility), and WebKit (VoiceOver simulation)
- **Cross-Engine Validation**: Ensure accessibility features work consistently across Chromium, Firefox, and WebKit engines

#### Manual Testing

- **Keyboard Only**: Complete application navigation using only keyboard
- **Screen Reader**: Test with actual screen readers (NVDA, JAWS, VoiceOver)
- **High Contrast**: Test in high contrast mode
- **Zoom**: Test at 200% zoom level
- **Reduced Motion**: Test with reduced motion preferences
- **Theme Testing**: Manual verification of accessibility in both light and dark modes
- **Color Independence**: Verify information is not conveyed by color alone in both themes

#### Mobile Accessibility

- **Touch Targets**: Verify 44px minimum on all devices
- **Orientation**: Test both portrait and landscape
- **Voice Control**: Test with voice control features
- **Screen Reader**: Test with mobile screen readers

#### Theme and Color Mode Testing

- **Light Mode**: Test all accessibility features in light color scheme
- **Dark Mode**: Test all accessibility features in dark color scheme
- **Color Contrast**: Verify AAA contrast ratios (7:1 for normal text, 4.5:1 for large text) in both themes
- **Theme Switching**: Ensure accessibility compliance is maintained when switching between themes
- **High Contrast Mode**: Test compatibility with system high contrast preferences
- **Reduced Motion**: Respect user preferences for reduced motion in both themes

### Code Review Checklist

#### Before Committing

- [ ] All interactive elements meet 44px minimum size
- [ ] Color contrast ratios meet 7:1 for normal text, 4.5:1 for large text
- [ ] No information conveyed by color alone
- [ ] All images have meaningful alt text
- [ ] Form inputs have proper labels and descriptions
- [ ] Focus indicators are visible and high contrast
- [ ] Keyboard navigation works for all functionality
- [ ] ARIA labels are descriptive and accurate

#### Testing Validation

- [ ] axe-core tests pass with WCAG 2.2 AAA rules on Chromium, Firefox, and WebKit
- [ ] Manual keyboard navigation test completed
- [ ] Screen reader testing completed
- [ ] Mobile accessibility testing completed
- [ ] Reduced motion preferences respected
- [ ] Light mode accessibility testing completed
- [ ] Dark mode accessibility testing completed
- [ ] Cross-browser accessibility validation (Chromium + Firefox + WebKit)

### Error Prevention

#### Critical Accessibility Violations

- **NEVER** use color alone to convey information
- **NEVER** create interactive elements smaller than 44px
- **NEVER** use contrast ratios below AAA thresholds
- **NEVER** implement functionality that requires mouse interaction
- **NEVER** create content that flashes more than 3 times per second
- **NEVER** auto-play audio or video content

#### Required Patterns

- **ALWAYS** provide text alternatives for visual information
- **ALWAYS** ensure keyboard accessibility for all interactions
- **ALWAYS** use semantic HTML elements appropriately
- **ALWAYS** provide clear error messages and recovery instructions
- **ALWAYS** respect user preferences (reduced motion, high contrast)
- **ALWAYS** test with actual assistive technologies

### Performance and Accessibility

- **Loading States**: Provide accessible loading indicators
- **Error Boundaries**: Accessible error handling and recovery
- **Progressive Enhancement**: Ensure core functionality without JavaScript
- **Reduced Data**: Respect data saving preferences

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
- **Break WCAG 2.2 AAA accessibility standards**
- **Create interactive elements smaller than 44px**
- **Use color alone to convey information**
- **Use contrast ratios below 7:1 for normal text**
- **Implement mouse-only functionality**
- **Auto-play media content**
- **Create flashing content above 3Hz**
- Use dynamic code execution
- Create ReDoS-vulnerable regex patterns
- Commit sensitive information
- **Use hardcoded user-facing text strings in any form**
- **Use string literals in JSX for user-visible content**
- **Commit code with missing translation keys**
- **Add translation keys to only some language files**
- **Use hardcoded text in accessibility attributes**
- **Delete code or disable features as a "solution" without proper analysis**
- **Implement complex solutions when simple ones exist**
- **Over-engineer solutions without clear benefits**
- **Defer documentation updates to "later" - they must be immediate**
- **Commit code changes without updating corresponding documentation**
- **Create new documentation files without evaluating existing alternatives**
- **Leave outdated examples or instructions in documentation**

### ALWAYS

- **Ensure WCAG 2.2 AAA compliance for all new features**
- **Test with keyboard-only navigation**
- **Verify color contrast ratios meet AAA standards**
- **Provide text alternatives for visual information**
- **Test with screen readers and assistive technologies**
- **Respect user preferences (reduced motion, high contrast)**
- **Ensure touch targets meet 44px minimum**
- **Design with mobile-first, touch-friendly interactions**
- **Prefer large clickable cards over small buttons**
- **Create intuitive, single-step interaction patterns**
- **Follow modern card-based design principles**
- Run `pnpm validate` before committing
- Follow existing component patterns
- Include comprehensive tests (including accessibility tests)
- Maintain TypeScript strict compliance
- Consider performance impact without compromising accessibility
- Validate user inputs with accessible error handling
- Review for security implications
- **Use translation keys with t() function for all user-facing text**
- **Provide fallback text with t('key') || 'Fallback' pattern**
- **Add new translation keys to all 6 language files simultaneously**
- **Test language switching for new features**
- **Use descriptive, hierarchical translation key names**
- **Analyze root causes thoroughly before implementing solutions**
- **Consider if existing systems can be extended rather than replaced**
- **Compare complexity vs. benefit when introducing new patterns**
- **Reflect on whether simpler approaches exist before implementing**
- **Validate that proposed changes are optimal solutions**
- **Update documentation immediately when making code, test, or configuration changes**
- **Verify documentation accuracy after any modifications**
- **Consider extending existing documentation before creating new files**
- **Maintain documentation synchronization with code changes**

## Engineering Principles

### Avoid Over-Engineering

- **ALWAYS** analyze the root cause before proposing solutions
- **ALWAYS** consider if existing systems can be extended rather than replaced
- **ALWAYS** compare complexity vs. benefit when introducing new patterns
- **NEVER** delete code or disable features as a "solution" without proper analysis
- **ALWAYS** reflect on whether a simpler approach exists before implementing complex changes
- **ALWAYS** validate that proposed changes are the optimal solution

### Problem-Solving Approach

1. **Understand**: Thoroughly analyze the existing implementation
2. **Identify**: Pinpoint the exact root cause of the issue
3. **Evaluate**: Compare multiple solution approaches (simple vs. complex)
4. **Reflect**: Ask "Is this the best way?" and "Are we over-engineering?"
5. **Implement**: Choose the minimal, most effective solution
6. **Validate**: Ensure the solution doesn't introduce unnecessary complexity

## Hardcoded Strings Prevention (Critical)

### Industry Best Practices for Internationalization

#### Zero Tolerance for Hardcoded User-Facing Text

- **NEVER** use hardcoded strings for any user-visible text
- **NEVER** use string literals in JSX for user-facing content
- **NEVER** use hardcoded text in error messages, labels, buttons, or tooltips
- **NEVER** use hardcoded text in accessibility attributes (aria-label, alt text, etc.)
- **NEVER** use hardcoded text in placeholders or form validation messages

#### Mandatory Translation Key Usage

- **ALWAYS** use `t('translation.key')` for all user-facing text
- **ALWAYS** provide fallback text with `t('key') || 'Fallback'` pattern
- **ALWAYS** add new translation keys to ALL 6 language files simultaneously
- **ALWAYS** use descriptive, hierarchical key names (e.g., `errors.validation.required`)
- **ALWAYS** test language switching for new features

#### Translation Key Management

- **Consistent Naming**: Use dot notation for hierarchical organization
- **Descriptive Keys**: Keys should clearly indicate their purpose and context
- **Interpolation**: Use `{{variable}}` syntax for dynamic content
- **Pluralization**: Handle singular/plural forms appropriately
- **Context**: Include context in key names when meaning could be ambiguous

#### Code Review Requirements

- **Automatic Rejection**: Any PR with hardcoded user-facing strings must be rejected
- **Translation Coverage**: Verify all new keys exist in all 6 language files
- **Fallback Testing**: Ensure proper fallback behavior for missing translations
- **Language Testing**: Test new features in multiple languages

#### Examples of Violations

```typescript
// ❌ NEVER DO THIS
<button>Submit</button>
<p>Error occurred</p>
placeholder="Enter your name"
aria-label="Close dialog"

// ✅ ALWAYS DO THIS
<button>{t('common.submit') || 'Submit'}</button>
<p>{t('errors.general') || 'Error occurred'}</p>
placeholder={t('forms.enterName') || 'Enter your name'}
aria-label={t('accessibility.closeDialog') || 'Close dialog'}
```

#### Exception Handling

- **Development Only**: Hardcoded strings are only acceptable in development/debug code
- **Technical Identifiers**: CSS classes, data attributes, and technical IDs don't need translation
- **Console Logs**: Debug messages and console logs can use hardcoded strings
- **Test Files**: Test assertions can use hardcoded strings for verification

## Engineering Principles Enhancement

### Critical Thinking Before Implementation

#### Mandatory Reflection Process

Before implementing any solution, **ALWAYS** ask these questions:

1. **Root Cause Analysis**: "What is the actual problem I'm solving?"
2. **Solution Evaluation**: "Is this the simplest effective approach?"
3. **Complexity Assessment**: "Am I over-engineering this solution?"
4. **Alternative Consideration**: "Are there simpler alternatives I haven't considered?"
5. **Long-term Impact**: "Will this solution create more problems than it solves?"

#### Anti-Patterns to Avoid

- **Deletion as Solution**: Never delete code or disable features without understanding why they exist
- **Complex Workarounds**: Avoid complex solutions when simple ones exist
- **Feature Creep**: Don't add unnecessary features or complexity
- **Premature Optimization**: Don't optimize before identifying actual performance issues
- **Technology for Technology's Sake**: Don't introduce new tools/patterns without clear benefits

#### Problem-Solving Methodology

1. **Understand Thoroughly**: Analyze existing implementation completely
2. **Identify Precisely**: Pinpoint the exact root cause, not symptoms
3. **Research Alternatives**: Consider multiple approaches (simple to complex)
4. **Evaluate Trade-offs**: Compare complexity vs. benefit for each approach
5. **Choose Minimal Solution**: Select the simplest effective solution
6. **Validate Impact**: Ensure the solution doesn't introduce new problems

#### Code Simplification Guidelines

- **Simplify Thoughtfully**: Only simplify when it genuinely improves maintainability
- **Preserve Functionality**: Never sacrifice working features for "cleaner" code
- **Document Decisions**: Explain why simplification was chosen over alternatives
- **Test Thoroughly**: Ensure simplified code maintains all original behavior
- **Consider Future Needs**: Don't oversimplify to the point of limiting future requirements

#### When Simplification is Appropriate

✅ **Good Simplification**:

- Removing unused code that's confirmed to be dead
- Consolidating duplicate logic into reusable functions
- Replacing complex patterns with simpler, equivalent ones
- Removing unnecessary abstractions that don't add value

❌ **Bad Simplification**:

- Removing code because it's "too complex" without understanding its purpose
- Disabling features instead of fixing them
- Removing error handling or edge case management
- Eliminating accessibility features for "cleaner" code

## Test Coverage Standards (Critical)

### Coverage Requirements

#### Mandatory 80% Coverage Threshold

- **ALWAYS** maintain minimum 80% test coverage for all source files
- **ALWAYS** focus on meaningful test scenarios, not just coverage numbers
- **ALWAYS** test critical business logic and user interactions
- **ALWAYS** test error handling and edge cases
- **ALWAYS** test accessibility features and keyboard navigation

#### Coverage Exclusions

Files that **MAY** be excluded from coverage requirements:

- **Configuration Files**: `vite.config.ts`, `eslint.config.ts`, etc.
- **Type Definitions**: Pure TypeScript type files without logic
- **Development Tools**: Build scripts, development utilities
- **Test Utilities**: Test helper files and mock implementations
- **Entry Points**: Simple index files that only export/import

Files that **MUST NEVER** be excluded:

- **Components**: All React components must have comprehensive tests
- **Hooks**: Custom hooks must test all functionality and edge cases
- **Utilities**: Business logic utilities must be thoroughly tested
- **Services**: API services and data management must be tested
- **State Management**: Context providers and state logic must be tested

#### Meaningful Testing Principles

##### Test Value Assessment

Before writing tests, evaluate:

1. **Business Impact**: Does this code affect user experience or data integrity?
2. **Complexity**: Is the logic complex enough to warrant testing?
3. **Error Prone**: Is this code likely to break or cause issues?
4. **Public API**: Is this code used by other parts of the application?
5. **Accessibility**: Does this code affect accessibility features?

##### Quality Over Quantity

- **NEVER** write tests just to increase coverage numbers
- **NEVER** test trivial getters/setters without business logic
- **NEVER** test framework code or third-party libraries
- **ALWAYS** focus on testing behavior, not implementation details
- **ALWAYS** test user-facing functionality thoroughly

#### Test Categories by Priority

##### High Priority (Must Test)

1. **User Interactions**: Button clicks, form submissions, navigation
2. **Data Validation**: Input validation, error handling
3. **Accessibility**: Keyboard navigation, screen reader support
4. **State Changes**: Component state updates, context changes
5. **Error Boundaries**: Error handling and recovery
6. **Critical Paths**: Core application workflows

##### Medium Priority (Should Test)

1. **Edge Cases**: Boundary conditions, unusual inputs
2. **Performance**: Loading states, optimization features
3. **Integration**: Component interactions, data flow
4. **Responsive Behavior**: Mobile/desktop differences
5. **Internationalization**: Language switching, text rendering

##### Low Priority (Optional)

1. **Styling**: CSS class applications (unless functional)
2. **Simple Utilities**: Trivial helper functions
3. **Constants**: Static configuration values
4. **Type Guards**: Simple type checking functions

#### Coverage Monitoring

##### Automated Checks

- **Pre-commit**: Coverage must meet 80% threshold before commit
- **CI/CD**: Coverage reports generated on every build
- **Pull Requests**: Coverage changes must be reviewed
- **Regression**: Coverage cannot decrease without justification

##### Manual Review

- **Code Review**: Assess test quality, not just coverage percentage
- **Test Scenarios**: Verify tests cover realistic user scenarios
- **Edge Cases**: Ensure error conditions are properly tested
- **Accessibility**: Confirm accessibility features are tested

#### Coverage Exceptions

##### When to Request Exception

- **Legacy Code**: Existing code being phased out
- **Generated Code**: Auto-generated files with no business logic
- **Experimental Features**: Prototype code not yet in production
- **External Dependencies**: Wrapper code for third-party libraries

##### Exception Process

1. **Document Justification**: Clear reasoning for exception
2. **Team Review**: Exception must be approved by team
3. **Time-bound**: Exceptions should have expiration dates
4. **Alternative Testing**: Consider integration or E2E tests instead

## Decision Priority

1. **Test Coverage** - Does this meet 80% coverage with meaningful tests?
2. **Internationalization** - Are all user-facing strings properly translated?
3. **Accessibility (WCAG 2.2 AAA)** - Meets highest accessibility standards for all users?
4. **User Experience** - Follows mobile-first, card-based interaction principles?
5. **Security** - Safe and secure implementation?
6. **Simplicity** - Is this the simplest effective solution with intuitive interactions?
7. **Performance** - Optimized for use case without compromising accessibility or UX?
8. **Testability** - Easily testable with accessibility validation?
9. **Consistency** - Matches existing accessible and modern design patterns?
