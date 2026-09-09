/** Deterministic binary treemap. Areas are proportional to weight; every leaf fills its partition. */
export function partitionAreas<T extends { id: string; count: number }>(items: T[], width: number, height: number) {
  const result: (T & { x: number; y: number; width: number; height: number })[] = [];
  const split = (nodes: T[], x: number, y: number, w: number, h: number) => {
    if (!nodes.length) return;
    if (nodes.length === 1) { result.push({ ...nodes[0], x, y, width: w, height: h }); return; }
    const total = nodes.reduce((sum, n) => sum + n.count, 0);
    let index = 1, first = nodes[0].count;
    while (index < nodes.length - 1 && Math.abs(first + nodes[index].count - total / 2) < Math.abs(first - total / 2)) first += nodes[index++].count;
    const ratio = first / total;
    if (w >= h) {
      split(nodes.slice(0, index), x, y, w * ratio, h);
      split(nodes.slice(index), x + w * ratio, y, w * (1 - ratio), h);
    } else {
      split(nodes.slice(0, index), x, y, w, h * ratio);
      split(nodes.slice(index), x, y + h * ratio, w, h * (1 - ratio));
    }
  };
  split([...items].filter(n => n.count > 0).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id)), 0, 0, width, height);
  return result;
}
