#!/usr/bin/env tsx

/**
 * CSS & HTML Code Quality Checker
 * Runs stylelint for CSS and html-validate for HTML files
 * Usage: tsx scripts/css-html-quality-check.ts [--fix]
 */

import { spawnSync, SpawnSyncReturns } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');

// Constants
const FAILED_STATUS = 'failed' as const;
const UNKNOWN_ERROR = 'Unknown error' as const;
const INVALID_CSS_PATTERNS = 'Invalid CSS file patterns' as const;
const INVALID_HTML_PATTERNS = 'Invalid HTML file patterns' as const;
const STYLELINT_TOOL = 'stylelint' as const;
const HTML_VALIDATE_TOOL = 'html-validate' as const;
const SPAWN_OPTIONS = {
  encoding: 'utf8' as const,
  stdio: 'pipe' as const,
  shell: false,
  timeout: 60000,
  windowsHide: true,
} as const;

/**
 * Build a sanitized environment for child processes
 * - Removes dangerous variables to prevent library injection
 * - Sets a fixed PATH containing only system directories (no writable dirs)
 */
export function buildSafeEnv(): Record<string, string> {
  const dangerousVars = [
    'LD_PRELOAD',
    'LD_LIBRARY_PATH',
    'DYLD_INSERT_LIBRARIES',
    'DYLD_LIBRARY_PATH',
  ];

  const baseEnv: Record<string, string> = {};

  // Copy only non-dangerous env vars
  for (const [key, value] of Object.entries(process.env)) {
    if (dangerousVars.includes(key)) continue;
    if (typeof value === 'string') baseEnv[key] = value;
  }

  // Remove PATH entirely to avoid any PATH-based command resolution
  // and ensure we only execute absolute binaries.
  delete baseEnv.PATH;
  delete (baseEnv as Record<string, string | undefined>)['Path'];

  return baseEnv;
}

/**
 * Resolve the absolute path to a package's bin script to avoid PATH lookups.
 */
export function resolveBin(pkgName: string, binName?: string): string {
  const pkgJsonPath = require.resolve(`${pkgName}/package.json`);
  const pkgDir = path.dirname(pkgJsonPath);
  const raw = readFileSync(pkgJsonPath, 'utf8');
  const pkg = JSON.parse(raw) as { name?: string; bin?: string | Record<string, string> };
  const binField = pkg.bin;

  if (typeof binField === 'string') {
    return path.resolve(pkgDir, binField);
  }

  if (binField && typeof binField === 'object') {
    if (binName && typeof binField[binName] === 'string') {
      return path.resolve(pkgDir, binField[binName]);
    }
    if (pkg.name && typeof binField[pkg.name] === 'string') {
      return path.resolve(pkgDir, binField[pkg.name]);
    }
    const values = Object.values(binField).filter((v): v is string => typeof v === 'string');
    if (values.length === 1) {
      return path.resolve(pkgDir, values[0]);
    }
  }

  const suffix = binName ? ` (bin: ${binName})` : '';
  throw new Error(`Cannot resolve bin for package: ${pkgName}${suffix}`);
}

/**
 * Build spawn options including sanitized environment.
 */
function buildSpawnOptions() {
  return {
    ...SPAWN_OPTIONS,
    env: buildSafeEnv(),
  } as const;
}

/**
 * Creates a failed result object
 */
function createFailedResult(tool: string, output: string): QualityCheckResult {
  return {
    tool,
    status: FAILED_STATUS,
    errors: 1,
    warnings: 0,
    output,
  };
}

interface QualityCheckResult {
  tool: string;
  status: 'passed' | 'failed';
  errors: number;
  warnings: number;
  output?: string;
}

/**
 * Validates file patterns for security
 */
