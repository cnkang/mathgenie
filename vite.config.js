import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'brotliCompress', // 使用 Brotli 压缩
      ext: '.br',
      threshold: 1024, // 仅压缩大于 1KB 的文件
    }),
    viteCompression({
      algorithm: 'gzip', // 额外生成 gzip 文件
      ext: '.gz',
      threshold: 1024,
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        assetFileNames: '[name].[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('jspdf')) {
            return 'jspdf';
          }
          if (id.includes('speed-insights')) {
            return 'speed-insights';
          }
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      format: {
        comments: false,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/setupTests.js',  // load setupTests.js
    css: true,  // enable CSS imports during testing
  },  
});
