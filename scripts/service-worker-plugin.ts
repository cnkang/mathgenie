import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import ts from "typescript-compiler-api";
import type { Plugin } from "vite-plus";
/** Build the one service-worker source for both build and build:fast. */
export const serviceWorkerPlugin = (): Plugin => ({
  name: "mathgenie-service-worker",
  generateBundle(_options, bundle) {
    const files = Object.keys(bundle);
    const workerSource = readFileSync("src/serviceWorker.ts", "utf8");
    const digest = createHash("sha256").update(workerSource);
    for (const name of files.sort()) {
      const entry = bundle[name];
      digest.update(name).update(entry.type === "chunk" ? entry.code : entry.source);
    }
    const hash = digest.digest("hex").slice(0, 16);
    // PDF is cached on first use; keep it outside startup downloads.
    const assets = files.filter(
      (name) =>
        name.endsWith(".css") ||
        /(?:index|react|i18n|QuizMode|generation.worker|rolldown|vendor)-.*\.js$/.test(name),
    );
    const urls = [
      "/",
      "/index.html",
      "/favicon.ico",
      "/manifest.json",
      "/logo192.png",
      "/logo512.png",
      ...assets.map((asset) => `/${asset}`),
    ];
    const source = workerSource
      .replaceAll("__CACHE_VERSION__", JSON.stringify(hash))
      .replaceAll("__PRECACHE_URLS__", JSON.stringify(urls));
    // Remove compile-time declarations before replacing constants in executable source.
    const executable = source.replace(/^declare const .*$/gm, "");
    this.emitFile({
      type: "asset",
      fileName: "sw.js",
      source: ts.transpileModule(executable, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).outputText,
    });
  },
});
