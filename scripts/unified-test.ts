#!/usr/bin/env tsx

/**
 * 统一测试脚本 - 智能选择最佳测试配置并支持多种测试类型
 */

import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { cpus, freemem, totalmem } from 'os';
import { join } from 'path';
import { buildSafeEnv } from './exec-utils';

// 颜色输出 (支持 NO_COLOR 环境变量)
const colors = process.env.NO_COLOR
  ? {}
  : {
      red: '\u001b[0;31m',
      green: '\u001b[0;32m',
      yellow: '\u001b[1;33m',
      blue: '\u001b[0;34m',
      cyan: '\u001b[0;36m',
      reset: '\u001b[0m',
    };

type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'system';

function log(level: LogLevel, message: string): void {
  const prefix =
    {
      info: `${colors.blue || ''}[INFO]${colors.reset || ''}`,
      success: `${colors.green || ''}[SUCCESS]${colors.reset || ''}`,
      warning: `${colors.yellow || ''}[WARNING]${colors.reset || ''}`,
      error: `${colors.red || ''}[ERROR]${colors.reset || ''}`,
      system: `${colors.cyan || ''}[SYSTEM]${colors.reset || ''}`,
    }[level] || '[LOG]';

  // Sanitize message to prevent log injection (CWE-117)
  const sanitizedMessage = message
    .replace(/[\r\n\t]/g, ' ') // Remove line breaks and tabs
    .replace(/[^\x20-\x7E]/g, '?') // Replace non-printable chars
    .substring(0, 500); // Limit length

  console.log(`${prefix} ${sanitizedMessage}`);
}

/**
 * Find executable path with cross-platform support
 */
