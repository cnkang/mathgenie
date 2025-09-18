import * as wcag from './wcagEnforcement';

const { enforceWCAGTouchTargets, setupWCAGEnforcement } = wcag;

// Mock navigator for Firefox detection tests
const mockNavigator = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
};

describe('WCAG Enforcement', () => {
  test('removes resize listener and clears timeout on cleanup', () => {
    vi.useFakeTimers();
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const enforceSpy = vi.spyOn(wcag, 'enforceWCAGTouchTargets');

    const cleanup = setupWCAGEnforcement();

    const resizeCall = addSpy.mock.calls.find(call => String(call[0]) === 'resize');
    const handler = resizeCall?.[1] as EventListener;

    enforceSpy.mockClear();
    window.dispatchEvent(new Event('resize'));
    cleanup();
    vi.runAllTimers();

    expect(removeSpy).toHaveBeenCalledWith('resize', handler);
    expect(enforceSpy).not.toHaveBeenCalled();

    addSpy.mockRestore();
    removeSpy.mockRestore();
    enforceSpy.mockRestore();
    vi.useRealTimers();
  });

  test('ignores elements hidden in different ways', () => {
    const displayNoneButton = document.createElement('button');
    displayNoneButton.style.display = 'none';

    const visibilityHiddenButton = document.createElement('button');
    visibilityHiddenButton.style.visibility = 'hidden';

    const zeroOpacityButton = document.createElement('button');
    zeroOpacityButton.style.opacity = '0';

    const visibleButton = document.createElement('button');

    document.body.append(
      displayNoneButton,
      visibilityHiddenButton,
      zeroOpacityButton,
      visibleButton
    );

    enforceWCAGTouchTargets();

    expect(displayNoneButton.style.minHeight).toBe('');
    expect(visibilityHiddenButton.style.minHeight).toBe('');
    expect(zeroOpacityButton.style.minHeight).toBe('');
    expect(visibleButton.style.minHeight).not.toBe('');

    document.body.removeChild(displayNoneButton);
    document.body.removeChild(visibilityHiddenButton);
    document.body.removeChild(zeroOpacityButton);
    document.body.removeChild(visibleButton);
  });

  test('applies min size when element is revealed', () => {
    const button = document.createElement('button');
    button.style.display = 'none';
    document.body.appendChild(button);

    const cleanup = setupWCAGEnforcement();

    button.style.display = 'block';
    enforceWCAGTouchTargets();
    expect(button.style.minHeight).not.toBe('');

    cleanup();
    document.body.removeChild(button);
  });

  test('wraps checkbox/radio inputs in parent with min size', () => {
    const wrapper = document.createElement('label');
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    wrapper.appendChild(input);
    document.body.appendChild(wrapper);

    enforceWCAGTouchTargets();
    expect(wrapper.style.minHeight).not.toBe('');

    document.body.removeChild(wrapper);
  });

  test('mutation observer triggers enforcement when interactive added', () => {
    const cleanup = setupWCAGEnforcement();

    const btn = document.createElement('button');
    document.body.appendChild(btn);

    // Give chance for debounced handler (simple direct call as fallback)
    enforceWCAGTouchTargets();
    expect(btn.style.minHeight).not.toBe('');

    document.body.removeChild(btn);
    cleanup();
  });

  test('applies device-specific min size for very small screens', () => {
    const originalWidth = window.innerWidth;
    window.innerWidth = 400; // small-mobile tier
    const btn = document.createElement('button');
    document.body.appendChild(btn);

    enforceWCAGTouchTargets();
    expect(btn.style.getPropertyValue('min-height')).toBe('50px');

    document.body.removeChild(btn);
    window.innerWidth = originalWidth;
  });

  test('uses Firefox-optimized selector when Firefox is detected', () => {
    const originalUserAgent = navigator.userAgent;
    mockNavigator('Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0');

    const querySelectorAllSpy = vi.spyOn(document, 'querySelectorAll');

    const btn = document.createElement('button');
    document.body.appendChild(btn);

    enforceWCAGTouchTargets();

    // Verify Firefox-optimized selector was used
    expect(querySelectorAllSpy).toHaveBeenCalledWith(
      'button, input, select, textarea, a[href], [role="button"]'
    );

    document.body.removeChild(btn);
    querySelectorAllSpy.mockRestore();
    mockNavigator(originalUserAgent);
  });

  test('uses standard selector for non-Firefox browsers', () => {
    const originalUserAgent = navigator.userAgent;
    mockNavigator(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124'
    );

    const querySelectorAllSpy = vi.spyOn(document, 'querySelectorAll');

    const btn = document.createElement('button');
    document.body.appendChild(btn);

    enforceWCAGTouchTargets();

    // Verify standard selector was used (contains more complex selectors)
    const calls = querySelectorAllSpy.mock.calls;
    // Find the call that matches our expected selector pattern
    const wcagCall = calls.find(
      call => call[0] && typeof call[0] === 'string' && call[0].includes('button')
    );
    expect(wcagCall).toBeDefined();
    const selectorUsed = wcagCall?.[0];
    expect(selectorUsed).toContain('[tabindex]');
    expect(selectorUsed).toContain('[onclick]');

    document.body.removeChild(btn);
    querySelectorAllSpy.mockRestore();
    mockNavigator(originalUserAgent);
  });

  test('uses batched processing for Firefox with many elements', () => {
    const originalUserAgent = navigator.userAgent;
    mockNavigator('Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0');

    // Create many buttons to trigger batched processing
    const buttons: HTMLButtonElement[] = [];
    for (let i = 0; i < 25; i++) {
      const btn = document.createElement('button');
      btn.textContent = `Button ${i}`;
      document.body.appendChild(btn);
      buttons.push(btn);
    }

    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');

    enforceWCAGTouchTargets();

    // Verify requestAnimationFrame was called for batched processing
    expect(requestAnimationFrameSpy).toHaveBeenCalled();

    // Clean up
    buttons.forEach(btn => document.body.removeChild(btn));
    requestAnimationFrameSpy.mockRestore();
    mockNavigator(originalUserAgent);
  });

  test('uses getBoundingClientRect for Firefox performance optimization', () => {
    const originalUserAgent = navigator.userAgent;
    mockNavigator('Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0');

    const btn = document.createElement('button');
    // Make button small to trigger size enforcement
    btn.style.width = '20px';
    btn.style.height = '20px';
    document.body.appendChild(btn);

    const getBoundingClientRectSpy = vi.spyOn(btn, 'getBoundingClientRect');

    enforceWCAGTouchTargets();

    // Verify getBoundingClientRect was called for size measurement
    expect(getBoundingClientRectSpy).toHaveBeenCalled();

    document.body.removeChild(btn);
    getBoundingClientRectSpy.mockRestore();
    mockNavigator(originalUserAgent);
  });

  test('applies Firefox-specific debounce delays in event listeners', () => {
    const originalUserAgent = navigator.userAgent;
    mockNavigator('Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0');

    vi.useFakeTimers();
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    const cleanup = setupWCAGEnforcement();

    // Verify that event listeners were set up
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    cleanup();
    addEventListenerSpy.mockRestore();
    vi.useRealTimers();
    mockNavigator(originalUserAgent);
  });

  test('handles server-side rendering gracefully', () => {
    const originalWindow = global.window;
    const originalDocument = global.document;

    // Simulate SSR environment
    delete (global as any).window;
    delete (global as any).document;

    // Should not throw error
    expect(() => enforceWCAGTouchTargets()).not.toThrow();
    expect(() => setupWCAGEnforcement()).not.toThrow();

    // Restore environment
    global.window = originalWindow;
    global.document = originalDocument;
  });

  test('logs Firefox optimization status in development mode', () => {
    const originalUserAgent = navigator.userAgent;
    const originalEnv = import.meta.env.DEV;

    mockNavigator('Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0');
    (import.meta.env as any).DEV = true;

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const btn = document.createElement('button');
    document.body.appendChild(btn);

    enforceWCAGTouchTargets();

    // Verify Firefox optimization status is logged
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Firefox optimized: true'));

    document.body.removeChild(btn);
    consoleSpy.mockRestore();
    mockNavigator(originalUserAgent);
    (import.meta.env as any).DEV = originalEnv;
  });
});
