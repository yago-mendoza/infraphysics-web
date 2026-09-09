// Dry-run first; --apply preserves a complete source backup before mutation.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { readContentFiles, chooseWikiSlug, pagesDir } from './content-files.js';
import { createContentRoutes, slugify } from '../src/lib/content/routes.js';

const files = readContentFiles();
const articleSlugs = {
  '2718281': 'trialgpt-clinical-trial-matching',
  '6184744': 'building-infraphysics',
  '1112121': 'investment-dashboard',
  '3141592': 'health-tech-crm',
  '7654321': 'forecasting-visual-auras',
  '6616933': 'the-moving-ceiling-of-ai',
  '2929333': 'the-palest-ink',
  '9962668': 'chain-of-thought-monitoring',
  '3142718': 'two-tank-fault-detection',
};
const used = new Map();
for (const f of files) {
  if (!used.has(f.category)) used.set(f.category, new Set(files.filter(x => x.category === f.category).flatMap(x => [x.id, x.slug, ...x.aliases]).filter(Boolean)));
}
const plan = files.map(f => {
  const slug = f.slug || (f.category === 'wikinotes' ? chooseWikiSlug(f.data.address, used.get(f.category)) : articleSlugs[f.id] || slugify(f.data.displayTitle || f.data.title));
  if (!f.slug && used.get(f.category).has(slug)) throw new Error(`Choose article slug: ${f.filename}: ${slug}`);
  used.get(f.category).add(slug);
  const target = path.join(path.dirname(f.file), `${slug}.md`);
  if (!path.resolve(target).startsWith(path.resolve(pagesDir) + path.sep)) throw new Error('Target outside pages');
  if (target !== f.file && fs.existsSync(target)) throw new Error(`Target exists: ${target}`);
  return { ...f, slug, target };
});
createContentRoutes(plan);
if (plan.every(f => f.slug === f.data.slug && f.file === f.target)) {
  console.log('Content already migrated; existing migration report preserved.');
  process.exit(0);
}
const report = plan.map(({ category, id, filename, slug, raw }) => ({ category, id, from: filename, to: `${slug}.md`, sha256: createHash('sha256').update(raw).digest('hex') }));
fs.mkdirSync('room/content-slugs', { recursive: true });
fs.writeFileSync('room/content-slugs/migration.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes('--apply')) {
  const backup = path.resolve('C:/Dev/infraphysics-slug-backup-' + new Date().toISOString().replace(/[:.]/g, '-'));
  fs.mkdirSync(backup);
  for (const entry of ['src', 'scripts', 'functions', 'public', 'README.md', 'CLAUDE.md', 'dev-scripts']) fs.cpSync(entry, path.join(backup, entry), { recursive: true });
  fs.writeFileSync(path.join(backup, 'migration.json'), JSON.stringify(report, null, 2));
  for (const f of plan) {
    if (f.slug === f.data.slug && f.file === f.target) continue;
    const newline = f.raw.includes('\r\n') ? '\r\n' : '\n';
    const raw = f.data.slug ? f.raw : f.raw.replace(/^(---\r?\n)/, `$1slug: ${f.slug}${newline}`);
    fs.writeFileSync(f.file, raw);
    if (f.file !== f.target) fs.renameSync(f.file, f.target);
  }
  console.log(`Migrated ${plan.length} files. Backup: ${backup}`);
}
