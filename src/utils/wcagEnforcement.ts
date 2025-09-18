/**
 * WCAG 2.2 AAA Touch Target Size Enforcement
 * This utility ensures all interactive elements meet the minimum 44x44px requirement
 */

import { debounce } from './debounce';

const STR_HIDDEN = 'hidden' as const;
const STR_IMPORTANT = 'important' as const;
const STR_CENTER = 'center' as const;

const INTERACTIVE_SELECTORS = [
  'button',
  'input',
  'select',
  'textarea',
  'a[href]',
  'a',
  '[role="button"]',
  '[tabindex="0"]',
  '[tabindex]:not([tabindex="-1"])',
  '[onclick]',
] as const;

const INTERACTIVE_SELECTOR =
  'button, input, select, textarea, a, [role="button"], [tabindex], [onclick]';

const isInteractive = (node: Node): boolean => {
  if (!(node instanceof Element)) {
    return false;
  }
  return node.matches(INTERACTIVE_SELECTOR);
};

const isVisible = (el: HTMLElement): boolean => {
  const style = window.getComputedStyle(el);
  return (
    style.display !== 'none' &&
    style.visibility !== STR_HIDDEN &&
    style.opacity !== '0' &&
    !el.hidden
  );
};

const isElementHidden = (element: HTMLElement, computedStyle: CSSStyleDeclaration): boolean => {
  const isHiddenAttribute = element.hidden;
  const isDisplayNone = computedStyle.display === 'none';
  const isVisibilityHidden = computedStyle.visibility === STR_HIDDEN;
  const isOpacityZero = computedStyle.opacity === '0';

  return isHiddenAttribute || isDisplayNone || isVisibilityHidden || isOpacityZero;
};

type DeviceTier = 'small-mobile' | 'mobile' | 'desktop';
const DEVICE_TIERS = {
  SMALL: 'small-mobile' as const,
  MOBILE: 'mobile' as const,
  DESKTOP: 'desktop' as const,
};

const getDeviceTier = (): DeviceTier => {
  const MOBILE_BREAKPOINT = 768;
  const SMALL_MOBILE_BREAKPOINT = 480;
  if (window.innerWidth <= SMALL_MOBILE_BREAKPOINT) {
    return DEVICE_TIERS.SMALL;
  }
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    return DEVICE_TIERS.MOBILE;
  }
  return DEVICE_TIERS.DESKTOP;
};

const getMinimumSizeForDevice = (): number => {
  const MIN_TOUCH_TARGET_SIZE = 44;
  switch (getDeviceTier()) {
    case DEVICE_TIERS.SMALL:
      return 50;
    case DEVICE_TIERS.MOBILE:
      return 48;
    default:
      return MIN_TOUCH_TARGET_SIZE;
  }
};

const getPaddingForDevice = (): string => {
  switch (getDeviceTier()) {
    case DEVICE_TIERS.SMALL:
      return '16px';
    case DEVICE_TIERS.MOBILE:
      return '14px';
    default:
      return '12px';
  }
};

const setMinSize = (el: HTMLElement, sizePx: string): void => {
  el.style.setProperty('min-height', sizePx, STR_IMPORTANT);
  el.style.setProperty('min-width', sizePx, STR_IMPORTANT);
};

const applyMinimumDimensions = (element: HTMLElement, minSize: number): void => {
  const sizePx = `${minSize}px`;
  setMinSize(element, sizePx);
  element.style.setProperty('box-sizing', 'border-box', STR_IMPORTANT);
};

const applyButtonStyles = (element: HTMLElement): void => {
  element.style.setProperty('display', 'inline-flex', STR_IMPORTANT);
  element.style.setProperty('align-items', STR_CENTER, STR_IMPORTANT);
  element.style.setProperty('justify-content', STR_CENTER, STR_IMPORTANT);
};

const handleInputElement = (element: HTMLElement, minSize: number): void => {
  const inputType = element.getAttribute('type');
  const isCheckboxOrRadio = inputType === 'checkbox' || inputType === 'radio';

  if (!isCheckboxOrRadio) {
    return;
  }

  const wrapper = element.parentElement;
  if (wrapper) {
    const sizePx = `${minSize}px`;
    setMinSize(wrapper, sizePx);
    wrapper.style.setProperty('display', 'flex', STR_IMPORTANT);
    wrapper.style.setProperty('align-items', STR_CENTER, STR_IMPORTANT);
    wrapper.style.setProperty('cursor', 'pointer', STR_IMPORTANT);
  }
};

