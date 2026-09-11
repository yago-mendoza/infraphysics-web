#!/usr/bin/env node
/**
 * Git pre-commit hook (wired through .githooks/pre-commit, see package.json "prepare"):
 * when the staged files touch what a share card shows (an article, a translation, the card
 * designs, a cover in the media manifest), photograph the cards that changed, upload them to R2
 * and stage the two manifests into this same commit, so the deploy leaves with the right cards.
 *
 * Never blocks a commit for want of tooling: without Chrome or R2 credentials it only warns.
 * Skip on purpose with SKIP_OG=1 (or git commit --no-verify). OG_PRECOMMIT_ALWAYS=1 runs it
 * whatever is staged (a check of the wiring).
 */
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const say = message => console.log(`og-precommit: ${message}`);

if (process.env.SKIP_OG) { say('skipped (SKIP_OG)'); process.exit(0); }

const staged = execSync('git diff --cached --name-only --diff-filter=ACMRD', { cwd: ROOT, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean).map(f => f.replace(/\\/g, '/'));
const guides = /\/(README|STYLE|VOICE|VISUAL|SYNTAX)\.md$/;
const touchesCards = f =>
  (f.startsWith('src/data/pages/') && f.endsWith('.md') && !guides.test(f)) ||
  f === 'src/views/shareCardDesigns.tsx' || f === 'src/styles/share-cards.css' || f === 'src/lib/shareCards.ts' ||
  f === 'src/views/OgCardView.tsx' || f === 'src/data/media-manifest.json';
const triggers = staged.filter(touchesCards);
if (!triggers.length && !process.env.OG_PRECOMMIT_ALWAYS) process.exit(0);

// Tooling present? Otherwise warn and let the commit through; the cards can be redone later with npm run og.
const env = {}; try { for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (m) env[m[1]] = m[2]; } } catch { /* no .env */ }
const creds = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'].every(k => env[k] || process.env[k]);
const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).some(p => fs.existsSync(p));
if (!creds || !chrome) { say(`${!creds ? 'no R2 credentials in .env' : 'no Chrome found'}: cards not regenerated for this commit, run npm run og later`); process.exit(0); }

say(`${triggers.length || 'no'} staged file(s) touch the share cards; refreshing them (SKIP_OG=1 to skip)`);
const run = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
const before = fs.readFileSync(path.join(ROOT, 'src/data/og-cards.json'), 'utf8');

// Fresh content first (the cards read the generated post and note indexes), then the cards (the script
// serves the site itself), then the content again so og-manifest.json points at the new cards.
if (run('npm', ['run', 'content']).status !== 0) { say('content build failed; commit aborted'); process.exit(1); }
const og = run('node', ['scripts/og-cards.js']);
if (og.status !== 0) say('some cards could not be rendered; the rest are in, run npm run og again for the missing ones');
if (fs.readFileSync(path.join(ROOT, 'src/data/og-cards.json'), 'utf8') === before) { say('no card changed'); process.exit(0); }
if (run('npm', ['run', 'content']).status !== 0) { say('content build failed after the cards; commit aborted'); process.exit(1); }
execSync('git add src/data/og-cards.json public/og-manifest.json', { cwd: ROOT, stdio: 'inherit' });
say('card manifests staged into this commit');
