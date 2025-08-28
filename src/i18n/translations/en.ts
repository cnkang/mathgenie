// English translations
export default {
  app: {
    title: 'MathGenie',
    subtitle: 'Generate customized math problems for practice and learning',
  },
  operations: {
    title: 'Select Operations',
    addition: 'Addition (+)',
    subtraction: 'Subtraction (-)',
    multiplication: 'Multiplication (×)',
    division: 'Division (÷)',
    help: 'Hold Ctrl/Cmd to select multiple operations',
  },
  settings: {
    numProblems: 'Number of Problems',
    numberRange: 'Number Range',
    resultRange: 'Result Range',
    operandsRange: 'Number of Operands',
    allowNegative: 'Allow Negative Results',
    showAnswers: 'Show Answers',
    from: 'From',
    to: 'to',
    manager: {
      title: 'Settings Manager',
      export: 'Export Settings',
      import: 'Import Settings',
      exportLabel: 'Export current settings',
      importLabel: 'Import settings from file',
    },
    importError: 'Error reading settings file',
  },
  pdf: {
    title: 'PDF Settings',
    fontSize: 'Font Size (pt)',
    lineSpacing: 'Line Spacing (pt)',
    paperSize: 'Paper Size',
  },
  buttons: {
    generate: 'Generate Problems',
    generating: 'Generating Problems...',
    download: 'Download PDF ({{count}} problems)',
    downloadEmpty: 'Download PDF',
  },
  results: {
    title: 'Generated Problems ({{count}})',
    noProblems: 'No problems generated yet',
  },
  errors: {
    noOperations:
      'Please select at least one mathematical operation to continue.',
    invalidProblemsCount: 'Number of problems must be between 1 and 100.',
    invalidNumberRange: 'Number range minimum cannot be greater than maximum.',
    invalidResultRange: 'Result range minimum cannot be greater than maximum.',
    generationFailed:
      'Unable to generate problems with current settings. Try adjusting the number ranges or allowing negative results.',
    partialGeneration:
      'Generated {{generated}} out of {{requested}} requested problems. Consider adjusting your settings for better results.',
    downloadFailed:
      'No problems available to download. Please generate problems first.',
    pdfError:
      'Failed to generate PDF. Please try again or check your browser settings.',
    generalError:
      'An error occurred while generating problems. Please try again.',
  },
  accessibility: {
    selectOperations: 'Select mathematical operations to include',
    numProblemsInput: 'Number of problems to generate',
    minNumber: 'Minimum number for operands',
    maxNumber: 'Maximum number for operands',
    minResult: 'Minimum result value',
    maxResult: 'Maximum result value',
    minOperands: 'Minimum number of operands per problem',
    maxOperands: 'Maximum number of operands per problem',
    allowNegativeLabel: 'Allow negative results in problems',
    showAnswersLabel: 'Show answers next to problems',
    fontSizeInput: 'Font size for PDF output',
    lineSpacingInput: 'Line spacing for PDF output',
    paperSizeSelect: 'Paper size for PDF output',
    generateButton: 'Generate math problems with current settings',
    downloadButton: 'Download generated problems as PDF file',
    languageSelect: 'Select interface language',
  },
  language: {
    select: 'Language',
    current: 'Current language: {{language}}',
  },
  loading: {
    insights: 'Loading insights...',
    translations: 'Loading translations...',
  },
  presets: {
    title: 'Quick Presets',
    apply: 'Apply',
    beginner: {
      name: 'Beginner (1-10)',
      description: 'Simple addition and subtraction',
    },
    intermediate: {
      name: 'Intermediate (1-50)',
      description: 'All operations with medium numbers',
    },
    advanced: {
      name: 'Advanced (1-100)',
      description: 'All operations including division',
    },
    multiplication: {
      name: 'Multiplication Tables',
      description: 'Focus on multiplication practice',
    },
  },
  preview: {
    title: 'Preview',
    info: 'Sample problems based on current settings',
  },
} as const;