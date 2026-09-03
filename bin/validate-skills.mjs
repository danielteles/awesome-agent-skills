#!/usr/bin/env node
// Validates every skill under skills/ against the repo contract (see CONTRIBUTING.md).
// Merges the old check-references + check-token-budget scripts and adds the spec rules.
//
// Errors (exit non-zero):
//   - frontmatter: has `name` (matches the directory, lowercase words joined by single
//     hyphens), `description` (<= 1024 chars), `license: CC-BY-4.0`, and `metadata`
//     with `author` and `version`;
//   - SKILL.md body is under 500 lines;
//   - the title is `# <Title> — <Kind>` with Kind one of the four allowed values; the
//     top-level sections are exactly How to Use This Skill / Ruleset / Limits / References, in
//     that order; a `> **Builds on.**` note exists (a base skill's is the exact contract line);
//     the `**Review**` row ends its steps with "Do not invent findings.";
//   - every Ruleset group `### <slug> → references/<file>` names a file called `<slug>.md`;
//   - every `references/<file>.md` pointer in SKILL.md resolves to a real file;
//   - every topic slug listed in the Output Format ("Ruleset topic slug (`a`, `b`, …)")
//     is a real `### <slug> → …` Ruleset group;
//   - every sibling-skill name in the "## References" bullet leads exists as a
//     directory under skills/;
//   - references/worked-example.md exists;
//   - every other references/<topic>.md opens with a `# … why…` heading and the
//     "The rules are in the `<skill>` Ruleset (`<topic>` group)…" line near the top,
//     naming this skill;
//   - a SKILL.md is <= 4300 estimated tokens; a references/*.md is <= 2000.
//
// Warnings (do not fail): a reference file no SKILL.md points to; a SKILL.md with no
// references pointers; a file over its soft token budget.
//
// No dependencies. Run with `node bin/validate-skills.mjs` or `npm test`. `SKILLS_DIR=<dir>`
// points it at another skills root; test/validate-skills.test.mjs uses that.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = process.env.SKILLS_DIR ? resolve(process.env.SKILLS_DIR) : join(repoRoot, 'skills');

const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REF_RE = /`references\/([A-Za-z0-9._-]+\.md)`/g;
const MAX_BODY_LINES = 500;
const MAX_DESCRIPTION = 1024;
const KINDS = ['Base Engineering Skill', 'Framework Skill', 'Review Skill', 'Engineering Skill'];
const SECTIONS = ['How to Use This Skill', 'Ruleset', 'Limits', 'References'];
const BASE_BUILDS_ON = '> **Builds on.** Nothing — this is a base skill.';
const REVIEW_CLOSER = 'Do not invent findings.';
// [warn, fail] token budgets. SKILL.md loads in full on every trigger; a reference
// loads one at a time, on demand.
const BUDGET = { skill: [3800, 4300], reference: [1400, 2000] };
const estimateTokens = (text) => Math.ceil(text.length / 4);

/** @type {string[]} */
const errors = [];
/** @type {string[]} */
const warnings = [];
/** @type {{path: string, tokens: number, kind: 'skill' | 'reference'}[]} */
const rows = [];

const budget = (path, kind) => {
  const rel = relative(dirname(skillsDir), path);
  const tokens = estimateTokens(readFileSync(path, 'utf8'));
  const [warn, fail] = BUDGET[kind];
  rows.push({ path: rel, tokens, kind });
  if (tokens > fail) errors.push(`${rel}: ~${tokens} tokens, over the ${fail} hard cap for a ${kind} file`);
  else if (tokens > warn) warnings.push(`${rel}: ~${tokens} tokens, over the ${warn} soft budget for a ${kind} file`);
};

