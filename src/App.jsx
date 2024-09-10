import React, { useState, useEffect, Suspense } from 'react';
import './App.css';

const SpeedInsights = React.lazy(() =>
  import('@vercel/speed-insights/react').then((module) => ({ default: module.SpeedInsights }))
);

function App() {
  const [settings, setSettings] = useState({
    operations: ['+','-'],
    numProblems: 20,
    numRange: [1, 20],
    resultRange: [0, 20],
    numOperandsRange: [2, 3],
    allowNegative: false,
    showAnswers: false,
    fontSize: 16,
    lineSpacing: 12,
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
          currYLeft += lineSpacing;
        } else {
          if (currYRight + lineSpacing > pageHeight) {
            doc.addPage();
            currYLeft = marginTop;
            currYRight = marginTop;
          }
          doc.text(problem.text, marginLeft + colWidth + marginLeft           , currYRight);
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
          <label htmlFor="operations">Operations:</label>
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
          <label htmlFor="numProblems">Number of Problems:</label>
          <input
            type="number"
            id="numProblems"
            value={settings.numProblems}
            onChange={(e) => handleChange('numProblems', parseInt(e.target.value, 10))}
          />
        </div>

        <div>
          <label htmlFor="numRange">Number Range:</label>
          <input
            type="number"
            id="numRangeFrom"
            value={settings.numRange[0]}
            onChange={(e) => handleChange('numRange', [parseInt(e.target.value, 10), settings.numRange[1]])}
          />
          <input
            type="number"
            id="numRangeTo"
            value={settings.numRange[1]}
            onChange={(e) => handleChange('numRange', [settings.numRange[0], parseInt(e.target.value, 10)])}
          />
        </div>

        <div>
          <label htmlFor="resultRange">Result Range:</label>
          <input
            type="number"
            id="resultRangeFrom"
            value={settings.resultRange[0]}
            onChange={(e) => handleChange('resultRange', [parseInt(e.target.value, 10), settings.resultRange[1]])}
          />
          <input
            type="number"
            id="resultRangeTo"
            value={settings.resultRange[1]}
            onChange={(e) => handleChange('resultRange', [settings.resultRange[0], parseInt(e.target.value, 10)])}
          />
        </div>

        <div>
          <label htmlFor="numOperandsRange">Number of Operands Range:</label>
          <input
            type="number"
            id="numOperandsRangeFrom"
            value={settings.numOperandsRange[0]}
            onChange={(e) => handleChange('numOperandsRange', [parseInt(e.target.value, 10), settings.numOperandsRange[1]])}
          />
          <input
            type="number"
            id="numOperandsRangeTo"
            value={settings.numOperandsRange[1]}
            onChange={(e) => handleChange('numOperandsRange', [settings.numOperandsRange[0], parseInt(e.target.value, 10)])}
          />
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

        <div>
          <label htmlFor="showAnswers">Show Answers:</label>
          <input
            type="checkbox"
            id="showAnswers"
            checked={settings.showAnswers}
            onChange={(e) => handleChange('showAnswers', e.target.checked)}
          />
        </div>

        <div>
          <label htmlFor="fontSize">Font Size:</label>
          <input
            type="number"
            id="fontSize"
            value={settings.fontSize}
            onChange={(e) => handleChange('fontSize', parseInt(e.target.value, 10))}
          />
        </div>

        <div>
          <label htmlFor="lineSpacing">Line Spacing:</label>
          <input
            type="number"
            id="lineSpacing"
            value={settings.lineSpacing}
            onChange={(e) => handleChange('lineSpacing', parseInt(e.target.value, 10))}
          />
        </div>

        <div>
          <label htmlFor="paperSize">Paper Size:</label>
          <select
            id="paperSize"
            value={settings.paperSize}
            onChange={(e)            => handleChange('paperSize', e.target.value)}
            >
              {Object.keys(paperSizeOptions).map((size) => (
                <option key={size} value={size}>
                  {size.toUpperCase()}
                </option>
              ))}
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
  
        <Suspense fallback={<div>Loading insights...</div>}>
          <SpeedInsights />
        </Suspense>
      </div>
    );
  }
  
  export default App;
  

