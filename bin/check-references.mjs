#!/usr/bin/env node
// Verifies each skill's SKILL.md and its references/ folder are consistent:
//   - frontmatter has `name` + `description`, and `name` matches the directory
//   - every `references/<file>.md` mentioned in SKILL.md resolves to a real file
//   - every file in references/ is referenced by SKILL.md (no orphans)
//   - references/worked-example.md exists
// Exits non-zero on any failure. No dependencies; run with `node bin/check-references.mjs`.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(repoRoot, 'skills');

const REF_RE = /`references\/([A-Za-z0-9._-]+\.md)`/g;

/** @type {string[]} */
const errors = [];
/** @type {string[]} */
const warnings = [];

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
  const skillMdPath = join(dir, 'SKILL.md');
  const md = readFileSync(skillMdPath, 'utf8');
  const rel = `skills/${skill}`;

  // --- frontmatter ---
  const fm = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) {
    errors.push(`${rel}/SKILL.md: missing YAML frontmatter`);
  } else {
    const body = fm[1];
    const nameMatch = body.match(/^name:\s*(.+)$/m);
    if (!nameMatch) errors.push(`${rel}/SKILL.md: frontmatter has no \`name\``);
    else if (nameMatch[1].trim() !== skill) {
      errors.push(`${rel}/SKILL.md: frontmatter name "${nameMatch[1].trim()}" != directory "${skill}"`);
    }
    if (!/^description:\s*\S/m.test(body) && !/^description:\s*>-?\s*$/m.test(body)) {
      errors.push(`${rel}/SKILL.md: frontmatter has no \`description\``);
    }
  }

  // --- referenced files ---
  const referenced = new Set();
  for (const m of md.matchAll(REF_RE)) referenced.add(m[1]);

  if (referenced.size === 0) {
    warnings.push(`${rel}/SKILL.md: no \`references/*.md\` pointers found — is this skill split?`);
  }

  const refDir = join(dir, 'references');
  const onDisk = existsSync(refDir)
    ? new Set(readdirSync(refDir).filter((f) => f.endsWith('.md')))
    : new Set();

  for (const ref of [...referenced].sort()) {
    if (!onDisk.has(ref)) {
      errors.push(`${rel}/SKILL.md: points to references/${ref} which does not exist`);
    }
  }
  for (const file of [...onDisk].sort()) {
    if (file === 'worked-example.md') continue; // linked from prose, not the Ruleset
    if (!referenced.has(file)) {
      warnings.push(`${rel}/references/${file}: not referenced from SKILL.md (orphan)`);
    }
  }
  if (referenced.size > 0 && !onDisk.has('worked-example.md')) {
    warnings.push(`${rel}/references/worked-example.md: missing`);
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);

console.log(
  `\n${skillNames.length} skills checked — ${errors.length} error(s), ${warnings.length} warning(s)`,
);
process.exit(errors.length > 0 ? 1 : 0);
