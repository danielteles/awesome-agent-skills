#!/usr/bin/env node
// Estimates the token cost of every skill file and flags regressions.
//   - SKILL.md is loaded in full whenever its skill triggers, so it has a tight budget.
//   - references/<topic>.md is pulled in one at a time, on demand, so it has a looser one.
// Token estimate is chars / 4 — approximate, but stable enough to catch a file that balloons.
// Exits non-zero when a file is over its hard cap. No dependencies; run with
// `node bin/check-token-budget.mjs`.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(repoRoot, 'skills');

// [warn, fail] token budgets per file kind. The warn line sits just above today's
// largest file, so it fires on growth (a regression to review), not on the status quo.
const BUDGET = {
  skill: [3800, 4300],
  reference: [1400, 2000],
};

const estimateTokens = (text) => Math.ceil(text.length / 4);

/** @type {string[]} */
const errors = [];
/** @type {string[]} */
const warnings = [];
/** @type {{path: string, tokens: number, kind: 'skill' | 'reference'}[]} */
const rows = [];

const check = (path, kind) => {
  const tokens = estimateTokens(readFileSync(path, 'utf8'));
  const rel = path.slice(repoRoot.length + 1);
  const [warn, fail] = BUDGET[kind];
  rows.push({ path: rel, tokens, kind });
  if (tokens > fail) errors.push(`${rel}: ~${tokens} tokens, over the ${fail} hard cap for a ${kind} file`);
  else if (tokens > warn) warnings.push(`${rel}: ~${tokens} tokens, over the ${warn} soft budget for a ${kind} file`);
};

const skillNames = readdirSync(skillsDir).filter((name) => {
  const p = join(skillsDir, name);
  return statSync(p).isDirectory() && existsSync(join(p, 'SKILL.md'));
});

if (skillNames.length === 0) {
  console.error('no skills found under skills/');
  process.exit(1);
}

for (const skill of skillNames.sort()) {
  const dir = join(skillsDir, skill);
  check(join(dir, 'SKILL.md'), 'skill');

  const refDir = join(dir, 'references');
  if (!existsSync(refDir)) continue;
  for (const file of readdirSync(refDir).filter((f) => f.endsWith('.md')).sort()) {
    check(join(refDir, file), 'reference');
  }
}

const skillRows = rows.filter((r) => r.kind === 'skill').sort((a, b) => b.tokens - a.tokens);
const refRows = rows.filter((r) => r.kind === 'reference').sort((a, b) => b.tokens - a.tokens);

console.log('SKILL.md (loaded in full on every trigger):');
for (const r of skillRows) console.log(`  ~${String(r.tokens).padStart(5)} tok  ${r.path}`);
console.log(`\nreferences/ (top 5 of ${refRows.length}, loaded on demand):`);
for (const r of refRows.slice(0, 5)) console.log(`  ~${String(r.tokens).padStart(5)} tok  ${r.path}`);

for (const w of warnings) console.warn(`\nwarn  ${w}`);
for (const e of errors) console.error(`\nERROR ${e}`);

console.log(
  `\n${rows.length} files checked — ${errors.length} error(s), ${warnings.length} warning(s)`,
);
process.exit(errors.length > 0 ? 1 : 0);
