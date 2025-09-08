#!/usr/bin/env tsx

/**
 * Browser Installation Checker for Playwright
 *
 * This script checks if Playwright browsers are installed and installs them if needed.
 * It's designed to be run before E2E tests to ensure browsers are available.
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { homedir, platform } from 'os';
import { join } from 'path';

// Colors for output (respect NO_COLOR environment variable)
const colors = {
  red: process.env.NO_COLOR ? '' : '\u001b[0;31m',
  green: process.env.NO_COLOR ? '' : '\u001b[0;32m',
  yellow: process.env.NO_COLOR ? '' : '\u001b[1;33m',
  blue: process.env.NO_COLOR ? '' : '\u001b[0;34m',
  reset: process.env.NO_COLOR ? '' : '\u001b[0m',
} as const;

type ColorKey = keyof typeof colors;

function log(message: string, color: ColorKey = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logInfo(message: string): void {
  log(`[INFO] ${message}`, 'blue');
}

function logSuccess(message: string): void {
  log(`[SUCCESS] ${message}`, 'green');
}

function logWarning(message: string): void {
  log(`[WARNING] ${message}`, 'yellow');
}

function logError(message: string): void {
  log(`[ERROR] ${message}`, 'red');
}

/**
 * Check if Playwright browsers are installed
 */
function checkBrowsersInstalled(): boolean {
  try {
    // Try to get browser info - this will fail if browsers aren't installed
    const result = execSync('npx playwright --version', {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    logInfo(`Playwright version: ${result.trim()}`);

    // Check if browsers are actually installed by trying to list them
    try {
      execSync('npx playwright install --dry-run chromium firefox webkit', {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      return true;
    } catch (error) {
      // If dry-run fails, browsers might not be installed
      return false;
    }
  } catch (error) {
    logError('Playwright is not installed or not accessible');
    return false;
  }
}

/**
 * Install Playwright browsers
 */
function installBrowsers(): boolean {
  logInfo('Installing Playwright browsers...');

  try {
    // Install browsers with dependencies
    execSync('npx playwright install chromium firefox webkit --with-deps', {
      stdio: 'inherit',
      encoding: 'utf8',
    });

    logSuccess('Playwright browsers installed successfully');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Failed to install browsers: ${errorMessage}`);
    return false;
  }
}

/**
 * Check if we're in CI environment
 */
function isCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.BUILD_NUMBER ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI ||
    process.env.JENKINS_URL
  );
}

/**
 * Get browser cache directory
 */
function getBrowserCacheDir(): string {
  const playwrightCacheDir = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (playwrightCacheDir) {
    return playwrightCacheDir;
  }

  // Default cache directories by platform
  switch (platform()) {
    case 'win32':
      return join(homedir(), 'AppData', 'Local', 'ms-playwright');
    case 'darwin':
      return join(homedir(), 'Library', 'Caches', 'ms-playwright');
    default:
      return join(homedir(), '.cache', 'ms-playwright');
  }
}

/**
 * Check if browser cache exists
 */
function checkBrowserCache(): boolean {
  const cacheDir = getBrowserCacheDir();
  logInfo(`Checking browser cache at: ${cacheDir}`);

  if (!existsSync(cacheDir)) {
    logWarning('Browser cache directory does not exist');
    return false;
  }

  // Check if cache has browser directories
  try {
    const contents = readdirSync(cacheDir);
    const hasBrowsers = contents.some(item => {
      const itemPath = join(cacheDir, item);
      return (
        statSync(itemPath).isDirectory() &&
        (item.includes('chromium') || item.includes('firefox') || item.includes('webkit'))
      );
    });

    if (hasBrowsers) {
      logSuccess('Browser cache found with installed browsers');
      return true;
    } else {
      logWarning('Browser cache exists but no browsers found');
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logWarning(`Could not read browser cache: ${errorMessage}`);
    return false;
  }
}

/**
 * Main function
 */
function main(): void {
  logInfo('Checking Playwright browser installation...');

  const ci = isCI();
  if (ci) {
    logInfo('Running in CI environment');
  }

  // First check if browsers are in cache
  const cacheExists = checkBrowserCache();

  // Then check if Playwright can detect browsers
  const browsersInstalled = checkBrowsersInstalled();

  if (browsersInstalled && cacheExists) {
    logSuccess('Playwright browsers are already installed and ready');
    process.exit(0);
  }

  if (!browsersInstalled || !cacheExists) {
    logWarning('Playwright browsers are not installed or not detected');

    // In CI, we might want to fail fast if browsers aren't pre-installed
    if (ci && process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === '1') {
      logError('Browser installation is disabled in CI (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1)');
      logError('Please ensure browsers are pre-installed in your CI environment');
      process.exit(1);
    }

    // Install browsers
    const installSuccess = installBrowsers();

    if (!installSuccess) {
      logError('Failed to install Playwright browsers');
      process.exit(1);
    }

    // Verify installation
    const verifyInstalled = checkBrowsersInstalled();
    if (!verifyInstalled) {
      logError('Browser installation verification failed');
      process.exit(1);
    }

    logSuccess('Browser installation completed and verified');
  }

  process.exit(0);
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkBrowserCache, checkBrowsersInstalled, installBrowsers, isCI };
