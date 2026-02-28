// Vite dev server plugin — fieldnote editing endpoints
// Only active during `vite dev`, never in production builds.
//
// Endpoints:
//   GET  /api/fieldnotes/:uid/raw     → raw markdown + mtime
//   POST /api/fieldnotes/save         → write to disk, incremental rebuild
//   POST /api/fieldnotes/create       → create new note, rebuild
//   POST /api/fieldnotes/validate     → parse + validate without saving
//   POST /api/fieldnotes/analyze-refs    → pre-delete impact analysis
//   POST /api/fieldnotes/convert-to-stub → clear body, preserve frontmatter + trailing refs
//   POST /api/fieldnotes/delete          → delete note + optional trailing ref cleanup

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked, Renderer } from 'marked';
import compilerConfig from '../scripts/compiler.config.js';
import {
  compileMarkdown,
  processAllLinks,
  processOutsideCode,
} from '../src/lib/content/compile.js';
import {
  parseFrontmatter,
  parseReferences,
  parseTrailingRefs,
  extractDescription,
  stripTrailingRefs,
  serializeFieldnote,
} from '../src/lib/content/fieldnote-parser.js';
import {
  checkReferenceIntegrity,
  checkSelfReferences,
  checkBareTrailingRefs,
  checkParentHierarchy,
  checkFrontmatterSchema,
} from '../src/lib/content/validate.js';
import { generateUid } from '../src/lib/content/uid.js';
import { checkSegmentCollisions, parseAddress } from '../src/lib/content/address.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Stub note placeholder phrases (shared with resolve-issues.js)
const STUB_PHRASES = [
  'This neuron hasn\'t fired yet.',
  'Null. But with potential.',
  'An empty space is an invitation to think.',
  'This note exists in superposition: it contains every possible idea until I write one.',
  'This note contains exactly what the Board has deemed necessary at this time.',
  'For a minute there, I lost my thought. I lost my thought.',
  'This could be a historic note. But right now, it\'s nothing.',
  'I\'ve been staring at this note for three hours. It\'s winning.',
  'Please enjoy each note equally. Even the empty ones.',
  'The work is mysterious and important. This note is mysterious and empty.',
  'My outie may have had a thought. My innie did not record it.',
  'You know what? I had a thought. A great thought. And now it\'s gone.',
  'A man who leaves a note empty is a man who is not paying attention.',
  'TARS: Humor setting: 75%. Note content: 0%. Adjusting expectations.',
  'And so, the blank note sits alone — a creature of infinite potential, yet profoundly still.',
  'The empty note is a choice. A terrible choice, but a choice nonetheless.',
  'fix: added note (empty) (will fill later) (I promise)',
  'I used to be a note full of ideas, then I took an arrow to the knee.',
  'Here we observe the empty note in its natural habitat. It waits. Patiently. Hoping to be filled before the season ends.',
  'I\'m sorry, Dave. I\'m afraid there\'s nothing here.',
  'There are no mistakes in here, only happy little empty notes.',
  'This note should have been filled 47 minutes ago. You can stand by.',
  'The only thing I know is that this note knows nothing.',
  'For sale: one note, never written.',
  'The definition of insanity is opening this note again and expecting content.',
  'TL;DR: there\'s nothing here. You\'re welcome.',
  'Don\'t panic. It\'s just an empty note.',
  '"One morning, upon waking from restless dreams, the note found itself transformed into something empty."',
  '"You miss 100% of the thoughts you don\'t write down."',
  '"The real treasure was the notes we forgot to write along the way."',
  '"It\'s not possible. — No. It\'s necessary. Write something."',
  '"Don\'t let me leave, Murph. Not with this note empty."',
  '"Stanley looked at the empty note. The empty note looked back at Stanley. Neither did anything productive."',
  '"This is the part where you write something profound ... We\'re waiting, Stanley."',
  '"A note never arrives empty nor full. It arrives precisely when it means to be written."',
];