export function validateFilePatterns(patterns: string[]): boolean {
  const allowedPattern = /^[a-zA-Z0-9_\-./*]+$/;
  const dangerousPattern = /[;&|`$(){}[\]<>?~]/;

  return patterns.every(pattern => {
    if (!allowedPattern.test(pattern)) {
      console.error(`❌ Invalid file pattern: ${pattern}`);
      return false;
    }
    if (dangerousPattern.test(pattern)) {
      console.error(`❌ Dangerous characters in pattern: ${pattern}`);
      return false;
    }
    if (pattern.length > 200) {
      console.error(`❌ Pattern too long: ${pattern}`);
      return false;
    }
    return true;
  });
}

/**
 * Checks if stylelint execution was successful
 */
function isStylelintSuccess(result: SpawnSyncReturns<string>): boolean {
  return result.status === 0 || (result.status === null && result.signal === null && !result.error);
}

/**
 * Handles stylelint success result
 */
function handleStylelintSuccess(result: SpawnSyncReturns<string>): QualityCheckResult {
  const message = shouldFix
    ? '✅ Stylelint: All CSS files passed quality checks (auto-fixed issues if any)'
    : '✅ Stylelint: All CSS files passed quality checks';
  console.log(message);
  return {
    tool: STYLELINT_TOOL,
    status: 'passed',
    errors: 0,
    warnings: 0,
    output: result.stdout,
  };
}

/**
 * Handles stylelint failure result
 */
function handleStylelintFailure(result: SpawnSyncReturns<string>): QualityCheckResult {
  const message = shouldFix
    ? '❌ Stylelint: Found CSS quality issues (some may have been auto-fixed)'
    : '❌ Stylelint: Found CSS quality issues';
  console.log(message);
  if (result.stdout) {
    console.log(result.stdout);
  }
  if (result.stderr) {
    console.error(result.stderr);
  }
  return createFailedResult(STYLELINT_TOOL, result.stdout || result.stderr || UNKNOWN_ERROR);
}

/**
 * Runs stylelint for CSS quality checking
 */
function runStylelint(): QualityCheckResult {
  const action = shouldFix ? 'fixing' : 'checking';
  console.log(`🎨 Running stylelint for CSS quality ${action}...`);

  const cssPatterns = ['src/**/*.css', 'public/**/*.css'];

  if (!validateFilePatterns(cssPatterns)) {
    return createFailedResult(STYLELINT_TOOL, INVALID_CSS_PATTERNS);
  }

  try {
    // Execute stylelint via the Node binary with an absolute bin script path
    const nodeBin = process.execPath; // absolute path to the current Node.js executable
    const stylelintBin = resolveBin(STYLELINT_TOOL, STYLELINT_TOOL);

    const stylelintArgs = [
      stylelintBin,
      ...cssPatterns,
      '--formatter',
      'string',
      ...(shouldFix ? ['--fix'] : []),
    ];

    const result = spawnSync(nodeBin, stylelintArgs, buildSpawnOptions());

    return isStylelintSuccess(result)
      ? handleStylelintSuccess(result)
      : handleStylelintFailure(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Stylelint execution failed:', errorMessage);
    return createFailedResult(STYLELINT_TOOL, errorMessage);
  }
}

/**
 * Runs html-validate for HTML quality checking
 */

function runHTMLValidate(): QualityCheckResult {
  console.log('🌐 Running html-validate for HTML quality check...');

  const htmlPatterns = ['index.html', 'public/**/*.html', 'src/**/*.html'];

  if (!validateFilePatterns(htmlPatterns)) {
    return createFailedResult(HTML_VALIDATE_TOOL, INVALID_HTML_PATTERNS);
  }

  try {
    const nodeBin = process.execPath;
    const htmlValidateBin = resolveBin(HTML_VALIDATE_TOOL, HTML_VALIDATE_TOOL);
    const args = [htmlValidateBin, ...htmlPatterns];

    const result = spawnSync(nodeBin, args, buildSpawnOptions());

    // Handle successful execution (status 0 or null with no error/signal)
    if (
      result.status === 0 ||
      (result.status === null && result.signal === null && !result.error)
    ) {
      console.log('✅ html-validate: All HTML files passed quality checks');
      return {
        tool: HTML_VALIDATE_TOOL,
        status: 'passed',
        errors: 0,
        warnings: 0,
        output: result.stdout,
      };
    } else {
      console.log('❌ html-validate: Found HTML quality issues');
      if (result.stdout) {
        console.log(result.stdout);
      }
      if (result.stderr) {
        console.error(result.stderr);
      }
      return createFailedResult(
        HTML_VALIDATE_TOOL,
        result.stdout || result.stderr || UNKNOWN_ERROR
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ html-validate execution failed:', errorMessage);
    return createFailedResult(HTML_VALIDATE_TOOL, errorMessage);
  }
}

/**
 * Generates quality report
 */
function generateReport(results: QualityCheckResult[]): void {
  console.log('\n📊 CSS & HTML Quality Check Report');
  console.log('=====================================');

  let totalErrors = 0;
  let totalWarnings = 0;
  let allPassed = true;

  results.forEach(result => {
    const status = result.status === 'passed' ? '✅' : '❌';
    console.log(`${status} ${result.tool}: ${result.status.toUpperCase()}`);
    console.log(`   Errors: ${result.errors}, Warnings: ${result.warnings}`);

    totalErrors += result.errors;
    totalWarnings += result.warnings;

    if (result.status === 'failed') {
      allPassed = false;
    }
  });

  console.log('\n📈 Summary:');
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);
  console.log(`Overall Status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);

  if (!allPassed) {
    process.exit(1);
  }
}

/**
 * Main execution function
 */
function main(): void {
  const mode = shouldFix ? 'with auto-fix' : 'check-only';
  console.log(`🔍 Starting CSS & HTML Quality Checks (${mode})...\n`);

  const results: QualityCheckResult[] = [];

  // Check if CSS files exist
  const hasCSSFiles =
    existsSync('src') &&
    (existsSync(path.join('src', 'styles')) || existsSync(path.join('src', 'components')));

  if (hasCSSFiles) {
    results.push(runStylelint());
  } else {
    console.log('ℹ️  No CSS files found, skipping stylelint');
  }

  // Check if HTML files exist
  const hasHTMLFiles = existsSync('public/index.html') || existsSync('src');

  if (hasHTMLFiles) {
    results.push(runHTMLValidate());
  } else {
    console.log('ℹ️  No HTML files found, skipping html-validate');
  }

  if (results.length === 0) {
    console.log('ℹ️  No CSS or HTML files found to check');
    return;
  }

  generateReport(results);
}

// Run only when executed directly (not when imported for tests)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
