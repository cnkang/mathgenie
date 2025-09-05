// French translations
export default {
  app: {
    title: 'MathGenie',
    subtitle:
      "Générez des problèmes de mathématiques personnalisés pour la pratique et l'apprentissage",
  },
  operations: {
    title: 'Sélectionner les opérations',
    addition: 'Addition (+)',
    subtraction: 'Soustraction (-)',
    multiplication: 'Multiplication (×)',
    division: 'Division (÷)',
    help: 'Maintenez Ctrl/Cmd pour sélectionner plusieurs opérations',
  },
  settings: {
    numProblems: 'Nombre de problèmes',
    numberRange: 'Plage de nombres',
    resultRange: 'Plage de résultats',
    operandsRange: "Nombre d'opérandes",
    options: 'Options des problèmes',
    allowNegative: 'Autoriser les résultats négatifs',
    allowNegativeDesc: 'Autoriser que les résultats de calculs soient des nombres négatifs',
    showAnswers: 'Afficher les réponses',
    showAnswersDesc: 'Afficher les réponses directement à côté des problèmes',
    from: 'De',
    to: 'à',
    manager: {
      title: 'Gestionnaire de paramètres',
      export: 'Exporter les paramètres',
      import: 'Importer les paramètres',
      exportLabel: 'Exporter les paramètres actuels',
      importLabel: 'Importer les paramètres depuis un fichier',
    },
    importError: 'Erreur lors de la lecture du fichier de paramètres',
  },
  pdf: {
    title: 'Paramètres PDF',
    fontSize: 'Taille de police (pt)',
    lineSpacing: 'Espacement des lignes (pt)',
    paperSize: 'Taille du papier',
  },
  buttons: {
    generate: 'Générer les problèmes',
    generating: 'Génération des problèmes...',
    generateDescription: 'Créer de nouveaux problèmes mathématiques avec vos paramètres actuels',
    download: 'Télécharger PDF',
    downloadDescription: 'Sauvegarder vos problèmes comme fichier PDF imprimable',
    quizDescription: 'Testez vos compétences avec un quiz interactif',
    downloadEmpty: 'Télécharger PDF',
  },
  results: {
    title: 'Problèmes générés ({{count}})',
    noProblems: 'Aucun problème généré pour le moment',
    clickToStart: 'Cliquez sur "{{generateButton}}" pour commencer',
  },
  errors: {
    noOperations: 'Veuillez sélectionner au moins une opération mathématique pour continuer.',
    invalidProblemCount: 'Le nombre de problèmes doit être entre 1 et 100.',
    invalidProblemsCount: 'Le nombre de problèmes doit être entre 1 et 100.',
    invalidNumberRange: 'Le minimum de la plage de nombres ne peut pas être supérieur au maximum.',
    invalidResultRange:
      'Le minimum de la plage de résultats ne peut pas être supérieur au maximum.',
    invalidOperandsRange:
      "Plage d'opérandes invalide : le minimum doit être au moins 2 et ne pas être supérieur au maximum.",
    noProblemsGenerated:
      "Aucun problème n'a pu être généré avec les paramètres actuels. Essayez d'ajuster les plages.",
    generationFailed: 'Échec de la génération des problèmes. Veuillez réessayer.',
    noProblemsToPdf: "Aucun problème à télécharger. Générez d'abord des problèmes.",
    pdfFailed: 'Échec de la génération du PDF. Veuillez réessayer.',
    partialGeneration:
      'Généré {{generated}} sur {{requested}} problèmes demandés. Considérez ajuster vos paramètres pour de meilleurs résultats.',
    downloadFailed:
      "Aucun problème disponible à télécharger. Veuillez d'abord générer des problèmes.",
    pdfError:
      'Échec de la génération du PDF. Veuillez réessayer ou vérifier les paramètres de votre navigateur.',
    generalError:
      "Une erreur s'est produite lors de la génération des problèmes. Veuillez réessayer.",
    noProblemsForQuiz: "Veuillez d'abord générer des problèmes avant de commencer le mode quiz.",
    unexpectedError: "Nous sommes désolés, mais quelque chose d'inattendu s'est produit.",
    tryAgain: 'Réessayer',
    reloadPage: 'Recharger la Page',
  },
  warnings: {
    settingsChanged:
      'Les paramètres ont été mis à jour. Les problèmes seront régénérés automatiquement.',
    largeNumberOfProblems:
      'Générer {{count}} problèmes peut prendre un moment. Veuillez patienter...',
    restrictiveSettings:
      'Les paramètres actuels sont assez restrictifs. Vous pourriez obtenir moins de problèmes que demandé.',
  },
  messages: {
    success: {
      problemsGenerated: '{{count}} problèmes générés avec succès !',
      settingsImported: 'Paramètres importés avec succès !',
      settingsExported: 'Paramètres exportés avec succès !',
      pdfGenerated: 'PDF téléchargé avec succès !',
      generated: 'Généré',
    },
    info: {
      autoGeneration:
        'Les problèmes sont générés automatiquement lorsque vous modifiez les paramètres.',
      pdfTip:
        "Astuce : Ajustez la taille de police et l'espacement des lignes pour une meilleure mise en page PDF.",
      presetApplied: "Le préréglage '{{name}}' a été appliqué à vos paramètres.",
    },
  },
  accessibility: {
    selectOperations: 'Sélectionner les opérations mathématiques à inclure',
    numProblemsInput: 'Nombre de problèmes à générer',
    minNumber: 'Nombre minimum pour les opérandes',
    maxNumber: 'Nombre maximum pour les opérandes',
    minResult: 'Valeur minimale du résultat',
    maxResult: 'Valeur maximale du résultat',
    minOperands: "Nombre minimum d'opérandes par problème",
    maxOperands: "Nombre maximum d'opérandes par problème",
    allowNegativeLabel: 'Autoriser les résultats négatifs dans les problèmes',
    showAnswersLabel: 'Afficher les réponses à côté des problèmes',
    fontSizeInput: 'Taille de police pour la sortie PDF',
    lineSpacingInput: 'Espacement des lignes pour la sortie PDF',
    paperSizeSelect: 'Taille du papier pour la sortie PDF',
    generateButton: 'Générer des problèmes de mathématiques avec les paramètres actuels',
    downloadButton: 'Télécharger les problèmes générés en tant que fichier PDF',
    languageSelect: "Sélectionner la langue de l'interface",
    errorMessage: "Message d'erreur",
    warningMessage: "Message d'avertissement",
    infoMessage: "Message d'information",
    dismissMessage: 'Ignorer le message',
    problemsList: 'Liste des problèmes mathématiques générés',
  },
  language: {
    select: 'Langue',
    current: 'Langue actuelle : {{language}}',
  },
  loading: {
    insights: 'Chargement des informations...',
    translations: 'Chargement des traductions...',
  },
  presets: {
    title: 'Préréglages rapides',
    apply: 'Appliquer',
    clickToApply: 'Cliquez pour appliquer',
    beginner: {
      name: 'Débutant (1-10)',
      description: 'Addition et soustraction simples',
    },
    intermediate: {
      name: 'Intermédiaire (1-50)',
      description: 'Toutes les opérations avec des nombres moyens',
    },
    advanced: {
      name: 'Avancé (1-100)',
      description: 'Toutes les opérations y compris la division',
    },
    multiplication: {
      name: 'Tables de multiplication',
      description: 'Focus sur la pratique de la multiplication',
    },
  },
  preview: {
    title: 'Aperçu',
    info: 'Exemples de problèmes basés sur les paramètres actuels',
  },
  quiz: {
    loading: 'Préparation du quiz...',
    exit: 'Quitter',
    previousProblem: '← Précédent',
    nextProblem: 'Suivant →',
    problemNumber: 'Problème {{number}}',
    progress: '{{current}} / {{total}}',
    completed: '🎉 Quiz Terminé !',
    score: 'points',
    retry: 'Recommencer le Quiz',
    backToPractice: 'Retour à la Pratique',
    detailedResults: 'Résultats Détaillés',
    correctAnswer: 'Réponse correcte : {{answer}}',
    enterAnswer: 'Entrez la réponse',
    submit: 'Soumettre',
    submitted: 'Soumis',
    correct: 'Correct !',
    incorrect: 'Incorrect.',
    stats: {
      totalProblems: 'Problèmes Totaux',
      correct: 'Correctes',
      incorrect: 'Incorrectes',
      timeUsed: 'Temps Utilisé',
    },
    grades: {
      excellent: 'Excellent',
      good: 'Bien',
      average: 'Moyen',
      passing: 'Passable',
      needsImprovement: 'À Améliorer',
    },
    feedback: {
      excellent: 'Fantastique ! Vous avez de solides compétences en mathématiques !',
      good: 'Bien joué ! Continuez comme ça !',
      average: "Bon travail ! Il y a de la place pour s'améliorer !",
      passing: 'Bonne base ! Pratiquez davantage !',
      needsImprovement: 'Continuez à essayer et pratiquez plus !',
    },
  },
  infoPanel: {
    title: 'Statistiques de Pratique',
    stats: {
      currentProblems: 'Problèmes Actuels',
      totalGenerated: 'Total Généré',
      difficultyLevel: 'Niveau de Difficulté',
      operationTypes: "Types d'Opération",
    },
    difficulty: {
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé',
      expert: 'Expert',
    },
    progress: {
      title: "Progrès d'Apprentissage",
      completed: 'Complété {{percent}}% (Objectif: 100 problèmes)',
    },
    quickActions: {
      title: 'Actions Rapides',
      regenerate: 'Régénérer les Problèmes',
      downloadPdf: 'Télécharger PDF',
      startQuiz: 'Commencer le Quiz',
      jumpToProblems: 'Aller aux Problèmes',
    },
    recentResults: {
      title: 'Résultats Récents du Quiz',
      score: '{{score}} points',
      grade: 'Note:',
      accuracy: 'Précision:',
    },
    tips: {
      title: "Conseils d'Utilisation",
      items: {
        '0': 'Utilisez les préréglages rapides pour configurer les paramètres courants',
        '1': "Augmenter le nombre d'opérandes augmente la difficulté",
        '2': 'Limiter la plage de résultats contrôle la complexité des réponses',
        '3': "Activer l'affichage des réponses aide à vérifier les progrès",
        '4': "L'export PDF supporte plusieurs formats de papier",
      },
    },
    currentConfig: {
      title: 'Configuration Actuelle',
      operations: 'Opérations: {{operations}}',
      numbers: 'Nombres: {{min}}-{{max}}',
      results: 'Résultats: {{min}}-{{max}}',
      operands: 'Opérandes: {{min}}-{{max}}',
    },
  },
} as const;
