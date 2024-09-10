const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    isProduction &&
      require('@fullhuman/postcss-purgecss')({
        content: [
          './src/**/*.html',
          './src/**/*.js',
          './src/**/*.jsx',
          './src/**/*.ts',
          './src/**/*.tsx',
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      }),
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default',
    }),
  ].filter(Boolean),
};
