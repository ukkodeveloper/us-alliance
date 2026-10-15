import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';

const DIRECTIVE = /@ts-expect-error|eslint-disable|prettier-ignore|@vite-ignore|^\/\/\/\s*<reference|webpackChunkName|@jsxImportSource|^#!/;

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const file = input?.tool_input?.file_path;
if (!file || !existsSync(file)) process.exit(0);
if (!/\/assignments\/[^/]+\/repo\//.test(file) || file.includes('/node_modules/')) process.exit(0);
if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file)) process.exit(0);

const assignmentDir = file.match(/^(.*\/assignments\/[^/]+)\/repo\//)?.[1];
if (assignmentDir != null && existsSync(join(assignmentDir, 'notes', 'allow-comments'))) process.exit(0);

const git = (...args) => execFileSync('git', args, { cwd: dirname(file), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

let repoRoot;
try {
  repoRoot = git('rev-parse', '--show-toplevel');
} catch {
  process.exit(0);
}

const ts = loadTypeScript(repoRoot);
if (!ts) process.exit(0);

const text = readFileSync(file, 'utf8');
const addedLines = getAddedLines();
const comments = collectComments();

const hits = comments
  .filter(c => !DIRECTIVE.test(c.text))
  .filter(c => addedLines == null || addedLines.has(c.line))
  .map(c => `${c.line}: ${c.text.split('\n')[0].slice(0, 100)}`);

if (hits.length > 0) {
  console.error(`주석 금지 규칙 위반 (${relative(repoRoot, file)}). 이번에 추가한 줄만 검사했습니다. 이름으로 표현하고, '왜'는 notes/decisions.md로 옮기세요:`);
  console.error(hits.slice(0, 10).join('\n'));
  process.exit(2);
}

function loadTypeScript(root) {
  const candidates = [join(root, 'package.json'), new URL('../../tools/e2e/package.json', import.meta.url).pathname];
  for (const candidate of candidates) {
    try {
      return createRequire(candidate)('typescript');
    } catch {}
  }
  return null;
}

function getAddedLines() {
  try {
    const tracked = git('ls-files', '--error-unmatch', file);
    if (!tracked) return null;
  } catch {
    return null;
  }
  const diff = git('diff', '-U0', 'HEAD', '--', file);
  const lines = new Set();
  for (const match of diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)) {
    const start = Number(match[1]);
    const count = match[2] == null ? 1 : Number(match[2]);
    for (let i = 0; i < count; i++) lines.add(start + i);
  }
  return lines;
}

function collectComments() {
  const kind = file.endsWith('x') ? ts.ScriptKind.TSX : file.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const seen = new Map();
  const add = ranges => {
    for (const range of ranges ?? []) {
      if (seen.has(range.pos)) continue;
      seen.set(range.pos, {
        line: source.getLineAndCharacterOfPosition(range.pos).line + 1,
        text: text.slice(range.pos, range.end),
      });
    }
  };
  const visit = node => {
    if (node.kind !== ts.SyntaxKind.JsxText) {
      add(ts.getLeadingCommentRanges(text, node.pos));
      add(ts.getTrailingCommentRanges(text, node.end));
    }
    for (const child of node.getChildren(source)) visit(child);
  };
  visit(source);
  return [...seen.values()];
}
