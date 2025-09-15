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
- **Block Braces Required**: Always use block braces for if statements, while loops, for loops, and other control structures, even for single-line statements

#### Quality Tools Integration & Optimization

- **CSS & HTML Quality Workflow**: Integrated quality checks with auto-fixing capabilities
  - `pnpm lint:css-html:fix` - Auto-fix CSS issues and validate HTML
  - `pnpm lint:css-html` - Validation-only quality checks
  - `pnpm lint:css:fix` - CSS-specific auto-fixing
  - `pnpm lint:html` - HTML-specific validation

- **Tool Consolidation**: Modern, actively maintained tools only
  - **HTML Validation**: html-validate (replaces HTMLHint due to compatibility issues)
  - **CSS Linting**: stylelint without deprecated stylelint-config-prettier
  - **Dependency Cleanup**: Removed redundant and incompatible dependencies

- **Pre-commit Integration**: Quality checks are mandatory and cannot be bypassed
  - CSS issues are automatically fixed during commit process
  - HTML validation prevents commits with invalid markup
  - Failed quality checks must be resolved before code can be committed

#### Quality Rule Enforcement (Critical)

- **NEVER disable quality rules for the sake of committing code**
- **ALWAYS fix the underlying quality issue first**
- **ONLY disable rules after thorough analysis confirms they are incorrectly configured**
- **REQUIRE team review and documentation for any rule modifications**

#### Quality Gate Integrity

- Pre-commit hooks cannot be bypassed with `--no-verify` or similar flags
- Quality failures provide clear guidance on resolution steps
- Auto-fixing is preferred over manual intervention where possible
- All quality tools execute with security isolation and timeout protection

#### CSS Quality Standards (Critical)

- **No Duplicate Properties**: Never declare the same CSS property multiple times in a single rule
- **Valid Properties Only**: Use only standard CSS properties; avoid non-standard properties
  - ❌ `tap-highlight-color` (non-standard)
  - ✅ `-webkit-tap-highlight-color` (standard vendor prefix)
- **Property Consolidation**: Remove redundant declarations and combine related properties efficiently
- **Vendor Prefix Compatibility**: Include standard properties alongside vendor-prefixed ones
- **CSS Validation**: Run CSS through linters to catch syntax errors and invalid properties

#### JavaScript Logic Quality Standards (Critical)

- **Avoid Always-Same-Return Functions**: Functions must have meaningful conditional logic
- **Clear Conditional Branches**: Use explicit if/else statements for different code paths
- **Block Braces Required**: Always use block braces `{}` for if statements, while loops, for loops, and other control structures, even for single-line statements
- **Meaningful Error Handling**: Implement proper error handling with different responses for different conditions
- **Service Worker Best Practices**: Use proper cache strategies with explicit conditional logic
  - ✅ Check cache first, then network with different return paths
  - ❌ Functions that always return the same value regardless of conditions
- **Promise Chain Clarity**: Structure promise chains with clear conditional logic and proper error propagation

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

#### Layout Compatibility Requirements (Critical)

- **Text Length Variation Management**: Different languages have significantly different text lengths that can cause layout issues:
  - English to German: Text can expand by 30-50%
  - English to Chinese/Japanese: Text typically contracts by 20-30%
  - English to French/Spanish: Text can expand by 15-25%
- **UI Layout Guidelines**:
  - Use flexible CSS layouts (flexbox, grid) that adapt to content length
  - Avoid fixed-width containers for text elements
  - Test UI with longest expected translations in all supported languages
  - Ensure adequate spacing between UI elements to prevent overlap
  - Use `min-width` and `max-width` constraints appropriately
- **Translation Text Guidelines**:
  - Prefer concise, clear translations over verbose ones
  - Standardize action button text across languages (e.g., "Apply" vs "Click to Apply")
  - Consider text length impact during translation key design
  - Provide context to translators about UI space constraints

#### Code Review Requirements

- Reject any PR with hardcoded user-facing strings
- Verify all new translation keys exist in all language files
- Test language switching functionality for new features
- Ensure proper fallback behavior for missing translations
- **Visual Layout Testing**: Test UI layouts with all supported languages to prevent text overlap or layout breaking
- **Responsive Design Validation**: Ensure layouts work across different viewport sizes with international content

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

### 🔒 Command Injection Prevention

#### Secure Command Execution (Mandatory)

