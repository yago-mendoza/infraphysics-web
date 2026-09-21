import type { WikiNoteMeta } from '../types';

export type WikiLens = 'orphans' | 'bridges' | 'cited' | 'trail';
export function matchesWikiName(note: WikiNoteMeta, query: string): boolean {
  const q = query.trim().toLocaleLowerCase();
  return [note.name || note.title.split('//').at(-1), note.displayTitle, ...(note.aliases ?? [])]
    .some(name => name?.toLocaleLowerCase().includes(q));
}

/** Selection paints only the selected node's address descendants, never incoming-reference walks. */
export function branchDepths(nodes: Array<{ id: string; address: string }>, id: string | null): Map<string, number> {
  const depths = new Map<string, number>();
  const parent = nodes.find(node => node.id === id);
  if (!parent) return depths;
  const depth = parent.address.split('//').length;
  for (const node of nodes) {
    if (node.address.startsWith(parent.address + '//')) depths.set(node.id, node.address.split('//').length - depth);
  }
  return depths;
}
