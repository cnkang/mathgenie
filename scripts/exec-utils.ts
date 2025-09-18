#!/usr/bin/env tsx

import { SpawnSyncOptions, SpawnSyncReturns, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

const EXEC_TIMEOUT_MS = 5000;
const EXECUTABLE_EXTENSIONS = process.platform === 'win32' ? ['.cmd', '.bat', ''] : [''];
const DEFAULT_BASE_PATH = './node_modules/.bin';

export type SafeEnvOptions = {
  removePath?: boolean;
};

export function findExecutable(
  command: string,
  basePath: string = DEFAULT_BASE_PATH
): string | null {
  for (const ext of EXECUTABLE_EXTENSIONS) {
    const fullPath = path.join(basePath, command + ext);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

export function isCommandAvailable(
  cmd: string,
  args: string[] = ['--version'],
  timeoutMs: number = EXEC_TIMEOUT_MS
): boolean {
  try {
    const result = spawnSync(cmd, args, {
      stdio: 'pipe',
      shell: false,
      timeout: timeoutMs,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

export function buildSafeEnv(opts: SafeEnvOptions = {}): Record<string, string> {
  const { removePath = true } = opts;
  const dangerousVars = [
    'LD_PRELOAD',
    'LD_LIBRARY_PATH',
    'DYLD_INSERT_LIBRARIES',
    'DYLD_LIBRARY_PATH',
    'DYLD_FALLBACK_LIBRARY_PATH',
  ];

  const baseEnv: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (!dangerousVars.includes(k) && typeof v === 'string') {
      baseEnv[k] = v;
    }
  }

  if (removePath) {
    delete baseEnv.PATH;
    delete (baseEnv as Record<string, string | undefined>)['Path'];
  }

  return baseEnv;
}

function validateBinPath(binPath: string): string {
  if (!binPath || typeof binPath !== 'string') {
    throw new Error('Invalid bin path');
  }
  // Prevent path traversal
  if (binPath.includes('..') || path.isAbsolute(binPath)) {
    throw new Error(`Unsafe bin path: ${binPath}`);
  }
  return binPath;
}

export function resolveBin(pkgName: string, binName?: string): string {
  // Validate package name to prevent path traversal
  if (
    !pkgName ||
    typeof pkgName !== 'string' ||
    pkgName.includes('..') ||
    pkgName.includes('/') ||
    pkgName.includes('\\')
  ) {
    throw new Error(`Invalid package name: ${pkgName}`);
  }

  const pkgJsonPath = require.resolve(`${pkgName}/package.json`);
  const pkgDir = path.dirname(pkgJsonPath);
  const raw = readFileSync(pkgJsonPath, 'utf8');
  const pkg = JSON.parse(raw) as { name?: string; bin?: string | Record<string, string> };
  const binField = pkg.bin;

  if (typeof binField === 'string') {
    return path.resolve(pkgDir, validateBinPath(binField));
  }

  if (binField && typeof binField === 'object') {
    if (binName && typeof binField[binName] === 'string') {
      return path.resolve(pkgDir, validateBinPath(binField[binName]));
    }
    if (pkg.name && typeof binField[pkg.name] === 'string') {
      return path.resolve(pkgDir, validateBinPath(binField[pkg.name]));
    }
    const values = Object.values(binField).filter((v): v is string => typeof v === 'string');
    if (values.length === 1) {
      return path.resolve(pkgDir, validateBinPath(values[0]));
    }
  }

  const suffix = binName ? ` (bin: ${binName})` : '';
  throw new Error(`Cannot resolve bin for package: ${pkgName}${suffix}`);
}

export type SpawnNodeCliOptions = Omit<SpawnSyncOptions, 'shell' | 'env' | 'encoding' | 'stdio'> & {
  removePath?: boolean;
  encoding?: 'utf8';
  stdio?: 'pipe' | 'inherit' | 'ignore';
};

function sanitizeArg(arg: unknown): arg is string {
  if (typeof arg !== 'string' || arg.length === 0) {
    return false;
  }
  // Block dangerous characters and patterns
  if (/[;|&`$\n\r]/.test(arg)) {
    return false;
  }
  // Block eval flags
  if (arg.startsWith('-e') || arg.startsWith('--eval')) {
    return false;
  }
  return true;
}

export function spawnNodeCli(
  pkg: string,
  bin: string,
  args: string[],
  options: SpawnNodeCliOptions = {}
): SpawnSyncReturns<string> {
  const nodeBin = process.execPath;
  const binPath = resolveBin(pkg, bin);
  const {
    removePath = true,
    encoding = 'utf8',
    stdio = 'pipe',
    timeout = 60000,
    ...rest
  } = options;

  // Validate and sanitize arguments to prevent code injection
  if (!Array.isArray(args)) {
    throw new Error('Arguments must be an array');
  }

  const sanitizedArgs = args.filter(sanitizeArg);

  return spawnSync(nodeBin, [binPath, ...sanitizedArgs], {
    encoding,
    stdio,
    shell: false,
    timeout,
    windowsHide: true,
    env: buildSafeEnv({ removePath }),
    ...rest,
  });
}
