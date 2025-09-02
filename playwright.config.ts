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
        ],
      },
    }),
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // CI环境下的Chrome优化
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
    // 移动端测试仅在非CI环境运行，或特定条件下运行
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
        // 让Playwright等待服务器在任何端口上启动
        // 如果4173被占用，vite会自动选择下一个可用端口
      },
});
