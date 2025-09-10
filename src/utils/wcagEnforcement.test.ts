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
});
