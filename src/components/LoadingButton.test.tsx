import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import LoadingButton from './LoadingButton';

describe('LoadingButton', () => {
  test('handles async clicks and loading state', async () => {
    let resolveClick: (() => void) | undefined;
    const onClick = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveClick = resolve;
        })
    );

    render(
      <LoadingButton onClick={onClick} loadingContent={<span aria-label='Loading'>Loading</span>}>
        Action
      </LoadingButton>
    );

    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: 'Action' });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveProperty('disabled', true);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();

    resolveClick!();
    await waitFor(() => expect(button).toHaveProperty('disabled', false));
  });
});
