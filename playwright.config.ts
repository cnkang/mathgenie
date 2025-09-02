// Playwright configuration for cross-browser testing
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  // Set output directory dynamically for CI matrix builds
  outputDir:
    process.env.CI && process.env.PLAYWRIGHT_OUTPUT_DIR
      ? process.env.PLAYWRIGHT_OUTPUT_DIR
      : "test-results",
  reporter: [
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results.json" }],
    ["junit", { outputFile: "test-results.xml" }],
    ...(process.env.CI ? [["github"] as const] : []),
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // CI environment optimization
    ...(process.env.CI && {
      headless: true,
      launchOptions: {
        args: [
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=TranslateUI",
          "--disable-ipc-flooding-protection",
        ],
      },
    }),
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Chrome optimization for CI environment
        ...(process.env.CI && {
          launchOptions: {
            args: [
              "--no-sandbox",
              "--disable-dev-shm-usage",
              "--disable-gpu",
              "--disable-web-security",
              "--disable-features=TranslateUI",
              "--disable-ipc-flooding-protection",
              "--memory-pressure-off",
              "--max_old_space_size=4096",
            ],
          },
        }),
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        ...(process.env.CI && {
          launchOptions: {
            firefoxUserPrefs: {
              "media.navigator.streams.fake": true,
              "media.navigator.permission.disabled": true,
            },
          },
        }),
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        ...(process.env.CI && {
          launchOptions: {
            args: ["--no-sandbox"],
          },
        }),
      },
    },
    // Mobile tests only run in non-CI environment or under specific conditions
    ...(process.env.MOBILE_TESTS === "true"
      ? [
          {
            name: "Mobile Chrome",
            use: { ...devices["Pixel 5"] },
          },
          {
            name: "Mobile Safari",
            use: { ...devices["iPhone 12"] },
          },
          // Latest iPhone devices
          {
            name: "iPhone 16 Pro Max",
            use: { ...devices["iPhone 15 Pro Max"] }, // Using closest available device
          },
          {
            name: "iPhone 16 Pro",
            use: { ...devices["iPhone 15 Pro"] }, // Using closest available device
          },
          {
            name: "iPhone 16",
            use: { ...devices["iPhone 15"] }, // Using closest available device
          },
          {
            name: "iPhone 15 Pro Max",
            use: { ...devices["iPhone 15 Pro Max"] },
          },
          {
            name: "iPhone 15 Pro",
            use: { ...devices["iPhone 15 Pro"] },
          },
          {
            name: "iPhone 15",
            use: { ...devices["iPhone 15"] },
          },
          {
            name: "iPhone 14 Pro Max",
            use: { ...devices["iPhone 14 Pro Max"] },
          },
          {
            name: "iPhone 14 Pro",
            use: { ...devices["iPhone 14 Pro"] },
          },
          {
            name: "iPhone 13 Pro",
            use: { ...devices["iPhone 13 Pro"] },
          },
          // iPad devices - Portrait orientation
          {
            name: "iPad Pro 12.9 Portrait",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 1024, height: 1366 }, // Portrait
            },
          },
          {
            name: "iPad Pro 11 Portrait",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 834, height: 1194 }, // Portrait
            },
          },
          {
            name: "iPad Air Portrait",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 820, height: 1180 }, // Portrait
            },
          },
          {
            name: "iPad Portrait",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 810, height: 1080 }, // Portrait
            },
          },
          // iPad devices - Landscape orientation
          {
            name: "iPad Pro 12.9 Landscape",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 1366, height: 1024 }, // Landscape
            },
          },
          {
            name: "iPad Pro 11 Landscape",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 1194, height: 834 }, // Landscape
            },
          },
          {
            name: "iPad Air Landscape",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 1180, height: 820 }, // Landscape
            },
          },
          {
            name: "iPad Landscape",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 1080, height: 810 }, // Landscape
            },
          },
          // Android devices - Latest phones
          {
            name: "Galaxy S24 Ultra",
            use: {
              ...devices["Galaxy S9+"],
              viewport: { width: 412, height: 915 }, // S24 Ultra dimensions
              userAgent:
                "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            },
          },
          {
            name: "Galaxy S24",
            use: {
              ...devices["Galaxy S9+"],
              viewport: { width: 384, height: 854 }, // S24 dimensions
              userAgent:
                "Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            },
          },
          {
            name: "Pixel 8 Pro",
            use: {
              ...devices["Pixel 5"],
              viewport: { width: 412, height: 892 }, // Pixel 8 Pro dimensions
              userAgent:
                "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            },
          },
          {
            name: "Pixel 8",
            use: {
              ...devices["Pixel 5"],
              viewport: { width: 412, height: 915 }, // Pixel 8 dimensions
              userAgent:
                "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            },
          },
          {
            name: "OnePlus 12",
            use: {
              ...devices["Galaxy S9+"],
              viewport: { width: 450, height: 1000 }, // OnePlus 12 dimensions
              userAgent:
                "Mozilla/5.0 (Linux; Android 14; CPH2573) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            },
          },
          // Android tablets - Portrait orientation
          {
            name: "Galaxy Tab S9 Ultra Portrait",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 1848, height: 2960 }, // Tab S9 Ultra Portrait
              userAgent:
                "Mozilla/5.0 (Linux; Android 13; SM-X916B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          },
          {
            name: "Galaxy Tab S9 Portrait",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 1600, height: 2560 }, // Tab S9 Portrait
              userAgent:
                "Mozilla/5.0 (Linux; Android 13; SM-X810) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          },
          {
            name: "Pixel Tablet Portrait",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 1600, height: 2560 }, // Pixel Tablet Portrait
              userAgent:
                "Mozilla/5.0 (Linux; Android 13; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          },
          // Android tablets - Landscape orientation
          {
            name: "Galaxy Tab S9 Ultra Landscape",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 2960, height: 1848 }, // Tab S9 Ultra Landscape
              userAgent:
                "Mozilla/5.0 (Linux; Android 13; SM-X916B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          },
          {
            name: "Galaxy Tab S9 Landscape",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 2560, height: 1600 }, // Tab S9 Landscape
              userAgent:
                "Mozilla/5.0 (Linux; Android 13; SM-X810) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          },
          {
            name: "Pixel Tablet Landscape",
            use: {
              ...devices["iPad Pro"],
              viewport: { width: 2560, height: 1600 }, // Pixel Tablet Landscape
              userAgent:
                "Mozilla/5.0 (Linux; Android 13; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          },
        ]
      : []),
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: "pnpm preview",
        port: 4173,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        // Let Playwright wait for server to start on any port
        // If 4173 is occupied, vite will automatically choose the next available port
      },
});
