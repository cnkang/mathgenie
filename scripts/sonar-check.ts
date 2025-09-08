#!/usr/bin/env tsx

/**
 * SonarQube-style code quality checker
 * Runs ESLint with SonarJS rules to identify code quality issues
 */

import { execSync } from 'child_process';

interface SonarCheckOptions {
  fix?: boolean;
  files?: string[];
  severity?: 'error' | 'warn' | 'all';
}

function runSonarCheck(options: SonarCheckOptions = {}): void {
  const { fix = false, files = ['src'], severity = 'error' } = options;

  try {
    console.log('🔍 Running SonarJS code quality checks...');

    const filesPattern = files.join(' ');
    const fixFlag = fix ? '--fix' : '';
    const maxWarnings = severity === 'all' ? '' : '--max-warnings 0';

    const command = `npx eslint ${filesPattern} --ext .ts,.tsx ${fixFlag} ${maxWarnings}`.trim();

    console.log(`Executing: ${command}`);

    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    console.log('✅ SonarJS checks passed!');
    if (result) {
      console.log(result);
    }
  } catch (error) {
    if (error instanceof Error && 'stdout' in error) {
      const stdout = (error as any).stdout;
      const stderr = (error as any).stderr;

      if (stdout) {
        console.log('SonarJS Issues Found:');
        console.log(stdout);
      }

      if (stderr) {
        console.error('ESLint execution error:', stderr);
      }

      console.error('❌ SonarJS checks failed. Please fix the issues above.');
      process.exit(1);
    } else {
      console.error('Unexpected error during SonarJS check:', error);
      process.exit(1);
    }
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
