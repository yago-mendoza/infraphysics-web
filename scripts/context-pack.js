#!/usr/bin/env node
/**
 * context-pack.js — one pasteable document per writing job, built from the docs that already exist.
 *
 * Two outputs, because the two channels are written differently.
 *
 * 1. `_studio/articles/1-articles-format/write-<category>.md`. An article pack is the whole contract in
 *    one paste: the prompt for that job, the no-tics paragraph, then the site's authoring docs
 *    assembled with heading levels and relative links adjusted. Generated, tracked in git, never edited by hand: edit a source in
 *    src/data/pages/ or a prompt in this script and regenerate.
 * 2. `_studio/twitter/0-gen_prompts/_format_ctx/NO-TICS.md`. Tweet prompts are hand-written (tweets
 *    follow no canon, so there is nothing to concatenate), and the one thing they do share with the
 *    site is the machine residue. So the compile only drops that doc beside them, and each prompt
 *    names it in its paste list instead of inlining it.
 *
 * The single source of the paragraph is src/data/pages/NO-TICS.md, beside STYLE.md and VOICE.md.
 * Nothing else under _studio/ is written here: the hand-written folders (_format_ctx, the queues,
 * the bank) stay as they are.
 *
 * Run explicitly with `npm run context`; --check reports drift without writing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_studio', 'articles', '1-articles-format');
const TWEET_CTX = path.join(ROOT, '_studio', 'twitter', '0-gen_prompts', '_format_ctx');
const P = 'src/data/pages';

const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n').trim();
// Local links must still point at their source after a guide is moved into a pack.
function relocateLinks(text, source, destination) {
  return text.replace(/(`+)[\s\S]*?\1|\]\(([^\s)]+)(\s+"[^"]*")?\)/g, (match, code, href, title = '') => {
    if (code) return match;
    if (/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(href)) return match;
    const [file, fragment] = href.split('#');
    const target = file ? path.resolve(ROOT, path.dirname(source), file) : path.join(ROOT, source);
    const relative = path.relative(destination, target).replace(/\\/g, '/');
    return `](${relative}${fragment ? '#' + fragment : ''}${title})`;
  });
}
// A doc arrives as a section: a heading with its path, then the file verbatim with its own headings
// pushed one level down so the pack keeps a single outline.
const section = rel => `\n\n---\n\n## \`${rel}\`\n\n${relocateLinks(read(rel), rel, OUT).replace(/^(#{1,5}) /gm, (_, h) => '#'.repeat(h.length + 1) + ' ')}\n`;
// The no-tics paragraph is the last paragraph of the canonical doc; it closes every article prompt.
const NO_TICS_DOC = read(`${P}/NO-TICS.md`);
const NO_TICS = NO_TICS_DOC.split(/\n\n+/).pop();

const RULES = [`${P}/README.md`, `${P}/SYNTAX.md`, `${P}/STYLE.md`, `${P}/VOICE.md`, `${P}/VISUAL.md`];
const SITE = `InfraPhysics (infraphysics.net) is Yago Mendoza's site: essays, Bits2Bricks tutorials, project write-ups and a wiki of atomic concept notes. The documents after this prompt are the site's own authoring documentation, assembled with heading levels and relative links adjusted. Read them as one contract (when two parts conflict, STYLE.md wins). Write in the site's markdown syntax exactly as documented; do not invent features.`;
const ACCESS = `The site is public and you may browse it if you can: https://infraphysics.net. The wiki (every concept note, with search) is at https://infraphysics.net/wiki; a note's page is https://infraphysics.net/wiki/<slug>. Machine-readable copies: https://infraphysics.net/llms.txt lists every article and section, https://infraphysics.net/llms-full.txt carries the full text of every article, and https://infraphysics.net/wikinotes-index.json holds every wikinote's uid, name, address, aliases and description. Use them to check what already exists before linking, tagging or repeating it; never invent a note or a uid.`;
const PROCESS = `What happens to your output: the author saves it as one markdown file in src/data/pages/<category>/<slug>.md and runs the build, which compiles the custom syntax, resolves every [[uid]] wiki link against the wiki (an unknown uid is a build error) and rejects any tag that does not match an existing wikinote name or alias. Nothing is published until he commits and pushes; you are writing the draft he will edit, not the live page.`;
const HOW = `How to work: read everything below first. Then ask for what is missing before writing (the notes, the facts, the images available). Draft the whole piece, frontmatter included, in one file. Verify every fact, number, name and date you did not receive from the author; where you cannot, say so in a note rather than smoothing it over. Do not add a conclusion that summarises; the piece stops when the thought stops.\n\n${PROCESS}\n\n${ACCESS}`;

const PACKS = {
  'write-essay': {
    prompt: `Input: the author's notes, an argument, a conversation or a rough draft. Output: a complete essay for the site, ready to drop into src/data/pages/essays/<slug>.md, with its frontmatter (slug, id, displayTitle, subtitle, tags, complexity, related) and the body in the site's syntax.\n\n${SITE}\n\n${HOW} An essay is the author's voice thinking; keep his wording where the notes already have it, and never polish specificity away.`,
    files: [...RULES, `${P}/essays/README.md`],
  },
  'write-project': {
    prompt: `Input: what was built, how, what went wrong, the numbers, and any repository or demo. Output: a complete project write-up for the site, ready to drop into src/data/pages/projects/<slug>.md, with its frontmatter (status, technologies, tldr, duration, github, demo) and the body in the site's syntax, including the context annotations the projects guide describes.\n\n${SITE}\n\n${HOW} A project is told as it happened: the dead ends stay in, the metrics are real, the title and subtitle are literal.`,
    files: [...RULES, `${P}/projects/README.md`],
  },
  'write-bits2bricks': {
    prompt: `Input: a topic the author can teach, his notes and the code or steps involved. Output: a complete Bits2Bricks tutorial for the site, ready to drop into src/data/pages/bits2bricks/<slug>.md, with its frontmatter and a body in the site's syntax whose sections a reader can follow in order.\n\n${SITE}\n\n${HOW} A tutorial is precise first: every number, command and result checked; the voice is a teacher, not a storyteller.`,
    files: [...RULES, `${P}/bits2bricks/README.md`],
  },
};

// Write only the named outputs. No directory cleanup or migration belongs in a generator.
const check = process.argv.includes('--check');
let changed = 0;
const generated = src => `<!-- Generated by scripts/context-pack.js. Do not edit: edit ${src}, or the prompt in the script, and run \`npm run context\`. -->`;
function output(file, text) {
  const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (previous === text) return;
  changed++;
  if (check) { console.log(`  stale: ${path.relative(ROOT, file)}`); return; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

let total = 0, count = 0;
const index = [];
for (const [name, { prompt, files }] of Object.entries(PACKS)) {
  const head = `${generated('the sources named below')}\n\n# ${name}\n\n${prompt}\n\n${NO_TICS}\n\nSources, in order: ${files.map(f => `\`${f}\``).join(', ')}.`;
  const doc = head + files.map(section).join('') + '\n';
  output(path.join(OUT, `${name}.md`), doc);
  total += doc.length; count++;
  const first = prompt.split('\n')[0];
  index.push(`| \`${name}.md\` | ${first.replace(/^Input: /, '**Input:** ').replace(/ Output: /, ' **Output:** ')} |`);
  console.log(`  ${name.padEnd(24)} ${files.length} files  ${(doc.length / 1024).toFixed(0)} KB`);
}

output(path.join(OUT, 'README.md'), `${generated('src/data/pages/NO-TICS.md and the docs it names')}

# articles-format

One pasteable document per article job, for an AI outside this repo (a browser chat, another tool). Each file opens with the prompt for that job, closes that prompt with the no-tics paragraph from \`src/data/pages/NO-TICS.md\`, and continues with the site's authoring docs assembled with heading levels and relative links adjusted, so the whole format contract travels in one paste. Nothing here is written by hand: the sources are the docs in \`src/data/pages/\`, the prompts live in \`scripts/context-pack.js\`, and \`npm run context\` rebuilds the named outputs explicitly.

| Pack | What it does |
|---|---|
${index.join('\n')}

Use: paste the pack, then the material it names (the notes, the draft, the wikinotes it draws on). The topic being written usually comes from \`../queue/\`, whose frontmatter says which items of \`../../_inbox/bank/\` it is built on.

Twitter works the other way round: its prompts in \`../../twitter/0-gen_prompts/\` are hand-written, because tweets follow no canon and there is no format doc to concatenate. The only thing the compile leaves there is \`_format_ctx/NO-TICS.md\`, the same paragraph, because machine residue is not style.
`);

// The one generated file on the Twitter side: the paragraph, verbatim, beside the hand-written prompts.
output(path.join(TWEET_CTX, 'NO-TICS.md'), `${generated('src/data/pages/NO-TICS.md')}\n\n${relocateLinks(NO_TICS_DOC, `${P}/NO-TICS.md`, TWEET_CTX)}\n`);

console.log(`context packs: ${count} packs (${(total / 1024).toFixed(0)} KB), ${changed} outputs ${check ? 'need regeneration (nothing written)' : 'updated'}`);
if (check && changed) process.exitCode = 1;
