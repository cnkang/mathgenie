// Playwright configuration specifically for e2e tests
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 120000, // Increased from 90s to 120s for complex accessibility tests
  expect: {
    timeout: 30000, // Increased from 15s to 30s for E2E expect timeout
  },
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report/e2e' }],
    ['json', { outputFile: 'test-results-e2e.json' }],
    ['junit', { outputFile: 'test-results-e2e.xml' }],
    ...(process.env.CI ? [['github'] as const] : [['list'] as const]),
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Increased action timeout for slower operations
    actionTimeout: 20000, // Increased from 10s to 20s for E2E operations
    // CI environment optimization (headless only, browser-specific args moved to individual projects)
    ...(process.env.CI && {
      headless: true,
    }),
  },

  projects: [
    {
      name: 'chromium-e2e',
      use: {
        ...devices['Desktop Chrome'],
        // Specific settings for e2e tests
        viewport: { width: 1280, height: 720 },
        ...(process.env.CI && {
          launchOptions: {
            args: [
              '--no-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--disable-web-security',
              '--disable-features=TranslateUI',
              '--disable-ipc-flooding-protection',
              '--memory-pressure-off',
              '--max_old_space_size=4096',
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-renderer-backgrounding',
            ],
          },
        }),
      },
    },
    {
      name: 'firefox-e2e',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
        ...(process.env.CI && {
          launchOptions: {
            firefoxUserPrefs: {
              'media.navigator.streams.fake': true,
              'media.navigator.permission.disabled': true,
              'dom.webnotifications.enabled': false,
              'dom.push.enabled': false,
            },
          },
        }),
      },
    },
    {
      name: 'webkit-e2e',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
        // WebKit doesn't support --no-sandbox, explicitly set empty launchOptions
        ...(process.env.CI && {
          launchOptions: {
            args: [], // Explicitly empty args to override any defaults
          },
        }),
      },
    },
    // Mobile tests only when specifically requested
    ...(process.env.MOBILE_E2E_TESTS === 'true'
      ? [
          {
            name: 'mobile-chrome-e2e',
            use: {
              ...devices['Pixel 5'],
              // Mobile-specific timeouts
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'mobile-safari-e2e',
            use: {
              ...devices['iPhone 12'],
              // Mobile-specific timeouts
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          // Latest iPhone devices for E2E testing
          {
            name: 'iphone-16-pro-max-e2e',
            use: {
              ...devices['iPhone 15 Pro Max'], // Using closest available device
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'iphone-16-pro-e2e',
            use: {
              ...devices['iPhone 15 Pro'], // Using closest available device
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'iphone-15-pro-max-e2e',
            use: {
              ...devices['iPhone 15 Pro Max'],
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'iphone-15-pro-e2e',
            use: {
              ...devices['iPhone 15 Pro'],
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'iphone-14-pro-max-e2e',
            use: {
              ...devices['iPhone 14 Pro Max'],
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'iphone-13-pro-e2e',
            use: {
              ...devices['iPhone 13 Pro'],
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          // iPad E2E tests - Portrait orientation
          {
            name: 'ipad-pro-12-portrait-e2e',
            use: {
              ...devices['iPad Pro'],
              viewport: { width: 1024, height: 1366 }, // Portrait
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'ipad-pro-11-portrait-e2e',
            use: {
              ...devices['iPad Pro'],
              viewport: { width: 834, height: 1194 }, // Portrait
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'ipad-air-portrait-e2e',
            use: {
              ...devices['iPad Pro'],
              viewport: { width: 820, height: 1180 }, // Portrait
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          // iPad E2E tests - Landscape orientation
          {
            name: 'ipad-pro-12-landscape-e2e',
            use: {
              ...devices['iPad Pro'],
              viewport: { width: 1366, height: 1024 }, // Landscape
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'ipad-pro-11-landscape-e2e',
            use: {
              ...devices['iPad Pro'],
              viewport: { width: 1194, height: 834 }, // Landscape
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'ipad-air-landscape-e2e',
            use: {
              ...devices['iPad Pro'],
              viewport: { width: 1180, height: 820 }, // Landscape
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          // Android E2E tests - Latest phones
          {
            name: 'galaxy-s24-ultra-e2e',
            use: {
              ...devices['Galaxy S9+'],
              viewport: { width: 412, height: 915 }, // S24 Ultra dimensions
              userAgent:
                'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'galaxy-s24-e2e',
            use: {
              ...devices['Galaxy S9+'],
              viewport: { width: 384, height: 854 }, // S24 dimensions
              userAgent:
                'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'pixel-8-pro-e2e',
            use: {
              ...devices['Pixel 5'],
              viewport: { width: 412, height: 892 }, // Pixel 8 Pro dimensions
              userAgent:
                'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'pixel-8-e2e',
            use: {
              ...devices['Pixel 5'],
              viewport: { width: 412, height: 915 }, // Pixel 8 dimensions
              userAgent:
                'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'oneplus-12-e2e',
            use: {
              ...devices['Galaxy S9+'],
              viewport: { width: 450, height: 1000 }, // OnePlus 12 dimensions
              userAgent:
                'Mozilla/5.0 (Linux; Android 14; CPH2573) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          // Android tablets E2E tests - Portrait orientation
          {
            name: 'galaxy-tab-s9-ultra-portrait-e2e',
            use: {
              ...devices['iPad Pro'],
              viewport: { width: 1848, height: 2960 }, // Tab S9 Ultra Portrait
              userAgent:
                'Mozilla/5.0 (Linux; Android 13; SM-X916B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'galaxy-tab-s9-portrait-e2e',
            use: {
              ...devices['iPad Pro'],
              viewport: { width: 1600, height: 2560 }, // Tab S9 Portrait
              userAgent:
                'Mozilla/5.0 (Linux; Android 13; SM-X810) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'pixel-tablet-portrait-e2e',
            use: {
              ...devices['iPad Pro'],
              viewport: { width: 1600, height: 2560 }, // Pixel Tablet Portrait
              userAgent:
                'Mozilla/5.0 (Linux; Android 13; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          // Android tablets E2E tests - Landscape orientation
          {
            name: 'galaxy-tab-s9-ultra-landscape-e2e',
            use: {
              ...devices['iPad Pro'],
              viewport: { width: 2960, height: 1848 }, // Tab S9 Ultra Landscape
              userAgent:
                'Mozilla/5.0 (Linux; Android 13; SM-X916B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'galaxy-tab-s9-landscape-e2e',
            use: {
              ...devices['iPad Pro'],
              viewport: { width: 2560, height: 1600 }, // Tab S9 Landscape
              userAgent:
                'Mozilla/5.0 (Linux; Android 13; SM-X810) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
          {
            name: 'pixel-tablet-landscape-e2e',
            use: {
              ...devices['iPad Pro'],
              viewport: { width: 2560, height: 1600 }, // Pixel Tablet Landscape
              userAgent:
                'Mozilla/5.0 (Linux; Android 13; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              actionTimeout: 30000, // Increased from 15s to 30s for mobile E2E
            },
          },
        ]
      : []),
  ],

  webServer: {
    command: 'pnpm preview -- --open false',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180000, // Increased from 120s to 180s for CI stability
    ignoreHTTPSErrors: true,
    // Retry server startup in case of port conflicts
    ...(process.env.CI && {
      env: {
        ...process.env,
        PORT: '4173',
        HOST: '0.0.0.0',
      },
    }),
  },
});
