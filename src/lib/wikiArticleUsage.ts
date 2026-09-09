/** Count distinct public articles with an explicit body link, never weighted scores or tags. */
export function computeWikiArticleUsage(candidates: { sources: { id: string; title: string; category: string; linkedConcepts: string[] }[] }[]) {
  const usage = new Map<string, Map<string, { id: string; title: string; category: string }>>();
  for (const root of candidates) for (const source of root.sources) {
    for (const uid of source.linkedConcepts) {
      if (!usage.has(uid)) usage.set(uid, new Map());
      usage.get(uid)!.set(source.id, { id: source.id, title: source.title, category: source.category });
    }
  }
  return new Map([...usage].map(([uid, articles]) => [uid, [...articles.values()].sort((a, b) => a.id.localeCompare(b.id))]));
}

export function wikiRootCoverage(notes: { id: string; address?: string; title: string }[], selectedIds: Set<string>) {
  const roots = new Map<string, { root: string; total: number; matched: number; percent: number }>();
  for (const note of notes) {
    const root = (note.address || note.title).split('//')[0];
    if (!roots.has(root)) roots.set(root, { root, total: 0, matched: 0, percent: 0 });
    const row = roots.get(root)!;
    row.total++;
    if (selectedIds.has(note.id)) row.matched++;
    row.percent = 100 * row.matched / row.total;
  }
  return [...roots.values()].sort((a, b) => b.percent - a.percent || b.matched - a.matched || a.root.localeCompare(b.root));
}
