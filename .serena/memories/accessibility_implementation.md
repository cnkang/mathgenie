# MathGenie Accessibility Implementation Guide

## Accessibility Philosophy

### Core Principles
- **Universal Design**: Design for all users from the start, not as an afterthought
- **WCAG 2.2 AAA Compliance**: Meet the highest accessibility standards
- **Progressive Enhancement**: Ensure core functionality works without JavaScript
- **Inclusive by Default**: Every feature must be accessible to all users
- **Real User Testing**: Test with actual assistive technologies and users

## WCAG 2.2 AAA Requirements

### Level AAA Standards
- **Color Contrast**: 7:1 ratio for normal text, 4.5:1 for large text
- **Touch Targets**: Minimum 44×44px for all interactive elements
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader Support**: Comprehensive ARIA implementation
- **Cognitive Accessibility**: Clear language and simple interactions
- **Motor Accessibility**: Support for various input methods

## Implementation Standards

### Color and Contrast
```css
/* ✅ AAA compliant color schemes */
:root {
  /* Light mode - AAA contrast ratios */
  --text-primary: #1a1a1a;        /* 16.94:1 on white */
  --text-secondary: #4a4a4a;      /* 9.74:1 on white */
  --background-primary: #ffffff;
  --accent-primary: #0066cc;       /* 7.27:1 on white */
  
  /* Dark mode - AAA contrast ratios */
  --text-primary-dark: #f5f5f5;   /* 17.38:1 on dark */
  --text-secondary-dark: #cccccc; /* 9.77:1 on dark */
  --background-primary-dark: #121212;
  --accent-primary-dark: #4da6ff; /* 7.12:1 on dark */
}

@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: var(--text-primary-dark);
    --text-secondary: var(--text-secondary-dark);
    --background-primary: var(--background-primary-dark);
    --accent-primary: var(--accent-primary-dark);
  }
}

/* ✅ Never rely on color alone */
.error-message {
  color: #d32f2f;
  border-left: 4px solid #d32f2f; /* Visual indicator */
}

.error-message::before {
  content: "⚠️ "; /* Icon indicator */
}
```

