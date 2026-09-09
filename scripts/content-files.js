import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { fileURLToPath } from 'node:url';
import { createContentRoutes, slugify, isReservedSlug } from '../src/lib/content/routes.js';

export const pagesDir = fileURLToPath(new URL('../src/data/pages/', import.meta.url));
export function readContentFiles() {
  return ['projects', 'essays', 'bits2bricks', 'wikinotes'].flatMap(category =>
    fs.readdirSync(path.join(pagesDir, category)).filter(f => f.endsWith('.md') && !f.startsWith('_')).flatMap(filename => {
      const file = path.join(pagesDir, category, filename);
      const raw = fs.readFileSync(file, 'utf8');
      const { data, content } = matter(raw);
      const id = data.uid || data.id;
      return id ? [{ category, id: String(id), slug: data.slug, aliases: data.slugAliases || [], file, filename, raw, data, content }] : [];
    }));
}

export function routeEntries(files = readContentFiles()) {
  for (const f of files) if (f.filename !== `${f.slug}.md`) throw new Error(`Filename must match slug: ${f.file}`);
  const entries = files.map(({ category, id, slug, aliases }) => ({ category, id, slug, aliases }));
  createContentRoutes(entries);
  return entries;
}

export function chooseWikiSlug(address, used) {
  const parts = address.split('//').map(p => p.trim());
  for (let depth = 1; depth <= parts.length; depth++) {
    const slug = slugify([parts.at(-1), ...parts.slice(-depth, -1)].join('-'));
    if (slug && slug !== 'graph' && !isReservedSlug(slug) && !used.has(slug)) return slug;
  }
  throw new Error(`Choose an explicit, unique slug for ${address}`);
}
