module.exports = {
    plugins: [
      // PurgeCSS to remove unused CSS
      require('@fullhuman/postcss-purgecss')({
        content: [
          './src/**/*.html', // HTML files in your src folder
          './src/**/*.js',   // JavaScript/JSX files in your src folder
          './src/**/*.jsx',  // React JSX files
          './src/**/*.ts',   // TypeScript files (if using TypeScript)
          './src/**/*.tsx'   // TypeScript JSX files
        ],
        defaultExtractor: content => content.match(/[\w-/:]+/) || [], // Regex to extract class names
      }),
  
      // Autoprefixer to add vendor prefixes for browser compatibility
      require('autoprefixer'),
  
      // cssnano to minify the CSS for production builds
      require('cssnano')({
        preset: 'default',
      })
    ]
  };
  