#!/usr/bin/env tsx

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface BuildError extends Error {
  message: string;
}

console.log("🚀 Starting optimized build process...");

// Step 1: Clean previous build
console.log("🧹 Cleaning previous build...");
try {
  execSync("rm -rf dist", { stdio: "inherit" });
} catch (error) {
  // Ignore if dist doesn't exist
}

// Step 2: Build with optimizations
console.log("🔨 Building with optimizations...");
execSync("NODE_ENV=production vite build", { stdio: "inherit" });

// Step 3: Optimize HTML
console.log("📄 Optimizing HTML...");
const htmlPath: string = join(process.cwd(), "dist", "index.html");
try {
  let html: string = readFileSync(htmlPath, "utf8");

  // Add performance hints
  html = html.replace(
    "<head>",
    `<head>
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
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

// Step 4: Generate service worker
console.log("🔧 Generating service worker...");
try {
  const cacheVersion: string = `mathgenie-v${Date.now()}`;
  const staticCacheUrls: string[] = [
    "/",
    "/index.html",
    "/favicon.ico",
    "/logo192.png",
    "/logo512.png",
    "/manifest.json",
  ];

  const swTemplate: string = `
// Auto-generated service worker for MathGenie
const CACHE_NAME = '${cacheVersion}';
const STATIC_CACHE_URLS = ${JSON.stringify(staticCacheUrls, null, 2)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
          .then((fetchResponse) => {
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseToCache));
            return fetchResponse;
          });
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});
`;

  writeFileSync(join(process.cwd(), "dist", "sw.js"), swTemplate.trim());
  console.log("✅ Service worker generated");
} catch (error) {
  const buildError = error as BuildError;
  console.warn("⚠️  Service worker generation failed:", buildError.message);
}

console.log("🎉 Build optimization complete!");
console.log('📊 Run "npm run analyze" to analyze bundle size');
