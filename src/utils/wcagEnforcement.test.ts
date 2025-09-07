import { enforceWCAGTouchTargets, setupWCAGEnforcement } from './wcagEnforcement';

describe('WCAG Enforcement', () => {
  test('removes resize listener on cleanup', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const cleanup = setupWCAGEnforcement();

    const resizeCall = addSpy.mock.calls.find(call => call[0] === 'resize');
    const handler = resizeCall?.[1] as EventListener;

    cleanup();

    expect(removeSpy).toHaveBeenCalledWith('resize', handler);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  test('ignores hidden elements', () => {
    const button = document.createElement('button');
    button.style.display = 'none';
    document.body.appendChild(button);

    enforceWCAGTouchTargets();

    expect(button.style.minHeight).toBe('');

    document.body.removeChild(button);
  });
});
