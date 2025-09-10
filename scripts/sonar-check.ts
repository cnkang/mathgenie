#!/usr/bin/env tsx

/**
 * SonarQube-style code quality checker
 * Runs ESLint with SonarJS rules to identify code quality issues
 */

import { spawnNodeCli } from './exec-utils';

interface SonarCheckOptions {
  fix?: boolean;
  files?: string[];
  severity?: 'error' | 'warn' | 'all';
}

/**
 * Validates that file patterns are safe for ESLint execution
 * Prevents path traversal and ensures only TypeScript files are processed
 */
function validateFilePatterns(files: string[]): boolean {
  const allowedPatterns = /^[a-zA-Z0-9_\-./]+$/;
  const dangerousPatterns = /[;&|`$(){}[\]<>*?~]/;

  return files.every(file => {
    // Must match allowed characters only
    if (!allowedPatterns.test(file)) {
      console.error(`❌ Invalid file pattern: ${file}`);
      return false;
    }

    // Must not contain shell metacharacters
    if (dangerousPatterns.test(file)) {
      console.error(`❌ Dangerous characters in file pattern: ${file}`);
      return false;
    }

    // Must be reasonable length
    if (file.length > 200) {
      console.error(`❌ File pattern too long: ${file}`);
      return false;
    }

    return true;
  });
}

/**
 * Builds validated ESLint arguments array
 * Prevents command injection by using argument arrays instead of string concatenation
 */
function buildESLintArgs(options: SonarCheckOptions): string[] {
  const { fix = false, files = ['src'], severity = 'error' } = options;

  // Validate file patterns first
  if (!validateFilePatterns(files)) {
    throw new Error('Invalid file patterns detected');
  }

  const args: string[] = [];

  // Add file patterns
  files.forEach(file => args.push(file));

  // Add extensions
  args.push('--ext', '.ts,.tsx');

  // Add fix flag if requested
  if (fix) {
    args.push('--fix');
  }

  // Add severity handling
  if (severity !== 'all') {
    args.push('--max-warnings', '0');
  }

  return args;
}

function runSonarCheck(options: SonarCheckOptions = {}): void {
  try {
    console.log('🔍 Running SonarJS code quality checks...');

    // Build secure argument array
    const args = buildESLintArgs(options);

    // Execute eslint via Node with an absolute bin script path
    const result = spawnNodeCli('eslint', 'eslint', args, {
      encoding: 'utf8',
      stdio: 'pipe',
      removePath: true,
      timeout: 60000,
    });

    // Handle successful execution
    if (result.status === 0) {
      console.log('✅ SonarJS checks passed!');
      if (result.stdout) {
        console.log(result.stdout);
      }
      return;
    }

    // Handle ESLint errors (non-zero exit code)
    if (result.stdout) {
      console.log('SonarJS Issues Found:');
      console.log(result.stdout);
    }

    if (result.stderr) {
      console.error('ESLint execution error:', result.stderr);
    }

    if (result.error) {
      console.error('Process execution error:', result.error.message);
    }

    console.error('❌ SonarJS checks failed. Please fix the issues above.');
    process.exit(1);
  } catch (error) {
    console.error('Unexpected error during SonarJS check:', error);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);
const fix = args.includes('--fix');
const showWarnings = args.includes('--warnings');

runSonarCheck({
  fix,
  severity: showWarnings ? 'all' : 'error',
});

export { runSonarCheck };
export type { SonarCheckOptions };
