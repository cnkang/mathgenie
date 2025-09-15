#!/usr/bin/env tsx

/**
 * 统一测试脚本 - 智能选择最佳测试配置并支持多种测试类型
 */

import { execSync } from 'child_process';
import { cpus, freemem, totalmem } from 'os';

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

  console.log(`${prefix} ${message}`);
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

  log('system', `${cpuCount} CPUs, ${totalMemoryGB}GB total memory, ${freeMemoryGB}GB free`);

  if (isCI) {
    log('info', 'CI environment detected - using conservative settings');
    return {
      config: 'vitest.ci.config.ts',
      maxThreads: Math.min(4, Math.ceil(cpuCount / 2)),
      playwrightWorkers: Math.min(2, Math.ceil(cpuCount / 4)),
      description: 'CI optimized configuration',
    };
  }

  // 本地环境策略选择
  if (freeMemoryGB < 4) {
    log('warning', 'Low memory detected - using conservative settings');
    return {
      config: 'vite.config.ts',
      maxThreads: Math.min(2, cpuCount),
      playwrightWorkers: 1,
      description: 'Memory conservative configuration',
    };
  }

  if (cpuCount >= 8 && freeMemoryGB >= 8) {
    log('info', 'High-performance system detected - using aggressive parallelization');
    return {
      config: 'vite.config.ts',
      maxThreads: Math.min(cpuCount - 2, 12),
      playwrightWorkers: Math.min(6, Math.ceil(cpuCount / 2)),
      description: 'High-performance configuration',
    };
  }

  log('info', 'Balanced system detected - using standard settings');
  return {
    config: 'vite.config.ts',
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

  log('info', `Using ${strategy.description}`);
  log('info', `Max threads: ${strategy.maxThreads}`);

  const coverageFlag = coverage ? '--coverage' : '--no-coverage';
  const watchFlag = watch ? '' : '--run';
  const reporterFlag = reporter !== 'default' ? `--reporter=${reporter}` : '';

  const command =
    `vitest ${watchFlag} ${coverageFlag} ${reporterFlag} --config=${strategy.config}`.trim();

  log('info', `Running: ${command}`);

  try {
    execSync(command, {
      stdio: 'inherit',
      env: {
        ...process.env,
        VITEST_MAX_THREADS: strategy.maxThreads.toString(),
      },
    });
    log('success', 'Unit tests completed successfully');
  } catch (error: any) {
    log('error', 'Unit tests failed');
    process.exit(error.status || 1);
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

  log('info', `Using ${strategy.description} for E2E tests`);
  log('info', `Playwright workers: ${strategy.playwrightWorkers}`);

  let command = 'npx playwright test';

  if (ui) {
    command += ' --ui';
  } else {
    if (suite) {
      command += ` tests/e2e/${suite}.spec.ts`;
    }

    if (project && !mobile) {
      command += ` --project=${project}`;
    }

    if (headed) {
      command += ' --headed';
    }

    if (debug) {
      command += ' --debug';
    }

    if (mobile) {
      // 设置移动设备测试环境变量
      process.env.MOBILE_TESTS = 'true';
      if (mobile !== 'all') {
        command += ` --grep="${mobile}"`;
      }
    }
  }

  log('info', `Running: ${command}`);

  try {
    execSync(command, {
      stdio: 'inherit',
      env: {
        ...process.env,
        PLAYWRIGHT_WORKERS: strategy.playwrightWorkers.toString(),
      },
    });
    log('success', 'E2E tests completed successfully');
  } catch (error: any) {
    log('error', 'E2E tests failed');
    process.exit(error.status || 1);
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
  options: Record<string, any>;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const options: Record<string, any> = {};

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

function main(): void {
  const { command, options } = parseArgs();
  const systemInfo = getSystemInfo();
  const strategy = selectTestStrategy(systemInfo);

  switch (command) {
    case 'unit':
      runUnitTests(strategy, {
        coverage: !options['no-coverage'] && systemInfo.isCoverage,
        reporter: options.reporter,
      });
      break;

    case 'unit:watch':
      runUnitTests(strategy, { watch: true, coverage: false });
      break;

    case 'unit:ci':
      // 强制使用CI配置
      const ciStrategy: TestStrategy = { ...strategy, config: 'vitest.ci.config.ts' };
      runUnitTests(ciStrategy, { coverage: true, reporter: 'verbose' });
      break;

    case 'e2e':
      runE2ETests(strategy, {
        project: options.project,
        suite: options.suite,
        mobile: options.mobile,
      });
      break;

    case 'e2e:ui':
      runE2ETests(strategy, { ui: true });
      break;

    case 'e2e:debug':
      runE2ETests(strategy, {
        debug: true,
        suite: options.positional,
        project: options.project || 'chromium',
      });
      break;

    case 'e2e:headed':
      runE2ETests(strategy, {
        headed: true,
        suite: options.positional,
        project: options.project || 'chromium',
      });
      break;

    case 'e2e:mobile':
      if (!options.positional) {
        log('error', 'Please specify a mobile device type');
        showUsage();
        process.exit(1);
      }
      runE2ETests(strategy, { mobile: options.positional });
      break;

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
