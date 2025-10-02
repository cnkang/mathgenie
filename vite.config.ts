import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    }),
    // Brotli compression (better compression ratio)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // Only compress files larger than 1KB
      compressionOptions: {
        level: 11, // Highest compression level
      },
      deleteOriginFile: false,
      verbose: false,
    }),
    // Gzip compression (better compatibility)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      compressionOptions: {
        level: 9, // Highest compression level
      },
      deleteOriginFile: false,
      verbose: false,
    }),
  ],
  build: {
    // Output directory
    outDir: 'dist',
    // Enable source maps (development environment only)
    sourcemap: process.env.NODE_ENV !== 'production',
    // Build target - use ES2020 for better compatibility
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // CommonJS options
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Rollup options
    rollupOptions: {
      output: {
        // Asset file naming
        assetFileNames: 'assets/[name]-[hash].[ext]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // Manual chunk splitting strategy
        manualChunks(id: string) {
          // Keep translation files as separate chunks for dynamic loading
          if (id.includes('src/i18n/translations/')) {
            const langMatch = /translations\/([a-z]{2})\.ts$/.exec(id);
            if (langMatch) {
              return `i18n-${langMatch[1]}`; // Use prefixed chunk name to avoid conflicts
            }
          }
          // Bundle React-related libraries separately
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // Bundle PDF generation library separately (large)
          if (id.includes('jspdf')) {
            return 'jspdf';
          }
          // Bundle analytics tools separately
          if (id.includes('speed-insights') || id.includes('web-vitals')) {
            return 'analytics';
          }
          // Other third-party libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
      // External dependencies (if CDN is needed)
      external: [],
    },
    // Use terser for better compatibility
    minify: 'terser',
    // Terser minification options
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        dead_code: true,
        passes: 2,
      },
      mangle: {
        toplevel: true,
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
    strictPort: false, // Allow fallback to other ports if 4173 is occupied
    host: process.env.CI ? '0.0.0.0' : 'localhost',
    cors: true,
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/i18n': resolve(__dirname, './src/i18n'),
      '@/types': resolve(__dirname, './src/types'),
    },
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'jspdf'],
    exclude: ['@vercel/speed-insights'],
    esbuildOptions: {
      target: 'es2022',
    },
  },
  // Environment variables
  define: {
    __DEV__: mode !== 'production',
    __PROD__: mode === 'production',
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_HASH__: JSON.stringify(Date.now().toString(36)),
    global: 'globalThis',
  },
  // CSS optimization
  css: {
    devSourcemap: mode !== 'production',
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    css: true,
    environmentOptions: {
      happyDOM: {
        settings: {
          navigator: {
            userAgent:
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        },
      },
    },
    // 动态调整worker数量基于CPU核心数和环境
    pool: 'threads',
    poolOptions: {
      threads: {
        // CI环境使用较少的线程以避免资源竞争，本地开发使用更多线程
        maxThreads: process.env.CI ? 4 : 8,
        minThreads: process.env.CI ? 1 : 2,
      },
    },
    // 根据CPU核心数动态调整并发数
    maxConcurrency: process.env.CI ? 4 : 12,
    sequence: {
      shuffle: false,
      concurrent: true,
    },
    fileParallelism: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**',
      '**/tests/smoke/**',
      '**/*.e2e.spec.ts',
      '**/*.smoke.spec.ts',
    ],
    coverage: {
      // 现在内存问题已解决，可以简化coverage配置
      enabled: process.env.VITEST_COVERAGE === '1',
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'clover'],
      reportsDirectory: 'coverage',
      exclude: [
        '**/*.config.{js,ts,cjs}',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}',
        '**/tests/**',
        '**/coverage/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/scripts/**',
        '**/src/index.tsx',
        '**/src/setupTests.ts',
        '**/src/reportWebVitals.ts',
        '**/public/**',
        '**/*.svg',
        '**/*.css',
        '**/src/i18n/translations/**',
        '**/src/types/**',
        '**/src/utils/serviceWorker.ts',
        '**/lighthouserc.{js,ts,cjs}',
        '**/playwright-report/**',
        '**/test-results/**',
        '**/postcss.config.cjs',
        '**/eslint.config.{js,ts}',
        '**/vite.config.ts',
        '**/vite/**',
        'vite/**',
        '**/dynamic-import-helper.js',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
}));
