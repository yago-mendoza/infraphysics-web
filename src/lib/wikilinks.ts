// Shared utility for resolving wiki-links at runtime

import { FieldNote } from '../types';
import { addressToId } from './addressToId';

export function resolveWikiLinks(
  html: string,
  allFieldNotes: FieldNote[],
  noteMap?: Map<string, FieldNote>,
): { html: string; resolvedRefs: string[]; unresolvedRefs: string[] } {
  const resolvedRefs: string[] = [];
  const unresolvedRefs: string[] = [];

  const processed = html.replace(
    /<a class="wiki-ref" data-address="([^"]+)">([^<]+)<\/a>/g,
    (_match, address: string, displayText: string) => {
      const targetId = addressToId(address);
      const target = noteMap ? noteMap.get(targetId) : allFieldNotes.find(n => n.id === targetId);

      if (target) {
        resolvedRefs.push(address);
        const title = encodeURIComponent(target.displayTitle || displayText);
        const desc = encodeURIComponent(target.description || '');
        return `<a class="wiki-ref wiki-ref-resolved" href="/lab/second-brain/${target.id}" data-address="${address}" data-title="${title}" data-description="${desc}">${displayText}<sup class="wiki-ref-icon">\u25C7</sup></a>`;
      } else {
        unresolvedRefs.push(address);
        return `<span class="wiki-ref wiki-ref-unresolved" data-address="${address}">${displayText}<sup class="wiki-ref-icon">?</sup></span>`;
      }
    }
  );

  return { html: processed, resolvedRefs, unresolvedRefs };
}
