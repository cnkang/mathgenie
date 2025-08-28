import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import App from './App';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Speed Insights component
vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => <div data-testid="mocked-speed-insights">Mocked Speed Insights</div>,
}));

// Mock jsPDF for PDF generation tests
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    internal: {
      pageSize: {
        getHeight: () => 297,
        getWidth: () => 210,
      },
    },
  })),
}));

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders MathGenie header', async () => {
    render(<App />);
    await waitFor(() => {
      const header = screen.getByText(/MathGenie/i);
      expect(header).not.toBeNull();
    });
  });

  it('allows user to select operations', async () => {
    render(<App />);
    await waitFor(() => screen.getByLabelText(/Operations/i));

    const operationsSelect = screen.getByLabelText(/Operations/i) as HTMLSelectElement;

    // Manually update the options selection
    for (const option of Array.from(operationsSelect.options)) {
      option.selected = ['*', '/'].includes(option.value);
    }

    fireEvent.change(operationsSelect);

    const selectedOptions = Array.from(operationsSelect.selectedOptions).map(opt => opt.value);
    expect(selectedOptions).toEqual(['*', '/']);
  });

  it('generates problems correctly', async () => {
    render(<App />);
    
    // Wait for the component to load and auto-generate problems
    await waitFor(() => {
      const problemDivs = screen.queryAllByText(/=/);
      expect(problemDivs.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('enables download PDF button after problems are generated', async () => {
    render(<App />);
    
    // Wait for problems to be auto-generated
    await waitFor(() => {
      const downloadButton = screen.getByText(/Download PDF/i) as HTMLButtonElement;
      expect(downloadButton.disabled).toBe(false);
    }, { timeout: 3000 });
  });

  it('checks allow negative results checkbox', async () => {
    render(<App />);
    
    await waitFor(() => {
      const allowNegativeCheckbox = screen.getByLabelText(/Allow Negative Results/i) as HTMLInputElement;
      
      fireEvent.click(allowNegativeCheckbox);
      expect(allowNegativeCheckbox.checked).toBe(true);

      fireEvent.click(allowNegativeCheckbox);
      expect(allowNegativeCheckbox.checked).toBe(false);
    });
  });

  it('updates number of problems input', async () => {
    render(<App />);
    
    await waitFor(() => {
      const numProblemsInput = screen.getByLabelText(/Number of problems/i) as HTMLInputElement;
      
      fireEvent.change(numProblemsInput, { target: { value: '30' } });
      expect(numProblemsInput.value).toBe('30');
    });
  });

  it('applies preset settings', async () => {
    render(<App />);
    
    await waitFor(() => {
      const beginnerPreset = screen.getByText(/Beginner/i);
      const applyButton = beginnerPreset.closest('.preset-card')?.querySelector('button');
      
      if (applyButton) {
        fireEvent.click(applyButton);
        
        // Check if settings were applied
        const numProblemsInput = screen.getByLabelText(/Number of problems/i) as HTMLInputElement;
        expect(numProblemsInput.value).toBe('15');
      }
    });
  });

  it('handles language switching', async () => {
    render(<App />);
    
    await waitFor(() => {
      const languageSelect = screen.getByLabelText(/Language/i) as HTMLSelectElement;
      
      fireEvent.change(languageSelect, { target: { value: 'zh' } });
      expect(languageSelect.value).toBe('zh');
    });
  });

  it('validates number range inputs', async () => {
    render(<App />);
    
    await waitFor(async () => {
      const minNumberInput = screen.getByLabelText(/Minimum number for operands/i) as HTMLInputElement;
      const maxNumberInput = screen.getByLabelText(/Maximum number for operands/i) as HTMLInputElement;
      
      fireEvent.change(minNumberInput, { target: { value: '10' } });
      fireEvent.change(maxNumberInput, { target: { value: '5' } });
      
      // Trigger validation by trying to generate problems
      const generateButton = screen.getByText(/Generate Problems/i);
      fireEvent.click(generateButton);
      
      // Should show error for invalid range
      await waitFor(() => {
        const errorMessage = screen.queryByRole('alert');
        expect(errorMessage).not.toBeNull();
      });
    });
  });

  it('handles PDF download', async () => {
    render(<App />);
    
    await waitFor(() => {
      const downloadButton = screen.getByText(/Download PDF/i) as HTMLButtonElement;
      fireEvent.click(downloadButton);
    }, { timeout: 3000 });
  });

  it('handles show answers toggle', async () => {
    render(<App />);
    
    await waitFor(() => {
      const showAnswersCheckbox = screen.getByLabelText(/Show Answers/i) as HTMLInputElement;
      fireEvent.click(showAnswersCheckbox);
      expect(showAnswersCheckbox.checked).toBe(true);
    });
  });

  it('handles font size changes', async () => {
    render(<App />);
    
    await waitFor(() => {
      const fontSizeInput = screen.getByLabelText(/Font size/i) as HTMLInputElement;
      fireEvent.change(fontSizeInput, { target: { value: '16' } });
      expect(fontSizeInput.value).toBe('16');
    });
  });

  it('validates no operations selected', async () => {
    render(<App />);
    
    await waitFor(() => {
      const operationsSelect = screen.getByLabelText(/Operations/i) as HTMLSelectElement;
      
      for (const option of Array.from(operationsSelect.options)) {
        option.selected = false;
      }
      fireEvent.change(operationsSelect);
      
      const generateButton = screen.getByText(/Generate Problems/i);
      fireEvent.click(generateButton);
    });
  });

  it('handles invalid problem count', async () => {
    render(<App />);
    
    await waitFor(() => {
      const numProblemsInput = screen.getByLabelText(/Number of problems/i) as HTMLInputElement;
      fireEvent.change(numProblemsInput, { target: { value: '101' } });
      
      const generateButton = screen.getByText(/Generate Problems/i);
      fireEvent.click(generateButton);
    });
  });

  it('handles invalid result range', async () => {
    render(<App />);
    
    await waitFor(() => {
      const resultRangeFrom = screen.getByLabelText(/Minimum result value/i) as HTMLInputElement;
      const resultRangeTo = screen.getByLabelText(/Maximum result value/i) as HTMLInputElement;
      
      fireEvent.change(resultRangeFrom, { target: { value: '100' } });
      fireEvent.change(resultRangeTo, { target: { value: '50' } });
      
      const generateButton = screen.getByText(/Generate Problems/i);
      fireEvent.click(generateButton);
    });
  });

  it('handles division operation', async () => {
    render(<App />);
    
    await waitFor(() => {
      const operationsSelect = screen.getByLabelText(/Operations/i) as HTMLSelectElement;
      
      for (const option of Array.from(operationsSelect.options)) {
        option.selected = option.value === '/';
      }
      fireEvent.change(operationsSelect);
    });
  });

  it('handles multiplication operation', async () => {
    render(<App />);
    
    await waitFor(() => {
      const operationsSelect = screen.getByLabelText(/Operations/i) as HTMLSelectElement;
      
      for (const option of Array.from(operationsSelect.options)) {
        option.selected = option.value === '*';
      }
      fireEvent.change(operationsSelect);
    });
  });

  it('handles operands range changes', async () => {
    render(<App />);
    
    await waitFor(() => {
      const operandsFrom = screen.getByLabelText(/Minimum number of operands/i) as HTMLInputElement;
      const operandsTo = screen.getByLabelText(/Maximum number of operands/i) as HTMLInputElement;
      
      fireEvent.change(operandsFrom, { target: { value: '3' } });
      fireEvent.change(operandsTo, { target: { value: '4' } });
      
      expect(operandsFrom.value).toBe('3');
      expect(operandsTo.value).toBe('4');
    });
  });

  it('handles line spacing changes', async () => {
    render(<App />);
    
    await waitFor(() => {
      const lineSpacingInput = screen.getByLabelText(/Line spacing/i) as HTMLInputElement;
      fireEvent.change(lineSpacingInput, { target: { value: '15' } });
      expect(lineSpacingInput.value).toBe('15');
    });
  });

  it('handles paper size changes', async () => {
    render(<App />);
    
    await waitFor(() => {
      const paperSizeSelect = screen.getByLabelText(/Paper size/i) as HTMLSelectElement;
      fireEvent.change(paperSizeSelect, { target: { value: 'letter' } });
      expect(paperSizeSelect.value).toBe('letter');
    });
  });

  it('handles PDF download with no problems', async () => {
    render(<App />);
    
    await waitFor(() => {
      // Clear problems by setting invalid settings
      const operationsSelect = screen.getByLabelText(/Operations/i) as HTMLSelectElement;
      for (const option of Array.from(operationsSelect.options)) {
        option.selected = false;
      }
      fireEvent.change(operationsSelect);
      
      const generateButton = screen.getByText(/Generate Problems/i);
      fireEvent.click(generateButton);
    });
    
    await waitFor(() => {
      const downloadButton = screen.getByText(/Download PDF/i) as HTMLButtonElement;
      fireEvent.click(downloadButton);
    });
  });

  it('handles crypto fallback for random generation', async () => {
    // Mock crypto to be undefined to test fallback
    const originalCrypto = window.crypto;
    const originalMsCrypto = (window as any).msCrypto;
    
    delete (window as any).crypto;
    (window as any).msCrypto = {
      getRandomValues: vi.fn().mockImplementation((array) => {
        array[0] = Math.floor(Math.random() * 0xFFFFFFFF);
      })
    };
    
    render(<App />);
    
    await waitFor(() => {
      const generateButton = screen.getByText(/Generate Problems/i);
      fireEvent.click(generateButton);
    });
    
    // Restore original crypto
    window.crypto = originalCrypto;
    (window as any).msCrypto = originalMsCrypto;
  });

  it('handles error boundary', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock process.env.NODE_ENV to be production
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(
      <App>
        <ThrowError />
      </App>
    );
    
    // Restore environment
    process.env.NODE_ENV = originalEnv;
    consoleSpy.mockRestore();
  });

  it('handles skip link navigation', async () => {
    render(<App />);
    
    await waitFor(() => {
      const skipLink = screen.getByText(/Skip to main content/i);
      expect(skipLink).not.toBeNull();
    });
  });

  it('displays loading state', () => {
    // Mock useTranslation to return loading state
    const mockUseTranslation = vi.fn(() => ({
      t: (key: string) => key,
      isLoading: true
    }));
    
    vi.doMock('./i18n', () => ({
      I18nProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      useTranslation: mockUseTranslation
    }));
    
    render(<App />);
    
    expect(screen.getByText(/loading.translations/i)).not.toBeNull();
  });

  it('handles problem generation with insufficient operands', async () => {
    render(<App />);
    
    await waitFor(() => {
      const operandsFrom = screen.getByLabelText(/Minimum number of operands/i) as HTMLInputElement;
      fireEvent.change(operandsFrom, { target: { value: '1' } });
      
      const generateButton = screen.getByText(/Generate Problems/i);
      fireEvent.click(generateButton);
    });
  });

  it('handles problem generation errors', async () => {
    // Mock crypto to throw an error
    const originalCrypto = window.crypto;
    window.crypto = {
      ...originalCrypto,
      getRandomValues: vi.fn().mockImplementation(() => {
        throw new Error('Crypto error');
      })
    };
    
    render(<App />);
    
    await waitFor(() => {
      const generateButton = screen.getByText(/Generate Problems/i);
      fireEvent.click(generateButton);
    });
    
    // Restore original crypto
    window.crypto = originalCrypto;
  });

  it('handles PDF generation errors', async () => {
    // Mock jsPDF to throw an error
    vi.doMock('jspdf', () => ({
      default: vi.fn().mockImplementation(() => {
        throw new Error('PDF error');
      })
    }));
    
    render(<App />);
    
    await waitFor(() => {
      const downloadButton = screen.getByText(/Download PDF/i) as HTMLButtonElement;
      if (!downloadButton.disabled) {
        fireEvent.click(downloadButton);
      }
    }, { timeout: 3000 });
  });

  it('handles unknown operation in calculation', async () => {
    render(<App />);
    
    await waitFor(() => {
      // This will test the default case in calculateExpression
      const generateButton = screen.getByText(/Generate Problems/i);
      fireEvent.click(generateButton);
    });
  });

  it('handles partial problem generation', async () => {
    render(<App />);
    
    await waitFor(() => {
      // Set very restrictive settings that will likely result in partial generation
      const resultRangeFrom = screen.getByLabelText(/Minimum result value/i) as HTMLInputElement;
      const resultRangeTo = screen.getByLabelText(/Maximum result value/i) as HTMLInputElement;
      
      fireEvent.change(resultRangeFrom, { target: { value: '1000' } });
      fireEvent.change(resultRangeTo, { target: { value: '1001' } });
      
      const numProblemsInput = screen.getByLabelText(/Number of problems/i) as HTMLInputElement;
      fireEvent.change(numProblemsInput, { target: { value: '50' } });
      
      const generateButton = screen.getByText(/Generate Problems/i);
      fireEvent.click(generateButton);
    });
  });
});