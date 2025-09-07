/**
 * WCAG 2.2 AAA Touch Target Size Enforcement
 * This utility ensures all interactive elements meet the minimum 44x44px requirement
 */

export const enforceWCAGTouchTargets = (): void => {
  // WCAG 2.2 AAA Success Criterion 2.5.5: Target Size (Enhanced)
  const MIN_TOUCH_TARGET_SIZE = 44;
  const MOBILE_BREAKPOINT = 768;
  const SMALL_MOBILE_BREAKPOINT = 480;

  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  const isSmallMobile = window.innerWidth <= SMALL_MOBILE_BREAKPOINT;

  // Determine minimum size based on screen size
  let minSize = MIN_TOUCH_TARGET_SIZE;
  if (isSmallMobile) {
    minSize = 50; // Extra large for very small screens
  } else if (isMobile) {
    minSize = 48; // Enhanced for mobile
  }

  // Select all interactive elements
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
    const htmlElement = element as HTMLElement;

    // Skip hidden elements
    if (htmlElement.offsetParent === null || htmlElement.style.display === 'none') {
      return;
    }

    // Get computed styles
    const computedStyle = window.getComputedStyle(htmlElement);
    const currentHeight = parseFloat(computedStyle.height);
    const currentWidth = parseFloat(computedStyle.width);

    // Force minimum dimensions if they're too small
    if (currentHeight < minSize || currentWidth < minSize) {
      // Use inline styles with !important to override any CSS
      htmlElement.style.setProperty('min-height', `${minSize}px`, 'important');
      htmlElement.style.setProperty('min-width', `${minSize}px`, 'important');
      htmlElement.style.setProperty('box-sizing', 'border-box', 'important');

      // Ensure proper padding for touch targets
      const currentPadding =
        parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
      if (currentPadding < 12) {
        const padding = isSmallMobile ? '16px' : isMobile ? '14px' : '12px';
        htmlElement.style.setProperty('padding', padding, 'important');
      }

      // Ensure buttons are properly displayed
      if (htmlElement.tagName === 'BUTTON') {
        htmlElement.style.setProperty('display', 'inline-flex', 'important');
        htmlElement.style.setProperty('align-items', 'center', 'important');
        htmlElement.style.setProperty('justify-content', 'center', 'important');
      }
    }

    // Special handling for checkboxes and radio buttons
    if (
      htmlElement.tagName === 'INPUT' &&
      (htmlElement.getAttribute('type') === 'checkbox' ||
        htmlElement.getAttribute('type') === 'radio')
    ) {
      // Create a larger clickable area around the input
      const wrapper = htmlElement.parentElement;
      if (wrapper) {
        wrapper.style.setProperty('min-height', `${minSize}px`, 'important');
        wrapper.style.setProperty('min-width', `${minSize}px`, 'important');
        wrapper.style.setProperty('display', 'flex', 'important');
        wrapper.style.setProperty('align-items', 'center', 'important');
        wrapper.style.setProperty('cursor', 'pointer', 'important');
      }
    }
  });

  // Add debug information in development
  if (process.env.NODE_ENV === 'development') {
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
  let resizeTimeout: number;
  const resizeHandler = (): void => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(enforceWCAGTouchTargets, 250);
  };
  window.addEventListener('resize', resizeHandler);

  // Re-run enforcement when new content is added (using MutationObserver)
  const observer = new MutationObserver(mutations => {
    let shouldRerun = false;
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any added nodes are interactive elements
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
    });

    if (shouldRerun) {
      // Debounce the enforcement to avoid excessive calls
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(enforceWCAGTouchTargets, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Cleanup function
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', resizeHandler);
  };
};
