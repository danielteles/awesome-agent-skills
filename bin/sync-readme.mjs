#!/usr/bin/env node
// Regenerates the two marked regions of README.md from the skill files:
//   <!-- sync-readme:skills -->     … the Skills table (one row per skills/<name>/SKILL.md)
//   <!-- sync-readme:structure -->  … the Project structure tree
//
// Default: rewrite README.md in place. `--check`: exit 1 if README.md is stale
// (used by `npm test`). No dependencies. Run with `node bin/sync-readme.mjs`.

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const readmePath = join(repoRoot, 'README.md');
const skillsDir = join(repoRoot, 'skills');

// Display order for the skills; any skill not listed here is appended, sorted by name.
const ORDER = [
  'core-typescript',
  'architecture-and-design',
  'component-api-design',
  'react',
  'angular',
  'vue',
  'accessibility',
  'styling-and-design-tokens',
  'web-performance',
  'i18n-and-localization',
  'test-quality',
  'e2e-testing',
  'frontend-code-review',
];

// The non-skills part of the tree. Kept here (not enumerated) so unrelated repo
// files do not leak into the structure block; update alongside a matching change.
const TREE_TAIL = [
  '├── CHANGELOG.md',
  '├── CONTRIBUTING.md',
  '├── LICENSE',
  '└── README.md',
];

const listSkills = () =>
  readdirSync(skillsDir)
    .filter((name) => {
      const p = join(skillsDir, name);
      return statSync(p).isDirectory() && existsSync(join(p, 'SKILL.md'));
    })
    .sort((a, b) => {
      const ia = ORDER.indexOf(a);
      const ib = ORDER.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });

/** Pull the (possibly folded) `description:` value out of a frontmatter block. */
const extractDescription = (fm) => {
  const lines = fm.split('\n');
  const i = lines.findIndex((l) => /^description:/.test(l));
  if (i === -1) return '';
  const parts = [];
  const inline = lines[i].replace(/^description:\s*/, '').trim();
  if (inline && !/^[>|][+-]?$/.test(inline)) parts.push(inline);
  for (let j = i + 1; j < lines.length; j++) {
    if (/^\S/.test(lines[j])) break;
    parts.push(lines[j].trim());
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
};

/** The "what it covers" cell: the description with its trailing "when to use" tail removed. */
const coverage = (description) => {
  let text = description;
  for (const marker of [' Use it when', ' Builds on ']) {
    const idx = text.indexOf(marker);
    if (idx !== -1) text = text.slice(0, idx);
  }
  text = text.replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|');
  if (text && !/[.!?]$/.test(text)) text += '.';
  return text;
};

const skills = listSkills().map((name) => {
  const fm = readFileSync(join(skillsDir, name, 'SKILL.md'), 'utf8').match(/^---\n([\s\S]*?)\n---\n/);
  return { name, coverage: coverage(fm ? extractDescription(fm[1]) : '') };
});

// --- skills table ---
const skillsBlock = [
  '| Skill | What it covers |',
  '| --- | --- |',
  ...skills.map(
    (s) => `| [\`skills/${s.name}/SKILL.md\`](skills/${s.name}/SKILL.md) | ${s.coverage} |`,
  ),
].join('\n');

// --- project structure tree ---
const treeLines = ['```', 'awesome-agent-skills/', '├── skills/'];
skills.forEach((s, i) => {
  const last = i === skills.length - 1;
  const branch = last ? '└──' : '├──';
  const cont = last ? '    ' : '│   ';
  treeLines.push(`│   ${branch} ${s.name}/`);
  treeLines.push(`│   ${cont}├── SKILL.md`);
  treeLines.push(`│   ${cont}└── references/`);
});
treeLines.push('├── templates/');
for (const f of readdirSync(join(repoRoot, 'templates')).filter((f) => f.endsWith('.md')).sort()) {
  const last = f === 'worked-example.md';
  treeLines.push(`│   ${last ? '└──' : '├──'} ${f}`);
}
treeLines.push('├── bin/');
const binFiles = readdirSync(join(repoRoot, 'bin')).filter((f) => f.endsWith('.mjs')).sort();
binFiles.forEach((f, i) => {
  treeLines.push(`│   ${i === binFiles.length - 1 ? '└──' : '├──'} ${f}`);
});
treeLines.push(...TREE_TAIL, '```');
const structureBlock = treeLines.join('\n');

// --- splice into README ---
const splice = (text, key, block) => {
  const re = new RegExp(`(<!-- sync-readme:${key}[^>]*-->\\n)[\\s\\S]*?(\\n<!-- /sync-readme:${key} -->)`);
  if (!re.test(text)) {
    console.error(`README.md: missing <!-- sync-readme:${key} --> … <!-- /sync-readme:${key} --> markers`);
    process.exit(1);
  }
  return text.replace(re, `$1${block}$2`);
};

const current = readFileSync(readmePath, 'utf8');
let next = current;
next = splice(next, 'skills', skillsBlock);
next = splice(next, 'structure', structureBlock);

const check = process.argv.includes('--check');
if (next === current) {
  console.log('README.md is in sync.');
  process.exit(0);
}
if (check) {
  console.error('README.md is stale — run `node bin/sync-readme.mjs` and commit.');
  process.exit(1);
}
writeFileSync(readmePath, next);
console.log('README.md updated.');
