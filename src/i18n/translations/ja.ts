// Japanese translations
export default {
  app: {
    title: 'MathGenie',
    subtitle: '練習と学習のためのカスタマイズされた数学問題を生成',
  },
  operations: {
    title: '演算を選択',
    addition: '足し算 (+)',
    subtraction: '引き算 (-)',
    multiplication: 'かけ算 (×)',
    division: 'わり算 (÷)',
    help: 'Ctrl/Cmdキーを押しながら複数の演算を選択',
  },
  settings: {
    numProblems: '問題数',
    numberRange: '数値の範囲',
    resultRange: '結果の範囲',
    operandsRange: 'オペランドの数',
    allowNegative: '負の結果を許可',
    showAnswers: '答えを表示',
    from: 'から',
    to: 'まで',
    manager: {
      title: '設定マネージャー',
      export: '設定をエクスポート',
      import: '設定をインポート',
      exportLabel: '現在の設定をエクスポート',
      importLabel: 'ファイルから設定をインポート',
    },
    importError: '設定ファイルの読み取りエラー',
  },
  pdf: {
    title: 'PDF設定',
    fontSize: 'フォントサイズ (pt)',
    lineSpacing: '行間 (pt)',
    paperSize: '用紙サイズ',
  },
  buttons: {
    generate: '問題を生成',
    generating: '問題を生成中...',
    download: 'PDFをダウンロード',
    downloadEmpty: 'PDFをダウンロード',
  },
  results: {
    title: '生成された問題 ({{count}}問)',
    noProblems: 'まだ問題が生成されていません',
  },
  errors: {
    noOperations: '続行するには少なくとも1つの数学演算を選択してください。',
    invalidProblemsCount: '問題数は1から100の間である必要があります。',
    invalidNumberRange: '数値範囲の最小値は最大値より大きくできません。',
    invalidResultRange: '結果範囲の最小値は最大値より大きくできません。',
    generationFailed:
      '現在の設定では問題を生成できません。数値範囲を調整するか、負の結果を許可してみてください。',
    partialGeneration:
      '要求された{{requested}}問のうち{{generated}}問を生成しました。より良い結果のために設定の調整を検討してください。',
    downloadFailed: 'ダウンロード可能な問題がありません。まず問題を生成してください。',
    pdfError: 'PDF生成に失敗しました。再試行するか、ブラウザ設定を確認してください。',
    generalError: '問題生成中にエラーが発生しました。再試行してください。',
  },
  accessibility: {
    selectOperations: '含める数学演算を選択',
    numProblemsInput: '生成する問題数',
    minNumber: 'オペランドの最小値',
    maxNumber: 'オペランドの最大値',
    minResult: '結果の最小値',
    maxResult: '結果の最大値',
    minOperands: '問題あたりのオペランドの最小数',
    maxOperands: '問題あたりのオペランドの最大数',
    allowNegativeLabel: '問題で負の結果を許可',
    showAnswersLabel: '問題の横に答えを表示',
    fontSizeInput: 'PDF出力のフォントサイズ',
    lineSpacingInput: 'PDF出力の行間',
    paperSizeSelect: 'PDF出力の用紙サイズ',
    generateButton: '現在の設定で数学問題を生成',
    downloadButton: '生成された問題をPDFファイルとしてダウンロード',
    languageSelect: 'インターフェース言語を選択',
  },
  language: {
    select: '言語',
    current: '現在の言語：{{language}}',
  },
  loading: {
    insights: 'インサイトを読み込み中...',
    translations: '翻訳を読み込み中...',
  },
  presets: {
    title: 'クイックプリセット',
    apply: '適用',
    beginner: {
      name: '初級 (1-10)',
      description: '簡単な足し算と引き算',
    },
    intermediate: {
      name: '中級 (1-50)',
      description: '中程度の数での全演算',
    },
    advanced: {
      name: '上級 (1-100)',
      description: 'わり算を含む全演算',
    },
    multiplication: {
      name: 'かけ算九九',
      description: 'かけ算の練習に特化',
    },
  },
  preview: {
    title: 'プレビュー',
    info: '現在の設定に基づくサンプル問題',
  },
} as const;
