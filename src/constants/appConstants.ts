// UI Constants
export const CSS_CLASSES = {
  FORM_INPUT: 'form-input',
  ACTION_CARD: 'action-card',
  ACTION_CARD_CONTENT: 'action-card-content',
  ACTION_ICON: 'action-icon',
  ACTION_TEXT: 'action-text',
  ACTION_INDICATOR: 'action-indicator',
  ACTION_ARROW: 'action-arrow',
  RANGE_INPUTS: 'range-inputs',
  CHECKBOX_ITEM: 'checkbox-item',
  CHECKBOX_CONTENT: 'checkbox-content',
  CHECKBOX_LABEL: 'checkbox-label',
  CHECKBOX_DESCRIPTION: 'checkbox-description',
  LOADING_SPINNER: 'loading-spinner',
  SR_ONLY: 'sr-only',
  TOGGLE_INDICATOR: 'toggle-indicator',
  TOGGLE_ICON: 'toggle-icon',
  TOGGLE_STATUS: 'toggle-status',
} as const;

// Translation Key Prefixes
export const TRANSLATION_KEYS = {
  SETTINGS_FROM: 'settings.from',
  SETTINGS_TO: 'settings.to',
  BUTTONS_GENERATE: 'buttons.generate',
  ACCESSIBILITY_PREFIX: 'accessibility.',
  BUTTONS_PREFIX: 'buttons.',
  MESSAGES_SUCCESS_PREFIX: 'messages.success.',
  ERRORS_PREFIX: 'errors.',
  OPERATIONS_PREFIX: 'operations.',
  SETTINGS_PREFIX: 'settings.',
  PDF_PREFIX: 'pdf.',
} as const;

// Numeric Constants
export const NUMERIC_CONSTANTS = {
  DECIMAL_RADIX: 10,
  SUCCESS_MESSAGE_TIMEOUT: 5000,
  ANNOUNCEMENT_TIMEOUT: 1000,
} as const;

// Accessibility Constants
export const ACCESSIBILITY = {
  ARIA_LIVE_POLITE: 'polite',
  ARIA_ATOMIC_TRUE: 'true',
  TABINDEX_ZERO: '0',
  TABINDEX_NEGATIVE_ONE: '-1',
} as const;

// Event Keys
export const EVENT_KEYS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  HOME: 'Home',
} as const;
