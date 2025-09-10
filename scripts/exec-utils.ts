#!/usr/bin/env tsx

import { spawnSync, SpawnSyncReturns, SpawnSyncOptions } from 'node:child_process';
import type { BufferEncoding } from 'node:buffer';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export type SafeEnvOptions = {
  removePath?: boolean;
};

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
    if (dangerousVars.includes(k)) continue;
    if (typeof v === 'string') baseEnv[k] = v;
  }

  if (removePath) {
    delete baseEnv.PATH;
    delete (baseEnv as Record<string, string | undefined>)['Path'];
  }

  return baseEnv;
}

export function resolveBin(pkgName: string, binName?: string): string {
  const pkgJsonPath = require.resolve(`${pkgName}/package.json`);
  const pkgDir = path.dirname(pkgJsonPath);
  const raw = readFileSync(pkgJsonPath, 'utf8');
  const pkg = JSON.parse(raw) as { name?: string; bin?: string | Record<string, string> };
  const binField = pkg.bin;

  if (typeof binField === 'string') return path.resolve(pkgDir, binField);

  if (binField && typeof binField === 'object') {
    if (binName && typeof binField[binName] === 'string')
      return path.resolve(pkgDir, binField[binName]);
    if (pkg.name && typeof binField[pkg.name] === 'string')
      return path.resolve(pkgDir, binField[pkg.name]);
    const values = Object.values(binField).filter((v): v is string => typeof v === 'string');
    if (values.length === 1) return path.resolve(pkgDir, values[0]);
  }

  const suffix = binName ? ` (bin: ${binName})` : '';
  throw new Error(`Cannot resolve bin for package: ${pkgName}${suffix}`);
}

export type SpawnNodeCliOptions = Omit<SpawnSyncOptions, 'shell' | 'env' | 'encoding' | 'stdio'> & {
  removePath?: boolean;
  encoding?: 'buffer' | BufferEncoding;
  stdio?: 'pipe' | 'inherit' | 'ignore';
};

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
  return spawnSync(nodeBin, [binPath, ...args], {
    encoding,
    stdio,
    shell: false,
    timeout,
    windowsHide: true,
    env: buildSafeEnv({ removePath }),
    ...rest,
  });
}