/** Pull the (possibly folded) `description:` value out of a frontmatter block. */
const extractDescription = (fm) => {
  const lines = fm.split('\n');
  const i = lines.findIndex((l) => /^description:/.test(l));
  if (i === -1) return null;
  const parts = [];
  const inline = lines[i].replace(/^description:\s*/, '').trim();
  if (inline && !/^[>|][+-]?$/.test(inline)) parts.push(inline);
  for (let j = i + 1; j < lines.length; j++) {
    if (/^\S/.test(lines[j])) break; // next top-level key
    parts.push(lines[j].trim());
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
};

const skillNames = readdirSync(skillsDir).filter((name) => {
  const p = join(skillsDir, name);
  return statSync(p).isDirectory() && existsSync(join(p, 'SKILL.md'));
});
const skillSet = new Set(skillNames);

if (skillNames.length === 0) {
  console.error('no skills found under skills/');
  process.exit(1);
}

for (const skill of [...skillSet].sort()) {
  const dir = join(skillsDir, skill);
  const rel = `skills/${skill}`;
  const md = readFileSync(join(dir, 'SKILL.md'), 'utf8');

  // --- frontmatter ---
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) {
    errors.push(`${rel}/SKILL.md: missing YAML frontmatter`);
  } else {
    const fm = fmMatch[1];

    const nameMatch = fm.match(/^name:\s*(.+)$/m);
    if (!nameMatch) {
      errors.push(`${rel}/SKILL.md: frontmatter has no \`name\``);
    } else {
      const name = nameMatch[1].trim();
      if (name !== skill) errors.push(`${rel}/SKILL.md: frontmatter name "${name}" != directory "${skill}"`);
      if (!NAME_RE.test(name)) {
        errors.push(`${rel}/SKILL.md: name "${name}" must be lowercase alphanumerics joined by single hyphens (no leading, trailing, or consecutive hyphens)`);
      }
    }

    const description = extractDescription(fm);
    if (!description) {
      errors.push(`${rel}/SKILL.md: frontmatter has no \`description\``);
    } else if (description.length > MAX_DESCRIPTION) {
      errors.push(`${rel}/SKILL.md: description is ${description.length} chars, over the ${MAX_DESCRIPTION} limit`);
    }

    if (!/^license:\s*CC-BY-4\.0\s*$/m.test(fm)) {
      errors.push(`${rel}/SKILL.md: frontmatter needs \`license: CC-BY-4.0\``);
    }
    if (!/^metadata:\s*$/m.test(fm) || !/^\s+author:\s*\S/m.test(fm) || !/^\s+version:\s*\S/m.test(fm)) {
      errors.push(`${rel}/SKILL.md: frontmatter needs \`metadata\` with \`author\` and \`version\``);
    }
  }

  // --- body ---
  const body = fmMatch ? md.slice(fmMatch[0].length) : md;
  const lineCount = md.split('\n').length;
  if (lineCount >= MAX_BODY_LINES) {
    errors.push(`${rel}/SKILL.md: ${lineCount} lines, must be under ${MAX_BODY_LINES}`);
  }

  // Title: `# <Title> — <Kind>`, Kind from the allowed list.
  const title = body.match(/^#\s+(.+)$/m);
  if (!title) {
    errors.push(`${rel}/SKILL.md: no \`# <Title> — <Kind>\` heading`);
  } else {
    const kind = title[1].split(' — ').pop().trim();
    if (!KINDS.includes(kind)) errors.push(`${rel}/SKILL.md: title Kind "${kind}" is not one of: ${KINDS.join(' / ')}`);
  }

  // Top-level sections: exactly the four, in order.
  const sections = [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1]);
  if (sections.join('|') !== SECTIONS.join('|')) {
    errors.push(`${rel}/SKILL.md: top-level sections are [${sections.join(', ')}]; must be exactly [${SECTIONS.join(', ')}]`);
  }

  // Builds-on note: present; a base skill's is the exact contract line.
  const buildsOn = body.match(/^>\s+\*\*Builds on\.\*\*.*$/m);
  if (!buildsOn) {
    errors.push(`${rel}/SKILL.md: missing the \`> **Builds on.**\` note`);
  } else if (/\bNothing\b/.test(buildsOn[0]) && buildsOn[0].trim() !== BASE_BUILDS_ON) {
    errors.push(`${rel}/SKILL.md: a base skill's Builds-on note must be exactly "${BASE_BUILDS_ON}"`);
  }

  // Review row: present, and its steps end with the standard closing sentence.
  const reviewRow = body.match(/^\|\s*\*\*Review\*\*.*$/m);
  if (!reviewRow) {
    errors.push(`${rel}/SKILL.md: How to Use This Skill has no \`**Review**\` row`);
  } else if (!reviewRow[0].includes(REVIEW_CLOSER)) {
    errors.push(`${rel}/SKILL.md: the Review row must end its steps with "${REVIEW_CLOSER}"`);
  }

  // Ruleset topic slugs: `### <slug> → \`references/<file>.md\`` — the file is named for the slug.
  const groupSlugs = new Set();
  for (const m of body.matchAll(/^###\s+([a-z0-9-]+)\s+→\s+`references\/([^`]+)`/gm)) {
    groupSlugs.add(m[1]);
    if (m[2] !== `${m[1]}.md`) {
      errors.push(`${rel}/SKILL.md: group \`${m[1]}\` points at references/${m[2]}; the file must be named references/${m[1]}.md`);
    }
  }

  // Output Format enumeration: "Ruleset topic slug (`a`, `b`, `c`, …)"
  const enumMatch = body.match(/Ruleset topic slug\s*\(([^)]*)\)/);
  if (enumMatch) {
    for (const m of enumMatch[1].matchAll(/`([a-z0-9-]+)`/g)) {
      if (!groupSlugs.has(m[1])) {
        errors.push(`${rel}/SKILL.md: Output Format names topic \`${m[1]}\`, which is not a Ruleset group`);
      }
    }
  }

  // Sibling skill names: the "## References" bullet leads are the authoritative
  // list. (The Builds-on note is prose and may backtick non-skill tokens.)
  const siblingCites = new Set();
  const refsSection = body.match(/^##\s+References\b[\s\S]*$/m);
  if (refsSection) for (const m of refsSection[0].matchAll(/^-\s+\*\*`([a-z0-9-]+)`\*\*/gm)) siblingCites.add(m[1]);
  for (const cite of [...siblingCites].sort()) {
    if (cite !== skill && !skillSet.has(cite)) {
      errors.push(`${rel}/SKILL.md: References names sibling skill \`${cite}\`, which does not exist under skills/`);
    }
  }

  // --- referenced files ---
  const referenced = new Set();
  for (const m of md.matchAll(REF_RE)) referenced.add(m[1]);
  if (referenced.size === 0) {
    warnings.push(`${rel}/SKILL.md: no \`references/*.md\` pointers found`);
  }

  const refDir = join(dir, 'references');
  const onDisk = existsSync(refDir)
    ? new Set(readdirSync(refDir).filter((f) => f.endsWith('.md')))
    : new Set();

  for (const ref of [...referenced].sort()) {
    if (!onDisk.has(ref)) errors.push(`${rel}/SKILL.md: points to references/${ref}, which does not exist`);
  }
  for (const file of [...onDisk].sort()) {
    if (file === 'worked-example.md') continue; // linked from prose, not the Ruleset
    if (!referenced.has(file)) warnings.push(`${rel}/references/${file}: not referenced from SKILL.md (orphan)`);
  }

  if (!onDisk.has('worked-example.md')) {
    errors.push(`${rel}/references/worked-example.md: missing`);
  }

  // --- reference file shape + token budget ---
  budget(join(dir, 'SKILL.md'), 'skill');
  for (const file of [...onDisk].sort()) {
    const path = join(refDir, file);
    budget(path, 'reference');
    if (file === 'worked-example.md') continue;

    const text = readFileSync(path, 'utf8');
    const firstHeading = text.match(/^#\s+.+$/m);
    if (!firstHeading || !/\bwhy\b/.test(firstHeading[0])) {
      errors.push(`${rel}/references/${file}: first heading must be \`# <Group> — why…\``);
    }
    const head = text.split('\n').slice(0, 12).join('\n');
    const marker = head.match(/The rules are in the `([^`]+)` Ruleset \(`[^`]+` group\)/);
    if (!marker) {
      errors.push(`${rel}/references/${file}: missing the "The rules are in the \`<skill>\` Ruleset (\`<topic>\` group)…" line near the top`);
    } else if (marker[1] !== skill) {
      errors.push(`${rel}/references/${file}: header says the \`${marker[1]}\` Ruleset, but this reference belongs to \`${skill}\``);
    }
  }
}

// --- report ---
const skillRows = rows.filter((r) => r.kind === 'skill').sort((a, b) => b.tokens - a.tokens);
const refRows = rows.filter((r) => r.kind === 'reference').sort((a, b) => b.tokens - a.tokens);

console.log('SKILL.md (loaded in full on every trigger):');
for (const r of skillRows) console.log(`  ~${String(r.tokens).padStart(5)} tok  ${r.path}`);
console.log(`\nreferences/ (top 5 of ${refRows.length}, loaded on demand):`);
for (const r of refRows.slice(0, 5)) console.log(`  ~${String(r.tokens).padStart(5)} tok  ${r.path}`);

for (const w of warnings) console.warn(`\nwarn  ${w}`);
for (const e of errors) console.error(`\nERROR ${e}`);

console.log(
  `\n${skillNames.length} skills checked — ${errors.length} error(s), ${warnings.length} warning(s)`,
);
process.exit(errors.length > 0 ? 1 : 0);
