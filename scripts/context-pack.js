#!/usr/bin/env node
/**
 * context-pack.js — one pasteable document per job, built from the docs that already exist.
 *
 * Output: _studio/ai-ctx/<articles|tweets>/<input>-<output>.md. Each pack opens with the prompt for
 * that job (what the input is, what the output must be, how to work), ends that prompt with the
 * no-tics paragraph from _studio/NO-TICS.md (the machine residue every text here must lose), and
 * continues with the source documents concatenated verbatim, so an AI outside this repo (a browser
 * chat, another tool) gets the whole contract in one paste. The sources are the authoring docs in
 * src/data/pages/, the review skill and the Twitter strategy. The two _add-ctx/ folders (shared
 * sources at the root, the author's expressions and moves under tweets/) are hand-written, pasted
 * after a pack when wanted; the generator never touches them.
 * The packs are generated output, tracked in git so they can be copied from anywhere, rebuilt by
 * `npm run build` (and by `npm run context` on its own). Never edit them by hand: edit a source, or
 * a prompt here, and regenerate.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_studio', 'ai-ctx');
const P = 'src/data/pages';

const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n').trim();
// A doc arrives as a section: a heading with its path, then the file verbatim with its own headings
// pushed one level down so the pack keeps a single outline.
const section = rel => `\n\n---\n\n## \`${rel}\`\n\n${read(rel).replace(/^(#{1,5}) /gm, (_, h) => '#'.repeat(h.length + 1) + ' ')}\n`;
// The no-tics paragraph is the last paragraph of _studio/NO-TICS.md; it closes every prompt.
const NO_TICS = read('_studio/NO-TICS.md').split(/\n\n+/).pop();

const RULES = [`${P}/SYNTAX.md`, `${P}/STYLE.md`, `${P}/VOICE.md`];
const SITE = `InfraPhysics (infraphysics.net) is Yago Mendoza's site: essays, Bits2Bricks tutorials, project write-ups and a wiki of atomic concept notes. The documents after this prompt are the site's own authoring documentation, concatenated verbatim. Read them as one contract (when two parts conflict, STYLE.md wins). Write in the site's markdown syntax exactly as documented; do not invent features.`;
const ACCESS = `The site is public and you may browse it if you can: https://infraphysics.net. The wiki (every concept note, with search) is at https://infraphysics.net/wiki; a note's page is https://infraphysics.net/wiki/<slug>. Machine-readable copies: https://infraphysics.net/llms.txt lists every article and section, https://infraphysics.net/llms-full.txt carries the full text of every article, and https://infraphysics.net/wikinotes-index.json holds every wikinote's uid, name, address, aliases and description. Use them to check what already exists before linking, tagging or repeating it; never invent a note or a uid.`;
const PROCESS = `What happens to your output: the author saves it as one markdown file in src/data/pages/<category>/<slug>.md and runs the build, which compiles the custom syntax, resolves every [[uid]] wiki link against the wiki (an unknown uid is a build error) and rejects any tag that does not match an existing wikinote name or alias. Nothing is published until he commits and pushes; you are writing the draft he will edit, not the live page.`;
const ARTICLE_HOW = `How to work: read everything below first. Then ask for what is missing before writing (the notes, the facts, the images available). Draft the whole piece, frontmatter included, in one file. Verify every fact, number, name and date you did not receive from the author; where you cannot, say so in a note rather than smoothing it over. Do not add a conclusion that summarises; the piece stops when the thought stops.\n\n${PROCESS}\n\n${ACCESS}`;
const ACCOUNT = `The account is Yago Mendoza (@ymdatweets), an industrial engineer who builds with language models and writes about ML infrastructure, alignment, agent security and industrial systems. Tweets follow no canon: no style guide, and the writing rules of his site do not apply. Below is the account's strategy for this season. After this document the author may paste extra context for colour (his favourite expressions, sentences, moves, and what he does not want to sound like) and some of his own posted tweets: treat all of it as material, match that account (its topics, its humour, its way of stating things), and do not smooth it into a generic voice.\n\n${ACCESS} When a tweet draws on one of his articles or notes, link the real page.`;

const PACKS = {
  articles: {
    'essay-from-notes': {
      prompt: `Input: the author's notes, an argument, a conversation or a rough draft. Output: a complete essay for the site, ready to drop into src/data/pages/essays/<slug>.md, with its frontmatter (slug, id, displayTitle, subtitle, tags, complexity, related) and the body in the site's syntax.\n\n${SITE}\n\n${ARTICLE_HOW} An essay is the author's voice thinking; keep his wording where the notes already have it, and never polish specificity away.`,
      files: [...RULES, `${P}/essays/README.md`],
    },
    'project-from-notes': {
      prompt: `Input: what was built, how, what went wrong, the numbers, and any repository or demo. Output: a complete project write-up for the site, ready to drop into src/data/pages/projects/<slug>.md, with its frontmatter (status, technologies, tldr, duration, github, demo) and the body in the site's syntax, including the context annotations the projects guide describes.\n\n${SITE}\n\n${ARTICLE_HOW} A project is told as it happened: the dead ends stay in, the metrics are real, the title and subtitle are literal.`,
      files: [...RULES, `${P}/projects/README.md`],
    },
    'bits2bricks-from-notes': {
      prompt: `Input: a topic the author can teach, his notes and the code or steps involved. Output: a complete Bits2Bricks tutorial for the site, ready to drop into src/data/pages/bits2bricks/<slug>.md, with its frontmatter and a body in the site's syntax whose sections a reader can follow in order.\n\n${SITE}\n\n${ARTICLE_HOW} A tutorial is precise first: every number, command and result checked; the voice is a teacher, not a storyteller.`,
      files: [...RULES, `${P}/bits2bricks/README.md`],
    },
    'wikinotes-from-text': {
      prompt: `Input: the author's own text, as long as he likes, explaining one or several concepts in his words (notes, a lecture he wrote up, a long message). Output: that text stored as wikinotes, English only: one file per concept, each ready to drop into src/data/pages/wikinotes/<slug>.md with its frontmatter (uid, address, name, date) and, where his text states a relation between two concepts, its Interactions.

${SITE}

How to work: this is storage, not writing. Read everything below first, then split his text into concepts, name each one as the term reads inside a sentence, give it an address in the existing hierarchy, set it in the note shape and syntax the wiki uses, and link what his text links. Add nothing he did not say: no facts, no history, no examples, no depth beyond his; when his text leaves a gap that the note shape needs, ask, or leave the sentence out. Say which existing notes each new one should link and which parents are missing rather than inventing them. The wiki is never translated.

${PROCESS.replace('src/data/pages/<category>/<slug>.md', 'src/data/pages/wikinotes/<slug>.md')}

${ACCESS}`,
      files: [`${P}/README.md`, `${P}/STYLE.md`, `${P}/wikinotes/STYLE.md`],
    },
  },
  tweets: {
    'reply-to-post': {
      prompt: `Input: someone else's post (text, author, link, and the replies already there if the author pastes them), plus, optionally, the angle he has in mind. Output: one reply that adds something to that conversation (a datum, a contradiction, an observation, an image idea), in the language of the post, and three lines under it: what it adds that was not there, to whom it is addressed (the post's author, or a specific reply worth answering instead, with the handle), and whether it passes the profile test (would someone who sees only this reply and opens the profile have a reason to follow).\n\n${ACCOUNT} Build the reply as the strategy's *The reply* section says: the ideal third participant, concede then extend, one observation from experience, one precise term and ordinary words, humour from register only. Do not flatter the original post, do not write a bare agreement.`,
      files: ['_studio/twitter/STRATEGY.md'],
    },
    'quote-of-post': {
      prompt: `Input: someone else's post (text, author, link) and the author's reaction to it. Output: a quote post whose comment transforms the original (reframes it, adds the missing datum, contradicts it with evidence), never a bare *this*, in the language of the post, and two lines under it: what it adds, and whether it passes the profile test.\n\n${ACCOUNT} Build it as the strategy's *The reply* section says: concede the frame, then take it further than its author did.`,
      files: ['_studio/twitter/STRATEGY.md'],
    },
    'post-from-idea': {
      prompt: `Input: an idea, an observation, a number, an inbox note or a wikinote of the author's. Output: one own post (one to three sentences, or an image caption if the input is an image), in the language the input is in, and one line under it saying what kind of reader it is for. No hook that promises, no question to the audience for its own sake, no hashtags.\n\n${ACCOUNT}`,
      files: ['_studio/twitter/STRATEGY.md'],
    },
    'thread-from-article': {
      prompt: `Input: one article of the site (pasted after this), or a cluster of wikinotes. Output: a thread of eight to twelve tweets that works on its own (its own opening and its own landing, not a summary), one idea per tweet, the first tweet carrying the claim, the last linking the piece without selling it, in the article's language. Under it, one line per tweet saying which image or figure from the article would go with it, if any.\n\n${ACCOUNT}`,
      files: ['_studio/twitter/STRATEGY.md'],
    },
  },
};

// Regenerate the generated files only: the two _add-ctx/ folders are written by hand and stay.
for (const rel of ['README.md', 'articles', ...fs.existsSync(path.join(OUT, 'tweets')) ? fs.readdirSync(path.join(OUT, 'tweets')).filter(f => f.endsWith('.md')).map(f => 'tweets/' + f) : []]) fs.rmSync(path.join(OUT, rel), { recursive: true, force: true });
const stamp = new Date().toISOString().slice(0, 10);
let total = 0, count = 0;
const index = [];
for (const [group, packs] of Object.entries(PACKS)) {
  fs.mkdirSync(path.join(OUT, group), { recursive: true });
  for (const [name, { prompt, files }] of Object.entries(packs)) {
    const head = `<!-- Generated by scripts/context-pack.js on ${stamp}. Do not edit: edit the sources named below, or the prompt in the script, and run \`npm run context\`. -->\n\n# ${group}/${name}\n\n${prompt}\n\n${NO_TICS}\n\nSources, in order: ${files.map(f => `\`${f}\``).join(', ')}.`;
    const doc = head + files.map(section).join('') + '\n';
    fs.writeFileSync(path.join(OUT, group, `${name}.md`), doc);
    total += doc.length; count++;
    const first = prompt.split('\n')[0];
    index.push(`| \`${group}/${name}.md\` | ${first.replace(/^Input: /, '**Input:** ').replace(/ Output: /, ' **Output:** ')} |`);
    console.log(`  ${(group + '/' + name).padEnd(32)} ${files.length} files  ${(doc.length / 1024).toFixed(0)} KB`);
  }
}
fs.writeFileSync(path.join(OUT, 'README.md'), `# ai-ctx

Generated context packs, one per job, for pasting into an AI outside this repo (a browser chat, another tool). Each file is named by its input and its output, opens with the prompt for that job, closes that prompt with the no-tics paragraph from \`../NO-TICS.md\`, and continues with the relevant documentation concatenated verbatim. Nothing here is written by hand: the sources are the authoring docs in \`src/data/pages/\`, the review skill and \`_studio/twitter/STRATEGY.md\`; the prompts live in \`scripts/context-pack.js\`. \`tweets/_add-ctx/\` is the exception: hand-written colour (the author's expressions, sentences, moves, allergies) pasted after a tweets pack when wanted, never touched by the generator.

\`articles/\` packs carry the site's rules and the category guide: the minimum to write a piece of that category, style included. \`tweets/\` packs carry no rules, only the strategy, because tweets follow no canon (the author's material is optional, in \`tweets/_add-ctx/\`); the no-tics paragraph is not style, it is the residue a model leaves.

| Pack | What it does |
|---|---|
${index.join('\n')}

Use: paste the pack, then the input it names (the notes, the post, the article), then any of the author's own posted tweets when the job is a tweet. Regenerate with \`npm run context\` (also part of \`npm run build\`).
`);
console.log(`context packs: ${count} written to _studio/ai-ctx (${(total / 1024).toFixed(0)} KB)`);
