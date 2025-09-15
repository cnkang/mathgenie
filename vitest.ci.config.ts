import { cpus } from 'os';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// CI环境专用的测试配置
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    css: true,

    // CI环境优化配置
    pool: 'threads',
    poolOptions: {
      threads: {
        // CI环境使用保守的线程数
        maxThreads: Math.min(4, Math.ceil(cpus().length / 2)),
        minThreads: 1,
      },
    },

    // 适中的并发数以平衡速度和稳定性
    maxConcurrency: 4,
    sequence: {
      shuffle: false,
      concurrent: true,
    },
    fileParallelism: true,

    // CI环境的超时设置
    testTimeout: 15000,
    hookTimeout: 10000,

    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**',
      '**/tests/smoke/**',
      '**/*.e2e.spec.ts',
      '**/*.smoke.spec.ts',
    ],

    coverage: {
      enabled: process.env.VITEST_COVERAGE === '1',
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
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

  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'jspdf'],
    exclude: ['@vercel/speed-insights'],
    esbuildOptions: {
      target: 'es2022',
    },
  },
});
