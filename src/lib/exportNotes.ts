// Export fieldnotes as LLM-friendly markdown.
// Pure functions — no React dependency.

import type { FieldNoteMeta } from '../types';
import type { Connection } from './brainIndex';

export interface ExportResult {
  markdown: string;
  noteCount: number;
  wordEstimate: number;
}

export interface ExportOptions {
  /** Full = fetch body + annotated interactions. Metadata = description one-liner + bare interactions. */
  fullMode: boolean;
  /** Header line above the exported block (e.g. filter description). */
  header?: string;
}

// ---------------------------------------------------------------------------
// HTML → plain text
// ---------------------------------------------------------------------------

/** Convert compiled fieldnote HTML to plain text, preserving wiki-link UIDs. */
export function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Convert wiki-ref links → [[uid|text]]
  doc.querySelectorAll('a.wiki-ref-resolved').forEach(a => {
    const uid = a.getAttribute('data-uid') || '';
    const text = a.textContent || '';
    const replacement = doc.createTextNode(`[[${uid}|${text}]]`);
    a.replaceWith(replacement);
  });

  // Convert list items to bullets (handle nested lists via indentation)
  const processListItems = (root: Element, indent = 0): string => {
    const lines: string[] = [];
    for (const child of Array.from(root.children)) {
      if (child.tagName === 'LI') {
        // Get direct text content (exclude nested <ul>/<ol>)
        const clone = child.cloneNode(true) as Element;
        clone.querySelectorAll('ul, ol').forEach(sub => sub.remove());
        const prefix = '  '.repeat(indent) + '- ';
        lines.push(prefix + clone.textContent!.trim());
        // Process nested lists
        child.querySelectorAll(':scope > ul, :scope > ol').forEach(sub => {
          lines.push(processListItems(sub, indent + 1));
        });
      }
    }
    return lines.join('\n');
  };

  // Process all top-level lists
  doc.body.querySelectorAll(':scope > ul, :scope > ol').forEach(list => {
    const text = processListItems(list);
    const replacement = doc.createTextNode(text + '\n');
    list.replaceWith(replacement);
  });

  // Strip remaining tags, collapse whitespace
  let text = doc.body.textContent || '';
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

// ---------------------------------------------------------------------------
// Single note formatting
// ---------------------------------------------------------------------------

export function formatNoteSection(
  note: FieldNoteMeta,
  connections: Connection[],
  opts: ExportOptions,
): string {
  const lines: string[] = [];

  // Header: ## Address [uid]
  lines.push(`## ${note.address || note.title} [${note.id}]`);
  lines.push(`date: ${note.date?.slice(0, 10) || 'unknown'}`);

  if (opts.fullMode) {
    // Body will be injected by caller (requires async fetch)
    lines.push(''); // placeholder — caller splices body here
    lines.push('{{BODY}}');
  } else {
    // Metadata mode: description one-liner
    if (note.description) {
      lines.push(`description: ${note.description}`);
    }
  }

  // Interactions
  if (connections.length > 0) {
    lines.push('');
    lines.push('### Interactions');
    for (const conn of connections) {
      const label = `[[${conn.note.id}|${conn.note.name || conn.note.title}]]`;
      if (opts.fullMode) {
        const annotation = conn.annotation || conn.reverseAnnotation || '';
        lines.push(`- ${label}${annotation ? ' :: ' + annotation : ''}`);
      } else {
        lines.push(`- ${label}`);
      }
    }
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Batch export
// ---------------------------------------------------------------------------

export async function exportNotesAsMarkdown(
  notes: FieldNoteMeta[],
  connectionsMap: Map<string, Connection[]>,
  opts: ExportOptions,
): Promise<ExportResult> {
  const sections: string[] = [];

  // Header
  if (opts.header) {
    sections.push(`# ${opts.header}`);
    sections.push(`${notes.length} notes exported\n`);
  }

  if (opts.fullMode) {
    // Batch-fetch content for all notes
    const fetches = notes.map(async (note) => {
      try {
        const resp = await fetch(`/fieldnotes/${note.id}.json`);
        if (!resp.ok) return { uid: note.id, body: '[content unavailable]' };
        const { content } = await resp.json();
        return { uid: note.id, body: htmlToText(content) };
      } catch {
        return { uid: note.id, body: '[content unavailable]' };
      }
    });

    const results = await Promise.allSettled(fetches);
    const bodyMap = new Map<string, string>();
    for (const r of results) {
      if (r.status === 'fulfilled') bodyMap.set(r.value.uid, r.value.body);
    }

    for (const note of notes) {
      const conns = connectionsMap.get(note.id) || [];
      let section = formatNoteSection(note, conns, opts);
      const body = bodyMap.get(note.id) || '[content unavailable]';
      section = section.replace('{{BODY}}', body);
      sections.push(section);
    }
  } else {
    for (const note of notes) {
      const conns = connectionsMap.get(note.id) || [];
      let section = formatNoteSection(note, conns, opts);
      section = section.replace('\n\n{{BODY}}', '');
      sections.push(section);
    }
  }

  const markdown = sections.join('\n\n---\n\n');
  const wordEstimate = markdown.split(/\s+/).filter(Boolean).length;

  return { markdown, noteCount: notes.length, wordEstimate };
}

// ---------------------------------------------------------------------------
// Quick word estimate from searchText (no fetch needed)
// ---------------------------------------------------------------------------

export function estimateWords(notes: FieldNoteMeta[]): number {
  let total = 0;
  for (const n of notes) {
    total += (n.searchText || '').split(/\s+/).filter(Boolean).length;
  }
  return total;
}
