/* Node.js PostCSS config */
import cssnanoPresetAdvanced from 'cssnano-preset-advanced';
/* global process */
const isProduction = process.env.NODE_ENV === 'production';

export default {
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
      preset: cssnanoPresetAdvanced,
    },
  },
};
