import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../tests/helpers/testUtils';
import RangeInput from './RangeInput';

describe('RangeInput', () => {
  it('renders and updates values', async () => {
    const user = userEvent.setup();
    const Wrapper: React.FC = () => {
      const [val, setVal] = useState<[number, number]>([1, 10]);
      return (
        <RangeInput
          id='test-range'
          label='Number Range'
          value={val}
          onChange={setVal}
          ariaMinLabel='From'
          ariaMaxLabel='To'
        />
      );
    };
    render(<Wrapper />);

    const from = screen.getByLabelText('From') as HTMLInputElement;
    const to = screen.getByLabelText('To') as HTMLInputElement;
    expect(from.value).toBe('1');
    expect(to.value).toBe('10');

    await user.clear(from);
    await user.type(from, '3');
    expect(from.value).toBe('3');

    await user.clear(to);
    await user.type(to, '12');
    expect(to.value).toBe('12');
  });
});
