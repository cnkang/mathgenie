// eslint.config.js
module.exports = [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        browser: true,
        es2021: true,
        node: true
      }
    },
    plugins: {
      react: require('eslint-plugin-react')
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single']
    }
  },
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
