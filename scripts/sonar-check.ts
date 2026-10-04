/** Local AST checks for complexity and unsafe execution; not a substitute for server-side Sonar analysis. */
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import ts from "typescript-compiler-api";
export interface QualityIssue {
  file: string;
  line: number;
  rule: string;
  message: string;
}
const functions = (
  node: ts.Node,
): node is
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.ArrowFunction
  | ts.MethodDeclaration =>
  ts.isFunctionDeclaration(node) ||
  ts.isFunctionExpression(node) ||
  ts.isArrowFunction(node) ||
  ts.isMethodDeclaration(node);

export const analyzeSource = (file: string, content: string): QualityIssue[] => {
  const source = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const issues: QualityIssue[] = [];
  const report = (node: ts.Node, rule: string, message: string) =>
    issues.push({
      file,
      line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
      rule,
      message,
    });
  const complexity = (root: ts.Node): number => {
    let count = 1;
    const walk = (node: ts.Node) => {
      if (node !== root && functions(node)) return;
      if (
        ts.isIfStatement(node) ||
        ts.isConditionalExpression(node) ||
        ts.isCaseClause(node) ||
        ts.isForStatement(node) ||
        ts.isForOfStatement(node) ||
        ts.isForInStatement(node) ||
        ts.isWhileStatement(node) ||
        ts.isCatchClause(node)
      )
        count++;
      if (
        ts.isBinaryExpression(node) &&
        [
          ts.SyntaxKind.AmpersandAmpersandToken,
          ts.SyntaxKind.BarBarToken,
          ts.SyntaxKind.QuestionQuestionToken,
        ].includes(node.operatorToken.kind)
      )
        count++;
      ts.forEachChild(node, walk);
    };
    walk(root);
    return count;
  };
  const visit = (node: ts.Node) => {
    if (functions(node)) {
      if (node.parameters.length > 7)
        report(node, "S107", "Use a parameter object above seven arguments");
      if (complexity(node) > 25)
        report(
          node,
          "complexity",
          "Cyclomatic complexity exceeds 25; extract a cohesive operation",
        );
    }
    if (
      ts.isBinaryExpression(node) &&
      [
        ts.SyntaxKind.EqualsEqualsToken,
        ts.SyntaxKind.EqualsEqualsEqualsToken,
        ts.SyntaxKind.ExclamationEqualsToken,
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
      ].includes(node.operatorToken.kind) &&
      node.left.getText(source) === node.right.getText(source)
    )
      report(node, "S1764", "Identical expressions on both sides");
    if (ts.isCallExpression(node)) {
      const name = node.expression.getText(source);
      if (["eval", "Function", "exec", "execSync"].includes(name))
        report(node, "unsafe-execution", "Dynamic evaluation or shell spawning is forbidden");
      if (["spawn", "spawnSync"].includes(name)) {
        const options = node.arguments[2]?.getText(source) ?? "";
        if (
          /shell:\s*true/.test(options) ||
          !/shell:\s*false/.test(options) ||
          !/timeout/.test(options)
        )
          report(node, "process-options", "Process execution requires shell:false and a timeout");
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return issues;
};
const collect = async (directory: string): Promise<string[]> => {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(path)));
    else if (/\.(ts|tsx)$/.test(path) && !/\.(test|spec)\./.test(path) && !path.endsWith(".d.ts"))
      files.push(path);
  }
  return files;
};
export const runQualityChecks = async (): Promise<QualityIssue[]> => {
  const files = [...(await collect("src")), ...(await collect("scripts"))];
  return files.flatMap((file) => analyzeSource(file, readFileSync(file, "utf8")));
};
if (import.meta.url === new URL(process.argv[1], "file:").href) {
  try {
    const issues = await runQualityChecks();
    for (const issue of issues)
      console.error(`${issue.file}:${issue.line} [${issue.rule}] ${issue.message}`);
    console.log(`Local AST checks: ${issues.length} issues`);
    process.exitCode = issues.length ? 1 : 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Quality check failed");
    process.exitCode = 1;
  }
}
