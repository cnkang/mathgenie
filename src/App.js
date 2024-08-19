import React, { useState, useEffect } from 'react'; // Import React and useState hook
import { jsPDF } from 'jspdf'; // Import jsPDF library for PDF generation
import { nanoid } from 'nanoid'; // Import nanoid for unique keys
import './App.css'; // Import CSS for styling

/**
 * The main component of the MathGenie application.
 *
 * @return {JSX.Element} The rendered MathGenie application.
 */
function App() {
  const [settings, setSettings] = useState({
    operations: ['+'], // Allowed operations
    numProblems: 10, // Number of problems to generate
    numRange: [1, 10], // Range of numbers for operands
    resultRange: [0, 100], // Acceptable range for results
    numOperandsRange: [2, 3], // Range for the number of operands
    allowNegative: false, // Whether to allow negative results
    showAnswers: true, // Whether to show answers
    fontSize: 12, // Font size for PDF
    lineSpacing: 10, // Line spacing for PDF
    paperSize: 'a4', // Paper size for PDF
  });
  const [problems, setProblems] = useState([]);

  const paperSizeOptions = {
    'a4': 'a4',
    'letter': 'letter',
    'legal': 'legal',
  };

  /**
   * Calculates the result of an expression with given operands and operators.
   *
   * @param {Array<number>} operands - The array of operands.
   * @param {Array<string>} operators - The array of operators.
   * @return {number} The result of the expression.
   */
  const calculateExpression = (operands, operators) => {
    let result = operands[0];

    for (let i = 0; i < operators.length; i++) {
      const operator = operators[i];
      const operand = operands[i + 1];

      switch (operator) {
        case '+':
          result += operand;
          break;
        case '-':
          result -= operand;
          break;
        case '*':
          result *= operand;
          break;
        case '/':
          result = result / operand;
          break;
        default:
          return NaN;
      }
    }

    return result;
  };

  /**
   * Generates a math problem with random operands and operations within the specified ranges.
   *
   * @return {string} The generated math problem, or an empty string if no valid problem was generated in MAX_ATTEMPTS attempts.
   */
  const generateProblem = () => {
    const numOperands = Math.floor(Math.random() * (settings.numOperandsRange[1] - settings.numOperandsRange[0] + 1)) + settings.numOperandsRange[0];

    if (numOperands < 2) return '';

    const MAX_ATTEMPTS = 10000;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const operands = Array.from({ length: numOperands }, () =>
        Math.floor(Math.random() * (settings.numRange[1] - settings.numRange[0] + 1)) + settings.numRange[0]
      );

      const operationSymbols = Array.from({ length: numOperands - 1 }, () =>
        settings.operations[Math.floor(Math.random() * settings.operations.length)]
      );

      const result = calculateExpression(operands, operationSymbols);

      if (settings.resultRange[0] <= result && result <= settings.resultRange[1]) {
        if (settings.allowNegative || result >= 0) {
          let problem = operands[0].toString();

          operationSymbols.forEach((operator, index) => {
            problem += ` ${operator} ${operands[index + 1]}`;
          });

          // Replace '*' and '/' with visual symbols
          problem = problem.replace(/\*/g, '✖').replace(/\//g, '➗');

          return settings.showAnswers ? `${problem} = ${result}` : `${problem} = `;
        }
      }
    }

    return ''; // Return an empty string if no valid problem was generated in MAX_ATTEMPTS
  };

  /**
   * Generates a set of problems based on the current settings and updates the state with the generated problems.
   *
   * @return {void} This function does not return anything.
   */
  const generateProblems = () => {
    const generatedProblems = Array.from({ length: settings.numProblems }, () =>
      generateProblem()
    ).filter(problem => problem !== '').map(problem => ({ id: nanoid(), text: problem }));
    setProblems(generatedProblems);
  };

  /**
   * Downloads a PDF file
   * containing the generated problems.
   *
   * This function creates a new instance of the jsPDF library and sets the
   * paper size and font size based on the settings. It then iterates over
   * the generated problems and adds each problem to the PDF document at a
   * specific position. Finally, it saves the PDF file with the name 'problems.pdf'.
   *
   * @return {void} This function does not return anything.
   */
  const downloadPdf = () => {
    const doc = new jsPDF({
      format: paperSizeOptions[settings.paperSize],
    });

    doc.setFontSize(settings.fontSize);
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    let y = 10; // Initial Y coordinate
    let x = 10; // Initial X coordinate
    const columnGap = 10; // Gap between columns
    const columnWidth = Math.floor(pageWidth / 2 - columnGap); // width of each column

    problems.forEach((problem) => {
      if (y + settings.lineSpacing > pageHeight) {
        if (x + columnWidth + columnGap < pageWidth) {
          x += columnWidth + columnGap;
          y = 10;
        } else {
          doc.addPage();
          x = 10;
          y = 10;
        }
      }
      doc.text(problem.text, x, y);
      y += settings.lineSpacing;
    });

    doc.save('problems.pdf');
  };

  useEffect(() => {
    generateProblems();
  }, [settings]);

  const handleChange = (field, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [field]: value,
    }));
  };

  return (
    <div className="App">
      <h1>MathGenie</h1>
      <div className="container">
        <div className="form-group operations-container">
          <label htmlFor="operations">Operations:</label>
          <select
            id="operations"
            multiple
            className="operations-select"
            value={settings.operations}
            onChange={(e) => handleChange('operations', [...e.target.selectedOptions].map((option) => option.value))}
          >
            <option value="+">+</option>
            <option value="-">-</option>
            <option value="*">✖</option>
            <option value="/">➗</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="numProblems">Number of Problems:</label>
          <input
            type="number"
            id="numProblems"
            value={settings.numProblems}
            onChange={(e) => handleChange('numProblems', parseInt(e.target.value))}
          />
        </div>

        <div className="form-group range-container">
          <label htmlFor="numRange">Number Range:</label>
          <input
            type="number"
            id="numRangeMin"
            value={settings.numRange[0]}
            onChange={(e) => handleChange('numRange', [parseInt(e.target.value), settings.numRange[1]])}
            placeholder="Min"
          />
          <input
            type="number"
            id="numRangeMax"
            value={settings.numRange[1]}
            onChange={(e) => handleChange('numRange', [settings.numRange[0], parseInt(e.target.value)])}
            placeholder="Max"
          />
        </div>

        <div className="form-group result-container">
          <label htmlFor="resultRange">Result Range:</label>
          <input
            type="number"
            id="resultRangeMin"
            value={settings.resultRange[0]}
            onChange={(e) => handleChange('resultRange', [parseInt(e.target.value), settings.resultRange[1]])}
            placeholder="Min"
          />
          <input
            type="number"
            id="resultRangeMax"
            value={settings.resultRange[1]}
            onChange={(e) => handleChange('resultRange', [settings.resultRange[0], parseInt(e.target.value)])}
            placeholder="Max"
          />
        </div>

        <div className="form-group operands-container">
          <label htmlFor="numOperandsRange">Number of Operands Range:</label>
          <input
            type="number"
            id="numOperandsRangeMin"
            value={settings.numOperandsRange[0]}
            onChange={(e) => handleChange('numOperandsRange', [parseInt(e.target.value), settings.numOperandsRange[1]])}
            placeholder="Min"
          />
          <input
            type="number"
            id="numOperandsRangeMax"
            value=            {settings.numOperandsRange[1]}
            onChange={(e) => handleChange('numOperandsRange', [settings.numOperandsRange[0], parseInt(e.target.value)])}
            placeholder="Max"
          />
        </div>

        <div className="form-group">
          <label htmlFor="allowNegative">Allow Negative Results:</label>
          <input
            type="checkbox"
            id="allowNegative"
            checked={settings.allowNegative}
            onChange={(e) => handleChange('allowNegative', e.target.checked)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="showAnswers">Show Answers:</label>
          <input
            type="checkbox"
            id="showAnswers"
            checked={settings.showAnswers}
            onChange={(e) => handleChange('showAnswers', e.target.checked)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fontSize">Font Size:</label>
          <input
            type="number"
            id="fontSize"
            value={settings.fontSize}
            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="lineSpacing">Line Spacing (px):</label>
          <input
            type="number"
            id="lineSpacing"
            value={settings.lineSpacing}
            onChange={(e) => handleChange('lineSpacing', parseInt(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="paperSize">Paper Size:</label>
          <select
            id="paperSize"
            value={settings.paperSize}
            onChange={(e) => handleChange('paperSize', e.target.value)}
          >
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="legal">Legal</option>
          </select>
        </div>

        <button onClick={generateProblems}>Generate Problems</button>{' '}
        <button onClick={downloadPdf}>Download PDF</button>

        <div className="problems">
          {problems.map((problem) => (
            <div key={problem.id}>{problem.text}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App; // Export the App component for use in other files

