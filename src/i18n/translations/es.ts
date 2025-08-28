// Spanish translations
export default {
  app: {
    title: 'MathGenie',
    subtitle:
      'Genera problemas de matemáticas personalizados para practicar y aprender',
  },
  operations: {
    title: 'Seleccionar Operaciones',
    addition: 'Suma (+)',
    subtraction: 'Resta (-)',
    multiplication: 'Multiplicación (×)',
    division: 'División (÷)',
    help: 'Mantén presionado Ctrl/Cmd para seleccionar múltiples operaciones',
  },
  settings: {
    numProblems: 'Número de Problemas',
    numberRange: 'Rango de Números',
    resultRange: 'Rango de Resultados',
    operandsRange: 'Número de Operandos',
    allowNegative: 'Permitir Resultados Negativos',
    showAnswers: 'Mostrar Respuestas',
    from: 'Desde',
    to: 'hasta',
    manager: {
      title: 'Gestor de Configuración',
      export: 'Exportar Configuración',
      import: 'Importar Configuración',
      exportLabel: 'Exportar configuración actual',
      importLabel: 'Importar configuración desde archivo',
    },
    importError: 'Error al leer el archivo de configuración',
  },
  pdf: {
    title: 'Configuración PDF',
    fontSize: 'Tamaño de Fuente (pt)',
    lineSpacing: 'Espaciado de Línea (pt)',
    paperSize: 'Tamaño de Papel',
  },
  buttons: {
    generate: 'Generar Problemas',
    generating: 'Generando Problemas...',
    download: 'Descargar PDF ({{count}} problemas)',
    downloadEmpty: 'Descargar PDF',
  },
  results: {
    title: 'Problemas Generados ({{count}})',
    noProblems: 'Aún no se han generado problemas',
  },
  errors: {
    noOperations:
      'Por favor selecciona al menos una operación matemática para continuar.',
    invalidProblemsCount: 'El número de problemas debe estar entre 1 y 100.',
    invalidNumberRange:
      'El mínimo del rango de números no puede ser mayor que el máximo.',
    invalidResultRange:
      'El mínimo del rango de resultados no puede ser mayor que el máximo.',
    generationFailed:
      'No se pueden generar problemas con la configuración actual. Intenta ajustar los rangos de números o permitir resultados negativos.',
    partialGeneration:
      'Se generaron {{generated}} de {{requested}} problemas solicitados. Considera ajustar tu configuración para mejores resultados.',
    downloadFailed:
      'No hay problemas disponibles para descargar. Por favor genera problemas primero.',
    pdfError:
      'Error al generar PDF. Por favor intenta de nuevo o verifica la configuración de tu navegador.',
    generalError:
      'Ocurrió un error al generar problemas. Por favor intenta de nuevo.',
  },
  accessibility: {
    selectOperations: 'Seleccionar operaciones matemáticas a incluir',
    numProblemsInput: 'Número de problemas a generar',
    minNumber: 'Número mínimo para operandos',
    maxNumber: 'Número máximo para operandos',
    minResult: 'Valor mínimo del resultado',
    maxResult: 'Valor máximo del resultado',
    minOperands: 'Número mínimo de operandos por problema',
    maxOperands: 'Número máximo de operandos por problema',
    allowNegativeLabel: 'Permitir resultados negativos en problemas',
    showAnswersLabel: 'Mostrar respuestas junto a los problemas',
    fontSizeInput: 'Tamaño de fuente para salida PDF',
    lineSpacingInput: 'Espaciado de línea para salida PDF',
    paperSizeSelect: 'Tamaño de papel para salida PDF',
    generateButton: 'Generar problemas de matemáticas con configuración actual',
    downloadButton: 'Descargar problemas generados como archivo PDF',
    languageSelect: 'Seleccionar idioma de la interfaz',
  },
  language: {
    select: 'Idioma',
    current: 'Idioma actual: {{language}}',
  },
  loading: {
    insights: 'Cargando análisis...',
    translations: 'Cargando traducciones...',
  },
  presets: {
    title: 'Presets Rápidos',
    apply: 'Aplicar',
    beginner: {
      name: 'Principiante (1-10)',
      description: 'Suma y resta simples',
    },
    intermediate: {
      name: 'Intermedio (1-50)',
      description: 'Todas las operaciones con números medianos',
    },
    advanced: {
      name: 'Avanzado (1-100)',
      description: 'Todas las operaciones incluyendo división',
    },
    multiplication: {
      name: 'Tablas de Multiplicar',
      description: 'Enfoque en práctica de multiplicación',
    },
  },
  preview: {
    title: 'Vista Previa',
    info: 'Problemas de muestra basados en la configuración actual',
  },
} as const;