function randomStubPhrase() {
  return STUB_PHRASES[Math.floor(Math.random() * STUB_PHRASES.length)];
}
const FIELDNOTES_DIR = path.join(__dirname, '../src/data/pages/fieldnotes');
const FIELDNOTES_INDEX_FILE = path.join(__dirname, '../src/data/fieldnotes-index.generated.json');
const FIELDNOTES_CONTENT_DIR = path.join(__dirname, '../public/fieldnotes');

// Configure marked the same way as build-content.js
const customRenderer = new Renderer();
const { titlePattern, classMap } = compilerConfig.imagePositions;

customRenderer.blockquote = function(token) {
  const body = this.parser.parse(token.tokens);
  return `<div class="small-text">${body}</div>\n`;
};

customRenderer.image = function({ href, title, text }) {
  let className = '';
  let style = '';
  let finalTitle = title;

  if (title) {
    const positionMatch = title.match(titlePattern);
    if (positionMatch) {
      const position = positionMatch[1];
      const width = positionMatch[2];
      className = classMap[position] || '';
      if (width && position !== 'full') style = `width: ${width};`;
      finalTitle = null;
    }
  }

  let alt = text || '';
  let caption = '';
  if (alt.includes('|')) {
    const pipeIndex = alt.indexOf('|');
    caption = alt.slice(pipeIndex + 1).trim();
    alt = alt.slice(0, pipeIndex).trim();
  }

  const styleAttr = style ? ` style="${style}"` : '';
  const titleAttr = finalTitle ? ` title="${finalTitle}"` : '';

  if (caption) {
    const figClass = className ? ` class="${className}"` : '';
    const imgTag = `<img src="${href}" alt="${alt}"${styleAttr}${titleAttr} loading="lazy" />`;
    return `<figure${figClass}>${imgTag}<figcaption>${caption}</figcaption></figure>`;
  }

  const classAttr = className ? ` class="${className}"` : '';
  return `<img src="${href}" alt="${alt}"${classAttr}${styleAttr}${titleAttr} loading="lazy" />`;
};

marked.setOptions({ renderer: customRenderer, ...compilerConfig.marked });

/**
 * Read all fieldnotes from disk to rebuild the in-memory index.
 * Returns { fieldnotePosts, uidToMeta }
 */
