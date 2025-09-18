#!/usr/bin/env tsx

/**
 * CSS & HTML Code Quality Checker
 * Runs stylelint for CSS and html-validate for HTML files
 * Usage: tsx scripts/css-html-quality-check.ts [--fix]
 */

import { SpawnSyncReturns, spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { pathToFileURL } from 'node:url';
import path from 'path';
import { buildSafeEnv } from './exec-utils';

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
// spawn options are provided per-call in spawnNodeCli

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

  let errorMessage = '';
  let invalidPattern = '';

  const allValid = patterns.every(pattern => {
    if (!allowedPattern.test(pattern)) {
      errorMessage = '❌ Invalid file pattern';
      invalidPattern = pattern;
      return false;
    }
    if (dangerousPattern.test(pattern)) {
      errorMessage = '❌ Dangerous characters in pattern';
      invalidPattern = pattern;
      return false;
    }
    if (pattern.length > 200) {
      errorMessage = '❌ Pattern too long';
      invalidPattern = pattern;
      return false;
    }
    return true;
  });

  if (!allValid) {
    console.error(`${errorMessage}: ${sanitizeLogOutput(invalidPattern)}`);
  }

  return allValid;
}

/**
 * Checks if stylelint execution was successful
 */
function isToolSuccess(result: SpawnSyncReturns<string>): boolean {
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
    console.log(sanitizeLogOutput(result.stdout));
  }
  if (result.stderr) {
    console.error(sanitizeLogOutput(result.stderr));
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
    // Use npx to run stylelint directly
    const stylelintArgs = [
      'stylelint',
      ...cssPatterns,
      '--formatter',
      'string',
      ...(shouldFix ? ['--fix'] : []),
    ];

    const result = spawnSync('npx', stylelintArgs, {
      encoding: 'utf8',
      stdio: 'pipe',
      shell: false,
      timeout: 60000,
      env: buildSafeEnv({ removePath: false }),
    });

    return isToolSuccess(result) ? handleStylelintSuccess(result) : handleStylelintFailure(result);
  } catch (error: unknown) {
    console.error('❌ Stylelint execution failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createFailedResult(STYLELINT_TOOL, errorMessage);
  }
}

/**
 * Handles html-validate success result
 */
function handleHtmlValidateSuccess(result: SpawnSyncReturns<string>): QualityCheckResult {
  console.log('✅ html-validate: All HTML files passed quality checks');
  return {
    tool: HTML_VALIDATE_TOOL,
    status: 'passed',
    errors: 0,
    warnings: 0,
    output: result.stdout,
  };
}

/**
 * Handles html-validate failure result
 */
function handleHtmlValidateFailure(result: SpawnSyncReturns<string>): QualityCheckResult {
  console.log('❌ html-validate: Found HTML quality issues');
  if (result.stdout) {
    console.log(sanitizeLogOutput(result.stdout));
  }
  if (result.stderr) {
    console.error(sanitizeLogOutput(result.stderr));
  }
  return createFailedResult(HTML_VALIDATE_TOOL, result.stdout || result.stderr || UNKNOWN_ERROR);
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
    const args = ['html-validate', ...htmlPatterns];
    const result = spawnSync('npx', args, {
      encoding: 'utf8',
      stdio: 'pipe',
      shell: false,
      timeout: 60000,
      env: buildSafeEnv({ removePath: false }),
    });

    return isToolSuccess(result)
      ? handleHtmlValidateSuccess(result)
      : handleHtmlValidateFailure(result);
  } catch (error: unknown) {
    console.error('❌ html-validate execution failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createFailedResult(HTML_VALIDATE_TOOL, errorMessage);
  }
}

/**
 * Sanitizes log output to prevent log injection attacks
 */
function sanitizeLogOutput(input: string): string {
  // Keep only printable ASCII characters and replace newlines/tabs with spaces
  const sanitized = input.replace(/[\n\t]/g, ' ').replace(/[^ -~]/g, '');
  return sanitized.replace(/\s+/g, ' ').trim().substring(0, 100);
}

export function isExecutedDirectly(
  argv: string[] = process.argv,
  moduleUrl: string = import.meta.url
): boolean {
  if (!Array.isArray(argv) || argv.length < 2) {
    return false;
  }

  const invokedPath = argv[1];
  if (typeof invokedPath !== 'string' || invokedPath.length === 0) {
    return false;
  }

  try {
    const absolutePath = path.isAbsolute(invokedPath) ? invokedPath : path.resolve(invokedPath);
    return moduleUrl === pathToFileURL(absolutePath).href;
  } catch {
    return false;
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
    const sanitizedTool = sanitizeLogOutput(result.tool);
    const sanitizedStatus = sanitizeLogOutput(result.status.toUpperCase());

    console.log(`${status} ${sanitizedTool}: ${sanitizedStatus}`);
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
if (isExecutedDirectly()) {
  main();
}
