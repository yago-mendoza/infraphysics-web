// Static cheatsheet panel showing custom syntax features
// Two-column: syntax → description

import React from 'react';

const FEATURES = [
  { syntax: '[[uid]]', desc: 'Wiki-link to a fieldnote (by UID)' },
  { syntax: '[[uid|display]]', desc: 'Wiki-link with custom display text' },
  { syntax: '[[projects/slug|Text]]', desc: 'Cross-doc link (projects, threads, bits2bricks)' },
  { syntax: '[[https://url|Text]]', desc: 'External URL link' },
  { syntax: '---\\n[[uid]] :: annotation', desc: 'Trailing ref (interaction) — must have :: annotation' },
  { syntax: '{bkqt/note}...{/bkqt}', desc: 'Typed blockquote (note, tip, warning, danger, keyconcept, quote)' },
  { syntax: '{bkqt/quote|Author}...{/bkqt}', desc: 'Blockquote with attribution' },
  { syntax: '{{ref|explanation}}', desc: 'Inline annotation (footnote-style)' },
  { syntax: '{#ff0:text}', desc: 'Colored text (hex or named color)' },
  { syntax: '{^:text}', desc: 'Superscript' },
  { syntax: '{v:text}', desc: 'Subscript' },
  { syntax: '{kbd:key}', desc: 'Keyboard key' },
  { syntax: '{shout:text}', desc: 'Shout (large text)' },
  { syntax: '{dots}', desc: 'Dot separator (· · ·)' },
  { syntax: '_underlined_', desc: 'Underlined text' },
  { syntax: '--accented--', desc: 'Accent-colored text' },
  { syntax: '- term:: definition', desc: 'Definition list' },
  { syntax: 'a. item  b. item', desc: 'Alphabetical list (a./A.)' },
  { syntax: '>> 26.02.15 - text', desc: 'Context annotation (timestamped note)' },
  { syntax: '![alt](url "left:200px")', desc: 'Side image (left/right with optional width)' },
  { syntax: '> small text', desc: 'Blockquote → small text (not standard blockquote)' },
];

export const SyntaxCheatsheet: React.FC = () => (
  <div className="overflow-y-auto thin-scrollbar p-4 space-y-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
    <h3 className="text-xs text-th-secondary uppercase tracking-wider mb-3">Custom Syntax</h3>
    {FEATURES.map((f, i) => (
      <div key={i} className="flex gap-3 py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <code className="text-[10px] text-violet-400 whitespace-nowrap flex-shrink-0 font-mono" style={{ minWidth: 200 }}>
          {f.syntax}
        </code>
        <span className="text-[11px] text-th-secondary">{f.desc}</span>
      </div>
    ))}
  </div>
);
