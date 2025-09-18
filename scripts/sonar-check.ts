#!/usr/bin/env tsx
/**
 * Enhanced SonarQube Local Checker
 * 专注于 HIGH 级别的 SonarQube 规则检查
 *
 * 支持的 HIGH 级别规则：
 * - typescript:S3776: Cognitive Complexity (HIGH)
 * - typescript:S1871: Identical Expressions (HIGH)
 * - typescript:S138: Function Length (HIGH)
 * - typescript:S107: Parameter Count (HIGH)
 * - typescript:S134: Nested Control Flow (HIGH)
 * - typescript:S1067: Expression Complexity (HIGH)
 * - typescript:S3800: Multiple Returns (HIGH)
 *
 * Security:
 * - All regex patterns use bounded quantifiers to prevent ReDoS attacks
 * - Character classes are limited to reasonable lengths (e.g., {0,500}, {1,10})
 * - Whitespace matching uses specific character classes [ \t] instead of \s
 */

import { ESLint } from 'eslint';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import * as path from 'path';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

interface SonarIssue {
  file: string;
  line: number;
  rule: string;
  sonarRule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface FunctionMetrics {
  name: string;
  startLine: number;
  linesOfCode: number;
  parameters: number;
  cognitiveComplexity: number;
  returnStatements: number;
  nestingLevel: number;
  expressionComplexity: number;
}

class SonarChecker {
  private issues: SonarIssue[] = [];
  private showOnlyHigh = false;
  private verbose = false;

  constructor(options: { highOnly?: boolean; verbose?: boolean } = {}) {
    this.showOnlyHigh = options.highOnly || false;
    this.verbose = options.verbose || false;
  }

  async run(): Promise<void> {
    console.log(`${colors.cyan}🔍 Enhanced SonarQube Local Checker${colors.reset}`);
    console.log(
      `${colors.blue}Focusing on ${this.showOnlyHigh ? 'HIGH priority' : 'all'} rules${colors.reset}\n`
    );

    await this.checkAllRules();
    this.reportResults();
  }

  private async checkAllRules(): Promise<void> {
    const files = await glob('src/**/*.{ts,tsx}', {
      ignore: ['**/*.test.*', '**/*.spec.*', 'src/i18n/translations/*.ts'],
    });

    console.log(`📊 Analyzing ${files.length} files...\n`);

    for (const file of files) {
      await this.analyzeFile(file);
    }

    // Check unused variables using ESLint
    console.log('🗑️ Checking for unused variables...');
    await this.checkUnusedVariables();
  }

  private async analyzeFile(filePath: string): Promise<void> {
    const content = readFileSync(filePath, 'utf8');
    const functions = this.extractFunctions(content);

    for (const func of functions) {
      this.checkCognitiveComplexity(filePath, func);
      this.checkFunctionLength(filePath, func);
      this.checkParameterCount(filePath, func);
      this.checkReturnStatements(filePath, func);
      this.checkNestingLevel(filePath, func);
      this.checkExpressionComplexity(filePath, func);
    }

    this.checkIdenticalExpressions(filePath, content);
  }

  private extractFunctions(content: string): FunctionMetrics[] {
    const functions: FunctionMetrics[] = [];
    const lines = content.split('\n');

    const functionPatterns = [
      /^[ \t]{0,10}(?:export[ \t]{1,10})?(?:async[ \t]{1,10})?function[ \t]{1,10}(\w+)/,
      /^[ \t]{0,10}(?:export[ \t]{1,10})?const[ \t]{1,10}(\w+)[ \t]{0,10}=[ \t]{0,10}(?:async[ \t]{1,10})?\(/,
      /^[ \t]{0,10}(\w+)[ \t]{0,10}\([^)]{0,500}\)[ \t]{0,10}{/,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of functionPatterns) {
        const match = line.match(pattern);
        if (match && !line.includes('//')) {
          const functionName = match[1];
          const startLine = i + 1;

          // Extract function body
          let braceCount = 0;
          let functionContent = '';
          let started = false;

          for (let j = i; j < lines.length; j++) {
            const currentLine = lines[j];
            functionContent += currentLine + '\n';

            for (const char of currentLine) {
              if (char === '{') {
                braceCount++;
                started = true;
              } else if (char === '}') {
                braceCount--;
                if (started && braceCount === 0) {
                  break;
                }
              }
            }
            if (started && braceCount === 0) break;
          }

          const metrics = this.calculateMetrics(functionContent, functionName, startLine);
          functions.push(metrics);
          break;
        }
      }
    }

    return functions;
  }

