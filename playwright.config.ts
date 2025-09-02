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
