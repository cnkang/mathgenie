// Playwright configuration for cross-browser testing
import { defineConfig, devices } from '@playwright/test';

// User agent constants to avoid duplication
const USER_AGENTS = {
  GALAXY_TAB_S9:
    'Mozilla/5.0 (Linux; Android 13; SM-X810) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  GALAXY_TAB_S9_ULTRA:
    'Mozilla/5.0 (Linux; Android 13; SM-X916B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  PIXEL_TABLET:
    'Mozilla/5.0 (Linux; Android 13; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
} as const;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // 动态调整worker数量基于CPU核心数
  workers: process.env.CI ? 2 : 6, // CI环境保守使用，本地环境更积极使用
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  // Set output directory dynamically for CI matrix builds
  outputDir:
    process.env.CI && process.env.PLAYWRIGHT_OUTPUT_DIR
      ? process.env.PLAYWRIGHT_OUTPUT_DIR
      : 'test-results',
  reporter: process.env.CI
    ? [
        ['html', { open: 'never' }],
        ['json', { outputFile: process.env.JSON_REPORT_FILE || 'test-results.json' }],
        ['junit', { outputFile: 'test-results.xml' }],
        ['github'],
      ]
    : [
        ['html', { open: 'never' }],
        ['json', { outputFile: 'test-results.json' }],
        ['junit', { outputFile: 'test-results.xml' }],
      ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // CI environment optimization (headless only, browser-specific args moved to individual projects)
    ...(process.env.CI && {
      headless: true,
    }),
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Chrome optimization for CI environment
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
            ],
          },
        }),
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        ...(process.env.CI && {
          launchOptions: {
            firefoxUserPrefs: {
              'media.navigator.streams.fake': true,
              'media.navigator.permission.disabled': true,
            },
          },
        }),
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        // WebKit doesn't support --no-sandbox, explicitly set empty launchOptions
        ...(process.env.CI && {
          launchOptions: {
            args: [], // Explicitly empty args to override any defaults
          },
        }),
      },
    },
    // Essential mobile devices for CI (always available)
    {
      name: 'mobile-iphone',
      use: {
        ...devices['iPhone 15 Pro'], // Using iPhone 15 Pro as closest to iPhone 16 Pro (WebKit engine)
        viewport: { width: 393, height: 852 }, // iPhone 16 Pro dimensions
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        // Explicitly ensure WebKit engine is used for iOS devices
        ...(process.env.CI && {
          launchOptions: {
            args: [], // WebKit doesn't support Chrome-specific args
          },
        }),
      },
    },
    {
      name: 'mobile-android',
      use: {
        ...devices['Galaxy S9+'],
        viewport: { width: 384, height: 854 }, // Galaxy S24 dimensions
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
    },
    {
      name: 'mobile-ipad',
      use: {
        ...devices['iPad Pro 11 landscape'], // iPad Pro 11 landscape uses WebKit engine (Safari)
        viewport: { width: 1366, height: 1024 }, // Large iPad Landscape (custom viewport)
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        // Explicitly ensure WebKit engine is used for iOS devices
        ...(process.env.CI && {
          launchOptions: {
            args: [], // WebKit doesn't support Chrome-specific args
          },
        }),
      },
    },
    {
      name: 'mobile-android-tablet',
      use: {
        ...devices['Galaxy Tab S4'], // Use Android tablet device (Chromium engine)
        viewport: { width: 2560, height: 1600 }, // Galaxy Tab S9 Landscape
        userAgent: USER_AGENTS.GALAXY_TAB_S9,
      },
    },

    // Extended mobile tests only run when MOBILE_TESTS=true
    ...(process.env.MOBILE_TESTS === 'true'
      ? [
          {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
          },
          {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
          },
          // Latest iPhone devices
          {
            name: 'iPhone 16 Pro Max',
            use: {
              ...devices['iPhone 15 Pro Max'], // Using closest available device
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPhone 16 Pro',
            use: {
              ...devices['iPhone 15 Pro'], // Using closest available device
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPhone 16',
            use: {
              ...devices['iPhone 15'], // Using closest available device
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPhone 15 Pro Max',
            use: {
              ...devices['iPhone 15 Pro Max'],
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPhone 15 Pro',
            use: {
              ...devices['iPhone 15 Pro'],
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPhone 15',
            use: {
              ...devices['iPhone 15'],
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPhone 14 Pro Max',
            use: {
              ...devices['iPhone 14 Pro Max'],
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPhone 14 Pro',
            use: {
              ...devices['iPhone 14 Pro'],
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPhone 13 Pro',
            use: {
              ...devices['iPhone 13 Pro'],
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          // iPad devices - Portrait orientation
          {
            name: 'Large iPad Portrait',
            use: {
              ...devices['iPad Pro 11'],
              viewport: { width: 1024, height: 1366 }, // Portrait
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPad Pro 11 Portrait',
            use: {
              ...devices['iPad Pro 11'],
              viewport: { width: 834, height: 1194 }, // Portrait
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPad Air Portrait',
            use: {
              ...devices['iPad Pro 11'],
              viewport: { width: 820, height: 1180 }, // Portrait
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPad Portrait',
            use: {
              ...devices['iPad Pro 11'],
              viewport: { width: 810, height: 1080 }, // Portrait
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          // iPad devices - Landscape orientation
          {
            name: 'Large iPad Landscape',
            use: {
              ...devices['iPad Pro 11'],
              viewport: { width: 1366, height: 1024 }, // Landscape
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPad Pro 11 Landscape',
            use: {
              ...devices['iPad Pro 11'],
              viewport: { width: 1194, height: 834 }, // Landscape
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPad Air Landscape',
            use: {
              ...devices['iPad Pro 11'],
              viewport: { width: 1180, height: 820 }, // Landscape
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          {
            name: 'iPad Landscape',
            use: {
              ...devices['iPad Pro 11'],
              viewport: { width: 1080, height: 810 }, // Landscape
              // Explicitly ensure WebKit engine is used for iOS devices
              ...(process.env.CI && {
                launchOptions: {
                  args: [], // WebKit doesn't support Chrome-specific args
                },
              }),
            },
          },
          // Android devices - Latest phones
          {
            name: 'Galaxy S24 Ultra',
            use: {
              ...devices['Galaxy S9+'],
              viewport: { width: 412, height: 915 }, // S24 Ultra dimensions
              userAgent:
                'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            },
          },
          {
            name: 'Galaxy S24',
            use: {
              ...devices['Galaxy S9+'],
              viewport: { width: 384, height: 854 }, // S24 dimensions
              userAgent:
                'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            },
          },
          {
            name: 'Pixel 8 Pro',
            use: {
              ...devices['Pixel 5'],
              viewport: { width: 412, height: 892 }, // Pixel 8 Pro dimensions
              userAgent:
                'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            },
          },
          {
            name: 'Pixel 8',
            use: {
              ...devices['Pixel 5'],
              viewport: { width: 412, height: 915 }, // Pixel 8 dimensions
              userAgent:
                'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            },
          },
          {
            name: 'OnePlus 12',
            use: {
              ...devices['Galaxy S9+'],
              viewport: { width: 450, height: 1000 }, // OnePlus 12 dimensions
              userAgent:
                'Mozilla/5.0 (Linux; Android 14; CPH2573) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            },
          },
          // Android tablets - Portrait orientation
          {
            name: 'Galaxy Tab S9 Ultra Portrait',
            use: {
              ...devices['Galaxy Tab S4'], // Use Android tablet device (Chromium engine)
              viewport: { width: 1848, height: 2960 }, // Tab S9 Ultra Portrait
              userAgent: USER_AGENTS.GALAXY_TAB_S9_ULTRA,
            },
          },
          {
            name: 'Galaxy Tab S9 Portrait',
            use: {
              ...devices['Galaxy Tab S4'], // Use Android tablet device (Chromium engine)
              viewport: { width: 1600, height: 2560 }, // Tab S9 Portrait
              userAgent: USER_AGENTS.GALAXY_TAB_S9,
            },
          },
          {
            name: 'Pixel Tablet Portrait',
            use: {
              ...devices['Galaxy Tab S4'], // Use Android tablet device (Chromium engine)
              viewport: { width: 1600, height: 2560 }, // Pixel Tablet Portrait
              userAgent: USER_AGENTS.PIXEL_TABLET,
            },
          },
          // Android tablets - Landscape orientation
          {
            name: 'Galaxy Tab S9 Ultra Landscape',
            use: {
              ...devices['Galaxy Tab S4'], // Use Android tablet device (Chromium engine)
              viewport: { width: 2960, height: 1848 }, // Tab S9 Ultra Landscape
              userAgent: USER_AGENTS.GALAXY_TAB_S9_ULTRA,
            },
          },
          {
            name: 'Galaxy Tab S9 Landscape',
            use: {
              ...devices['Galaxy Tab S4'], // Use Android tablet device (Chromium engine)
              viewport: { width: 2560, height: 1600 }, // Tab S9 Landscape
              userAgent: USER_AGENTS.GALAXY_TAB_S9,
            },
          },
          {
            name: 'Pixel Tablet Landscape',
            use: {
              ...devices['Galaxy Tab S4'], // Use Android tablet device (Chromium engine)
              viewport: { width: 2560, height: 1600 }, // Pixel Tablet Landscape
              userAgent: USER_AGENTS.PIXEL_TABLET,
            },
          },
        ]
      : []),
  ],

  webServer: {
    command: 'pnpm preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
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
