#!/usr/bin/env tsx
/**
 * Test script to verify fallback strategies work correctly
 */

import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Check if a command is available
 */
function isCommandAvailable(cmd: string): boolean {
  try {
    const result = spawnSync(cmd, ['--version'], {
      stdio: 'pipe',
      shell: false,
      timeout: 5000,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Find executable path with cross-platform support
 */
function findExecutable(command: string): string | null {
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

function main(): void {
  console.log('🔍 Testing fallback strategies...\n');

  // Test command availability
  const commands = ['pnpm', 'npx', 'node'];
  console.log('📋 Command availability:');
  commands.forEach(cmd => {
    const available = isCommandAvailable(cmd);
    console.log(
      `  ${available ? '✅' : '❌'} ${cmd}: ${available ? 'available' : 'not available'}`
    );
  });

  console.log('\n📁 Local executable detection:');
  const tools = ['vitest', 'playwright', 'stylelint', 'html-validate'];
  tools.forEach(tool => {
    const path = findExecutable(tool);
    console.log(`  ${path ? '✅' : '❌'} ${tool}: ${path || 'not found'}`);
  });

  console.log('\n🎯 Fallback strategy priority:');
  console.log('  1. Direct execution (./node_modules/.bin/tool)');
  console.log('  2. pnpm exec (if pnpm available)');
  console.log('  3. npx (if npx available)');
  console.log('  4. node direct (last resort)');

  console.log('\n✅ Fallback test completed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
