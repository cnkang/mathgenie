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
      element.style.setProperty('padding', padding, STR_IMPORTANT);
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

export const enforceWCAGTouchTargets = (): void => {
  if (inNonBrowser()) {
    return;
  }

  const minSize = getMinimumSizeForDevice();
  const selector = INTERACTIVE_SELECTORS.join(', ');
  const elements = document.querySelectorAll(selector);

  elements.forEach(element => {
    if (element instanceof HTMLElement) {
      processElement(element, minSize);
    }
  });

  if (import.meta.env.DEV) {
    console.log(
      `WCAG Enforcement: Applied ${minSize}px minimum touch targets to ${elements.length} elements`
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
  const resizeHandler = debounce(enforceWCAGTouchTargets, 250);
  window.addEventListener('resize', resizeHandler);

  const mutationHandler = debounce(enforceWCAGTouchTargets, 100);
  const observer = createMutationObserver(mutationHandler);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', STR_HIDDEN],
  });

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
