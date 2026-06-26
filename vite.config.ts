import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite-plus";
import viteCompression from "vite-plugin-compression";

const reactChunkPackages = new Set([
  "react",
  "react-dom",
  "react-is",
  "scheduler",
  "use-sync-external-store",
]);

const jspdfOptionalHtmlDeps = ["canvg", "core-js", "dompurify", "html2canvas"];

const getPackageName = (id: string): string | null => {
  const nodeModulesIndex = id.lastIndexOf("node_modules/");
  if (nodeModulesIndex === -1) {
    return null;
  }
  const modulePath = id.slice(nodeModulesIndex + "node_modules/".length);
  if (modulePath.startsWith("@")) {
    const [scope, name] = modulePath.split("/");
    return scope && name ? `${scope}/${name}` : null;
  }
  const [name] = modulePath.split("/");
  return name || null;
};

const vpConfig = {
  staged: {
    "*": "vp check --fix --no-fmt",
  },
  fmt: {
    ignorePatterns: [
      ".amazonq/**",
      ".git/**",
      ".github/**",
      ".kiro/**",
      ".lighthouseci/**",
      ".serena/**",
      ".tmp/**",
      ".vite-hooks/**",
      ".vscode/**",
      "coverage/**",
      "dist/**",
      "docs/**",
      "node_modules/**",
      "playwright-report/**",
      "public/**",
      "test-results/**",
      "tests/e2e/**",
      "*.md",
      "*.pdf",
      "*.png",
      "*.xml",
      "*.yml",
      "*.json",
      "*.cjs",
    ],
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  plugins: [
    react({
      jsxRuntime: "automatic",
      jsxImportSource: undefined,
    }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
      compressionOptions: { level: 11 },
      deleteOriginFile: false,
      verbose: false,
    }),
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
      compressionOptions: { level: 9 },
      deleteOriginFile: false,
      verbose: false,
    }),
  ],
  build: {
    outDir: "dist",
    sourcemap: process.env.NODE_ENV !== "production",
    target: ["es2022", "edge88", "firefox78", "chrome87", "safari14"],
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    commonjsOptions: { transformMixedEsModules: true },
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash].[ext]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        manualChunks(id: string) {
          if (id.includes("src/i18n/translations/")) {
            const langMatch = /translations\/([a-z]{2})\.ts$/.exec(id);
            if (langMatch) return `i18n-${langMatch[1]}`;
          }
          const packageName = getPackageName(id);
          if (packageName) {
            if (reactChunkPackages.has(packageName)) return "react-vendor";
            if (packageName === "jspdf") return "jspdf";
            return "vendor";
          }
        },
      },
      external: jspdfOptionalHtmlDeps,
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: true,
        dead_code: true,
        passes: 2,
      },
      mangle: { toplevel: true, safari10: true },
      format: { comments: false },
    },
  },
  server: { port: 3000, open: true },
  preview: {
    port: 4173,
    strictPort: false,
    host: process.env.CI ? "0.0.0.0" : "localhost",
    cors: true,
    headers: { "Cache-Control": "no-cache" },
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
  optimizeDeps: {
    include: ["react", "react-dom", "jspdf"],
    exclude: ["@vercel/speed-insights", ...jspdfOptionalHtmlDeps],
  },
  define: {
    __DEV__: process.env.NODE_ENV !== "production",
    __PROD__: process.env.NODE_ENV === "production",
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_HASH__: JSON.stringify(Date.now().toString(36)),
    global: "globalThis",
  },
  css: {
    devSourcemap: process.env.NODE_ENV !== "production",
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    css: true,
    environmentOptions: {
      happyDOM: {
        settings: {
          navigator: {
            userAgent:
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        },
      },
    },
    pool: "threads",
    poolOptions: {
      threads: {
        maxThreads: process.env.CI ? 4 : 8,
        minThreads: process.env.CI ? 1 : 2,
      },
    },
    maxConcurrency: process.env.CI ? 4 : 12,
    sequence: { shuffle: false, concurrent: false },
    fileParallelism: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/e2e/**",
      "**/tests/smoke/**",
      "**/*.e2e.spec.ts",
      "**/*.smoke.spec.ts",
    ],
    coverage: {
      enabled: process.env.VITEST_COVERAGE === "1",
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
        "**/scripts/**",
        "**/src/index.tsx",
        "**/src/setupTests.ts",
        "**/src/reportWebVitals.ts",
        "**/public/**",
        "**/*.svg",
        "**/*.css",
        "**/src/i18n/translations/**",
        "**/src/types/**",
        "**/src/utils/serviceWorker.ts",
        "**/src/utils/testUtils.ts",
        "**/lighthouserc.{js,ts,cjs}",
        "**/playwright-report/**",
        "**/test-results/**",
        "**/postcss.config.cjs",
        "**/vite.config.ts",
        "**/vite/**",
        "vite/**",
        "**/dynamic-import-helper.js",
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
} as any;

export default defineConfig(vpConfig);
