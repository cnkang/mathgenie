#!/usr/bin/env tsx
/**
 * SonarCloud Issue Checker and Fixer
 * - Identifies common Sonar-like issues
 * - Provides safe auto-fix for duplicate strings (sonarjs/no-duplicate-string)
 *
 * Security:
 * - Avoids spawning shells; uses ESLint Node API (no execSync)
 * - Validates inputs; no user-controlled paths
 */

import { readFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';
import * as ts from 'typescript';
import { ESLint } from 'eslint';
import { applyDuplicateStringFixesToFile, findDuplicateStringsInFile } from './lib/duplicate-string-fixer';

interface SonarIssue {
  file: string;
  line: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

class SonarChecker {
  private issues: SonarIssue[] = [];
  private fixMode = false;
  private showWarnings = false;

  constructor(options: { fix?: boolean; warnings?: boolean } = {}) {
    this.fixMode = options.fix || false;
    this.showWarnings = options.warnings || false;
  }

  async run(): Promise<void> {
    console.log('🔍 Checking for SonarCloud issues...\n');

    await this.checkDuplicateStrings(this.fixMode);
    await this.checkCognitiveComplexity();
    await this.checkIdenticalExpressions();
    await this.checkUnusedVariables();
    await this.checkFunctionReturnTypes();

    this.reportResults();
  }

  private async checkDuplicateStrings(doFix: boolean): Promise<void> {
    console.log('📝 Checking for duplicate strings...');

    // Ignore translation source files where duplication is expected and harmless
    const files = await glob('src/**/*.{ts,tsx}', {
      ignore: [
        '**/*.test.*',
        '**/*.spec.*',
        'src/i18n/translations/*.ts',
      ],
    });

    for (const file of files) {
      const first = findDuplicateStringsInFile(file, { minLength: 6, minCount: 3 });

      if (doFix && first.duplicates.length > 0) {
        const applied = applyDuplicateStringFixesToFile(file, { minLength: 6, minCount: 3 });
        if (applied.changed) {
          console.log(
            `  ✨ Auto-fixed ${applied.replacedCount} duplicates in ${path.relative(process.cwd(), file)}`
          );
        }
        // Re-scan after fix and only report remaining issues
        const after = findDuplicateStringsInFile(file, { minLength: 6, minCount: 3 });
        for (const d of after.duplicates) {
          this.issues.push({
            file,
            line: d.line,
            rule: 'sonarjs/no-duplicate-string',
            message: `Duplicate string literal: ${d.preview}`,
            severity: 'warning',
          });
        }
      } else if (!doFix && first.duplicates.length > 0) {
        for (const d of first.duplicates) {
          this.issues.push({
            file,
            line: d.line,
            rule: 'sonarjs/no-duplicate-string',
            message: `Duplicate string literal: ${d.preview}`,
            severity: 'warning',
          });
        }
      }
    }

    // Post-pass: when fixing, ensure JSX brace repair runs even for files without duplicates
    if (doFix) {
      const tsxFiles = await glob('src/**/*.tsx', { ignore: ['**/*.test.*', '**/*.spec.*'] });
      for (const f of tsxFiles) {
        applyDuplicateStringFixesToFile(f, { minLength: 6, minCount: 3 });
      }
    }
  }

  private async checkCognitiveComplexity(): Promise<void> {
    console.log('🧠 Checking cognitive complexity...');

    const files = await glob('src/**/*.{ts,tsx}', { ignore: ['**/*.test.*', '**/*.spec.*'] });

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const functions = this.extractFunctions(content);

      functions.forEach(func => {
        const complexity = this.calculateCognitiveComplexity(func.body);
        if (complexity > 15) {
          this.issues.push({
            file,
            line: func.line,
            rule: 'sonarjs/cognitive-complexity',
            message: `Function has cognitive complexity of ${complexity} (max: 15)`,
            severity: 'error',
          });
        }
      });
    }
  }

  private async checkIdenticalExpressions(): Promise<void> {
    console.log('🔄 Checking for identical expressions...');

    const files = await glob('src/**/*.{ts,tsx}', { ignore: ['**/*.test.*', '**/*.spec.*'] });

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const functions = this.extractFunctions(content);
      for (const func of functions) {
        const ifStatements = func.body.match(/if\s*\([^)]+\)/g) || [];
        if (ifStatements.length < 2) continue;
        const duplicateConditions = this.findDuplicates(ifStatements.map(s => s.replace(/\s+/g, ' ')));
        duplicateConditions.forEach(condition => {
          this.issues.push({
            file,
            line: this.getLineNumber(content, condition.trim()),
            rule: 'sonarjs/no-identical-conditions',
            message: `Identical condition: ${condition}`,
            severity: 'error',
          });
        });
      }
    }
  }

  private async checkUnusedVariables(): Promise<void> {
    console.log('🗑️ Checking for unused variables...');

    try {
      const eslint = new ESLint({
        overrideConfig: {
          rules: { '@typescript-eslint/no-unused-vars': 'error' },
        },
        errorOnUnmatchedPattern: false,
      });

      const results = await eslint.lintFiles(['src/**/*.{ts,tsx}']);

      for (const result of results) {
        for (const message of result.messages) {
          if (message.ruleId === '@typescript-eslint/no-unused-vars') {
            this.issues.push({
              file: result.filePath,
              line: message.line ?? 1,
              rule: message.ruleId,
              message: message.message,
              severity: 'warning',
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ ESLint execution failed:', error);
    }
  }

  private async checkFunctionReturnTypes(): Promise<void> {
    console.log('📤 Checking function return types...');

    const files = await glob('src/**/*.{ts,tsx}', { ignore: ['**/*.test.*', '**/*.spec.*'] });

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');

      // Find functions without explicit return types
      const functionsWithoutReturnType =
        content.match(/(?:function|const\s+\w+\s*=\s*(?:async\s+)?)\s*\([^)]*\)\s*(?:=>)?\s*{/g) ||
        [];

      functionsWithoutReturnType.forEach(func => {
        if (!func.includes('):') && !func.includes('=> void') && !func.includes('=> Promise')) {
          this.issues.push({
            file,
            line: this.getLineNumber(content, func),
            rule: 'typescript/explicit-function-return-type',
            message: 'Function should have explicit return type',
            severity: 'info',
          });
        }
      });
    }
  }

  private findDuplicates<T>(array: T[]): T[] {
    const seen = new Set<T>();
    const duplicates = new Set<T>();

    array.forEach(item => {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    });

    return Array.from(duplicates);
  }

  private getLineNumber(content: string, searchString: string): number {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchString)) {
        return i + 1;
      }
    }
    return 1;
  }

  private extractFunctions(content: string): Array<{ line: number; body: string }> {
    const functions: Array<{ line: number; body: string }> = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/(?:function|const\s+\w+\s*=|=>\s*{)/)) {
        let braceCount = 0;
        let functionBody = '';
        let j = i;

        while (j < lines.length) {
          const currentLine = lines[j];
          functionBody += currentLine + '\n';

          braceCount += (currentLine.match(/{/g) || []).length;
          braceCount -= (currentLine.match(/}/g) || []).length;

          if (braceCount === 0 && j > i) {
            break;
          }
          j++;
        }

        functions.push({ line: i + 1, body: functionBody });
      }
    }

    return functions;
  }

  private calculateCognitiveComplexity(functionBody: string): number {
    let complexity = 0;

    // Count control flow statements
    complexity += (functionBody.match(/\bif\b/g) || []).length;
    complexity += (functionBody.match(/\belse\b/g) || []).length;
    complexity += (functionBody.match(/\bfor\b/g) || []).length;
    complexity += (functionBody.match(/\bwhile\b/g) || []).length;
    complexity += (functionBody.match(/\bswitch\b/g) || []).length;
    complexity += (functionBody.match(/\bcatch\b/g) || []).length;
    complexity += (functionBody.match(/\btry\b/g) || []).length;

    // Count logical operators
    complexity += (functionBody.match(/&&/g) || []).length;
    complexity += (functionBody.match(/\|\|/g) || []).length;

    // Count nested functions
    complexity += (functionBody.match(/function\s*\(/g) || []).length;
    complexity += (functionBody.match(/=>\s*{/g) || []).length;

    return complexity;
  }

  private reportResults(): void {
    console.log('\n📊 SonarCloud Issue Report');
    console.log('='.repeat(50));

    if (this.issues.length === 0) {
      console.log('✅ No issues found!');
      return;
    }

    const errorCount = this.issues.filter(i => i.severity === 'error').length;
    const warningCount = this.issues.filter(i => i.severity === 'warning').length;
    const infoCount = this.issues.filter(i => i.severity === 'info').length;

    console.log(`Found ${this.issues.length} issues:`);
    console.log(`  🔴 Errors: ${errorCount}`);
    console.log(`  🟡 Warnings: ${warningCount}`);
    console.log(`  🔵 Info: ${infoCount}\n`);

    // Group issues by file
    const issuesByFile = this.issues.reduce(
      (acc, issue) => {
        if (!acc[issue.file]) {
          acc[issue.file] = [];
        }
        acc[issue.file].push(issue);
        return acc;
      },
      {} as Record<string, SonarIssue[]>
    );

    Object.entries(issuesByFile).forEach(([file, issues]) => {
      console.log(`📁 ${path.relative(process.cwd(), file)}`);
      issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵';
        console.log(`  ${icon} Line ${issue.line}: ${issue.message} (${issue.rule})`);
      });
      console.log('');
    });

    if (this.fixMode) {
      console.log('🔧 Auto-fix applied where supported (duplicate strings).');
      console.log('Other issues require manual refactoring.');
    } else {
      console.log('💡 Run with --fix flag to attempt automatic fixes for duplicate strings.');
    }

    // Exit with error code if there are errors
    if (errorCount > 0) {
      process.exit(1);
    }
  }
}

// CLI interface
const args = process.argv.slice(2);
const options = {
  fix: args.includes('--fix'),
  warnings: args.includes('--warnings'),
};

const checker = new SonarChecker(options);
checker.run().catch(error => {
  console.error('❌ Error running SonarCloud checker:', error);
  process.exit(1);
});
