// Shared utility for resolving wiki-links at runtime

import { FieldNoteMeta } from '../types';
import { WIKI_REF_ICON_HTML } from './icons';
import { secondBrainPath } from '../config/categories';

export function resolveWikiLinks(
  html: string,
  allFieldNotes: FieldNoteMeta[],
  noteMap?: Map<string, FieldNoteMeta>,
): { html: string; resolvedRefs: string[]; unresolvedRefs: string[] } {
  const resolvedRefs: string[] = [];
  const unresolvedRefs: string[] = [];

  const processed = html.replace(
    /<a class="wiki-ref" data-uid="([^"]+)">([^<]+)<\/a>/g,
    (_match, uid: string, displayText: string) => {
      const target = noteMap ? noteMap.get(uid) : allFieldNotes.find(n => n.id === uid);

      if (target) {
        resolvedRefs.push(uid);
        const title = encodeURIComponent(target.name || target.displayTitle || displayText);
        const desc = encodeURIComponent(target.description || '');
        const address = encodeURIComponent(target.address || '');
        return `<a class="wiki-ref wiki-ref-resolved" href="${secondBrainPath(target.id)}" data-uid="${uid}" data-title="${title}" data-description="${desc}" data-address="${address}">${displayText}${WIKI_REF_ICON_HTML}</a>`;
      } else {
        unresolvedRefs.push(uid);
        return `<span class="wiki-ref wiki-ref-unresolved" data-uid="${uid}" title="Note does not exist">${displayText}<sup class="wiki-ref-icon">?</sup></span>`;
      }
    }
  );

  return { html: processed, resolvedRefs, unresolvedRefs };
}
