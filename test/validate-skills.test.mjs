// Tests for bin/validate-skills.mjs. Each test builds a throwaway skills root,
// runs the validator against it with SKILLS_DIR, and asserts on the exit code
// and the message it prints. No dependencies: `node --test test/*.test.mjs`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const validator = join(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'validate-skills.mjs');

const skillMd = ({
  name,
  description = 'Does a thing. Use it when the user says "thing".',
  license = 'license: CC-BY-4.0',
  metadata = 'metadata:\n  author: tester\n  version: "1.0"',
  topics = ['alpha'],
  outputTopics = topics,
  siblings = [],
  extraBody = '',
  kind = 'Engineering Skill',
  buildsOn = 'Nothing — this is a base skill.',
  reviewRow = '| **Review** — check a diff | 1. Run the Ruleset. 2. If nothing fails, say so in one line. Do not invent findings. |',
  rulesetBlock,
  extraSection = '',
}) => `---
name: ${name}
description: >-
  ${description}
${license}
${metadata}
---

# ${name} — ${kind}

Intro.

> **Builds on.** ${buildsOn}

## How to Use This Skill

| Mode | Steps |
|---|---|
${reviewRow}

### Output Format

- \`<topic>\` is a Ruleset topic slug (${outputTopics.map((t) => `\`${t}\``).join(', ')}).

## Ruleset

${rulesetBlock ?? topics.map((t) => `### ${t} → \`references/${t}.md\`\n\n- [ ] A rule.`).join('\n\n')}

## Limits

- Nothing.
${extraSection}
## References

${siblings.map((s) => `- **\`${s}\`** — a sibling.`).join('\n')}
${extraBody}
`;

const refMd = (skill, topic, { pad = '' } = {}) => `# ${topic} — why

The rules are in the \`${skill}\` Ruleset (\`${topic}\` group). This file is the reasoning.

\`\`\`ts
// ❌ bad
// ✅ good
\`\`\`
${pad}
`;

/** Write skills/<dirName>/ into root with a valid shape unless overridden. */
function writeSkill(root, dirName, { frontmatter = {}, refs, workedExample = true } = {}) {
  const dir = join(root, dirName);
  mkdirSync(join(dir, 'references'), { recursive: true });
  const opts = { name: dirName, ...frontmatter };
  writeFileSync(join(dir, 'SKILL.md'), skillMd(opts));
  const topics = opts.topics ?? ['alpha'];
  const refFiles = refs ?? Object.fromEntries(topics.map((t) => [t, refMd(opts.name, t)]));
  for (const [t, text] of Object.entries(refFiles)) writeFileSync(join(dir, 'references', `${t}.md`), text);
  if (workedExample) writeFileSync(join(dir, 'references', 'worked-example.md'), '# Worked example\n');
  return dir;
}

function run(root) {
  const r = spawnSync(process.execPath, [validator], {
    env: { ...process.env, SKILLS_DIR: root },
    encoding: 'utf8',
  });
  return { status: r.status, out: r.stdout + r.stderr };
}

/** A fresh skills root per test, removed afterwards. */
function root(t) {
  const dir = mkdtempSync(join(tmpdir(), 'skills-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('a minimal valid skill passes', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill');
  const { status, out } = run(r);
  assert.equal(status, 0, out);
  assert.match(out, /1 skills checked — 0 error\(s\), 0 warning\(s\)/);
});

test('fails when the frontmatter name differs from the directory', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { name: 'other-name' } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /frontmatter name "other-name" != directory "good-skill"/);
});

test('fails on consecutive hyphens in the name', (t) => {
  const r = root(t);
  writeSkill(r, 'bad--name');
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /single hyphens/);
});

test('fails when the description exceeds 1024 characters', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { description: 'x'.repeat(1100) } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /description is 1100 chars, over the 1024 limit/);
});

test('fails without the license field', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { license: '' } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /needs `license: CC-BY-4\.0`/);
});