function findExecutable(command: string): string | null {
  // Windows executables might have extensions
  const extensions = process.platform === 'win32' ? ['.cmd', '.bat', ''] : [''];
  const basePath = './node_modules/.bin';

  for (const ext of extensions) {
    const fullPath = join(basePath, command + ext);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

/**
 * Check if a command is available
 */
function isCommandAvailable(cmd: string): boolean {
  try {
    const result = spawnSync(cmd, ['--version'], {
      stdio: 'pipe',
      shell: false,
      timeout: 5000, // 5 second timeout
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Execute command safely using spawnSync with multiple fallback strategies
 * This provides maximum compatibility across different environments
 */
function safeSpawn(command: string, args: string[], env: Record<string, string> = {}): void {
  const safeEnv = buildSafeEnv({ removePath: true });
  const fullEnv = {
    ...process.env,
    ...safeEnv,
    ...env,
  };

  // Filter out undefined values to ensure Record<string, string>
  const cleanEnv: Record<string, string> = {};
  for (const [key, value] of Object.entries(fullEnv)) {
    if (typeof value === 'string') {
      cleanEnv[key] = value;
    }
  }

  // Strategy 1: Direct execution
  const executablePath = findExecutable(command);
  if (executablePath && tryExecution(executablePath, args, cleanEnv)) {
    return;
  }

  // Strategy 2: pnpm exec
  if (isCommandAvailable('pnpm') && tryExecution('pnpm', ['exec', command, ...args], cleanEnv)) {
    return;
  }

  // Strategy 3: npx
  if (isCommandAvailable('npx') && tryExecution('npx', [command, ...args], cleanEnv)) {
    return;
  }

  // Strategy 4: node direct
  if (executablePath && tryExecution(process.execPath, [executablePath, ...args], cleanEnv)) {
    return;
  }

  throw new Error(`Failed to execute ${command}`);
}

function tryExecution(executable: string, args: string[], env: Record<string, string>): boolean {
  try {
    const result = spawnSync(executable, args, {
      stdio: 'inherit',
      shell: false,
      env,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Execute command with secure spawnSync and fallback strategies
 */
function executeCommand(
  baseCommand: string,
  args: string[],
  env: Record<string, string> = {}
): void {
  try {
    safeSpawn(baseCommand, args, env);
  } catch (error: unknown) {
    log('error', `Failed to execute ${baseCommand}: ${error}`);
    throw error;
  }
}

interface SystemInfo {
  cpuCount: number;
  totalMemoryGB: number;
  freeMemoryGB: number;
  isCI: boolean;
  isCoverage: boolean;
}

function getSystemInfo(): SystemInfo {
  const cpuCount = cpus().length;
  const totalMemoryGB = Math.round(totalmem() / 1024 ** 3);
  const freeMemoryGB = Math.round(freemem() / 1024 ** 3);

  return {
    cpuCount,
    totalMemoryGB,
    freeMemoryGB,
    isCI: !!process.env.CI,
    isCoverage: process.env.VITEST_COVERAGE === '1',
  };
}

interface TestStrategy {
  config: string;
  maxThreads: number;
  playwrightWorkers: number;
  description: string;
}

function selectTestStrategy(systemInfo: SystemInfo): TestStrategy {
  const { cpuCount, totalMemoryGB, freeMemoryGB, isCI } = systemInfo;
  const VITE_CONFIG = 'vite.config.ts';

  // Only show system info if not running validate command
  const isValidateCommand = process.argv.includes('validate');
  if (!isValidateCommand) {
    log('system', `${cpuCount} CPUs, ${totalMemoryGB}GB total memory, ${freeMemoryGB}GB free`);
  }

  if (isCI) {
    if (!isValidateCommand) {
      log('info', 'CI environment detected - using conservative settings');
    }
    return {
      config: 'vitest.ci.config.ts',
      maxThreads: Math.min(4, Math.ceil(cpuCount / 2)),
      playwrightWorkers: Math.min(2, Math.ceil(cpuCount / 4)),
      description: 'CI optimized configuration',
    };
  }

  // 本地环境策略选择
  if (freeMemoryGB < 4) {
    if (!isValidateCommand) {
      log('warning', 'Low memory detected - using conservative settings');
    }
    return {
      config: VITE_CONFIG,
      maxThreads: Math.min(2, cpuCount),
      playwrightWorkers: 1,
      description: 'Memory conservative configuration',
    };
  }

  if (cpuCount >= 8 && freeMemoryGB >= 8) {
    if (!isValidateCommand) {
      log('info', 'High-performance system detected - using aggressive parallelization');
    }
    return {
      config: VITE_CONFIG,
      maxThreads: Math.min(cpuCount - 2, 12),
      playwrightWorkers: Math.min(6, Math.ceil(cpuCount / 2)),
      description: 'High-performance configuration',
    };
  }

  if (!isValidateCommand) {
    log('info', 'Balanced system detected - using standard settings');
  }
  return {
    config: VITE_CONFIG,
    maxThreads: Math.min(4, Math.ceil(cpuCount / 2)),
    playwrightWorkers: Math.min(4, Math.ceil(cpuCount / 3)),
    description: 'Balanced configuration',
  };
}

interface UnitTestOptions {
  watch?: boolean;
  coverage?: boolean;
  reporter?: string;
}

function runUnitTests(strategy: TestStrategy, options: UnitTestOptions = {}): void {
  const { watch = false, coverage = true, reporter = 'default' } = options;

  const isVerbose = !process.env.CI && !process.argv.includes('validate');

  if (isVerbose) {
    log('info', `Using ${strategy.description}`);
    log('info', `Max threads: ${strategy.maxThreads}`);
  }

  const coverageFlag = coverage ? '--coverage' : '--no-coverage';
  const watchFlag = watch ? '' : '--run';
  const reporterFlag = reporter !== 'default' ? `--reporter=${reporter}` : '';

  const command =
    `vitest ${watchFlag} ${coverageFlag} ${reporterFlag} --config=${strategy.config}`.trim();

  if (isVerbose) {
    log('info', `Running: ${command}`);
  }

  const args = [watchFlag, coverageFlag, reporterFlag, `--config=${strategy.config}`]
    .filter(arg => arg.trim() !== '')
    .flatMap(arg => arg.split(' '))
    .filter(arg => arg.trim() !== '');

  try {
    // SONAR-SAFE: Using secure command execution with fallback strategies
    executeCommand('vitest', args, {
      VITEST_MAX_THREADS: strategy.maxThreads.toString(),
    });
    log('success', 'Unit tests completed successfully');
  } catch (error: unknown) {
    log('error', 'Unit tests failed');
    const exitCode =
      error && typeof error === 'object' && 'status' in error
        ? (error as { status?: number }).status
        : 1;
    process.exit(exitCode || 1);
  }
}

interface E2ETestOptions {
  project?: string;
  headed?: boolean;
  debug?: boolean;
  ui?: boolean;
  suite?: string;
  mobile?: string;
}

function runE2ETests(strategy: TestStrategy, options: E2ETestOptions = {}): void {
  const {
    project = 'chromium',
    headed = false,
    debug = false,
    ui = false,
    suite = null,
    mobile = null,
  } = options;

  // Only show detailed info if not running validate command
  const isValidateCommand = process.argv.includes('validate');
  if (!isValidateCommand) {
    log('info', `Using ${strategy.description} for E2E tests`);
    log('info', `Playwright workers: ${strategy.playwrightWorkers}`);
  }

  const args = buildE2EArgs({ ui, suite, project, mobile, headed, debug });
  const env = buildE2EEnv(strategy, mobile);

  executeE2ETests(args, env);
}

function buildE2EArgs(options: {
  ui: boolean;
  suite: string | null;
  project: string;
  mobile: string | null;
  headed: boolean;
  debug: boolean;
}): string[] {
  const args = ['test'];

  if (options.ui) {
    args.push('--ui');
    return args;
  }

  if (options.suite) {
    args.push(`tests/e2e/${options.suite}.spec.ts`);
  }
  if (options.project && !options.mobile) {
    args.push(`--project=${options.project}`);
  }
  if (options.headed) {
    args.push('--headed');
  }
  if (options.debug) {
    args.push('--debug');
  }
  if (options.mobile && options.mobile !== 'all') {
    args.push(`--grep=${options.mobile}`);
  }

  return args;
}

function buildE2EEnv(strategy: TestStrategy, mobile: string | null): Record<string, string> {
  const safeEnv = buildSafeEnv({ removePath: false });
  const baseEnv = {
    ...safeEnv,
    PLAYWRIGHT_WORKERS: strategy.playwrightWorkers.toString(),
    ...(mobile ? { MOBILE_TESTS: 'true' } : {}),
  };

  // Filter out undefined values to ensure Record<string, string>
  const cleanEnv: Record<string, string> = {};
  for (const [key, value] of Object.entries(baseEnv)) {
    if (typeof value === 'string') {
      cleanEnv[key] = value;
    }
  }

  return cleanEnv;
}

function executeE2ETests(args: string[], env: Record<string, string>): void {
  try {
    // SONAR-SAFE: Using secure command execution with fallback strategies
    executeCommand('playwright', args, env);
    log('success', 'E2E tests completed successfully');
  } catch (error: unknown) {
    log('error', 'E2E tests failed');
    const exitCode =
      error && typeof error === 'object' && 'status' in error
        ? (error as { status?: number }).status
        : 1;
    process.exit(exitCode || 1);
  }
}

function showUsage(): void {
  console.log(`
Usage: tsx scripts/unified-test.ts [COMMAND] [OPTIONS]

Commands:
  unit [options]              - Run unit tests with smart configuration
  unit:watch                  - Run unit tests in watch mode
  unit:ci                     - Run unit tests with CI optimizations
  e2e [options]               - Run E2E tests with smart configuration
  e2e:ui                      - Open Playwright UI
  e2e:debug [suite]           - Run E2E tests in debug mode
  e2e:headed [suite]          - Run E2E tests in headed mode
  e2e:mobile <device>         - Run mobile E2E tests
  validate                    - Run full validation (unit + e2e)
  help                        - Show this help message

Unit Test Options:
  --no-coverage               - Skip coverage collection
  --reporter=<reporter>       - Use specific reporter (verbose, basic, etc.)

E2E Test Options:
  --project=<browser>         - Run on specific browser (chromium, firefox, webkit)
  --suite=<name>              - Run specific test suite
  --mobile=<device>           - Run mobile device tests

Examples:
  tsx scripts/unified-test.ts unit                    # Smart unit tests
  tsx scripts/unified-test.ts unit --no-coverage      # Unit tests without coverage
  tsx scripts/unified-test.ts unit:watch              # Watch mode
  tsx scripts/unified-test.ts unit:ci                 # CI optimized
  tsx scripts/unified-test.ts e2e                     # Smart E2E tests
  tsx scripts/unified-test.ts e2e --project=firefox   # E2E on Firefox
  tsx scripts/unified-test.ts e2e --suite=presets-functionality # Specific test suite
  tsx scripts/unified-test.ts e2e:mobile iphone       # iPhone tests
  tsx scripts/unified-test.ts e2e:ui                  # Playwright UI
  tsx scripts/unified-test.ts validate                # Full validation

Available Test Suites:
  basic, error-handling, localstorage-persistence, presets-functionality,
  integration, accessibility-unified

Available Mobile Devices:
  all, iphone, iphone16, iphone15, ipad, android, galaxy, pixel, latest
`);
}

interface ParsedArgs {
  command: string;
  options: Record<string, string | boolean>;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const options: Record<string, string | boolean> = {};

  // 解析选项
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (value) {
        options[key] = value;
      } else {
        options[key] = true;
      }
    } else if (!options.positional) {
      options.positional = arg;
    }
  }

  return { command, options };
}

function getStringOption(
  options: Record<string, string | boolean>,
  key: string
): string | undefined {
  return typeof options[key] === 'string' ? (options[key] as string) : undefined;
}

function handleUnitCommands(
  command: string,
  options: Record<string, string | boolean>,
  strategy: TestStrategy,
  systemInfo: SystemInfo
): boolean {
  switch (command) {
    case 'unit':
      runUnitTests(strategy, {
        coverage: !options['no-coverage'] && systemInfo.isCoverage,
        reporter: getStringOption(options, 'reporter'),
      });
      return true;

    case 'unit:watch':
      runUnitTests(strategy, { watch: true, coverage: false });
      return true;

    case 'unit:ci': {
      const ciStrategy: TestStrategy = { ...strategy, config: 'vitest.ci.config.ts' };
      runUnitTests(ciStrategy, { coverage: true, reporter: 'verbose' });
      return true;
    }
  }
  return false;
}

function handleE2ECommands(
  command: string,
  options: Record<string, string | boolean>,
  strategy: TestStrategy
): boolean {
  switch (command) {
    case 'e2e':
      runE2ETests(strategy, {
        project: getStringOption(options, 'project'),
        suite: getStringOption(options, 'suite'),
        mobile: getStringOption(options, 'mobile'),
      });
      return true;

    case 'e2e:ui':
      runE2ETests(strategy, { ui: true });
      return true;

    case 'e2e:debug':
      runE2ETests(strategy, {
        debug: true,
        suite: getStringOption(options, 'positional'),
        project: getStringOption(options, 'project') || 'chromium',
      });
      return true;

    case 'e2e:headed':
      runE2ETests(strategy, {
        headed: true,
        suite: getStringOption(options, 'positional'),
        project: getStringOption(options, 'project') || 'chromium',
      });
      return true;

    case 'e2e:mobile':
      if (!options.positional) {
        log('error', 'Please specify a mobile device type');
        showUsage();
        process.exit(1);
      }
      runE2ETests(strategy, {
        mobile: getStringOption(options, 'positional'),
      });
      return true;
  }
  return false;
}

function main(): void {
  const { command, options } = parseArgs();
  const systemInfo = getSystemInfo();
  const strategy = selectTestStrategy(systemInfo);

  // Handle unit test commands
  if (handleUnitCommands(command, options, strategy, systemInfo)) {
    return;
  }

  // Handle E2E test commands
  if (handleE2ECommands(command, options, strategy)) {
    return;
  }

  // Handle other commands
  switch (command) {
    case 'validate':
      log('info', 'Running full validation suite...');
      runUnitTests(strategy, { coverage: true });
      runE2ETests(strategy, {});
      log('success', 'Full validation completed successfully');
      break;

    case 'help':
    case '--help':
    case '-h':
      showUsage();
      break;

    default:
      log('error', `Unknown command: ${command}`);
      showUsage();
      process.exit(1);
  }
}

// 检查是否作为主模块运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getSystemInfo, runE2ETests, runUnitTests, selectTestStrategy };
