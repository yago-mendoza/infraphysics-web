// Dev-only Vite plugin: keeps the CDN in step with media/ while `npm run dev` runs.
// On server start it runs `scripts/media.js sync --soft` once (no-op in well under a
// second when nothing changed), then watches media/ and re-runs the sync whenever a
// master is added or replaced. So a file dropped into media/articles/<id>/figures/
// is on the CDN a few seconds later, without a manual push. Never fails the server:
// without R2 credentials the sync prints one line and skips.

import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MEDIA_DIR = path.join(ROOT, 'media');
const SCRIPT = path.join(ROOT, 'scripts', 'media.js');
const DEBOUNCE_MS = 800;

export function mediaSyncPlugin() {
  let running = null;
  let queued = false;
  let timer = null;

  const runSync = (logger) => {
    if (running) { queued = true; return running; }
    running = new Promise(resolve => {
      const child = spawn(process.execPath, [SCRIPT, 'sync', '--soft'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
      const relay = (chunk) => { const text = chunk.toString().trimEnd(); if (text) logger.info(text.split('\n').map(line => `  [media] ${line}`).join('\n')); };
      child.stdout.on('data', relay);
      child.stderr.on('data', relay);
      child.on('close', () => { running = null; if (queued) { queued = false; runSync(logger); } resolve(); });
      child.on('error', error => { logger.warn(`  [media] sync could not start: ${error.message}`); running = null; resolve(); });
    });
    return running;
  };

  return {
    name: 'infraphysics-media-sync',
    apply: /** @type {const} */ ('serve'),
    configureServer(server) {
      const logger = server.config.logger;
      runSync(logger);
      server.watcher.add(MEDIA_DIR);
      const onChange = (file) => {
        const rel = path.relative(MEDIA_DIR, file);
        if (rel.startsWith('..') || rel.startsWith('.cache') || path.basename(file).startsWith('.')) return;
        clearTimeout(timer);
        timer = setTimeout(() => runSync(logger), DEBOUNCE_MS);
      };
      server.watcher.on('add', onChange);
      server.watcher.on('change', onChange);
    },
  };
}