test('fails when metadata lacks a version', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { metadata: 'metadata:\n  author: tester' } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /needs `metadata` with `author` and `version`/);
});

test('fails when SKILL.md reaches 500 lines', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { extraBody: '\n'.repeat(500) } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /lines, must be under 500/);
});

test('fails when the title Kind is not an allowed value', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { kind: 'Frontend Engineering Skill' } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /title Kind "Frontend Engineering Skill" is not one of/);
});

test('fails on an extra top-level section', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { extraSection: '\n## The targets\n\n- A table.\n' } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /top-level sections are \[How to Use This Skill, Ruleset, Limits, The targets, References\]/);
});

test('fails when a base skill\'s Builds-on note is not the exact contract line', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { buildsOn: 'Nothing — this is the base skill.' } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /Builds-on note must be exactly/);
});

test('passes when a non-base Builds-on note names siblings', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { buildsOn: '`other-skill` (the base). If it is not loaded, do not block.' } });
  const { status, out } = run(r);
  assert.equal(status, 0, out);
});

test('fails when the Review row lacks the closing sentence', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { reviewRow: '| **Review** — check a diff | 1. Run the Ruleset. |' } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /Review row must end its steps with "Do not invent findings\."/);
});

test('fails when a Ruleset group points at a file not named for its slug', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', {
    frontmatter: { rulesetBlock: '### alpha → `references/performance.md`\n\n- [ ] A rule.' },
    refs: { alpha: refMd('good-skill', 'alpha'), performance: refMd('good-skill', 'alpha') },
  });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /group `alpha` points at references\/performance\.md; the file must be named references\/alpha\.md/);
});

test('fails when a Ruleset group points at a reference that does not exist', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', {
    frontmatter: { topics: ['alpha', 'beta'] },
    refs: { alpha: refMd('good-skill', 'alpha') },
  });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /points to references\/beta\.md, which does not exist/);
});

test('fails when the Output Format names a topic that is not a Ruleset group', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { outputTopics: ['alpha', 'ghost'] } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /names topic `ghost`, which is not a Ruleset group/);
});

test('fails when References names a sibling skill that does not exist', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { siblings: ['nope'] } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /sibling skill `nope`, which does not exist/);
});

test('passes when the named sibling skill exists', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { frontmatter: { siblings: ['other-skill'] } });
  writeSkill(r, 'other-skill');
  const { status, out } = run(r);
  assert.equal(status, 0, out);
});

test('fails without a worked example', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { workedExample: false });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /worked-example\.md: missing/);
});

test('fails when a reference header names another skill', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { refs: { alpha: refMd('someone-else', 'alpha') } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /header says the `someone-else` Ruleset, but this reference belongs to `good-skill`/);
});

test('fails when a reference lacks the "why" heading', (t) => {
  const r = root(t);
  const text = '# Alpha\n\nThe rules are in the `good-skill` Ruleset (`alpha` group). This file is the reasoning.\n';
  writeSkill(r, 'good-skill', { refs: { alpha: text } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /first heading must be/);
});

test('fails when a reference exceeds its hard token budget', (t) => {
  const r = root(t);
  writeSkill(r, 'good-skill', { refs: { alpha: refMd('good-skill', 'alpha', { pad: 'x'.repeat(9000) }) } });
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /over the 2000 hard cap for a reference file/);
});

test('warns but passes on an orphan reference file', (t) => {
  const r = root(t);
  const dir = writeSkill(r, 'good-skill');
  writeFileSync(join(dir, 'references', 'gamma.md'), refMd('good-skill', 'gamma'));
  const { status, out } = run(r);
  assert.equal(status, 0, out);
  assert.match(out, /references\/gamma\.md: not referenced from SKILL\.md \(orphan\)/);
});

test('fails when the skills root holds no skills', (t) => {
  const r = root(t);
  const { status, out } = run(r);
  assert.equal(status, 1);
  assert.match(out, /no skills found/);
});
