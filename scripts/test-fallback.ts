#!/usr/bin/env tsx
/**
 * Test script to verify fallback strategies work correctly
 */

import { findExecutable, isCommandAvailable } from './exec-utils';

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
