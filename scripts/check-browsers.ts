#!/usr/bin/env tsx

/**
 * Browser Installation Checker for Playwright
 *
 * This script checks if Playwright browsers are installed and installs them if needed.
 * It's designed to be run before E2E tests to ensure browsers are available.
 *
 * Security approach: Command validation instead of PATH filtering
 * - Validates specific commands before execution
 * - Removes dangerous environment variables
 * - Uses timeouts and proper error handling
 */

import { spawnNodeCli } from './exec-utils';
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
const MS_PLAYWRIGHT_DIR = 'ms-playwright' as const;
const BROWSERS = ['chromium', 'firefox', 'webkit'] as const;

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

const PLAYWRIGHT_ALLOWED_ARGS = new Set([
  '--version',
  'install',
  '--dry-run',
  ...BROWSERS,
  '--with-deps',
]);

// Execute Playwright via Node with absolute CLI bin path
function execPlaywright(
  args: string[],
  opts: { stdio?: 'pipe' | 'inherit'; encoding?: 'utf8'; timeout?: number } = {}
) {
  const { stdio = 'pipe', encoding = 'utf8', timeout = 300000 } = opts; // default 5 min

  // Validate arguments to prevent code injection.
  for (const arg of args) {
    if (!PLAYWRIGHT_ALLOWED_ARGS.has(arg)) {
      // Throw an error if any argument is not in the allowlist.
      throw new Error(`Disallowed argument for Playwright: ${arg}`);
    }
  }

  return spawnNodeCli('playwright', 'playwright', args, {
    stdio,
    encoding,
    timeout,
    removePath: false, // Keep PATH for Playwright internals
  });
}

/**
 * Check if Playwright browsers are installed
 */
function checkBrowsersInstalled(): boolean {
  try {
    // Try to get browser info - this will fail if browsers aren't installed
    const result = execPlaywright(['--version'], { encoding: 'utf8', stdio: 'pipe' });
    const ver = result.stdout?.toString() || '';
    logInfo(`Playwright version: ${ver.trim()}`);

    // Check if browsers are actually installed by trying to list them
    try {
      const dry = execPlaywright(['install', '--dry-run', 'chromium', 'firefox', 'webkit'], {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      if (dry.status !== 0) {
        throw new Error(dry.stderr?.toString() || 'Dry-run failed');
      }
      return true;
    } catch (dryRunError) {
      // If dry-run fails, browsers might not be installed
      // This is expected behavior when browsers are not installed
      const errorMessage = dryRunError instanceof Error ? dryRunError.message : String(dryRunError);
      logInfo(`Dry-run check indicates browsers may not be installed: ${errorMessage}`);
      return false;
    }
  } catch (playwrightError) {
    // Playwright itself is not accessible or not installed
    const errorMessage =
      playwrightError instanceof Error ? playwrightError.message : String(playwrightError);
    logError(`Playwright is not installed or not accessible: ${errorMessage}`);
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
    const res = execPlaywright(['install', 'chromium', 'firefox', 'webkit', '--with-deps'], {
      stdio: 'inherit',
      encoding: 'utf8',
    });
    if (res.status !== 0) {
      const stderr = res.stderr?.toString() || 'Unknown error';
      throw new Error(`Playwright install failed: ${stderr}`);
    }

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
  const ciEnvironmentVariables = [
    'CI',
    'CONTINUOUS_INTEGRATION',
    'BUILD_NUMBER',
    'GITHUB_ACTIONS',
    'GITLAB_CI',
    'CIRCLECI',
    'JENKINS_URL',
  ];

  return ciEnvironmentVariables.some(variable => !!process.env[variable]);
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
      return join(homedir(), 'AppData', 'Local', MS_PLAYWRIGHT_DIR);
    case 'darwin':
      return join(homedir(), 'Library', 'Caches', MS_PLAYWRIGHT_DIR);
    default:
      return join(homedir(), '.cache', MS_PLAYWRIGHT_DIR);
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
        BROWSERS.some(browser => item.includes(browser))
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
 * Handles the installation of Playwright browsers if they are not found.
 * @param ci - A boolean indicating if the environment is a CI environment.
 */
function handleBrowserInstallation(ci: boolean): void {
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
  } else {
    handleBrowserInstallation(ci);
  }

  process.exit(0);
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkBrowserCache, checkBrowsersInstalled, installBrowsers, isCI };
