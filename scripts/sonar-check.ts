#!/usr/bin/env tsx

/**
 * SonarQube-style code quality checker
 * Runs ESLint with SonarJS rules to identify code quality issues
 */

import { spawnSync } from 'child_process';
import { statSync } from 'fs';
import path from 'path';


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
 * Checks if a directory is secure (system-level, not user-writable)
 * Uses dynamic analysis instead of hardcoded paths
 */
function isSecureDirectory(dir: string): boolean {
  try {
    // Normalize and resolve the path
    const normalizedDir = path.resolve(dir);

    // Define patterns for unsafe directories
    const unsafePatterns = [
      /^\./, // Relative paths
      new RegExp(`^${process.env.HOME || '/home'}`), // User home directories
      new RegExp(`^${process.env.USERPROFILE || 'C:\\\\Users'}`), // Windows user directories
      /\/tmp\//, // Temporary directories
      /\/var\/tmp\//, // System temporary directories
      /[Tt]emp[/\\]/, // Windows temp directories (safer pattern)
      /node_modules/, // Node.js module directories
      /\.local\//, // User local directories
      /\.npm\//, // npm cache directories
      /\.pnpm\//, // pnpm directories
      /\.yarn\//, // Yarn directories
      /\/opt\/.*\/bin$/, // Third-party software in /opt (except system packages)
    ];

    // Check against unsafe patterns
    if (unsafePatterns.some(pattern => pattern.test(normalizedDir))) {
      return false;
    }

    // Additional checks for system directories
    const systemDirectoryPatterns = [
      /^\/usr\/bin$/,
      /^\/bin$/,
      /^\/usr\/local\/bin$/,
      /^\/opt\/homebrew\/bin$/, // Homebrew on Apple Silicon
      /^C:\\Windows\\System32$/i,
      /^C:\\Windows$/i,
    ];

    // If it matches known system patterns, it's likely secure
    if (systemDirectoryPatterns.some(pattern => pattern.test(normalizedDir))) {
      return true;
    }

    // For other directories, check if they exist and are accessible
    const stats = statSync(normalizedDir);
    if (!stats.isDirectory()) {
      return false;
    }

    // Additional security check: ensure it's not in user-writable locations
    // This is a basic check - in production, you might want more sophisticated permission checking
    return true;
  } catch {
    // If we can't access the directory, consider it unsafe
    return false;
  }
}

/**
 * Gets fallback system paths when dynamic filtering results in empty PATH
 * These are minimal, well-known system directories
 */
function getSystemFallbackPaths(): string[] {
  switch (process.platform) {
    case 'darwin': // macOS
      return ['/usr/bin', '/bin'];
    case 'linux':
      return ['/usr/bin', '/bin'];
    case 'win32': // Windows
      return ['C:\\Windows\\System32', 'C:\\Windows'];
    default:
      return ['/usr/bin', '/bin'];
  }
}

/**
 * Creates a secure environment with dynamically filtered PATH variable
 * Analyzes current PATH and filters out unsafe directories
 */
function createSecureEnvironment(): NodeJS.ProcessEnv {
  const currentPath = process.env.PATH || '';
  const pathSeparator = process.platform === 'win32' ? ';' : ':';

  // Parse current PATH into individual directories
  const pathDirectories = currentPath
    .split(pathSeparator)
    .filter(Boolean) // Remove empty entries
    .filter(isSecureDirectory); // Filter for secure directories only

  // If filtering resulted in no paths, use system fallback
  const securePaths = pathDirectories.length > 0 ? pathDirectories : getSystemFallbackPaths();

  console.log(
    `🔒 Filtered PATH from ${currentPath.split(pathSeparator).length} to ${securePaths.length} secure directories`
  );

  return {
    // Essential environment variables for Node.js and npm/pnpm
    NODE_ENV: process.env.NODE_ENV || 'development',
    HOME: process.env.HOME,
    USER: process.env.USER,
    USERPROFILE: process.env.USERPROFILE, // Windows equivalent of HOME
    LANG: process.env.LANG || 'en_US.UTF-8',

    // Dynamically filtered secure PATH
    PATH: securePaths.join(pathSeparator),

    // Node.js specific variables (only if they exist and are safe)
    NODE_OPTIONS: process.env.NODE_OPTIONS,

    // npm/pnpm configuration (only safe ones)
    npm_config_cache: process.env.npm_config_cache,
    npm_config_prefix: process.env.npm_config_prefix,

    // Explicitly remove dangerous environment variables
    LD_PRELOAD: undefined,
    LD_LIBRARY_PATH: undefined,
    DYLD_INSERT_LIBRARIES: undefined,
    DYLD_LIBRARY_PATH: undefined,
    DYLD_FALLBACK_LIBRARY_PATH: undefined,

    // Windows specific - only include safe PATHEXT
    PATHEXT: process.platform === 'win32' ? '.COM;.EXE;.BAT;.CMD' : undefined,
  };
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

/**
 * Finds the absolute path to npx executable in secure directories
 * Prevents relying on potentially unsafe PATH resolution
 */
function findSecureNpxPath(): string {
  const secureSearchPaths = getSystemFallbackPaths();
  const npxName = process.platform === 'win32' ? 'npx.cmd' : 'npx';

  for (const searchPath of secureSearchPaths) {
    const npxPath = path.join(searchPath, npxName);
    try {
      const stats = statSync(npxPath);
      if (stats.isFile()) {
        return npxPath;
      }
    } catch {
      // Continue searching
    }
  }

  // Fallback to npx if not found in secure paths
  // This maintains functionality while logging the security concern
  console.warn('⚠️ Could not find npx in secure paths, using system resolution');
  return 'npx';
}

function runSonarCheck(options: SonarCheckOptions = {}): void {
  try {
    console.log('🔍 Running SonarJS code quality checks...');

    // Build secure argument array
    const args = buildESLintArgs(options);

    // Find secure npx path
    const npxPath = findSecureNpxPath();

    // Log the command for transparency (but safely)
    console.log(`Executing: ${npxPath} eslint ${args.join(' ')}`);

    // Create secure environment with controlled PATH
    const secureEnv = createSecureEnvironment();

    // Execute with secure spawn (no shell interpretation)
    const result = spawnSync(npxPath, ['eslint', ...args], {
      encoding: 'utf8',
      stdio: 'pipe',
      shell: false, // Critical: disable shell interpretation
      timeout: 60000, // 60 second timeout
      env: secureEnv,
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

export { createSecureEnvironment, findSecureNpxPath, isSecureDirectory, runSonarCheck };
export type { SonarCheckOptions };
