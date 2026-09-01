// Shared utility for resolving wiki-links at runtime

import { FieldNoteMeta } from '../types';
import { WIKI_REF_ICON_HTML } from './icons';
import { secondBrainPath } from '../config/categories';

export function resolveWikiLinks(
  html: string,
  allFieldNotes: FieldNoteMeta[],
  noteMap?: Map<string, FieldNoteMeta>,
): { html: string; resolvedRefs: string[] } {
  const resolvedRefs: string[] = [];

  const processed = html.replace(
    /<a class="wiki-ref" data-uid="([^"]+)">([^<]+)<\/a>/g,
    (_match, uid: string, displayText: string) => {
      const target = noteMap ? noteMap.get(uid) : allFieldNotes.find(n => n.id === uid);

      if (target) {
        resolvedRefs.push(uid);
        const title = encodeURIComponent(target.name || target.displayTitle || displayText);
        const desc = encodeURIComponent(target.description || '');
        const address = encodeURIComponent(target.address || '');
        return `<a class="wiki-ref wiki-ref-resolved" href="${secondBrainPath(target.id)}" data-uid="${uid}" data-title="${title}" data-description="${desc}" data-address="${address}"><span class="wiki-ref-label">${displayText}</span>${WIKI_REF_ICON_HTML}</a>`;
      } else {
        return displayText;
      }
    }
  );

  return { html: processed, resolvedRefs };
}
