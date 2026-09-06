/**
 * Canonical technology strip shared by project cards and project articles.
 * Topic tags remain searchable metadata; this list is strictly the visible
 * tool stack, normalised once so the two surfaces cannot drift apart.
 */
export const getProjectDisplayTechnologies = (technologies?: string[] | null): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of technologies ?? []) {
    const label = raw.trim();
    const key = label.toLocaleLowerCase();
    if (!label || seen.has(key)) continue;
    seen.add(key);
    result.push(label);
    if (result.length === 3) break;
  }
  return result;
};
