/**
 * WCAG 2.2 AAA Touch Target Size Enforcement
 * This utility ensures all interactive elements meet the minimum 44x44px requirement
 */

import { debounce } from './debounce';

const isElementHidden = (element: HTMLElement, computedStyle: CSSStyleDeclaration): boolean => {
  return (
    element.hidden ||
    computedStyle.display === 'none' ||
    computedStyle.visibility === 'hidden' ||
    computedStyle.opacity === '0'
  );
};

const getMinimumSizeForDevice = (): number => {
  const MIN_TOUCH_TARGET_SIZE = 44;
  const MOBILE_BREAKPOINT = 768;
  const SMALL_MOBILE_BREAKPOINT = 480;

  const isSmallMobile = window.innerWidth <= SMALL_MOBILE_BREAKPOINT;
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  if (isSmallMobile) return 50; // Extra large for very small screens
  if (isMobile) return 48; // Enhanced for mobile
  return MIN_TOUCH_TARGET_SIZE;
};

const getPaddingForDevice = (): string => {
  const MOBILE_BREAKPOINT = 768;
  const SMALL_MOBILE_BREAKPOINT = 480;

  const isSmallMobile = window.innerWidth <= SMALL_MOBILE_BREAKPOINT;
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  if (isSmallMobile) return '16px';
  if (isMobile) return '14px';
  return '12px';
};

const applyMinimumDimensions = (element: HTMLElement, minSize: number): void => {
  element.style.setProperty('min-height', `${minSize}px`, 'important');
  element.style.setProperty('min-width', `${minSize}px`, 'important');
  element.style.setProperty('box-sizing', 'border-box', 'important');
};

const applyButtonStyles = (element: HTMLElement): void => {
  element.style.setProperty('display', 'inline-flex', 'important');
  element.style.setProperty('align-items', 'center', 'important');
  element.style.setProperty('justify-content', 'center', 'important');
};

const handleInputElement = (element: HTMLElement, minSize: number): void => {
  const inputType = element.getAttribute('type');
  const isCheckboxOrRadio = inputType === 'checkbox' || inputType === 'radio';

  if (!isCheckboxOrRadio) return;

  const wrapper = element.parentElement;
  if (wrapper) {
    wrapper.style.setProperty('min-height', `${minSize}px`, 'important');
    wrapper.style.setProperty('min-width', `${minSize}px`, 'important');
    wrapper.style.setProperty('display', 'flex', 'important');
    wrapper.style.setProperty('align-items', 'center', 'important');
    wrapper.style.setProperty('cursor', 'pointer', 'important');
  }
};

const processElement = (element: HTMLElement, minSize: number): void => {
  const computedStyle = window.getComputedStyle(element);

  if (isElementHidden(element, computedStyle)) {
    return;
  }

  const currentHeight = parseFloat(computedStyle.height) || 0;
  const currentWidth = parseFloat(computedStyle.width) || 0;

  if (currentHeight < minSize || currentWidth < minSize) {
    applyMinimumDimensions(element, minSize);

    const currentPadding =
      parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);

    if (currentPadding < 12) {
      const padding = getPaddingForDevice();
      element.style.setProperty('padding', padding, 'important');
    }

    if (element.tagName === 'BUTTON') {
      applyButtonStyles(element);
    }
  }

  if (element.tagName === 'INPUT') {
    handleInputElement(element, minSize);
  }
};

export const enforceWCAGTouchTargets = (): void => {
  const minSize = getMinimumSizeForDevice();

  const interactiveSelectors = [
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
  ];

  const selector = interactiveSelectors.join(', ');
  const elements = document.querySelectorAll(selector);

  elements.forEach(element => {
    processElement(element as HTMLElement, minSize);
  });

  if (import.meta.env.DEV) {
    console.log(
      `WCAG Enforcement: Applied ${minSize}px minimum touch targets to ${elements.length} elements`
    );
  }
};

export const setupWCAGEnforcement = (): (() => void) => {
  // Run enforcement on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enforceWCAGTouchTargets);
  } else {
    enforceWCAGTouchTargets();
  }

  // Re-run enforcement when the window is resized
  const resizeHandler = debounce(enforceWCAGTouchTargets, 250);
  window.addEventListener('resize', resizeHandler);

  // Re-run enforcement when new content is added or revealed
  const mutationHandler = debounce(enforceWCAGTouchTargets, 100);
  const observer = new MutationObserver(mutations => {
    let shouldRerun = false;
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (
              element.matches(
                'button, input, select, textarea, a, [role="button"], [tabindex], [onclick]'
              )
            ) {
              shouldRerun = true;
            }
          }
        });
      }
      if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
        const target = mutation.target as HTMLElement;
        const style = window.getComputedStyle(target);
        if (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0' &&
          !target.hidden
        ) {
          shouldRerun = true;
        }
      }
    });

    if (shouldRerun) {
      mutationHandler();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'hidden'],
  });

  // Cleanup function
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', resizeHandler);
    resizeHandler.cancel();
    mutationHandler.cancel();
  };
};
