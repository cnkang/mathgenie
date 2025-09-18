/* eslint-env node */
/* global process */
const { default: purgecss } = require('@fullhuman/postcss-purgecss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    isProduction &&
      purgecss({
        content: ['./src/**/*.html', './src/**/*.ts', './src/**/*.tsx'],
        defaultExtractor: content =>
          (content.match(/[\w-/:%]+/g) || []).filter(token => !token.endsWith(':')),
      }),
    autoprefixer,
    cssnano({
      preset: 'advanced',
    }),
  ].filter(Boolean),
};
