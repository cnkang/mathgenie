#!/usr/bin/env tsx
/// <reference types="node" />

import { readFileSync, writeFileSync } from "node:fs";
import { createScanner, SyntaxKind, LanguageVariant } from "typescript/unstable/ast";

export type DuplicateString = {
  text: string;
  count: number;
  line: number;
  preview: string;
  occurrences: Array<{ start: number; end: number; wrapWithBraces: boolean }>;
};

export type FindOptions = {
  minLength: number;
  minCount: number;
};

const DEFAULT_OPTIONS: FindOptions = { minLength: 6, minCount: 3 } as const;
const EXCLUDED_STRINGS = new Set<string>(["undefined"]);

function computeLineOfPos(source: string, pos: number): number {
  return source.slice(0, pos).split("\n").length;
}

function makeConstName(base: string, used: Set<string>): string {
  const cleaned = base
    .trim()
    .slice(0, 80)
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
  let candidate = `STR_${cleaned}`;
  if (!/^STR_[A-Z][A-Z0-9_]*$/.test(candidate)) {
    candidate = `STR_${cleaned.replace(/[^A-Z0-9_]/g, "") || "VAL"}`;
  }
  if (!candidate.startsWith('STR_')) {
    candidate = `STR_${candidate}`;
  }
  let name = candidate;
  let i = 2;
  while (used.has(name)) {
    name = `${candidate}_${i++}`;
  }
  used.add(name);
  return name;
}

export function findDuplicateStringsInSource(
  source: string,
  filePath = "inline.tsx",
  options: FindOptions = DEFAULT_OPTIONS,
): { duplicates: DuplicateString[] } {
  let autoStartPos = -1;
  let autoEndPos = -1;
  {
    const startMarker = "// AUTO-GENERATED: duplicate strings extracted by sonar-check --fix";
    const lines = source.split(/\r?\n/);
    const startIdx = lines.findIndex((l) => l.includes(startMarker));
    if (startIdx !== -1) {
      let pos = 0;
      for (let i = 0; i < startIdx; i++) pos += lines[i].length + 1;
      autoStartPos = pos;
      let endLine = startIdx + 1;
      while (endLine < lines.length && /^const\s+STR_[A-Z\d_]+\s*=/.test(lines[endLine].trim())) {
        endLine++;
      }
      for (let i = startIdx; i < endLine; i++) pos += lines[i].length + 1;
      autoEndPos = pos;
    }
  }

  const languageVariant = filePath.endsWith(".tsx") ? LanguageVariant.JSX : LanguageVariant.Standard;
  const scanner = createScanner(true, languageVariant, source);

  const strings: Array<{
    text: string;
    start: number;
    end: number;
    line: number;
  }> = [];

  let inImport = false;
  let inExport = false;
  let prevTokenKind = SyntaxKind.Unknown;

  let tokenKind = scanner.scan();
  while (tokenKind !== SyntaxKind.EndOfFile) {
    const tokenValue = scanner.getTokenValue();
    const tokenStart = scanner.getTokenStart();
    const tokenEnd = scanner.getTokenEnd();

    if (tokenKind === SyntaxKind.ImportKeyword) {
      inImport = true;
    } else if (tokenKind === SyntaxKind.ExportKeyword) {
      inExport = true;
    } else if (tokenKind === SyntaxKind.SemicolonToken) {
      inImport = false;
      inExport = false;
    }

    if (tokenKind === SyntaxKind.StringLiteral || tokenKind === SyntaxKind.NoSubstitutionTemplateLiteral) {
      if (
        autoStartPos !== -1 &&
        autoEndPos !== -1 &&
        tokenStart >= autoStartPos &&
        tokenStart < autoEndPos
      ) {
        prevTokenKind = tokenKind;
        tokenKind = scanner.scan();
        continue;
      }

      const isModuleSpecifier =
        (inImport || inExport) && prevTokenKind === SyntaxKind.FromKeyword;
      const isSideEffectImport = prevTokenKind === SyntaxKind.ImportKeyword;

      if (!isModuleSpecifier && !isSideEffectImport) {
        const text = tokenValue;
        if (text.length >= options.minLength && !EXCLUDED_STRINGS.has(text)) {
          const line = computeLineOfPos(source, tokenStart);
          strings.push({ text, start: tokenStart, end: tokenEnd, line });
        }
      }
    }

    prevTokenKind = tokenKind;
    tokenKind = scanner.scan();
  }

  const counts = new Map<string, DuplicateString>();
  for (const s of strings) {
    const item = counts.get(s.text);
    if (item) {
      item.count += 1;
      item.occurrences.push({ start: s.start, end: s.end, wrapWithBraces: false });
    } else {
      counts.set(s.text, {
        text: s.text,
        count: 1,
        line: s.line,
        preview: `'${s.text}'`,
        occurrences: [{ start: s.start, end: s.end, wrapWithBraces: false }],
      });
    }
  }

  const duplicates = Array.from(counts.values()).filter((d) => d.count >= options.minCount);
  return { duplicates };
}

function removeExistingAutoBlock(source: string): string {
  const startMarker = "// AUTO-GENERATED: duplicate strings extracted by sonar-check --fix";
  const lines = source.split(/\r?\n/);
  const startIdx = lines.findIndex((l) => l.includes(startMarker));
  if (startIdx === -1) return source;
  let endIdx = startIdx + 1;
  while (endIdx < lines.length && /^const\s+STR_[A-Z\d_]+\s*=/.test(lines[endIdx].trim())) {
    endIdx++;
  }
  const kept = lines.slice(0, startIdx);
  if (kept.length > 0 && kept[kept.length - 1].trim() === "") {
    kept.pop();
  }
  kept.push(...lines.slice(endIdx));
  return kept.join("\n");
}

