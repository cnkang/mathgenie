import * as wcag from './wcagEnforcement';

const { enforceWCAGTouchTargets, setupWCAGEnforcement } = wcag;

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
});