  private calculateMetrics(
    functionContent: string,
    name: string,
    startLine: number
  ): FunctionMetrics {
    const lines = functionContent
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('//'));

    // Count parameters
    const paramMatch = functionContent.match(/\(([^)]{0,500})\)/);
    const parameters = paramMatch ? paramMatch[1].split(',').filter(p => p.trim()).length : 0;

    // Calculate cognitive complexity
    let cognitiveComplexity = 0;
    const complexityPatterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bswitch\b/g,
      /\bcatch\b/g,
      /&&/g,
      /\|\|/g,
      /\?.{0,100}:/g,
    ];

    for (const pattern of complexityPatterns) {
      const matches = functionContent.match(pattern);
      if (matches) cognitiveComplexity += matches.length;
    }

    // Count return statements
    const returnStatements = (functionContent.match(/\breturn\b/g) || []).length;

    // Calculate nesting level
    let maxLevel = 0;
    let currentLevel = 0;
    for (const char of functionContent) {
      if (char === '{') {
        currentLevel++;
        maxLevel = Math.max(maxLevel, currentLevel);
      } else if (char === '}') {
        currentLevel--;
      }
    }

    // Calculate expression complexity
    const expressionComplexity = (functionContent.match(/&&|\|\||\?.{0,100}:/g) || []).length;

    return {
      name,
      startLine,
      linesOfCode: lines.length,
      parameters,
      cognitiveComplexity,
      returnStatements,
      nestingLevel: maxLevel,
      expressionComplexity,
    };
  }

  // Rule checking methods
  private checkCognitiveComplexity(filePath: string, func: FunctionMetrics): void {
    if (func.cognitiveComplexity > 15) {
      this.addIssue(
        filePath,
        func.startLine,
        'typescript:S3776',
        `Function '${func.name}' has cognitive complexity ${func.cognitiveComplexity}, which exceeds the maximum of 15`,
        'error',
        'HIGH'
      );
    }
  }

  private checkFunctionLength(filePath: string, func: FunctionMetrics): void {
    if (func.linesOfCode > 50) {
      this.addIssue(
        filePath,
        func.startLine,
        'typescript:S138',
        `Function '${func.name}' has ${func.linesOfCode} lines, which exceeds the maximum of 50`,
        'warning',
        'HIGH'
      );
    }
  }

  private checkParameterCount(filePath: string, func: FunctionMetrics): void {
    if (func.parameters > 7) {
      this.addIssue(
        filePath,
        func.startLine,
        'typescript:S107',
        `Function '${func.name}' has ${func.parameters} parameters, which exceeds the maximum of 7`,
        'warning',
        'HIGH'
      );
    }
  }

  private checkReturnStatements(filePath: string, func: FunctionMetrics): void {
    if (func.returnStatements > 3) {
      this.addIssue(
        filePath,
        func.startLine,
        'typescript:S3800',
        `Function '${func.name}' has ${func.returnStatements} return statements, which exceeds the maximum of 3`,
        'warning',
        'HIGH'
      );
    }
  }

  private checkNestingLevel(filePath: string, func: FunctionMetrics): void {
    if (func.nestingLevel > 3) {
      this.addIssue(
        filePath,
        func.startLine,
        'typescript:S134',
        `Function '${func.name}' has nesting level ${func.nestingLevel}, which exceeds the maximum of 3`,
        'warning',
        'HIGH'
      );
    }
  }

  private checkExpressionComplexity(filePath: string, func: FunctionMetrics): void {
    if (func.expressionComplexity > 3) {
      this.addIssue(
        filePath,
        func.startLine,
        'typescript:S1067',
        `Function '${func.name}' has expression complexity ${func.expressionComplexity}, which exceeds the maximum of 3`,
        'warning',
        'HIGH'
      );
    }
  }

  private checkIdenticalExpressions(filePath: string, content: string): void {
    const ifPattern = /if[ \t]{0,10}\(([^)]{1,500})\)/g;
    const conditions: string[] = [];
    let match;

    while ((match = ifPattern.exec(content)) !== null) {
      conditions.push(match[1].trim());
    }

    const duplicates = this.findDuplicates(conditions);
    for (const duplicate of duplicates) {
      const lineNumber = this.getLineNumber(content, duplicate);
      this.addIssue(
        filePath,
        lineNumber,
        'typescript:S1871',
        `Identical condition found: ${duplicate}`,
        'error',
        'HIGH'
      );
    }
  }

  private async checkUnusedVariables(): Promise<void> {
    if (this.showOnlyHigh) return; // Skip for HIGH-only mode

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
            this.addIssue(
              result.filePath,
              message.line ?? 1,
              'typescript:S1481',
              message.message,
              'warning',
              'MEDIUM'
            );
          }
        }
      }
    } catch (error) {
      console.error('❌ ESLint execution failed:', error);
    }
  }

  private findDuplicates<T>(array: T[]): T[] {
    const seen = new Set<T>();
    const duplicates = new Set<T>();

    for (const item of array) {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    }

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

  private addIssue(
    file: string,
    line: number,
    sonarRule: string,
    message: string,
    severity: 'error' | 'warning' | 'info',
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
  ): void {
    this.issues.push({
      file,
      line,
      rule: sonarRule.split(':')[1], // Extract rule ID
      sonarRule,
      message,
      severity,
      priority,
    });
  }

  private reportResults(): void {
    console.log(`\n${colors.bold}📊 Enhanced SonarQube Issue Report${colors.reset}`);
    console.log('='.repeat(60));

    if (this.issues.length === 0) {
      console.log(
        `${colors.green}✅ No ${this.showOnlyHigh ? 'HIGH priority ' : ''}issues found!${colors.reset}`
      );
      return;
    }

    const highCount = this.issues.filter(i => i.priority === 'HIGH').length;
    const mediumCount = this.issues.filter(i => i.priority === 'MEDIUM').length;
    const lowCount = this.issues.filter(i => i.priority === 'LOW').length;

    const errorCount = this.issues.filter(i => i.severity === 'error').length;
    const warningCount = this.issues.filter(i => i.severity === 'warning').length;

    console.log(`Found ${this.issues.length} issues:`);
    console.log(`  🔴 Errors: ${errorCount}`);
    console.log(`  🟡 Warnings: ${warningCount}`);
    console.log('');
    console.log('Priority breakdown:');
    console.log(`  🚨 HIGH: ${highCount}`);
    console.log(`  ⚠️  MEDIUM: ${mediumCount}`);
    console.log(`  ℹ️  LOW: ${lowCount}`);
    console.log('');

    // Group and display issues
    const filteredIssues = this.showOnlyHigh
      ? this.issues.filter(i => i.priority === 'HIGH')
      : this.issues;

    const issuesByFile = this.groupIssuesByFile(filteredIssues);

    for (const [file, fileIssues] of Object.entries(issuesByFile)) {
      console.log(`📁 ${path.relative(process.cwd(), file)}`);
      for (const issue of fileIssues) {
        const severityIcon = issue.severity === 'error' ? '🔴' : '🟡';
        const priorityIcon = issue.priority === 'HIGH' ? '🚨' : '⚠️';
        console.log(`  ${severityIcon} ${priorityIcon} Line ${issue.line}: ${issue.message}`);
        console.log(`     Rule: ${issue.sonarRule}`);
      }
      console.log('');
    }

    console.log('💡 Tips:');
    console.log('  • Focus on HIGH priority issues first');
    console.log('  • Use --high flag to see only HIGH priority issues');
    console.log('  • Use --verbose flag to see rule details');

    // Exit with error code if there are HIGH priority errors
    const hasHighPriorityErrors = this.issues.some(
      issue => issue.priority === 'HIGH' && issue.severity === 'error'
    );
    if (hasHighPriorityErrors) {
      process.exit(1);
    }
  }

  private groupIssuesByFile(issues: SonarIssue[]): Record<string, SonarIssue[]> {
    return issues.reduce(
      (acc, issue) => {
        if (!acc[issue.file]) {
          acc[issue.file] = [];
        }
        acc[issue.file].push(issue);
        return acc;
      },
      {} as Record<string, SonarIssue[]>
    );
  }
}

// CLI interface
const args = process.argv.slice(2);
const options = {
  highOnly: args.includes('--high-only') || args.includes('--high'),
  verbose: args.includes('--verbose') || args.includes('-v'),
};

const checker = new SonarChecker(options);
checker.run().catch(error => {
  console.error('❌ Error running SonarQube checker:', error);
  process.exit(1);
});