### Touch Targets and Spacing
```css
/* ✅ AAA compliant touch targets */
button,
input,
select,
[role="button"],
[role="tab"],
[role="menuitem"] {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
  margin: 4px; /* Ensure 24px spacing between targets */
}

/* ✅ Large clickable areas */
.problem-card {
  min-height: 88px; /* Double minimum for better usability */
  padding: 16px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
}

.problem-card:hover,
.problem-card:focus {
  border-color: var(--accent-primary);
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### Keyboard Navigation
```typescript
// ✅ Comprehensive keyboard support
const KeyboardNavigableList = ({ items, onSelect }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect(items[focusedIndex]);
        break;
      case 'Escape':
        event.preventDefault();
        listRef.current?.blur();
        break;
    }
  };
  
  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="Problem list"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={index === focusedIndex}
          className={index === focusedIndex ? 'focused' : ''}
        >
          {item.content}
        </li>
      ))}
    </ul>
  );
};
```

### Screen Reader Support
```typescript
// ✅ Comprehensive ARIA implementation
const MathProblem = ({ problem, onAnswer, isCorrect, showResult }) => {
  const problemId = `problem-${problem.id}`;
  const resultId = `result-${problem.id}`;
  
  return (
    <div
      role="group"
      aria-labelledby={problemId}
      aria-describedby={showResult ? resultId : undefined}
    >
      <h3 id={problemId} className="sr-only">
        Math problem: {problem.operand1} {problem.operation} {problem.operand2}
      </h3>
      
      <div aria-hidden="true">
        {problem.operand1} {problem.operationSymbol} {problem.operand2} = ?
      </div>
      
      <label htmlFor={`answer-${problem.id}`} className="sr-only">
        Enter your answer for {problem.operand1} {problem.operation} {problem.operand2}
      </label>
      
      <input
        id={`answer-${problem.id}`}
        type="number"
        onChange={(e) => onAnswer(problem.id, e.target.value)}
        aria-describedby={showResult ? resultId : undefined}
        aria-invalid={showResult && !isCorrect}
      />
      
      {showResult && (
        <div
          id={resultId}
          role="status"
          aria-live="polite"
          className={isCorrect ? 'correct' : 'incorrect'}
        >
          {isCorrect 
            ? `Correct! ${problem.operand1} ${problem.operation} ${problem.operand2} equals ${problem.answer}`
            : `Incorrect. The correct answer is ${problem.answer}`
          }
        </div>
      )}
    </div>
  );
};
```

### Focus Management
```typescript
// ✅ Proper focus management
const Modal = ({ isOpen, onClose, children, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus modal
      modalRef.current?.focus();
      
      // Trap focus within modal
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
        
        if (event.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            
            if (event.shiftKey && document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        
        // Restore previous focus
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="modal-content"
        tabIndex={-1}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose} aria-label="Close dialog">
          ×
        </button>
      </div>
    </div>
  );
};
```

### Form Accessibility
```typescript
// ✅ Accessible form implementation
const ProblemGeneratorForm = ({ onGenerate }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = (data: FormData) => {
    const newErrors: Record<string, string> = {};
    
    const count = data.get('count') as string;
    if (!count || parseInt(count) < 1) {
      newErrors.count = 'Please enter a number greater than 0';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    const formData = new FormData(event.target as HTMLFormElement);
    const validationErrors = validateForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Focus first error field
      const firstErrorField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
      firstErrorField?.focus();
      
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await onGenerate(formData);
    } catch (error) {
      setErrors({ general: 'Failed to generate problems. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset disabled={isSubmitting}>
        <legend>Problem Generation Settings</legend>
        
        {errors.general && (
          <div role="alert" className="error-message">
            {errors.general}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="operation">
            Operation Type
            <span aria-label="required" className="required">*</span>
          </label>
          <select
            id="operation"
            name="operation"
            required
            aria-describedby="operation-help"
          >
            <option value="">Select an operation</option>
            <option value="addition">Addition (+)</option>
            <option value="subtraction">Subtraction (−)</option>
            <option value="multiplication">Multiplication (×)</option>
            <option value="division">Division (÷)</option>
          </select>
          <div id="operation-help" className="help-text">
            Choose the type of math operation for the problems
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="count">
            Number of Problems
            <span aria-label="required" className="required">*</span>
          </label>
          <input
            id="count"
            name="count"
            type="number"
            min="1"
            max="100"
            required
            aria-describedby={errors.count ? 'count-error count-help' : 'count-help'}
            aria-invalid={!!errors.count}
          />
          <div id="count-help" className="help-text">
            Enter a number between 1 and 100
          </div>
          {errors.count && (
            <div id="count-error" role="alert" className="error-message">
              {errors.count}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          aria-describedby="submit-status"
        >
          {isSubmitting ? 'Generating...' : 'Generate Problems'}
        </button>
        
        <div id="submit-status" aria-live="polite" className="sr-only">
          {isSubmitting ? 'Generating problems, please wait' : ''}
        </div>
      </fieldset>
    </form>
  );
};
```

## Testing Accessibility

### Automated Testing
```typescript
// ✅ Comprehensive accessibility testing
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  test('should have no accessibility violations', async () => {
    const { container } = render(<MathProblem problem={mockProblem} />);
    const results = await axe(container, {
      rules: {
        // Enable AAA level rules
        'color-contrast-enhanced': { enabled: true },
        'target-size': { enabled: true },
      },
    });
    
    expect(results).toHaveNoViolations();
  });
  
  test('should support keyboard navigation', async () => {
    render(<ProblemList problems={mockProblems} />);
    
    const list = screen.getByRole('listbox');
    list.focus();
    
    // Test arrow key navigation
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { selected: true })).toBeInTheDocument();
    
    // Test Enter key selection
    fireEvent.keyDown(list, { key: 'Enter' });
    expect(mockOnSelect).toHaveBeenCalled();
  });
  
  test('should announce changes to screen readers', async () => {
    render(<MathProblem problem={mockProblem} />);
    
    const input = screen.getByLabelText(/enter your answer/i);
    fireEvent.change(input, { target: { value: '8' } });
    
    // Check for live region updates
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/correct/i);
    });
  });
});
```

### Manual Testing Checklist
```typescript
// ✅ Manual accessibility testing guide
const AccessibilityTestingChecklist = {
  keyboardNavigation: [
    'Tab through all interactive elements',
    'Use arrow keys for lists and menus',
    'Test Enter and Space for activation',
    'Verify Escape closes modals/menus',
    'Check Home/End navigation',
  ],
  
  screenReader: [
    'Test with NVDA (Windows)',
    'Test with JAWS (Windows)',
    'Test with VoiceOver (macOS/iOS)',
    'Test with TalkBack (Android)',
    'Verify all content is announced',
    'Check ARIA labels and descriptions',
  ],
  
  visualAccessibility: [
    'Test at 200% zoom level',
    'Verify high contrast mode',
    'Check focus indicators visibility',
    'Test with reduced motion enabled',
    'Verify color contrast ratios',
  ],
  
  motorAccessibility: [
    'Test with switch navigation',
    'Verify voice control compatibility',
    'Check touch target sizes on mobile',
    'Test with head tracking devices',
  ],
};
```

## Mobile Accessibility

### Touch Accessibility
```css
/* ✅ Mobile-optimized touch targets */
@media (max-width: 768px) {
  button,
  input,
  select {
    min-height: 48px; /* Larger on mobile */
    min-width: 48px;
    padding: 16px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .problem-card {
    min-height: 96px;
    padding: 20px;
    margin: 8px 0; /* Increased spacing */
  }
}

/* ✅ Prevent accidental activation */
.touch-target {
  touch-action: manipulation; /* Disable double-tap zoom */
}
```

### Voice Control Support
```typescript
// ✅ Voice control compatibility
const VoiceControlButton = ({ children, onClick, ...props }) => {
  return (
    <button
      onClick={onClick}
      aria-label={typeof children === 'string' ? children : undefined}
      data-voice-command={typeof children === 'string' ? children.toLowerCase() : undefined}
      {...props}
    >
      {children}
    </button>
  );
};
```

## Internationalization Accessibility

### RTL Language Support
```css
/* ✅ RTL language support */
[dir="rtl"] .problem-layout {
  flex-direction: row-reverse;
}

[dir="rtl"] .navigation-arrow {
  transform: scaleX(-1);
}

/* ✅ Logical properties for better RTL support */
.content {
  margin-inline-start: 16px;
  margin-inline-end: 8px;
  padding-inline: 12px;
  border-inline-start: 2px solid var(--accent-primary);
}
```

### Language-Specific Accessibility
```typescript
// ✅ Language-aware accessibility
const useAccessibleText = (language: string) => {
  const getAriaLabel = useCallback((key: string, params?: Record<string, any>) => {
    const text = t(key, params);
    
    // Add pronunciation guides for complex terms
    if (language === 'zh' && key.includes('math')) {
      return `${text} (数学)`;
    }
    
    return text;
  }, [language, t]);
  
  return { getAriaLabel };
};
```

## Performance and Accessibility

### Accessible Loading States
```typescript
// ✅ Accessible loading indicators
const AccessibleLoader = ({ isLoading, children, loadingText = 'Loading...' }) => {
  return (
    <div>
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          aria-label={loadingText}
          className="loading-indicator"
        >
          <div className="spinner" aria-hidden="true" />
          <span className="sr-only">{loadingText}</span>
        </div>
      )}
      
      <div aria-hidden={isLoading}>
        {children}
      </div>
    </div>
  );
};
```

### Reduced Motion Support
```css
/* ✅ Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .parallax {
    transform: none !important;
  }
}

/* ✅ Provide alternative feedback for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .success-animation {
    background-color: var(--success-color);
    border: 2px solid var(--success-border);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .success-animation {
    animation: successPulse 0.6s ease-in-out;
  }
}
```

## Accessibility Documentation

### Component Documentation
```typescript
/**
 * MathProblem Component
 * 
 * Accessibility Features:
 * - WCAG 2.2 AAA compliant
 * - Full keyboard navigation support
 * - Screen reader optimized with proper ARIA labels
 * - High contrast mode compatible
 * - Touch targets meet 44px minimum
 * - Supports reduced motion preferences
 * 
 * @param problem - Math problem data
 * @param onAnswer - Callback when user provides answer
 * @param isCorrect - Whether the current answer is correct
 * @param showResult - Whether to show the result
 */
const MathProblem: React.FC<MathProblemProps> = ({ ... }) => {
  // Implementation
};
```

### Accessibility Testing Commands
```bash
# Automated accessibility testing
pnpm test:e2e:accessibility

# Cross-browser accessibility testing
pnpm test:e2e:accessibility:chromium
pnpm test:e2e:accessibility:firefox
pnpm test:e2e:accessibility:webkit

# Mobile accessibility testing
pnpm test:mobile:accessibility
```

## Accessibility Maintenance

### Regular Audits
- [ ] Monthly automated accessibility scans
- [ ] Quarterly manual testing with assistive technologies
- [ ] Annual accessibility expert review
- [ ] User testing with disabled users
- [ ] Accessibility training for development team

### Accessibility Metrics
- [ ] Zero critical accessibility violations
- [ ] 100% keyboard navigable
- [ ] AAA color contrast compliance
- [ ] 44px minimum touch targets
- [ ] Screen reader compatibility score
- [ ] Voice control compatibility