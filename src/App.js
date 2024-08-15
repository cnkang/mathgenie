import React, { useState } from 'react'; // Import React and useState hook
import { jsPDF } from 'jspdf'; // Import jsPDF library for PDF generation
import './App.css'; // Import CSS for styling
function App() {
  // State variables for various settings and generated problems
  const [operations, setOperations] = useState(['+']); // Allowed operations
  const [numProblems, setNumProblems] = useState(10); // Number of problems to generate
  const [numRange, setNumRange] = useState([1, 10]); // Range of numbers for operands
  const [resultRange, setResultRange] = useState([0, 100]); // Acceptable range for results
  const [numOperandsRange, setNumOperandsRange] = useState([2, 3]);  // Range for the number of operands
  const [allowNegative, setAllowNegative] = useState(false); // Whether to allow negative results
  const [showAnswers, setShowAnswers] = useState(true); // Whether to show answers
  const [fontSize, setFontSize] = useState(12); // Font size for PDF
  const [lineSpacing, setLineSpacing] = useState(10); // Line spacing for PDF
  const [paperSize, setPaperSize] = useState('a4'); // Paper size for PDF
  const [problems, setProblems] = useState([]); // Generated problems

  // Options for paper size
  const paperSizeOptions = {
    'a4': 'a4',
    'letter': 'letter',
    'legal': 'legal',
  };

  // Calculate the result of an expression given operands and operators
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

  // Generate a single math problem
  const generateProblem = () => {
    const numOperands = Math.floor(Math.random() * (numOperandsRange[1] - numOperandsRange[0] + 1)) + numOperandsRange[0];

    // Ensure at least two operands
    if (numOperands < 2) return '';

    while (true) {
      const operands = Array.from({ length: numOperands }, () => 
        Math.floor(Math.random() * (numRange[1] - numRange[0] + 1)) + numRange[0]
      );
      const operationSymbols = Array.from({ length: numOperands - 1 }, () =>
        operations[Math.floor(Math.random() * operations.length)]
      );

      const result = calculateExpression(operands, operationSymbols);

      // Check if the result is within the allowed range and satisfies conditions
      if (resultRange[0] <= result && result <= resultRange[1]) {
        if (allowNegative || result >= 0) {
          let problem = operands.map((operand, i) => 
            i < operationSymbols.length ? operand + operationSymbols[i] : operand
          ).join('');

          // Replace symbols for display
          problem = problem.replace(/\*/g, '✖').replace(/\//g, '➗');

          return showAnswers ? problem + ` = ${result}` : problem + " = ";
        }
      }
    }
  };

  // Generate multiple problems
  const generateProblems = () => {
    const generatedProblems = Array.from({ length: numProblems }, () => generateProblem()).filter(problem => problem !== '');
    setProblems(generatedProblems);
  };

  const downloadPdf = () => {
    const doc = new jsPDF({
      format: paperSizeOptions[paperSize],
    });

    doc.setFontSize(fontSize);
    problems.forEach((problem, i) => {
      doc.text(problem, 10, 10 + i * lineSpacing);
    });
    doc.save('problems.pdf');
  };

  return (
    <div className="App">
      <h1>MathGenie</h1>
      <div className="container">
      {/* Form group for selecting operations */}
        <div className="form-group">
          <label htmlFor="operations">Operations: </label>
          <select
            id="operations"
            multiple
            value={operations}
            onChange={e => setOperations([...e.target.selectedOptions].map(o => o.value))}
          >
            <option value="+">+</option>
            <option value="-">-</option>
            <option value="*">✖</option>
            <option value="/">➗</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="numProblems">Number of Problems: </label>
          <input
            id="numProblems"
            type="number"
            value={numProblems}
            onChange={e => setNumProblems(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="numRangeMin">Number Range: </label>
          <input
            id="numRangeMin"
            type="number"
            value={numRange[0]}
            onChange={e => setNumRange([Number(e.target.value), numRange[1]])}
          />
          -
          <input
            id="numRangeMax"
            type="number"
            value={numRange[1]}
            onChange={e => setNumRange([numRange[0], Number(e.target.value)])}
          />
        </div>
        <div className="form-group">
          <label htmlFor="resultRangeMin">Result Range: </label>
          <input
            id="resultRangeMin"
            type="number"
            value={resultRange[0]}
            onChange={e => setResultRange([Number(e.target.value), resultRange[1]])}
          />
          -
          <input
            id="resultRangeMax"
            type="number"
            value={resultRange[1]}
            onChange={e => setResultRange([resultRange[0], Number(e.target.value)])}
          />
        </div>
        <div className="form-group">
          <label htmlFor="numOperandsMin">Number of Operands (Range): </label>
          <input
            id="numOperandsMin"
            type="number"
            value={numOperandsRange[0]}
            onChange={e => setNumOperandsRange([Math.max(2, Number(e.target.value)), numOperandsRange[1]])}
          />
          -
          <input
            id="numOperandsMax"
            type="number"
            value={numOperandsRange[1]}
            onChange={e => setNumOperandsRange([numOperandsRange[0], Number(e.target.value)])}
          />
        </div>
        <div className="form-group">
          <label htmlFor="allowNegative">Allow Negative Results: </label>
          <input
            id="allowNegative"
            type="checkbox"
            checked={allowNegative}
            onChange={e => setAllowNegative(e.target.checked)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="showAnswers">Show Answers: </label>
          <input
            id="showAnswers"
            type="checkbox"
            checked={showAnswers}
            onChange={e => setShowAnswers(e.target.checked)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="fontSize">Font Size: </label>
          <input
            id="fontSize"
            type="number"
            value={fontSize}
            onChange={e => setFontSize(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lineSpacing">Line Spacing: </label>
          <input
            id="lineSpacing"
            type="number"
            value={lineSpacing}
            onChange={e => setLineSpacing(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="paperSize">Paper Size: </label>
          <select
            id="paperSize"
            value={paperSize}
            onChange={e => setPaperSize(e.target.value)}
          >
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="legal">Legal</option>
          </select>
        </div>
        <button onClick={generateProblems}>Generate Problems</button>
        <button onClick={downloadPdf} disabled={problems.length === 0}>Download PDF</button>
        <h2>Generated Problems:</h2>
        <ul>
          {problems.map((problem, index) => (
            <li key={index}>{problem}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
