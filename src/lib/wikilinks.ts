// Shared utility for resolving wiki-links at runtime

import { Post } from '../types';

export function resolveWikiLinks(
  html: string,
  allFieldNotes: Post[],
): { html: string; resolvedRefs: string[]; unresolvedRefs: string[] } {
  const resolvedRefs: string[] = [];
  const unresolvedRefs: string[] = [];

  const processed = html.replace(
    /<a class="wiki-ref" data-address="([^"]+)">([^<]+)<\/a>/g,
    (_match, address: string, displayText: string) => {
      const targetId = address.toLowerCase().replace(/\/\//g, '--').replace(/\s+/g, '-');
      const target = allFieldNotes.find(n => n.id === targetId);

      if (target) {
        resolvedRefs.push(address);
        return `<a class="wiki-ref wiki-ref-resolved" href="/second-brain/${target.id}" data-address="${address}">${displayText}</a>`;
      } else {
        unresolvedRefs.push(address);
        return `<span class="wiki-ref wiki-ref-unresolved" data-address="${address}">${displayText}</span>`;
      }
    }
  );

  return { html: processed, resolvedRefs, unresolvedRefs };
}