- **NEVER** use `execSync`, `exec`, or `spawn` with `shell: true`
- **ALWAYS** use `spawnSync` or `spawn` with `shell: false`
- **ALWAYS** pass commands and arguments separately (no string concatenation)
- **ALWAYS** validate command arguments against strict whitelists

#### Implementation Pattern

```typescript
// ❌ NEVER DO THIS - Vulnerable to injection
const result = execSync(`command ${userInput}`);

// ✅ ALWAYS DO THIS - Secure execution
const result = spawnSync('command', [validatedArg], {
  shell: false,
  timeout: 60000,
  env: { ...process.env, LD_PRELOAD: undefined },
});
```

#### Input Validation Requirements

- Use regex patterns: `/^[a-zA-Z0-9_\-./]+$/` for file paths
- Block shell metacharacters: `[;&|`$(){}[]<>\*?~]`
- Enforce length limits (e.g., 200 chars for paths)
- Provide clear error messages for invalid inputs

### 🔒 Library Injection Prevention

#### Environment Variable Security

- **ALWAYS** remove dangerous environment variables from child processes:
  - `LD_PRELOAD` (Linux library preloading)
  - `LD_LIBRARY_PATH` (Linux library path)
  - `DYLD_INSERT_LIBRARIES` (macOS library injection)
  - `DYLD_LIBRARY_PATH` (macOS library path)

#### Safe Environment Pattern

```typescript
// ✅ Safe environment handling
const safeEnv = {
  ...process.env,
  // Explicitly remove dangerous variables
  LD_PRELOAD: undefined,
  LD_LIBRARY_PATH: undefined,
  DYLD_INSERT_LIBRARIES: undefined,
  DYLD_LIBRARY_PATH: undefined,
};
```

### 🔒 Input Validation & Sanitization

#### Validation Strategy

- **Validate at boundaries**: API endpoints, file inputs, CLI arguments
- **Fail-fast principle**: Reject invalid inputs immediately
- **Type safety**: Use TypeScript interfaces + runtime validation
- **Whitelist approach**: Allow only known-safe patterns

#### Validation Functions

```typescript
// ✅ Example validation function
function validateFilePattern(input: string): boolean {
  const allowedPattern = /^[a-zA-Z0-9_\-./]+$/;
  const dangerousPattern = /[;&|`$(){}[\]<>*?~]/;

  return allowedPattern.test(input) && !dangerousPattern.test(input) && input.length <= 200;
}
```

### 🔒 Secure Process Execution

#### Process Security Requirements

- **Timeout protection**: Set reasonable timeouts (e.g., 60 seconds)
- **Resource limits**: Prevent resource exhaustion
- **Error handling**: Don't expose sensitive information in errors
- **Audit logging**: Log security-relevant operations

#### Security Checklist

Before executing any external command:

- [ ] Command is in approved whitelist
- [ ] All arguments are validated
- [ ] No shell metacharacters present
- [ ] Environment variables cleaned
- [ ] Timeout configured
- [ ] Error handling implemented
- [ ] Logging configured

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
- **Disable quality rules for the sake of committing code**
- **Use `--no-verify`, `--skip-hooks`, or similar flags to bypass quality checks**
- **Comment out or remove quality rules to force commits through**
- **Ignore quality tool warnings without proper analysis and resolution**
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
- **Use duplicate CSS property declarations in the same rule**
- **Use non-standard CSS properties without proper vendor prefixes**
- **Write JavaScript functions that always return the same value regardless of conditions**
- **Create Service Worker logic that doesn't properly differentiate between cache and network responses**
- **Omit block braces for if statements, while loops, for loops, or other control structures**

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
- **Run quality checks before every commit using `pnpm lint:css-html:fix`**
- **Fix quality issues at their root cause rather than disabling rules**
- **Analyze and understand why quality rules are triggering before taking action**
- **Seek team review before modifying or disabling any quality rules**
- **Document any necessary rule modifications with clear justification**
- **Use auto-fixing capabilities when available to maintain code quality**
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
- **Validate CSS for duplicate properties and invalid property names**
- **Use standard CSS properties with vendor prefixes as fallbacks**
- **Write JavaScript functions with clear conditional logic and different return paths**
- **Implement proper Service Worker cache strategies with explicit conditional branches**
- **Use block braces for all control structures (if, while, for, etc.) even for single-line statements**
- **Run CSS and JavaScript through appropriate linters and validators**

## Quality Tools Optimization & Integration

### CSS & HTML Quality Workflow

#### Integrated Quality Pipeline

- **Pre-commit Auto-fixing**: CSS issues are automatically fixed during commit using `pnpm lint:css-html:fix`
- **HTML Validation**: All HTML files must pass html-validate checks before commit
- **Pre-push Validation**: Comprehensive quality checks run before push using `pnpm lint:css-html`
- **CI/CD Integration**: Quality gates enforced in continuous integration pipeline

#### Tool Modernization

- **HTML Validation**: Migrated from HTMLHint to html-validate
  - **Reason**: HTMLHint has Node.js compatibility issues and is less actively maintained
  - **Benefit**: html-validate is modern, actively maintained, and provides better error reporting
- **CSS Linting**: Removed stylelint-config-prettier dependency
  - **Reason**: Stylelint v15+ deprecated all style-related rules, making this package unnecessary
  - **Benefit**: Cleaner dependency tree and elimination of peer dependency warnings

#### Quality Commands Reference

```bash
# CSS and HTML quality check with auto-fix (use in pre-commit)
pnpm lint:css-html:fix

# CSS and HTML quality check (validation only, use in pre-push)
pnpm lint:css-html

# Individual tool commands
pnpm lint:css:fix    # CSS auto-fix only
pnpm lint:html       # HTML validation only
```

#### Security-First Quality Execution

- **Command Injection Prevention**: All quality tools execute with validated arguments and secure environments
- **Environment Isolation**: Dangerous environment variables removed from child processes
- **Timeout Protection**: All quality checks have reasonable timeout limits
- **Resource Management**: Quality tools run with appropriate resource constraints

### Quality Rule Enforcement Philosophy

#### Core Principles

1. **Quality Rules Exist for Good Reasons**: Every quality rule addresses real code quality, security, or maintainability concerns
2. **Fix Issues, Don't Disable Rules**: The correct response to quality violations is to fix the underlying issue
3. **Thorough Analysis Required**: Before modifying any quality rule, conduct thorough analysis of why it's triggering
4. **Team Review Mandatory**: Any quality rule modifications require team review and documentation

#### Decision Framework for Quality Rule Issues

When a quality rule triggers, follow this decision framework:

1. **First Response**: Fix the underlying code quality issue
   - This is the preferred and most common solution
   - Addresses the root cause rather than symptoms
   - Maintains code quality standards

2. **Second Response**: Analyze rule configuration
   - Determine if the rule is correctly configured for the project context
   - Check if the rule conflicts with other established patterns
   - Verify the rule is appropriate for the specific technology stack

3. **Last Resort**: Rule modification with justification
   - Only after thorough analysis and team review
   - Must be documented with clear reasoning
   - Should include plan for future re-evaluation
   - Requires explicit approval from team leads

#### Prohibited Practices

- **NEVER** use `--no-verify` to bypass pre-commit hooks
- **NEVER** comment out or delete quality rules to force commits
- **NEVER** ignore quality warnings without investigation
- **NEVER** disable rules temporarily without a clear re-enablement plan
- **NEVER** modify quality configurations without team review

#### Quality Gate Integrity

- **Mandatory Execution**: Quality checks cannot be bypassed or skipped
- **Clear Feedback**: Quality failures provide actionable guidance for resolution
- **Auto-fixing Priority**: Use automated fixes when available to reduce manual work
- **Consistent Standards**: Quality rules apply uniformly across the entire codebase

### Quality Metrics & Monitoring

#### Key Quality Indicators

- **CSS Quality**: Zero duplicate properties, valid CSS properties only, proper vendor prefixes
- **HTML Quality**: Valid markup, semantic structure, accessibility compliance
- **JavaScript Quality**: Clear conditional logic, proper error handling, no always-same-return functions
- **Security**: No command injection vulnerabilities, secure environment handling

#### Continuous Improvement

- **Regular Tool Updates**: Keep quality tools updated to latest stable versions
- **Rule Review Cycles**: Periodically review and optimize quality rule configurations
- **Metrics Tracking**: Monitor quality trends and improvement over time
- **Team Training**: Ensure all team members understand quality standards and tools

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

## CSS & JavaScript Code Quality Standards (Critical)

### CSS Quality Requirements

#### Duplicate Property Prevention

- **Problem**: Multiple declarations of the same CSS property in a single rule
- **Solution**: Remove duplicate properties, keep only one declaration per property
- **Example**:

  ```css
  /* ❌ WRONG - Duplicate min-width */
  .button {
    min-width: 160px;
    padding: 12px;
    min-width: 160px; /* Duplicate! */
  }

  /* ✅ CORRECT - Single declaration */
  .button {
    min-width: 160px;
    padding: 12px;
  }
  ```

#### Invalid CSS Property Prevention

- **Problem**: Using non-standard or invalid CSS properties
- **Solution**: Use only standard CSS properties with proper vendor prefixes
- **Example**:

  ```css
  /* ❌ WRONG - Non-standard property */
  .element {
    tap-highlight-color: rgba(79, 70, 229, 0.2);
  }

  /* ✅ CORRECT - Standard vendor prefix */
  .element {
    -webkit-tap-highlight-color: rgba(79, 70, 229, 0.2);
  }
  ```

### JavaScript Logic Quality Requirements

#### Function Return Value Variation

- **Problem**: Functions that always return the same value regardless of conditions
- **Solution**: Implement clear conditional logic with different return paths
- **Example**:

  ```javascript
  // ❌ WRONG - Always returns the same pattern
  function handleRequest(cached, network) {
    return (
      cached ||
      network.then(response => {
        // Always does the same thing regardless of response
        return response;
      })
    );
  }

  // ✅ CORRECT - Clear conditional branches
  function handleRequest(cached, network) {
    if (cached) {
      return cached; // Different return path
    }

    return network.then(response => {
      if (!response || response.status !== 200) {
        return response; // Different handling
      }

      // Cache and return - different logic path
      cacheResponse(response.clone());
      return response;
    });
  }
  ```

#### Service Worker Cache Strategy

- **Problem**: Service Worker logic that doesn't properly differentiate between cache and network
- **Solution**: Implement explicit cache-first or network-first strategies with proper fallbacks
- **Example**:

  ```javascript
  // ❌ WRONG - Unclear logic flow
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).then(fetchResponse => {
          // Always does the same thing
          return fetchResponse;
        })
      );
    })
  );

  // ✅ CORRECT - Clear conditional branches
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // Cache hit - return immediately
      }

      // Cache miss - fetch from network
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse; // Error response
        }

        // Success - cache and return
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
  ```

### Code Quality Validation Process

#### Pre-Commit Checks

1. **CSS Validation**:
   - Run CSS linters to detect duplicate properties
   - Validate CSS property names against standard specifications
   - Check for proper vendor prefix usage

2. **JavaScript Logic Validation**:
   - Review functions for meaningful conditional logic
   - Ensure Service Workers have proper cache strategies
   - Validate promise chains for clear error handling

3. **Automated Tools**:
   - Use ESLint rules to detect logic issues
   - Configure CSS linters to catch property problems
   - Set up pre-commit hooks to prevent quality issues

#### Quality Metrics

- **CSS**: Zero duplicate properties, zero invalid properties
- **JavaScript**: All functions must have meaningful conditional branches
- **Service Workers**: Must implement proper cache strategies with fallbacks
- **Error Handling**: All promise chains must have proper error handling

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

1. **🔒 Security** - Safe and secure implementation with no injection vulnerabilities?
   - Command injection prevention ✅
   - Library injection prevention ✅
   - Input validation & sanitization ✅
   - Secure process execution ✅
2. **Test Coverage** - Does this meet 80% coverage with meaningful tests?
3. **Internationalization** - Are all user-facing strings properly translated?
4. **Accessibility (WCAG 2.2 AAA)** - Meets highest accessibility standards for all users?
5. **User Experience** - Follows mobile-first, card-based interaction principles?
6. **Simplicity** - Is this the simplest effective solution with intuitive interactions?
7. **Performance** - Optimized for use case without compromising accessibility or UX?
8. **Testability** - Easily testable with accessibility validation?
9. **Consistency** - Matches existing accessible and modern design patterns?

### Security-First Development

**Security is the top priority** - No feature or optimization should compromise security:

- 🔒 **Command Injection**: All external command execution must be secure
- 🔒 **Library Injection**: Environment variables must be cleaned
- 🔒 **Input Validation**: All inputs must be validated and sanitized
- 🔒 **Process Security**: All child processes must have proper isolation

**Security Review Checklist** (mandatory before commit):

- [ ] No `execSync`, `exec`, or `spawn` with `shell: true`
- [ ] All command arguments validated against whitelists
- [ ] Dangerous environment variables removed
- [ ] Input validation functions implemented
- [ ] Timeout and error handling configured
- [ ] Security logging implemented