function loadAllFieldnotes() {
  const files = fs.readdirSync(FIELDNOTES_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md');

  const posts = [];
  const uidToMeta = new Map();

  for (const filename of files) {
    const filePath = path.join(FIELDNOTES_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = parseFrontmatter(raw);
    if (!parsed) continue;

    const { frontmatter, body } = parsed;
    if (!frontmatter.uid || !frontmatter.address) continue;

    const uid = frontmatter.uid;
    const address = frontmatter.address;
    const date = frontmatter.date || '';
    const addressParts = address.split('//').map(s => s.trim());
    const name = frontmatter.name || addressParts[addressParts.length - 1];
    const references = parseReferences(body);
    const { trailingRefs, trailingRefStart } = parseTrailingRefs(body);
    const description = extractDescription(body);
    const contentMd = stripTrailingRefs(body, trailingRefStart);

    // Compile HTML (no Shiki in dev server — too heavy for incremental)
    const preLinkHtml = compileMarkdown(contentMd.trim(), date, {
      markedInstance: marked,
      compilerConfig,
      highlighter: null,
    });
    const searchText = preLinkHtml.replace(/<[^>]*>/g, '').toLowerCase();

    const post = {
      id: uid,
      title: address,
      displayTitle: name,
      name,
      category: 'fieldnotes',
      date,
      description,
      address,
      addressParts,
      references,
      trailingRefs,
      searchText,
      aliases: frontmatter.aliases || null,
      supersedes: frontmatter.supersedes || null,
      distinct: frontmatter.distinct || null,
      content: preLinkHtml,
    };

    posts.push(post);
    uidToMeta.set(uid, { address, name });
  }

  return { fieldnotePosts: posts, uidToMeta };
}

/**
 * Process all wiki-links for a set of posts given a uidToMeta map.
 */
function applyLinks(posts, uidToMeta) {
  return posts.map(post => ({
    ...post,
    content: processOutsideCode(post.content, html =>
      processAllLinks(html, uidToMeta, compilerConfig.wikiLinks)
    ),
    trailingRefs: (post.trailingRefs || []).map(r =>
      r.annotation
        ? { ...r, annotation: processAllLinks(r.annotation, uidToMeta, compilerConfig.wikiLinks) }
        : r
    ),
  }));
}

/**
 * Write outputs: fieldnotes-index.generated.json + public/fieldnotes/*.json
 */
function writeOutputs(linkedPosts) {
  const index = linkedPosts.map(({ content, searchText, ...meta }) => ({ ...meta, searchText }));
  fs.writeFileSync(FIELDNOTES_INDEX_FILE, JSON.stringify(index, null, 2));

  if (!fs.existsSync(FIELDNOTES_CONTENT_DIR)) {
    fs.mkdirSync(FIELDNOTES_CONTENT_DIR, { recursive: true });
  }

  for (const post of linkedPosts) {
    const contentFile = path.join(FIELDNOTES_CONTENT_DIR, `${post.id}.json`);
    fs.writeFileSync(contentFile, JSON.stringify({ content: post.content }));
  }
}

/**
 * Full incremental rebuild: load all → link all → validate → write outputs.
 * Returns diagnostics.
 */
function fullRebuild() {
  const { fieldnotePosts, uidToMeta } = loadAllFieldnotes();
  const linked = applyLinks(fieldnotePosts, uidToMeta);
  writeOutputs(linked);
  return { fieldnotePosts, uidToMeta, linked };
}

/**
 * Validate raw markdown without saving.
 */
function validateRaw(raw, allFieldnotes) {
  const issues = [];
  const parsed = parseFrontmatter(raw);

  if (!parsed) {
    issues.push({ source: 'PARSE', severity: 'ERROR', message: 'Invalid frontmatter — missing or malformed --- delimiters' });
    return issues;
  }

  const { frontmatter, body } = parsed;

  // Schema checks
  const schemaIssues = checkFrontmatterSchema(frontmatter);
  for (const i of schemaIssues) {
    issues.push({ source: 'PARSE', severity: i.severity, message: i.message });
  }

  // Parse references
  const references = parseReferences(body);
  const { trailingRefs } = parseTrailingRefs(body);

  // Build known UIDs from existing notes
  const knownUids = new Set(allFieldnotes.map(n => n.id));
  if (frontmatter.uid) knownUids.add(frontmatter.uid);

  // Reference integrity
  for (const ref of references) {
    if (!knownUids.has(ref)) {
      issues.push({ source: 'VALIDATE', severity: 'ERROR', message: `Broken ref [[${ref}]] — no matching fieldnote` });
    }
  }

  // Trailing ref checks
  for (const ref of trailingRefs) {
    if (!knownUids.has(ref.uid)) {
      issues.push({ source: 'VALIDATE', severity: 'ERROR', message: `Broken trailing ref [[${ref.uid}]] — no matching fieldnote` });
    }
    if (ref.uid === frontmatter.uid) {
      issues.push({ source: 'VALIDATE', severity: 'WARN', message: 'Self-reference in trailing refs' });
    }
    if (!ref.annotation || ref.annotation.trim() === '') {
      issues.push({ source: 'VALIDATE', severity: 'ERROR', message: `Bare trailing ref [[${ref.uid}]] — needs :: annotation` });
    }
  }

  // Parent hierarchy
  if (frontmatter.address) {
    const parts = parseAddress(frontmatter.address);
    const knownAddresses = new Set(allFieldnotes.map(n => n.address));
    if (frontmatter.address) knownAddresses.add(frontmatter.address);

    for (let i = 1; i < parts.length; i++) {
      const parentAddr = parts.slice(0, i).join('//');
      if (!knownAddresses.has(parentAddr)) {
        issues.push({ source: 'VALIDATE', severity: 'WARN', message: `Missing parent "${parentAddr}"` });
      }
    }
  }

  return issues;
}

/**
 * Replace all [[uid]] and [[uid|display]] wiki-links with plain text.
 * [[uid]] → deletedName, [[uid|custom text]] → custom text.
 */
function unlinkWikiRefs(text, uid, deletedName) {
  // [[uid|display text]] → display text
  // [[uid]]              → deletedName
  return text.replace(
    new RegExp(`\\[\\[${uid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\|([^\\]]+))?\\]\\]`, 'g'),
    (_, display) => display || deletedName
  );
}

// Helper to parse JSON body from request
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/** @returns {import('vite').Plugin} */
export function fieldnoteEditorPlugin() {
  let cachedFieldnotes = null;

  return {
    name: 'fieldnote-editor',
    apply: 'serve',  // Only active during dev

    configureServer(server) {
      // Load initial index
      try {
        const { fieldnotePosts, uidToMeta } = loadAllFieldnotes();
        cachedFieldnotes = { posts: fieldnotePosts, uidToMeta };
      } catch {
        console.log('[fieldnote-editor] Initial load failed — will retry on first request');
      }

      server.middlewares.use(async (req, res, next) => {
        // ── GET /api/fieldnotes/:uid/raw ──
        const rawMatch = req.url?.match(/^\/api\/fieldnotes\/([^/]+)\/raw$/);
        if (rawMatch && req.method === 'GET') {
          const uid = rawMatch[1];
          const filePath = path.join(FIELDNOTES_DIR, `${uid}.md`);

          if (!fs.existsSync(filePath)) {
            return sendJson(res, { error: 'Not found' }, 404);
          }

          const raw = fs.readFileSync(filePath, 'utf-8');
          const stat = fs.statSync(filePath);
          return sendJson(res, { raw, mtime: stat.mtimeMs });
        }

        // ── POST /api/fieldnotes/save ──
        if (req.url === '/api/fieldnotes/save' && req.method === 'POST') {
          try {
            const { uid, raw } = await readBody(req);
            if (!uid || !raw) {
              return sendJson(res, { error: 'Missing uid or raw' }, 400);
            }

            const filePath = path.join(FIELDNOTES_DIR, `${uid}.md`);
            if (!fs.existsSync(filePath)) {
              return sendJson(res, { error: 'File not found' }, 404);
            }

            // Validate before saving
            const allFieldnotes = cachedFieldnotes?.posts || [];
            const diagnostics = validateRaw(raw, allFieldnotes);
            const hasErrors = diagnostics.some(d => d.severity === 'ERROR');

            // Write to disk even with warnings (only block on errors if desired)
            fs.writeFileSync(filePath, raw, 'utf-8');

            // Incremental rebuild
            const { fieldnotePosts, uidToMeta, linked } = fullRebuild();
            cachedFieldnotes = { posts: fieldnotePosts, uidToMeta };

            // Notify browser via HMR
            server.ws.send({
              type: 'custom',
              event: 'fieldnote-update',
              data: { uid, action: 'save' },
            });

            return sendJson(res, {
              ok: true,
              diagnostics,
              hasErrors,
            });
          } catch (err) {
            return sendJson(res, { error: err.message }, 500);
          }
        }

        // ── POST /api/fieldnotes/create ──
        if (req.url === '/api/fieldnotes/create' && req.method === 'POST') {
          try {
            const { address, name, date, body } = await readBody(req);
            if (!address) {
              return sendJson(res, { error: 'Missing address' }, 400);
            }

            // Generate UID
            const allFieldnotes = cachedFieldnotes?.posts || [];
            const existingUids = new Set(allFieldnotes.map(n => n.id));
            const uid = generateUid(existingUids);

            const parts = parseAddress(address);
            const autoName = name || parts[parts.length - 1];
            const autoDate = date || new Date().toISOString().slice(0, 10);
            const bodyContent = body || randomStubPhrase();

            // Check address collisions
            const existingAddresses = new Set(allFieldnotes.map(n => n.address));
            if (existingAddresses.has(address)) {
              return sendJson(res, { error: `Address "${address}" already exists` }, 409);
            }

            // Segment collision check
            const allNotes = [...allFieldnotes, { address, addressParts: parts }];
            const collisions = checkSegmentCollisions(allNotes);
            const newCollisions = collisions.filter(c =>
              (c.entries || []).some(e => e.fullAddress === address)
            );

            // Build raw markdown
            const raw = [
              '---',
              `uid: ${uid}`,
              `address: "${address}"`,
              `name: "${autoName}"`,
              `date: "${autoDate}"`,
              '---',
              '',
              bodyContent,
              '',
            ].join('\n');

            // Write file
            const filePath = path.join(FIELDNOTES_DIR, `${uid}.md`);
            fs.writeFileSync(filePath, raw, 'utf-8');

            // Full rebuild
            const { fieldnotePosts, uidToMeta, linked } = fullRebuild();
            cachedFieldnotes = { posts: fieldnotePosts, uidToMeta };

            // HMR notification
            server.ws.send({
              type: 'custom',
              event: 'fieldnote-update',
              data: { uid, action: 'create' },
            });

            // Check for missing parents
            const knownAddresses = new Set(fieldnotePosts.map(n => n.address));
            const missingParents = [];
            for (let i = 1; i < parts.length; i++) {
              const parentAddr = parts.slice(0, i).join('//');
              if (!knownAddresses.has(parentAddr)) {
                missingParents.push(parentAddr);
              }
            }

            return sendJson(res, {
              ok: true,
              uid,
              diagnostics: [],
              collisions: newCollisions,
              missingParents,
            });
          } catch (err) {
            return sendJson(res, { error: err.message }, 500);
          }
        }

        // ── POST /api/fieldnotes/analyze-refs ──
        // Pre-delete impact analysis: who references this note?
        if (req.url === '/api/fieldnotes/analyze-refs' && req.method === 'POST') {
          try {
            const { uid } = await readBody(req);
            if (!uid) return sendJson(res, { error: 'Missing uid' }, 400);

            if (!cachedFieldnotes) {
              const { fieldnotePosts, uidToMeta } = loadAllFieldnotes();
              cachedFieldnotes = { posts: fieldnotePosts, uidToMeta };
            }

            const targetPost = cachedFieldnotes.posts.find(p => p.id === uid);
            if (!targetPost) return sendJson(res, { error: 'Note not found' }, 404);

            const bodyRefs = [];     // notes that reference this uid in body text
            const trailingRefs = []; // notes that have trailing refs pointing to this uid
            const children = [];     // notes whose address starts with target's address + '//'

            for (const post of cachedFieldnotes.posts) {
              if (post.id === uid) continue;

              // Read raw file to distinguish body refs from trailing refs
              const filePath = path.join(FIELDNOTES_DIR, `${post.id}.md`);
              if (!fs.existsSync(filePath)) continue;
              const raw = fs.readFileSync(filePath, 'utf-8');
              const parsed = parseFrontmatter(raw);
              if (!parsed) continue;

              const { body } = parsed;
              const { trailingRefs: tRefs, trailingRefStart } = parseTrailingRefs(body);
              const contentBody = stripTrailingRefs(body, trailingRefStart);
              const bodyReferences = parseReferences(contentBody);

              // Body references (inline [[uid]] in content)
              if (bodyReferences.includes(uid)) {
                bodyRefs.push({
                  uid: post.id,
                  address: post.address,
                  name: post.name,
                  filename: `${post.id}.md`,
                });
              }

              // Trailing refs pointing to this uid
              const matchingTrailing = tRefs.filter(r => r.uid === uid);
              for (const tr of matchingTrailing) {
                trailingRefs.push({
                  uid: post.id,
                  address: post.address,
                  name: post.name,
                  filename: `${post.id}.md`,
                  annotation: tr.annotation || '',
                });
              }

              // Children (address hierarchy)
              if (post.address.startsWith(targetPost.address + '//')) {
                children.push({
                  uid: post.id,
                  address: post.address,
                  name: post.name,
                });
              }
            }

            // Own trailing refs — interactions declared BY this note
            const ownTrailingRefs = [];
            const targetFile = path.join(FIELDNOTES_DIR, `${uid}.md`);
            if (fs.existsSync(targetFile)) {
              const targetRaw = fs.readFileSync(targetFile, 'utf-8');
              const targetParsed = parseFrontmatter(targetRaw);
              if (targetParsed) {
                const { trailingRefs: ownTRefs } = parseTrailingRefs(targetParsed.body);
                for (const tr of ownTRefs) {
                  const meta = cachedFieldnotes.uidToMeta.get(tr.uid);
                  ownTrailingRefs.push({
                    uid: tr.uid,
                    address: meta?.address || tr.uid,
                    name: meta?.name || tr.uid,
                    annotation: tr.annotation || '',
                  });
                }
              }
            }

            return sendJson(res, {
              noteAddress: targetPost.address,
              noteName: targetPost.name,
              bodyRefs,
              trailingRefs,
              children,
              ownTrailingRefs,
              isReferenced: bodyRefs.length > 0 || trailingRefs.length > 0,
              isParent: children.length > 0,
              totalImpact: bodyRefs.length + trailingRefs.length + children.length + ownTrailingRefs.length,
            });
          } catch (err) {
            return sendJson(res, { error: err.message }, 500);
          }
        }

        // ── POST /api/fieldnotes/delete ──
        if (req.url === '/api/fieldnotes/delete' && req.method === 'POST') {
          try {
            const { uid, cleanupTrailingRefs, trailingRefUids, unlinkBodyRefs } = await readBody(req);
            if (!uid) return sendJson(res, { error: 'Missing uid' }, 400);

            const sourceFile = path.join(FIELDNOTES_DIR, `${uid}.md`);
            if (!fs.existsSync(sourceFile)) {
              return sendJson(res, { error: 'File not found' }, 404);
            }

            // Resolve the deleted note's name for unlink fallback text
            const deletedName = cachedFieldnotes?.uidToMeta?.get(uid)?.name || uid;

            // 1. Clean up trailing refs in other notes that point to this uid
            if (cleanupTrailingRefs && trailingRefUids && trailingRefUids.length > 0) {
              for (const otherUid of trailingRefUids) {
                const otherFile = path.join(FIELDNOTES_DIR, `${otherUid}.md`);
                if (!fs.existsSync(otherFile)) continue;

                const raw = fs.readFileSync(otherFile, 'utf-8');
                const parsed = parseFrontmatter(raw);
                if (!parsed) continue;

                const { frontmatter, body } = parsed;
                const { trailingRefs: tRefs, trailingRefStart } = parseTrailingRefs(body);
                let contentBody = stripTrailingRefs(body, trailingRefStart);

                // Also unlink body refs in these files if requested
                if (unlinkBodyRefs) {
                  contentBody = unlinkWikiRefs(contentBody, uid, deletedName);
                }

                // Filter out refs to the deleted uid
                const filteredRefs = tRefs.filter(r => r.uid !== uid);

                // Serialize back using clean reconstruction
                const newRaw = serializeFieldnote(frontmatter, contentBody, filteredRefs);
                fs.writeFileSync(otherFile, newRaw, 'utf-8');
              }
            }

            // 2. Unlink body refs in notes that only have body refs (not in trailingRefUids)
            if (unlinkBodyRefs) {
              const allFieldnotes = cachedFieldnotes?.posts || [];
              const alreadyProcessed = new Set(trailingRefUids || []);
              for (const post of allFieldnotes) {
                if (post.id === uid || alreadyProcessed.has(post.id)) continue;
                const otherFile = path.join(FIELDNOTES_DIR, `${post.id}.md`);
                if (!fs.existsSync(otherFile)) continue;
                const raw = fs.readFileSync(otherFile, 'utf-8');
                // Quick check — skip files that don't mention the uid at all
                if (!raw.includes(uid)) continue;
                const parsed = parseFrontmatter(raw);
                if (!parsed) continue;
                const { frontmatter, body } = parsed;
                const { trailingRefs: tRefs, trailingRefStart } = parseTrailingRefs(body);
                const contentBody = stripTrailingRefs(body, trailingRefStart);
                const unlinked = unlinkWikiRefs(contentBody, uid, deletedName);
                if (unlinked !== contentBody) {
                  const newRaw = serializeFieldnote(frontmatter, unlinked, tRefs);
                  fs.writeFileSync(otherFile, newRaw, 'utf-8');
                }
              }
            }

            // 3. Delete source file
            fs.unlinkSync(sourceFile);

            // 3. Delete compiled output
            const compiledFile = path.join(FIELDNOTES_CONTENT_DIR, `${uid}.json`);
            if (fs.existsSync(compiledFile)) {
              fs.unlinkSync(compiledFile);
            }

            // 4. Full rebuild
            const { fieldnotePosts, uidToMeta } = fullRebuild();
            cachedFieldnotes = { posts: fieldnotePosts, uidToMeta };

            // 5. HMR notification
            server.ws.send({
              type: 'custom',
              event: 'fieldnote-update',
              data: { uid, action: 'delete' },
            });

            return sendJson(res, { ok: true });
          } catch (err) {
            return sendJson(res, { error: err.message }, 500);
          }
        }

        // ── POST /api/fieldnotes/convert-to-stub ──
        // Clears body content but preserves frontmatter + trailing refs
        if (req.url === '/api/fieldnotes/convert-to-stub' && req.method === 'POST') {
          try {
            const { uid } = await readBody(req);
            if (!uid) return sendJson(res, { error: 'Missing uid' }, 400);

            const filePath = path.join(FIELDNOTES_DIR, `${uid}.md`);
            if (!fs.existsSync(filePath)) {
              return sendJson(res, { error: 'File not found' }, 404);
            }

            const raw = fs.readFileSync(filePath, 'utf-8');
            const parsed = parseFrontmatter(raw);
            if (!parsed) {
              return sendJson(res, { error: 'Invalid frontmatter' }, 400);
            }

            const { frontmatter, body } = parsed;
            const { trailingRefs: tRefs } = parseTrailingRefs(body);

            // Replace body with a random stub phrase, keep trailing refs
            const stubBody = randomStubPhrase();
            const newRaw = serializeFieldnote(frontmatter, stubBody, tRefs);
            fs.writeFileSync(filePath, newRaw, 'utf-8');

            // Full rebuild
            const { fieldnotePosts, uidToMeta } = fullRebuild();
            cachedFieldnotes = { posts: fieldnotePosts, uidToMeta };

            // HMR notification
            server.ws.send({
              type: 'custom',
              event: 'fieldnote-update',
              data: { uid, action: 'stub' },
            });

            return sendJson(res, { ok: true });
          } catch (err) {
            return sendJson(res, { error: err.message }, 500);
          }
        }

        // ── POST /api/fieldnotes/validate ──
        if (req.url === '/api/fieldnotes/validate' && req.method === 'POST') {
          try {
            const { raw } = await readBody(req);
            if (!raw) {
              return sendJson(res, { error: 'Missing raw' }, 400);
            }

            const allFieldnotes = cachedFieldnotes?.posts || [];
            const issues = validateRaw(raw, allFieldnotes);
            return sendJson(res, { issues });
          } catch (err) {
            return sendJson(res, { error: err.message }, 500);
          }
        }

        // ── GET /api/fieldnotes/index ──
        if (req.url === '/api/fieldnotes/index' && req.method === 'GET') {
          if (!cachedFieldnotes) {
            const { fieldnotePosts, uidToMeta } = loadAllFieldnotes();
            cachedFieldnotes = { posts: fieldnotePosts, uidToMeta };
          }
          return sendJson(res, {
            notes: cachedFieldnotes.posts.map(({ content, ...meta }) => meta),
          });
        }

        next();
      });
    },
  };
}
