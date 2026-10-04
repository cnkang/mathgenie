#!/usr/bin/env tsx

import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, delimiter } from "node:path";
import { build as viteBuild } from "vite-plus";

interface BuildError extends Error {
  message: string;
}

async function main(): Promise<void> {
  if (process.platform !== "win32") {
    const defaultSafe = ["/usr/local/bin", "/usr/bin", "/bin"].join(delimiter);
    process.env.PATH = defaultSafe;
  }
  process.env.NODE_ENV = "production";
  console.log("🚀 Starting optimized build process...");

  // Step 0: Generate build info
  const buildInfo = {
    buildTime: new Date().toISOString(),
    buildTimestamp: Date.now(),
    buildHash: Date.now().toString(36),
    version: process.env.npm_package_version || "1.0.0",
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || "development",
  };

  const buildInfoPath = join(process.cwd(), "public/build-info.json");
  writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  console.log("📋 Build info generated:", buildInfo);

  // Step 1: Clean previous build
  console.log("🧹 Cleaning previous build...");
  rmSync("dist", { recursive: true, force: true });

  // Step 2: Build with optimizations
  console.log("🔨 Building with optimizations...");
  await viteBuild();

  // Step 3: Optimize HTML
  console.log("📄 Optimizing HTML...");
  const htmlPath: string = join(process.cwd(), "dist", "index.html");
  try {
    let html: string = readFileSync(htmlPath, "utf8");

    // Add performance hints
    html = html.replace(
      "<head>",
      `<head>
  <meta name="robots" content="index,follow">
  <meta name="googlebot" content="index,follow">`,
    );

    // Add resource hints for critical resources
    html = html.replace(
      "</head>",
      `  <link rel="prefetch" href="/manifest.json">
  <link rel="prefetch" href="/favicon.ico">
</head>`,
    );

    writeFileSync(htmlPath, html);
    console.log("✅ HTML optimized");
  } catch (error) {
    const buildError = error as BuildError;
    console.warn("⚠️  HTML optimization failed:", buildError.message);
  }

  console.log("🎉 Build optimization complete!");
  console.log('📊 Run "npm run analyze" to analyze bundle size');
}

try {
  await main();
} catch (error) {
  const buildError = error as BuildError;
  console.error("❌ Build failed:", buildError.message);
  process.exit(1);
}
