// Playwright configuration specifically for e2e tests
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 45000, // Increased timeout for complex tests
  expect: {
    timeout: 15000, // Increased expect timeout
  },
  reporter: [
    ["html", { open: "never", outputFolder: "playwright-report/e2e" }],
    ["json", { outputFile: "test-results-e2e.json" }],
    ["junit", { outputFile: "test-results-e2e.xml" }],
    ...(process.env.CI ? [["github"] as const] : [["list"] as const]),
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Increased action timeout for slower operations
    actionTimeout: 10000,
    // CI环境优化
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
          "--memory-pressure-off",
          "--max_old_space_size=4096",
        ],
      },
    }),
  },

  projects: [
    {
      name: "chromium-e2e",
      use: {
        ...devices["Desktop Chrome"],
        // Specific settings for e2e tests
        viewport: { width: 1280, height: 720 },
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
              "--disable-background-timer-throttling",
              "--disable-backgrounding-occluded-windows",
              "--disable-renderer-backgrounding",
            ],
          },
        }),
      },
    },
    {
      name: "firefox-e2e",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1280, height: 720 },
        ...(process.env.CI && {
          launchOptions: {
            firefoxUserPrefs: {
              "media.navigator.streams.fake": true,
              "media.navigator.permission.disabled": true,
              "dom.webnotifications.enabled": false,
              "dom.push.enabled": false,
            },
          },
        }),
      },
    },
    {
      name: "webkit-e2e",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1280, height: 720 },
        ...(process.env.CI && {
          launchOptions: {
            args: ["--no-sandbox"],
          },
        }),
      },
    },
    // Mobile tests only when specifically requested
    ...(process.env.MOBILE_E2E_TESTS === "true"
      ? [
          {
            name: "mobile-chrome-e2e",
            use: {
              ...devices["Pixel 5"],
              // Mobile-specific timeouts
              actionTimeout: 15000,
            },
          },
          {
            name: "mobile-safari-e2e",
            use: {
              ...devices["iPhone 12"],
              // Mobile-specific timeouts
              actionTimeout: 15000,
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
        // Enhanced server startup detection
        url: "http://localhost:4173",
        ignoreHTTPSErrors: true,
      },

  // Global setup for e2e tests
  globalSetup: require.resolve("./tests/e2e/global-setup.ts"),
  globalTeardown: require.resolve("./tests/e2e/global-teardown.ts"),
});
