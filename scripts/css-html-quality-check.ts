#!/usr/bin/env tsx
/**
 * Simplified CSS & HTML Quality Check
 *
 * This script runs stylelint and html-validate using spawnSync for security.
 */

import { spawnSync } from 'child_process';
import { findExecutable, isCommandAvailable } from './exec-utils';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Constants to avoid duplicate strings
const UNKNOWN_ERROR_MESSAGE = 'Unknown error occurred';
const NO_ISSUES_FOUND = 'No issues found';
const SUCCESS_EMOJI = '✅';
const FAILED_EMOJI = '❌';
const PASSED_TEXT = 'PASSED';
const FAILED_TEXT = 'FAILED';
const TOOL_STYLELINT = 'stylelint';
const TOOL_HTML_VALIDATE = 'html-validate';

export interface QualityResult {
  tool: string;
  success: boolean;
  output: string;
}

/**
 * Execute a command safely using spawnSync with multiple fallback strategies
 */
export function safeExec(command: string, args: string[]): { output: string; exitCode: number } {
  // Strategy 1: Direct execution
  const executablePath = findExecutable(command);
  if (executablePath) {
    const result = tryExecWithOutput(executablePath, args);
    if (result) {
      return result;
    }
  }

  // Strategy 2: pnpm exec
  if (isCommandAvailable('pnpm')) {
    const result = tryExecWithOutput('pnpm', ['exec', command, ...args]);
    if (result) {
      return result;
    }
  }

  // Strategy 3: npx
  if (isCommandAvailable('npx')) {
    const result = tryExecWithOutput('npx', [command, ...args]);
    if (result) {
      return result;
    }
  }

  throw new Error(`Failed to execute ${command}`);
}

export function tryExecWithOutput(
  executable: string,
  args: string[]
): { output: string; exitCode: number } | null {
  try {
    const result = spawnSync(executable, args, {
      encoding: 'utf8',
      shell: false,
    });

    // Return output and exit code regardless of status
    // For linters, non-zero exit code just means issues were found
    return {
      output: (result.stdout || result.stderr || '').trim(),
      exitCode: result.status || 0,
    };
  } catch {
    return null;
  }
}

export function runStylelint(shouldFix: boolean): QualityResult {
  const args = [
    'src/**/*.css',
    'public/**/*.css',
    '--formatter',
    'string',
    ...(shouldFix ? ['--fix'] : []),
  ];

  try {
    const result = safeExec(TOOL_STYLELINT, args);
    // Exit code 0 = no issues, exit code 1 = issues found, other codes = error
    const success = result.exitCode === 0;
    return {
      tool: TOOL_STYLELINT,
      success,
      output:
        result.output || (success ? NO_ISSUES_FOUND : 'Issues found but no details available'),
    };
  } catch (error: unknown) {
    const execError = error as { message?: string };
    return {
      tool: TOOL_STYLELINT,
      success: false,
      output: execError.message || UNKNOWN_ERROR_MESSAGE,
    };
  }
}

export function runHtmlValidate(): QualityResult {
  const args = ['index.html', 'public/**/*.html', 'src/**/*.html'];

  try {
    const result = safeExec(TOOL_HTML_VALIDATE, args);
    // Exit code 0 = no issues, exit code 1 = issues found, other codes = error
    const success = result.exitCode === 0;
    return {
      tool: TOOL_HTML_VALIDATE,
      success,
      output:
        result.output || (success ? NO_ISSUES_FOUND : 'Issues found but no details available'),
    };
  } catch (error: unknown) {
    const execError = error as { message?: string };
    return {
      tool: TOOL_HTML_VALIDATE,
      success: false,
      output: execError.message || UNKNOWN_ERROR_MESSAGE,
    };
  }
}

function main(): void {
  const shouldFix = process.argv.includes('--fix');

  console.log(
    `${colors.cyan}🔍 Starting CSS & HTML Quality Checks${shouldFix ? ' (with auto-fix)' : ' (check-only)'}...${colors.reset}\n`
  );

  const results: QualityResult[] = [];

  // Run stylelint
  console.log('🎨 Running stylelint for CSS quality checking...');
  const stylelintResult = runStylelint(shouldFix);
  results.push(stylelintResult);

  if (stylelintResult.success) {
    console.log(`${SUCCESS_EMOJI} Stylelint: All CSS files passed quality checks`);
  } else {
    console.log(`${FAILED_EMOJI} Stylelint: Found CSS quality issues`);
    if (stylelintResult.output.trim()) {
      console.log(stylelintResult.output);
    }
  }

  // Run html-validate
  console.log('🌐 Running html-validate for HTML quality check...');
  const htmlResult = runHtmlValidate();
  results.push(htmlResult);

  if (htmlResult.success) {
    console.log(`${SUCCESS_EMOJI} html-validate: All HTML files passed quality checks`);
  } else {
    console.log(`${FAILED_EMOJI} html-validate: Found HTML quality issues`);
    if (htmlResult.output.trim()) {
      console.log(htmlResult.output);
    }
  }

  // Generate summary report
  console.log('\n📊 Quality Check Summary');
  console.log('========================');

  let allPassed = true;
  let totalErrors = 0;

  results.forEach(result => {
    const status = result.success ? SUCCESS_EMOJI : FAILED_EMOJI;
    const statusText = result.success ? PASSED_TEXT : FAILED_TEXT;
    console.log(`${status} ${result.tool}: ${statusText}`);

    if (!result.success) {
      allPassed = false;
      totalErrors += 1;
    }
  });

  const overallStatus = allPassed
    ? `${SUCCESS_EMOJI} All checks passed`
    : `${FAILED_EMOJI} ${totalErrors} check(s) failed`;
  console.log(`\nOverall: ${overallStatus}`);

  if (!allPassed) {
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
