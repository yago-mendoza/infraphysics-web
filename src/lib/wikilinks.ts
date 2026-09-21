// Shared utility for resolving wiki-links at runtime. A resolved link is the
// label alone: the wiki icon that used to follow it was removed on 2026-09-18
// at the author's request (every link to the wiki, everywhere).

import { WikiNoteMeta } from '../types';
import { secondBrainPath } from '../config/categories';

export function resolveWikiLinks(
  html: string,
  allWikiNotes: WikiNoteMeta[],
  noteMap?: Map<string, WikiNoteMeta>,
): { html: string; resolvedRefs: string[] } {
  const resolvedRefs: string[] = [];

  const processed = html.replace(
    /<a class="wiki-ref" data-uid="([^"]+)">([^<]+)<\/a>/g,
    (_match, uid: string, displayText: string) => {
      const target = noteMap ? noteMap.get(uid) : allWikiNotes.find(n => n.id === uid);

      if (target) {
        resolvedRefs.push(uid);
        const title = encodeURIComponent(target.name || target.displayTitle || displayText);
        const desc = encodeURIComponent(target.description || '');
        const address = encodeURIComponent(target.address || '');
        return `<a class="wiki-ref wiki-ref-resolved" href="${secondBrainPath(target.id)}" data-uid="${uid}" data-title="${title}" data-description="${desc}" data-address="${address}"><span class="wiki-ref-label">${displayText}</span></a>`;
      } else {
        return displayText;
      }
    }
  );

  return { html: processed, resolvedRefs };
}
