import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
    }),
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
    }),
  ],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    outDir: "dist",
    rollupOptions: {
      output: {
        assetFileNames: "[name].[hash].[ext]",
        manualChunks(id: string) {
          if (id.includes("react") || id.includes("react-dom")) {
            return "react-vendor";
          }
          if (id.includes("jspdf")) {
            return "jspdf";
          }
          if (id.includes("speed-insights") || id.includes("web-vitals")) {
            return "analytics";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: true,
        pure_funcs: process.env.NODE_ENV === "production" ? ["console.log"] : [],
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
      reporter: ["text", "json"],
      reportsDirectory: "coverage",
      exclude: [
        "**/*.config.{js,ts}",
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
        "**/test-results/**"
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
  },
});
