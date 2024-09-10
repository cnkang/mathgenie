import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // 输出目录
    rollupOptions: {
      output: {
        assetFileNames: '[name].[hash].[ext]', // 资源文件命名
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true, // HTML5 History API 支持
  },
  resolve: {
    extensions: ['.js', '.jsx'], // 解析的文件扩展名
  },
});
