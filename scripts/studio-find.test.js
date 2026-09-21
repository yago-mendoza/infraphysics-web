import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

test('bank folders drive retrieval and nested topic references without a kind field', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-folders-'));
  const write = (relative, text) => {
    const file = path.join(fixture, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text);
  };
  const bank = '_studio/_inbox/bank/';
  write(bank + 'articles/projects/same.md', '---\ntitle: Camera project\nstatus: seed\ntopics: [combined]\n---\nCamera source.');
  write(bank + 'articles/essays/same.md', '---\ntitle: Camera essay\nkind: project\ntopics: [combined]\n---\nSeparate idea.');
  write(bank + 'facts/reference.md', '---\ntitle: Measurement\nstatus: verified\ntopics: [combined]\n---\nEvidence.');
  write('_studio/articles/queue/combined.md', '---\ntitle: Combined topic\nkind: essay\nbank: [articles/projects/same, articles/essays/same, facts/reference]\n---\nAngle.');
  write(bank + 'articles/projects/additions/extra.md', '---\ntitle: Project addition\ntarget: projects/example\n---\nMore material.');
  write(bank + 'ideas/quotes/same.md', '---\ntitle: Loose quote\n---\nA saved quotation.');
  write('_studio/articles/articles-format/generated.md', '---\ntitle: Do not index me\n---\nGenerated.');
  const source = fs.readFileSync(new URL('./studio-find.js', import.meta.url), 'utf8')
    .replace(/^const ROOT = .*;$/m, `const ROOT = ${JSON.stringify(fixture)};`);
  const run = (...args) => execFileSync(process.execPath, ['--input-type=module', '-', ...args], {
    input: source, encoding: 'utf8', cwd: path.resolve(import.meta.dirname, '..'),
  });
  try {
    const projects = run('--folder', 'projects');
    assert.match(projects, /Camera project/); assert.doesNotMatch(projects, /Camera essay|Combined topic/);
    const legacy = run('--kind', 'project');
    assert.match(legacy, /Camera project/); assert.doesNotMatch(legacy, /Camera essay/);
    assert.match(run('--folder', 'essays'), /Camera essay/);
    assert.match(run('--folder', 'articles/projects'), /Project addition/);
    assert.doesNotMatch(run('--folder', 'articles/projects'), /Camera essay|Loose quote/);
    assert.match(run('--folder', 'additions'), /Project addition/);
    assert.doesNotMatch(run('--folder', 'additions'), /Camera project/);
    assert.match(run('--folder', 'ideas'), /Loose quote/);
    assert.doesNotMatch(run('--folder', 'articles'), /Loose quote/);
    assert.match(run('--kind', 'addition'), /Project addition/);
    assert.match(run('--kind', 'quote'), /Loose quote/);
    const links = run('--links');
    assert.match(links, /1 topics, 5 bank items/);
    assert.doesNotMatch(links, /to fix|ONE-WAY|NO SUCH/);
    assert.doesNotMatch(run(), /Do not index me/);
    write('_studio/articles/queue/combined.md', '---\ntitle: Combined topic\nbank: [articles/essays/same, missing/item]\n---\nAngle.');
    const broken = run('--links');
    assert.match(broken, /missing\/item: no such bank item/);
    assert.match(broken, /projects\/same -> combined: one-way/);
  } finally {
    assert.equal(path.dirname(path.resolve(fixture)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(fixture).startsWith('studio-folders-'));
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
