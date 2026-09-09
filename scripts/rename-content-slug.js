// node scripts/rename-content-slug.js <category> <id-or-slug> <new-slug> [--apply]
import fs from 'node:fs';
import path from 'node:path';
import { readContentFiles, routeEntries, pagesDir } from './content-files.js';
import { createContentRoutes } from '../src/lib/content/routes.js';

const [category, key, slug] = process.argv.slice(2);
const files = readContentFiles();
const routes = createContentRoutes(routeEntries(files));
const entry = routes.resolve(routes.path(category, key));
const file = files.find(f => f.category === category && f.id === entry?.id);
if (!file || !slug) throw new Error('Usage: node scripts/rename-content-slug.js <category> <id-or-slug> <new-slug> [--apply]');
if (slug === file.slug) { console.log('Slug already current.'); process.exit(0); }
const aliases = [...new Set([...file.aliases, file.slug])].filter(a => a !== slug);
createContentRoutes(files.map(f => f === file ? { ...f, slug, aliases } : f));
const target = path.resolve(path.dirname(file.file), `${slug}.md`);
if (!target.startsWith(path.resolve(pagesDir) + path.sep)) throw new Error('Target outside pages');
if (fs.existsSync(target)) throw new Error(`Target exists: ${target}`);
console.log(`${file.filename} -> ${slug}.md; retained aliases: ${aliases.join(', ')}`);
if (process.argv.includes('--apply')) {
  const newline = file.raw.includes('\r\n') ? '\r\n' : '\n';
  // Change only the YAML block. Body text and stable identities are preserved.
  const raw = file.raw.replace(/^(---\r?\n)([\s\S]*?)(\r?\n---)/, (_, open, yaml, close) => {
    let next = yaml.replace(/^slug:.*$/m, `slug: ${slug}`);
    if (/^slugAliases:/m.test(next)) {
      next = next.replace(/^slugAliases:[^\r\n]*(?:\r?\n(?:[ \t]+[^\r\n]*|-[ \t]+[^\r\n]*|#[^\r\n]*|(?=\r?\n)))*/m, `slugAliases: ${JSON.stringify(aliases)}`);
    } else next += `${newline}slugAliases: ${JSON.stringify(aliases)}`;
    return open + next + close;
  });
  fs.writeFileSync(file.file, raw);
  fs.renameSync(file.file, target);
  console.log('Run npm run build to regenerate routes and public links.');
}
