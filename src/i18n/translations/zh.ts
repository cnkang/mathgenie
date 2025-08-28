// Chinese translations
export default {
  app: {
    title: '数学精灵',
    subtitle: '生成定制化数学题目，用于练习和学习',
  },
  operations: {
    title: '选择运算',
    addition: '加法 (+)',
    subtraction: '减法 (-)',
    multiplication: '乘法 (×)',
    division: '除法 (÷)',
    help: '按住 Ctrl/Cmd 键选择多个运算',
  },
  settings: {
    numProblems: '题目数量',
    numberRange: '数字范围',
    resultRange: '结果范围',
    operandsRange: '操作数个数',
    allowNegative: '允许负数结果',
    showAnswers: '显示答案',
    from: '从',
    to: '到',
    manager: {
      title: '设置管理器',
      export: '导出设置',
      import: '导入设置',
      exportLabel: '导出当前设置',
      importLabel: '从文件导入设置',
    },
    importError: '读取设置文件时出错',
  },
  pdf: {
    title: 'PDF 设置',
    fontSize: '字体大小 (pt)',
    lineSpacing: '行间距 (pt)',
    paperSize: '纸张大小',
  },
  buttons: {
    generate: '生成题目',
    generating: '正在生成题目...',
    download: '下载 PDF ({{count}} 道题)',
    downloadEmpty: '下载 PDF',
  },
  results: {
    title: '生成的题目 ({{count}} 道)',
    noProblems: '尚未生成题目',
  },
  errors: {
    noOperations: '请至少选择一种数学运算才能继续。',
    invalidProblemsCount: '题目数量必须在 1 到 100 之间。',
    invalidNumberRange: '数字范围的最小值不能大于最大值。',
    invalidResultRange: '结果范围的最小值不能大于最大值。',
    generationFailed:
      '无法使用当前设置生成题目。请尝试调整数字范围或允许负数结果。',
    partialGeneration:
      '生成了 {{generated}} 道题目，共请求 {{requested}} 道。请考虑调整设置以获得更好的结果。',
    downloadFailed: '没有可下载的题目。请先生成题目。',
    pdfError: '生成 PDF 失败。请重试或检查浏览器设置。',
    generalError: '生成题目时发生错误。请重试。',
  },
  accessibility: {
    selectOperations: '选择要包含的数学运算',
    numProblemsInput: '要生成的题目数量',
    minNumber: '操作数的最小值',
    maxNumber: '操作数的最大值',
    minResult: '结果的最小值',
    maxResult: '结果的最大值',
    minOperands: '每道题操作数的最小个数',
    maxOperands: '每道题操作数的最大个数',
    allowNegativeLabel: '允许题目中出现负数结果',
    showAnswersLabel: '在题目旁显示答案',
    fontSizeInput: 'PDF 输出的字体大小',
    lineSpacingInput: 'PDF 输出的行间距',
    paperSizeSelect: 'PDF 输出的纸张大小',
    generateButton: '使用当前设置生成数学题目',
    downloadButton: '将生成的题目下载为 PDF 文件',
    languageSelect: '选择界面语言',
  },
  language: {
    select: '语言',
    current: '当前语言：{{language}}',
  },
  loading: {
    insights: '正在加载分析...',
    translations: '正在加载翻译...',
  },
  presets: {
    title: '快速预设',
    apply: '应用',
    beginner: {
      name: '初级 (1-10)',
      description: '简单的加法和减法'
    },
    intermediate: {
      name: '中级 (1-50)', 
      description: '包含中等数字的所有运算'
    },
    advanced: {
      name: '高级 (1-100)',
      description: '包括除法在内的所有运算'
    },
    multiplication: {
      name: '乘法表',
      description: '专注于乘法练习'
    }
  },
  preview: {
    title: '预览',
    info: '基于当前设置的示例题目'
  }
} as const;