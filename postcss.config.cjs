/* Node.js PostCSS config */
/* global process */
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: {
    '@fullhuman/postcss-purgecss': isProduction
      ? {
          content: ['./src/**/*.html', './src/**/*.ts', './src/**/*.tsx'],
          defaultExtractor: content =>
            (content.match(/[\w-/:%]+/g) || []).filter(token => !token.endsWith(':')),
        }
      : false,
    autoprefixer: {},
    cssnano: {
      preset: 'advanced',
    },
  },
};
