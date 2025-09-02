import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // 优化 JSX 运行时
      jsxRuntime: "automatic",
    }),
    // Brotli 压缩 (更好的压缩率)
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024, // 只压缩大于 1KB 的文件
      compressionOptions: {
        level: 11, // 最高压缩级别
      },
      deleteOriginFile: false,
      verbose: false,
    }),
    // Gzip 压缩 (兼容性更好)
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
      compressionOptions: {
        level: 9, // 最高压缩级别
      },
      deleteOriginFile: false,
      verbose: false,
    }),
  ],
  build: {
    // 输出目录
    outDir: "dist",
    // 启用源码映射 (仅在开发环境)
    sourcemap: process.env.NODE_ENV !== "production",
    // 构建目标
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // CommonJS 选项
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Rollup 选项
    rollupOptions: {
      output: {
        // 资源文件命名
        assetFileNames: "assets/[name]-[hash].[ext]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        // 手动分包策略
        manualChunks(id: string) {
          // React 相关库单独打包
          if (id.includes("react") || id.includes("react-dom")) {
            return "react-vendor";
          }
          // PDF 生成库单独打包 (较大)
          if (id.includes("jspdf")) {
            return "jspdf";
          }
          // 分析工具单独打包
          if (id.includes("speed-insights") || id.includes("web-vitals")) {
            return "analytics";
          }
          // 其他第三方库
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
      // 外部依赖 (如果需要 CDN)
      external: [],
    },
    // 使用 Terser 进行代码压缩
    minify: "terser",
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: true,
        // 移除未使用的代码
        dead_code: true,
        // 移除纯函数调用
        pure_funcs:
          process.env.NODE_ENV === "production"
            ? ["console.log", "console.info", "console.debug"]
            : [],
        // 压缩选项
        passes: 2, // 多次压缩以获得更好效果
        unsafe: false, // 安全压缩
        unsafe_comps: false,
        unsafe_math: false,
        unsafe_proto: false,
      },
      mangle: {
        // 混淆变量名
        toplevel: true,
        safari10: true,
      },
      format: {
        // 移除注释
        comments: false,
        // 保留许可证注释
        preserve_annotations: false,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/components": resolve(__dirname, "./src/components"),
      "@/hooks": resolve(__dirname, "./src/hooks"),
      "@/utils": resolve(__dirname, "./src/utils"),
      "@/i18n": resolve(__dirname, "./src/i18n"),
      "@/types": resolve(__dirname, "./src/types"),
    },
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ["react", "react-dom", "jspdf"],
    exclude: ["@vercel/speed-insights"],
  },
  // 环境变量
  define: {
    __DEV__: mode !== "production",
    __PROD__: mode === "production",
    global: "globalThis",
  },
  // CSS 优化
  css: {
    devSourcemap: mode !== "production",
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    css: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/e2e/**",
      "**/tests/smoke/**",
      "**/*.e2e.spec.ts",
      "**/*.smoke.spec.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov", "clover"],
      reportsDirectory: "coverage",
      exclude: [
        "**/*.config.{js,ts,cjs}",
        "**/*.test.{js,ts,jsx,tsx}",
        "**/*.spec.{js,ts,jsx,tsx}",
        "**/tests/**",
        "**/coverage/**",
        "**/dist/**",
        "**/node_modules/**",
        "**/src/index.tsx",
        "**/src/setupTests.ts",
        "**/src/reportWebVitals.ts",
        "**/public/**",
        "**/*.svg",
        "**/*.css",
        "**/src/i18n/translations/**",
        "**/src/types/**",
        "**/src/utils/serviceWorker.ts",
        "**/lighthouserc.ts",
        "**/playwright-report/**",
        "**/test-results/**",
        "**/postcss.config.cjs",
        "**/eslint.config.{js,ts}",
        "**/vite.config.ts",
        "**/vite/**",
        "vite/**",
        "**/dynamic-import-helper.js",
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
}));