function findInsertPosAfterImports(source: string): number {
  const scanner = createScanner(true, LanguageVariant.Standard, source);
  let insertPos = 0;
  let tokenKind = scanner.scan();

  while (tokenKind !== SyntaxKind.EndOfFile) {
    if (tokenKind === SyntaxKind.ImportKeyword) {
      do {
        tokenKind = scanner.scan();
      } while (tokenKind !== SyntaxKind.EndOfFile && tokenKind !== SyntaxKind.SemicolonToken);

      if (tokenKind === SyntaxKind.SemicolonToken) {
        insertPos = scanner.getTokenEnd();
        tokenKind = scanner.scan();
        continue;
      }
      break;
    }

    break;
  }

  return insertPos;
}

export function applyDuplicateStringFixesToContent(
  filePath: string,
  source: string,
  options: FindOptions = DEFAULT_OPTIONS,
): { updated: string; replacedCount: number; constsAdded: number; constNames: string[] } {
  let updated = removeExistingAutoBlock(source);
  const { duplicates } = findDuplicateStringsInSource(updated, filePath, options);
  if (duplicates.length === 0) {
    return { updated, replacedCount: 0, constsAdded: 0, constNames: [] };
  }
  const usedNames = new Set<string>();

  type Replacement = { start: number; end: number; name: string; wrapWithBraces: boolean };
  const replacements: Replacement[] = [];
  const constDecls: string[] = [];
  const constNames: string[] = [];

  for (const d of duplicates) {
    const name = makeConstName(d.text, usedNames);
    constNames.push(name);
    constDecls.push(`const ${name} = ${JSON.stringify(d.text)} as const;`);
    for (const occ of d.occurrences) {
      replacements.push({ start: occ.start, end: occ.end, name, wrapWithBraces: occ.wrapWithBraces });
    }
  }

  replacements.sort((a, b) => b.start - a.start);

  for (const r of replacements) {
    const replacementText = r.wrapWithBraces ? `{${r.name}}` : r.name;
    updated = updated.slice(0, r.start) + replacementText + updated.slice(r.end);
  }

  const insertPos = findInsertPosAfterImports(updated);
  const header =
    "\n\n// AUTO-GENERATED: duplicate strings extracted by sonar-check --fix\n// Do not edit manually.\n";
  const constBlock = constDecls.join("\n") + "\n";
  const before = updated.slice(0, insertPos);
  const after = updated.slice(insertPos);
  updated = before + header + constBlock + after;

  if (filePath.endsWith(".tsx")) {
    const jsxAttrBareIdInTag =
      /(<[^>]{0,200}\b)([A-Za-z_:][A-Za-z\d_:.-]{0,50}[ \t]{0,10}=)[ \t]{0,10}(STR_[A-Z\d_]{1,100})(?![A-Za-z\d_])/g;
    updated = updated.replaceAll(
      jsxAttrBareIdInTag,
      (_m: string, p0: string, p1: string, p2: string) => `${p0}${p1}{${p2}}`,
    );
    const domClassNameBrace = /(\.className[ \t]{0,10}=)[ \t]{0,10}{(STR_[A-Z0-9_]{1,100})}/g;
    updated = updated.replaceAll(domClassNameBrace, (_m: string, p1: string, p2: string) => `${p1} ${p2}`);
  }

  let replacedCount = 0;
  for (const d of duplicates) {
    replacedCount += d.occurrences.length;
  }

  return { updated, replacedCount, constsAdded: constDecls.length, constNames };
}

export function applyDuplicateStringFixesToFile(
  filePath: string,
  options: FindOptions = DEFAULT_OPTIONS,
): { changed: boolean; replacedCount: number; constsAdded: number } {
  const source = readFileSync(filePath, "utf8");
  if (!source.includes("// AUTO-GENERATED:")) {
    const { duplicates } = findDuplicateStringsInSource(source, filePath, options);
    if (duplicates.length === 0) {
      return { changed: false, replacedCount: 0, constsAdded: 0 };
    }
  }
  const res = applyDuplicateStringFixesToContent(filePath, source, options);
  if (res.replacedCount > 0) {
    writeFileSync(filePath, res.updated, "utf8");
    return { changed: true, replacedCount: res.replacedCount, constsAdded: res.constsAdded };
  }
  if (filePath.endsWith(".tsx")) {
    const jsxAttrBareIdInTag =
      /(<[^>]{0,200}\b)([A-Za-z_:][A-Za-z\d_:.-]{0,50}[ \t]{0,10}=)[ \t]{0,10}(STR_[A-Z\d_]{1,100})(?![A-Za-z\d_])/g;
    const patched = source.replaceAll(jsxAttrBareIdInTag, "$1$2{$3}");
    const domClassNameBrace = /(\.className[ \t]{0,10}=)[ \t]{0,10}{(STR_[A-Z0-9_]{1,100})}/g;
    const final = patched.replaceAll(domClassNameBrace, "$1 $2");
    if (final !== source) {
      writeFileSync(filePath, final, "utf8");
      return { changed: true, replacedCount: 0, constsAdded: 0 };
    }
  }
  return { changed: false, replacedCount: 0, constsAdded: 0 };
}