// Firefox-optimized element processing with reduced style calculations
const processElement = (element: HTMLElement, minSize: number): void => {
  // Firefox optimization: Cache computed style and reduce calculations
  let computedStyle: CSSStyleDeclaration | null = null;

  const getComputedStyleCached = (): CSSStyleDeclaration => {
    if (!computedStyle) {
      computedStyle = window.getComputedStyle(element);
    }
    return computedStyle;
  };

  const style = getComputedStyleCached();

  if (isElementHidden(element, style)) {
    return;
  }

  // Firefox optimization: Use getBoundingClientRect for better performance
  const rect = element.getBoundingClientRect();
  const currentHeight = rect.height;
  const currentWidth = rect.width;

  if (currentHeight < minSize || currentWidth < minSize) {
    applyMinimumDimensions(element, minSize);

    // Firefox optimization: Reduce padding calculations
    if (isFirefox()) {
      // Simplified padding logic for Firefox
      const padding = getPaddingForDevice();
      element.style.setProperty('padding', padding, STR_IMPORTANT);
    } else {
      // Full padding calculation for other browsers
      const currentPadding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

      if (currentPadding < 12) {
        const padding = getPaddingForDevice();
        element.style.setProperty('padding', padding, STR_IMPORTANT);
      }
    }

    if (element.tagName === 'BUTTON') {
      applyButtonStyles(element);
    }
  }

  if (element.tagName === 'INPUT') {
    handleInputElement(element, minSize);
  }
};

const inNonBrowser = (): boolean =>
  typeof window === 'undefined' || typeof document === 'undefined';

// Firefox performance optimization: Detect browser and apply optimizations
const isFirefox = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox');
};

// Firefox-optimized element processing with batching
const processElementsInBatches = (elements: NodeListOf<Element>, minSize: number): void => {
  const batchSize = isFirefox() ? 10 : 25; // Smaller batches for Firefox
  let index = 0;

  const processBatch = (): void => {
    const endIndex = Math.min(index + batchSize, elements.length);

    for (let i = index; i < endIndex; i++) {
      const element = elements[i];
      if (element instanceof HTMLElement) {
        processElement(element, minSize);
      }
    }

    index = endIndex;

    if (index < elements.length) {
      // Use requestAnimationFrame for better performance in Firefox
      if (isFirefox()) {
        requestAnimationFrame(processBatch);
      } else {
        setTimeout(processBatch, 0);
      }
    }
  };

  processBatch();
};

// Firefox-optimized selector to reduce DOM query complexity
const getOptimizedSelector = (): string => {
  if (isFirefox()) {
    // Use simpler selectors for Firefox to improve performance
    return 'button, input, select, textarea, a[href], [role="button"]';
  }
  return INTERACTIVE_SELECTORS.join(', ');
};

export const enforceWCAGTouchTargets = (): void => {
  if (inNonBrowser()) {
    return;
  }

  const minSize = getMinimumSizeForDevice();
  const selector = getOptimizedSelector();

  // Firefox optimization: Use more efficient DOM querying
  const elements = document.querySelectorAll(selector);

  if (isFirefox() && elements.length > 20) {
    // Use batched processing for Firefox when many elements exist
    processElementsInBatches(elements, minSize);
  } else {
    // Standard processing for other browsers or small element counts
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        processElement(element, minSize);
      }
    });
  }

  if (import.meta.env.DEV) {
    console.log(
      `WCAG Enforcement: Applied ${minSize}px minimum touch targets to ${elements.length} elements (Firefox optimized: ${isFirefox()})`
    );
  }
};

const hasAddedInteractiveNodes = (mutation: MutationRecord): boolean => {
  return mutation.type === 'childList' && Array.from(mutation.addedNodes).some(isInteractive);
};

const hasElementBecomeVisible = (mutation: MutationRecord): boolean => {
  return (
    mutation.type === 'attributes' &&
    mutation.target instanceof HTMLElement &&
    isVisible(mutation.target)
  );
};

const shouldTriggerMutation = (mutation: MutationRecord): boolean => {
  return hasAddedInteractiveNodes(mutation) || hasElementBecomeVisible(mutation);
};

const hasRelevantMutation = (mutations: MutationRecord[]): boolean =>
  mutations.some(shouldTriggerMutation);

const createMutationObserver = (mutationHandler: () => void): MutationObserver => {
  return new MutationObserver(mutations => {
    if (hasRelevantMutation(mutations)) {
      mutationHandler();
    }
  });
};

const setupEventListeners = () => {
  // Firefox optimization: Longer debounce delays for better performance
  const resizeDelay = isFirefox() ? 500 : 250;
  const mutationDelay = isFirefox() ? 200 : 100;

  const resizeHandler = debounce(enforceWCAGTouchTargets, resizeDelay);
  window.addEventListener('resize', resizeHandler);

  const mutationHandler = debounce(enforceWCAGTouchTargets, mutationDelay);
  const observer = createMutationObserver(mutationHandler);

  // Firefox optimization: Reduced observation scope for better performance
  const observerConfig = isFirefox()
    ? {
        childList: true,
        subtree: false, // Reduced scope for Firefox
        attributes: true,
        attributeFilter: ['style', 'class'], // Removed 'hidden' for Firefox
      }
    : {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', STR_HIDDEN],
      };

  observer.observe(document.body, observerConfig);

  return { observer, resizeHandler, mutationHandler };
};

const isServerSideRendering = (): boolean => inNonBrowser();

export const setupWCAGEnforcement = (): (() => void) => {
  if (isServerSideRendering()) {
    return () => {};
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enforceWCAGTouchTargets);
  } else {
    enforceWCAGTouchTargets();
  }

  const { observer, resizeHandler, mutationHandler } = setupEventListeners();

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', resizeHandler);
    resizeHandler.cancel();
    mutationHandler.cancel();
  };
};
