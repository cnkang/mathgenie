import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Test to check if the MathGenie header is rendered
test('renders MathGenie header', () => {
  render(<App />); // Renders the <App /> component
  const headerElement = screen.getByText(/MathGenie/i); // Finds the header element by text
  expect(headerElement).toBeInTheDocument(); // Asserts that the header element is in the document
});

// Test to check if the user can select operations from a dropdown
test('allows user to select operations', () => {
  render(<App />); // Renders the <App /> component

  const operationsSelect = screen.getByLabelText(/Operations/i); // Finds the operations dropdown by label text

  // Clears all selected operators
  fireEvent.change(operationsSelect, {
    target: { multiple: true, value: [] }, // Simulates clearing the selected values
  });
  operationsSelect.options[1].selected = false; // Deselects "+"
  operationsSelect.options[2].selected = false; // Deselects "-"

  // Selects new operators
  operationsSelect.options[2].selected = true; // Selects "*"
  operationsSelect.options[3].selected = true; // Selects "/"

  // Triggers change event for the dropdown
  fireEvent.change(operationsSelect);

  // Asserts that the selected options are '*' and '/'
  const selectedOptions = Array.from(operationsSelect.selectedOptions).map(opt => opt.value);
  expect(selectedOptions).toEqual(['*', '/']);
});

// Test to check if problems are generated correctly
test('generates problems correctly', () => {
  render(<App />); // Renders the <App /> component
  const generateButton = screen.getByText(/Generate Problems/i); // Finds the generate button by text
  fireEvent.click(generateButton); // Simulates a click on the generate button
  const listItems = screen.getAllByRole('listitem'); // Finds all list items
  expect(listItems.length).toBeGreaterThan(0); // Asserts that at least one problem is generated
});

// Test to check if the "Download PDF" button becomes enabled after problems are generated
test('enables download PDF button after problems are generated', () => {
  render(<App />); // Renders the <App /> component
  const generateButton = screen.getByText(/Generate Problems/i); // Finds the generate button by text
  fireEvent.click(generateButton); // Simulates a click on the generate button
  const downloadButton = screen.getByText(/Download PDF/i, { selector: 'button' }); // Finds the download button by text
  expect(downloadButton).not.toBeDisabled(); // Asserts that the download button is enabled
});

// Test to check if the "Allow Negative Results" checkbox can be toggled
test('checks allow negative results checkbox', () => {
  render(<App />); // Renders the <App /> component
  const allowNegativeCheckbox = screen.getByLabelText(/Allow Negative Results:/i); // Finds the checkbox by label text
  fireEvent.click(allowNegativeCheckbox); // Simulates a click on the checkbox
  expect(allowNegativeCheckbox).toBeChecked(); // Asserts that the checkbox is checked

  fireEvent.click(allowNegativeCheckbox); // Simulates another click on the checkbox
  expect(allowNegativeCheckbox).not.toBeChecked(); // Asserts that the checkbox is unchecked
});
