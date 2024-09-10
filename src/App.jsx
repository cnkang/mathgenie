import React, { useState, useEffect, Suspense } from 'react'; // Suspense is needed for dynamic imports
import './App.css'; // Import CSS for styling

const SpeedInsights = React.lazy(() =>
  import('@vercel/speed-insights/react').then((module) => ({ default: module.SpeedInsights }))
);

function App() {
  const [settings, setSettings] = useState({
    operations: ['+'],
    numProblems: 10,
    numRange: [1, 10],
    resultRange: [0, 100],
    numOperandsRange: [2, 3],
    allowNegative: false,
    showAnswers: true,
    fontSize: 12,
    lineSpacing: 10,
    paperSize: 'a4',
  });
  const [problems, setProblems] = useState([]);

  const paperSizeOptions = {
    'a4': 'a4',
    'letter': 'letter',
    'legal': 'legal',
  };

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

  const generateProblem = () => {
    const crypto = window.crypto || window.msCrypto;
    const random = (min, max) => {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const val = array[0] / (0xFFFFFFFF + 1);
      return min + Math.floor((max - min + 1) * val);
    };

    const numOperands = random(settings.numOperandsRange[0], settings.numOperandsRange[1]);

    if (numOperands < 2) return '';

    const MAX_ATTEMPTS = 10000;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const operands = Array.from({ length: numOperands }, () =>
        random(settings.numRange[0], settings.numRange[1])
      );

      const operationSymbols = Array.from({ length: numOperands - 1 }, () =>
        settings.operations[random(0, settings.operations.length - 1)]
      );

      const result = calculateExpression(operands, operationSymbols);

      if (settings.resultRange[0] <= result && result <= settings.resultRange[1]) {
        if (settings.allowNegative || result >= 0) {
          let problem = operands[0].toString();

          operationSymbols.forEach((operator, index) => {
            problem += ` ${operator} ${operands[index + 1]}`;
          });

          problem = problem.replace(/\*/g, '✖').replace(/\//g, '➗');

          return settings.showAnswers ? `${problem} = ${result}` : `${problem} = `;
        }
      }
    }

    return ''; 
  };

  const generateProblems = () => {
    const generatedProblems = Array.from({ length: settings.numProblems }, () =>
      generateProblem()
    ).filter(problem => problem !== '').map((problem, index) => ({ id: index, text: problem }));
    setProblems(generatedProblems);
  };

  const downloadPdf = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF({
        format: paperSizeOptions[settings.paperSize],
      });

      doc.setFontSize(settings.fontSize);
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();

      const marginLeft = 10;
      const marginTop = 10;
      const lineSpacing = settings.lineSpacing;
      const colWidth = (pageWidth - 3 * marginLeft) / 2;

      let currYLeft = marginTop;
      let currYRight = marginTop;

      problems.forEach((problem, index) => {
        if (index % 2 === 0) {
          if (currYLeft + lineSpacing > pageHeight) {
            doc.addPage();
            currYLeft = marginTop;
            currYRight = marginTop;
          }
          doc.text(problem.text, marginLeft, currYLeft);
          currYLeft          += lineSpacing;
        } else {
          if (currYRight + lineSpacing > pageHeight) {
            doc.addPage();
            currYLeft = marginTop;
            currYRight = marginTop;
          }
          doc.text(problem.text, marginLeft + colWidth + marginLeft, currYRight);
          currYRight += lineSpacing;
        }
      });

      doc.save('problems.pdf');
    });
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
        <div>
          <label htmlFor="operations">Operations</label>
          <select
            id="operations"
            multiple
            value={settings.operations}
            onChange={(e) =>
              handleChange(
                'operations',
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
          >
            <option value="+">+</option>
            <option value="-">-</option>
            <option value="*">*</option>
            <option value="/">/</option>
          </select>
        </div>

        <div>
          <label htmlFor="allowNegative">Allow Negative Results:</label>
          <input
            type="checkbox"
            id="allowNegative"
            checked={settings.allowNegative}
            onChange={(e) => handleChange('allowNegative', e.target.checked)}
          />
        </div>

        <button onClick={generateProblems}>Generate Problems</button>{' '}
        <button onClick={downloadPdf}>Download PDF</button>

        <div className="problems">
          {problems.map((problem) => (
            <div key={problem.id}>{problem.text}</div>
          ))}
        </div>
      </div>
      <Suspense fallback={<div>Loading insights...</div>}>
        <SpeedInsights />
      </Suspense>
    </div>
  );
}

export default App;

