/* Node.js PostCSS config */
import cssnanoPresetAdvanced from 'cssnano-preset-advanced';
import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
/* global process */
const isProduction = process.env.NODE_ENV === 'production';

export default {
  plugins: [
    ...(isProduction
      ? [purgeCSSPlugin({
          content: ['./src/**/*.html', './src/**/*.ts', './src/**/*.tsx'],
          defaultExtractor: content =>
            (content.match(/[\w-/:%]+/g) || []).filter(token => !token.endsWith(':')),
        })]
      : []),
    autoprefixer(),
    cssnano({ preset: cssnanoPresetAdvanced }),
  ],
};
