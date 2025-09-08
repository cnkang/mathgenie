import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import react from 'eslint-plugin-react';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

const config: Linter.FlatConfig[] = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}', '**/setupTests.ts'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        __DEV__: 'readonly',
        __PROD__: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
    plugins: {
      react,
      sonarjs,
      '@typescript-eslint': typescript,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-console': 'off',
      // SonarJS specific rules for better code quality
      'sonarjs/no-duplicate-string': 'error',
      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-useless-catch': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-object-literal': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // Test files configuration
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}', '**/setupTests.ts'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        ...globals.jest,
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
    plugins: {
      react,
      '@typescript-eslint': typescript,
    },
    rules: {
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // More lenient in tests
      'prefer-const': 'error',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': 'off',
      'no-console': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];

export default config;
