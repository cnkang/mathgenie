import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import App from './App';
import { vi } from 'vitest';

vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => <div data-testid="mocked-speed-insights">Mocked Speed Insights</div>,
}));



// Test to check if the MathGenie header is rendered
describe('App Component', () => {
  it('renders MathGenie header', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/MathGenie/i)).toBeInTheDocument();
    });
  });

  it('allows user to select operations', async () => {
    render(<App />);
    await waitFor(() => screen.getByLabelText(/Operations/i));
  
    const operationsSelect = screen.getByLabelText(/Operations/i);
  
    // Manually update the options selection
    for (let option of operationsSelect.options) {
      if (['*', '/'].includes(option.value)) {
        option.selected = true;
      } else {
        option.selected = false;
      }
    }
  
    fireEvent.change(operationsSelect);
  
    const selectedOptions = Array.from(operationsSelect.selectedOptions).map(opt => opt.value);
    expect(selectedOptions).toEqual(['*', '/']);
  });
  

  it('generates problems correctly', async () => {
    render(<App />);
    const generateButton = screen.getByText(/Generate Problems/i);
    fireEvent.click(generateButton);

    const problemDivs = await screen.findAllByText(/=/);
    expect(problemDivs.length).toBeGreaterThan(0);
  });

  it('enables download PDF button after problems are generated', async () => {
    render(<App />);
    const generateButton = screen.getByText(/Generate Problems/i);
    fireEvent.click(generateButton);

    const downloadButton = await screen.findByText(/Download PDF/i, { selector: 'button' });
    expect(downloadButton).not.toBeDisabled();
  });

  it('checks allow negative results checkbox', async () => {
    render(<App />);
    const allowNegativeCheckbox = screen.getByLabelText(/Allow Negative Results:/i);
    fireEvent.click(allowNegativeCheckbox);
    expect(allowNegativeCheckbox).toBeChecked();

    fireEvent.click(allowNegativeCheckbox);
    expect(allowNegativeCheckbox).not.toBeChecked();
  });
});
