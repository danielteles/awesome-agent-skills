#!/usr/bin/env node
// Bump a skill's metadata.version in its SKILL.md frontmatter.
//
//   node bin/bump-version.mjs <skill> <version>
//
// <version> is a dotted number (1.0, 1.2, 2.0.1). It is written quoted, as
// `version: "<version>"`, and nothing else in the file changes. Exit 0 on
// success, 1 on a malformed frontmatter, 2 on bad arguments.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [skill, version] = process.argv.slice(2);

if (!skill || !version) {
  console.error('usage: node bin/bump-version.mjs <skill> <version>');
  process.exit(2);
}
if (!/^\d+\.\d+(\.\d+)?$/.test(version)) {
  console.error(`bump-version: "${version}" is not a version like 1.0, 1.2, or 2.0.1`);
  process.exit(2);
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(repoRoot, 'skills', skill, 'SKILL.md');

if (!existsSync(path)) {
  console.error(`bump-version: no skill at skills/${skill}/SKILL.md`);
  process.exit(2);
}

const md = readFileSync(path, 'utf8');
const fm = md.match(/^---\n([\s\S]*?)\n---\n/);
if (!fm) {
  console.error(`bump-version: skills/${skill}/SKILL.md has no YAML frontmatter`);
  process.exit(1);
}

const VERSION_LINE = /^(\s*version:\s*)"?[^"\n]*"?(\s*)$/m;
const current = fm[1].match(/^\s*version:\s*"?([^"\n]+?)"?\s*$/m)?.[1]?.trim();
if (current === undefined) {
  console.error(`bump-version: skills/${skill}/SKILL.md frontmatter has no metadata.version`);
  process.exit(1);
}

const nextBody = fm[1].replace(VERSION_LINE, `$1"${version}"$2`);
const next = md.slice(0, fm.index) + '---\n' + nextBody + '\n---\n' + md.slice(fm.index + fm[0].length);
writeFileSync(path, next);

console.log(`${skill}: version ${current} -> ${version}`);
console.log('Add a line under "## [Unreleased]" in CHANGELOG.md describing the change.');
