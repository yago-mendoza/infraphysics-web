/** Place labels nearest their content coordinates, using their rendered size.
 * Pure and deterministic for a given viewport; scoring remains build-time only.
 */
export function placeFieldLabels(items, width, height, gap = 8) {
  const placed = [];
  const inset = 10;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  for (const item of items) {
    const halfW = item.width / 2;
    const halfH = item.height / 2;
    const minX = inset + halfW, maxX = width - inset - halfW;
    const minY = 38 + halfH, maxY = height - 38 - halfH;
    const targetX = item.x * width / 100;
    const targetY = (100 - item.y) * height / 100;
    const xs = [targetX, minX, maxX];
    const ys = [targetY, minY, maxY];
    for (const p of placed) {
      xs.push(p.left - gap - halfW, p.right + gap + halfW);
      ys.push(p.top - gap - halfH, p.bottom + gap + halfH);
    }
    let best;
    for (const rawX of xs) for (const rawY of ys) {
      const x = clamp(rawX, minX, maxX), y = clamp(rawY, minY, maxY);
      const box = { left: x - halfW, right: x + halfW, top: y - halfH, bottom: y + halfH };
      if (placed.some(p => box.left < p.right + gap - 0.01 && box.right > p.left - gap + 0.01 && box.top < p.bottom + gap - 0.01 && box.bottom > p.top - gap + 0.01)) continue;
      const cost = (x - targetX) ** 2 + (y - targetY) ** 2;
      if (!best || cost < best.cost) best = { ...box, x, y, cost };
    }
    // The Home map is capped at eight labels. Keep a bounded fallback for tiny embeds.
    const p = best || { x: clamp(targetX, minX, maxX), y: clamp(targetY, minY, maxY), left: minX - halfW, right: maxX + halfW, top: minY - halfH, bottom: maxY + halfH };
    placed.push(p);
  }
  return placed.map(p => ({ x: p.x / width * 100, y: 100 - p.y / height * 100 }));
}
