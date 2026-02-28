// Consolidated Second Brain guide modal — replaces all individual InfoPopovers.
// Two-column layout: left nav (sections/subsections) + right scrollable content.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronIcon } from './icons';

// --- Reuse tip classes from InfoPopover convention ---
const tipStrong = 'text-th-primary';
const tipAccent = 'text-violet-400';
const tipCode = 'text-violet-400/80';

// --- Section data ---
interface SubSection {
  label: string;
  content: React.ReactNode;
}
interface Section {
  label: string;
  localhostOnly?: boolean;
  subsections?: SubSection[];
  content?: React.ReactNode; // direct content (no subs)
}

const SECTIONS: Section[] = [
  {
    label: 'Getting Started',
    subsections: [
      {
        label: 'Overview',
        content: (
          <div className="space-y-3">
            <p>The Second Brain is a <strong className={tipStrong}>knowledge graph</strong> — a collection of short notes (called <em>concepts</em>) connected to each other through links. Instead of organizing ideas into folders, you navigate by following connections between related concepts.</p>
            <p>The <strong className={tipStrong}>grid</strong> is your starting point. Each card represents one concept. Click any card to read the full note and explore its connections.</p>
            <p>You don't need to browse manually — <strong className={tipStrong}>just start typing</strong> on your keyboard and the search bar opens automatically. Results filter live as you type.</p>
            <p>As you explore, the interface tracks where you've been: <span style={{ color: 'var(--wiki-link-visited)' }}>blue</span> names are notes you've already visited this session, <span className={tipAccent}>purple</span> ones are still unvisited. You'll see these colors everywhere — on grid cards, inside notes, and on the graph.</p>
            <p>The sidebar header has a <strong className={tipStrong}>mode toggle</strong> (<span className={tipAccent}>simple</span> / <span className={tipAccent}>technical</span>). Simplified mode shows just search, sort, and the directory tree — no topology, filters, or analytics. Switch anytime; your choice is remembered.</p>
            <p>You can switch between light and dark themes anytime. Use the theme button in the header, or press <code className={tipCode}>Shift+T</code> on desktop.</p>
          </div>
        ),
      },
      {
        label: 'Keyboard',
        content: (
          <div className="space-y-3">
            <p className="text-th-muted italic">Desktop only — these require a physical keyboard.</p>
            <p>When you're on the grid, you can navigate entirely with the keyboard:</p>
            <p><strong className={tipStrong}>Arrow keys</strong> move focus between cards. The focused card gets a subtle highlight.</p>
            <p><strong className={tipStrong}>Enter</strong> opens the focused card.</p>
            <p><strong className={tipStrong}>Escape</strong> clears whatever you've typed in the search bar and deselects the focused card.</p>
            <p><strong className={tipStrong}>Any letter key</strong> jumps straight into the search bar — no need to click it first.</p>
          </div>
        ),
      },
    ],
  },
  {
    label: 'Grid & Search',
    subsections: [
      {
        label: 'Search Modes',
        content: (
          <div className="space-y-3">
            <p>Above the grid, you'll see three search mode chips: <strong className={tipStrong}>name</strong>, <strong className={tipStrong}>content</strong>, and <strong className={tipStrong}>backlinks</strong>. These control <em>what</em> gets searched when you type:</p>
            <p><strong className={tipStrong}>Name</strong> matches against note titles and their address paths (the hierarchical name, like <code className={tipCode}>chip / MCU / ARM</code>).</p>
            <p><strong className={tipStrong}>Content</strong> does full-text search across the actual body of every note — useful when you remember a specific phrase but not which note it's in.</p>
            <p><strong className={tipStrong}>Backlinks</strong> works in reverse: type a concept name, and it returns every note that <em>links to</em> that concept. If "CPU" links to "ARM", searching backlinks for "ARM" will return "CPU".</p>
          </div>
        ),
      },
      {
        label: 'Filters',
        content: (
          <div className="space-y-3">
            <p>Below the search bar there's a collapsible <strong className={tipStrong}>filters</strong> panel. These narrow down which cards appear on the grid:</p>
            <p><strong className={tipStrong}>Isolated</strong> shows only notes with zero connections — they don't link anywhere and nothing links to them.</p>
            <p><strong className={tipStrong}>Leaf</strong> shows notes at the end of a naming branch. For example, if <code className={tipCode}>chip//MCU//ARM</code> has no sub-notes, ARM is a leaf.</p>
            <p><strong className={tipStrong}>Bridges</strong> highlights structurally critical notes. A bridge is a note that, if removed, would split its cluster of connected notes into separate groups. They're the glue holding parts of the graph together.</p>
            <p><strong className={tipStrong}>Island</strong> lets you pick a specific cluster of connected notes from a dropdown. Notes form islands based on their actual links — two notes in the same folder can belong to different islands if they aren't linked to each other.</p>
            <p><strong className={tipStrong}>Depth</strong> filters by hierarchy level. A root note like <code className={tipCode}>chip</code> has depth 1, <code className={tipCode}>chip//MCU</code> has depth 2, <code className={tipCode}>chip//MCU//ARM</code> has depth 3.</p>
            <p><strong className={tipStrong}>Hubs &ge; N</strong> shows only notes with at least N total connections (incoming + outgoing). Useful for finding the most interconnected concepts.</p>
            <p><strong className={tipStrong}>Heatmap</strong> is the calendar-style grid of colored squares. Click any day to filter notes created on that date. Click a second day to select a range.</p>
          </div>
        ),
      },
      {
        label: 'Sorting',
        content: (
          <div className="space-y-3">
            <p>The sort dropdown controls the order cards appear on the grid:</p>
            <p><strong className={tipStrong}>A–Z</strong> sorts alphabetically by note name.</p>
            <p><strong className={tipStrong}>Newest / Oldest</strong> sorts by creation date.</p>
            <p><strong className={tipStrong}>Most / Fewest links</strong> sorts by total connection count — outgoing links plus incoming mentions.</p>
            <p><strong className={tipStrong}>Depth</strong> sorts by how deep the note sits in the naming tree.</p>
            <p><strong className={tipStrong}>Shuffle</strong> randomizes the order. Click again to reshuffle — useful for serendipitous discovery.</p>
            <p>There's also an <strong className={tipStrong}>Unvisited</strong> toggle that hides cards you've already opened this session, so you can focus on what's left to explore.</p>
          </div>
        ),
      },
    ],
  },
  {
    label: 'Note Detail',
    subsections: [
      {
        label: 'Navigation',
        content: (
          <div className="space-y-3">
            <p>When you open a note, a <strong className={tipStrong}>breadcrumb trail</strong> appears at the top showing the path you took to get there. It's like browser history but visible — you can see the chain of concepts you followed.</p>
            <p>Click any crumb to jump back to that point. The first crumb, <strong className={tipStrong}>"all concepts"</strong>, always returns you to the grid.</p>
            <p>Following a link inside a note's body <strong className={tipStrong}>extends</strong> the trail — so you can trace exactly how you arrived at a particular concept. But clicking a card from the grid <strong className={tipStrong}>resets</strong> the trail, starting a fresh path.</p>
            <p>When the trail gets long, older crumbs collapse automatically to save space. They're still there — just hidden behind an overflow indicator.</p>
          </div>
        ),
      },
      {
        label: 'Page Layout',
        content: (
          <div className="space-y-3">
            <p>Each note page has a consistent structure from top to bottom:</p>
            <p>Right below the title you'll see <strong className={tipStrong}>colored names</strong> — these are <span className={tipAccent}>mentions</span>, other notes that link <em>to</em> the one you're reading. Think of them as "who references me?" Click any to visit that note.</p>
            <div className="border-t border-th-hub-border my-2" />
            <p>The note body itself contains <strong className={tipStrong}>highlighted words</strong> — these are outgoing links to other concepts. Click one to follow the connection.</p>
            <div className="border-t border-th-hub-border my-2" />
            <p>The <strong className={tipStrong}>address path</strong> below the title (e.g. <code className={tipCode}>chip / MCU / ARM</code>) shows where the note sits in the naming hierarchy. Each segment is clickable — tap an ancestor to navigate up the tree.</p>
            <p>The <strong className={tipStrong}>metadata line</strong> gives you a quick count: <code className={tipCode}>links ↓ N</code> = how many notes the current one links to, <code className={tipCode}>mentioned ↑ N</code> = how many notes link back here.</p>
          </div>
        ),
      },
      {
        label: 'Interactions',
        content: (
          <div className="space-y-3">
            <p>Below the note body, you may see a section called <strong className={tipStrong}>Interactions</strong>. These are different from regular links in the text.</p>
            <p>A regular link just says "A mentions B." An interaction is a <strong className={tipStrong}>curated, annotated relationship</strong> — it describes <em>how</em> two concepts relate. For example: "contrasts with", "depends on", "is an example of".</p>
            <p>Interactions are <strong className={tipStrong}>bilateral</strong>: if note A has an interaction with note B, it automatically shows up on both sides. You don't need to add it twice.</p>
            <p>Click any name in the interactions list to jump to that concept.</p>
          </div>
        ),
      },
      {
        label: 'Missing Links',
        content: (
          <div className="space-y-3">
            <p>At the bottom of some notes you'll see <strong className={tipStrong}>Missing Links</strong> — these are suggestions for connections that probably <em>should</em> exist but haven't been created yet.</p>
            <p>The algorithm behind it is simple: if two notes share many neighbors (they're both linked to the same concepts) but aren't linked to <em>each other</em>, they're likely related. The more neighbors they share, the stronger the suggestion.</p>
            <p>Each suggestion shows a <strong className={tipStrong}>"via"</strong> annotation listing the shared neighbors that triggered it — so you can see <em>why</em> the connection is being suggested.</p>
            <p>Only the top 3 strongest suggestions are shown, ranked by how many neighbors they have in common.</p>
          </div>
        ),
      },
    ],
  },
  {
    label: 'Sidebar',
    subsections: [
      {
        label: 'Stats',
        content: (
          <div className="space-y-3">
            <p>The <strong className={tipStrong}>Graph Stats</strong> section in the sidebar gives you a bird's-eye view of the entire knowledge base:</p>
            <p><strong className={tipStrong}>Concepts</strong> — total number of notes.</p>
            <p><strong className={tipStrong}>Links</strong> — total references between notes, counting both body links and explicit interactions.</p>
            <p><strong className={tipStrong}>Isolated</strong> — how many notes have zero connections to anything. A high number here means there are orphan notes waiting to be integrated.</p>
            <p><strong className={tipStrong}>Avg refs</strong> — the average number of links per note. Higher means the graph is more interconnected.</p>
            <p><strong className={tipStrong}>Max depth</strong> — the deepest level in the naming tree. For example, <code className={tipCode}>chip//MCU//ARM</code> has depth 3.</p>
            <p><strong className={tipStrong}>Density</strong> — what percentage of all <em>possible</em> connections actually exist. 100% would mean every note links to every other note (unrealistic, but the number gives you a sense of how tightly woven the graph is).</p>
            <p>Below the stats, a <strong className={tipStrong}>word count histogram</strong> shows the distribution of note lengths. Click any bar to filter the grid to notes within that word-count range.</p>
          </div>
        ),
      },
      {
        label: 'Directory',
        content: (
          <div className="space-y-3">
            <p>The <strong className={tipStrong}>Directory</strong> is a tree view that organizes notes by their <em>address</em> — a hierarchical naming path using <code className={tipCode}>//</code> as separator. For example, <code className={tipCode}>chip//MCU//ARM</code> means ARM lives under MCU, which lives under chip.</p>
            <p>This tree reflects how concepts are <em>named</em>, not how they're linked. Two notes in the same branch might not link to each other at all, and two heavily linked notes might live in completely different branches.</p>
            <p>Click a <strong className={tipStrong}>folder name</strong> (or the ⊙ icon) to <strong className={tipStrong}>scope</strong> the grid — only notes within that branch will appear. Click again to clear the scope.</p>
            <p>When you open a note, its branch <strong className={tipStrong}>auto-expands</strong> in the directory so you can see where you are in the tree.</p>
            <p>The <strong className={tipStrong}>small bars</strong> on the right side of each note show relative centrality — how many links that note has compared to others. Wider bar = more connected.</p>
            <p>Use the <strong className={tipStrong}>filter input</strong> at the top to search within the tree by name. When any filter, search, or scope is active, branches with no matching notes are hidden automatically.</p>
          </div>
        ),
      },
      {
        label: 'Topology',
        content: (
          <div className="space-y-3">
            <p>While the Directory groups notes by their names, <strong className={tipStrong}>Topology</strong> groups them by their actual connections. It answers: "which notes can reach each other through links?"</p>
            <p><strong className={tipStrong}>Islands</strong> are clusters of notes that are all reachable from each other by following links. Each island gets a numeric <span className={tipAccent}>#ID</span>. Two notes in the same directory folder can belong to different islands if nothing connects them.</p>
            <p>Notes marked with <strong className={tipStrong}>⚡ (bridges)</strong> are structurally critical — removing one would split its island into separate groups. They're the bottlenecks holding clusters together.</p>
            <p>Notes marked with <strong className={tipStrong}>○ (isolated)</strong> have zero connections to anything.</p>
            <p>Click the <strong className={tipStrong}>chevron</strong> next to any island to expand it and see all its members.</p>
            <p>When you're reading a note, you'll see an <strong className={tipStrong}>island badge</strong> near the title (e.g. <span className={tipAccent}>island #3</span>). Clicking that badge scrolls the sidebar to highlight the corresponding island here.</p>
            <p>Like the directory, topology auto-prunes when filters are active — islands with no matching notes disappear temporarily.</p>
          </div>
        ),
      },
    ],
  },
  {
    label: 'Neighborhood',
    content: (
      <div className="space-y-3">
        <p>When you're reading a note, a <strong className={tipStrong}>neighborhood graph</strong> appears on the right side showing the note's position in the naming hierarchy — its parent, siblings, and children based on the address path.</p>
        <p>The graph is divided into three <strong className={tipStrong}>zones</strong>: the parent sits above, siblings are on the same level, and children are below. Tap a zone to filter the leaderboard underneath it to only show notes from that zone.</p>
        <p>On desktop, you can also use <strong className={tipStrong}>arrow keys</strong> to switch between zones and navigate within them.</p>
        <p>The <strong className={tipStrong}>white bar</strong> represents the current note. Other notes follow the same color convention: <span style={{ color: 'var(--wiki-link-visited)' }}>blue</span> = visited, <span className={tipAccent}>purple</span> = not yet visited.</p>
        <p>Sometimes you'll see <strong className={tipStrong}>ghost dots</strong> — faint indicators that the same name exists under a different parent elsewhere in the tree. They help you spot when a concept appears in multiple places in the hierarchy.</p>
      </div>
    ),
  },
  {
    label: 'Editing',
    localhostOnly: true,
    subsections: [
      {
        label: 'Editor',
        content: (
          <div className="space-y-3">
            <p>The editing toolbar at the top of the page (visible only on localhost) lets you modify notes directly in the browser.</p>
            <p>Toggle <strong className={tipStrong}>Edit mode</strong> (pencil icon) to activate the editor panel. Once on, the editor opens automatically for every note you navigate to — you can browse and edit in one flow.</p>
            <p>When <strong className={tipStrong}>Auto-save</strong> is enabled (checkbox in the toolbar), your changes are saved automatically when you navigate away to another note. No need to save manually.</p>
            <p>The <strong className={tipStrong}>+ button</strong> creates a brand new note and opens it in the editor immediately. It also activates edit mode if it isn't already on.</p>
            <p>The <strong className={tipStrong}>dice button</strong> jumps to a random note — useful for review passes when you want to check notes you haven't looked at recently.</p>
          </div>
        ),
      },
      {
        label: 'Shortcuts',
        content: (
          <div className="space-y-3">
            <p>Inside the editor, type <code className={tipCode}>[[</code> to open <strong className={tipStrong}>wiki-link autocomplete</strong>. A dropdown appears where you can search by name, alias, or address. Select a result to insert a link to that note.</p>
            <p>The editor also detects <strong className={tipStrong}>unlinked terms</strong> — words in your note that match existing concept names but aren't linked yet. These show up as <span className={tipAccent}>purple highlights</span> in the text and as suggestions in the diagnostics panel below. Click <strong className={tipStrong}>[Yes]</strong> to convert a mention into a proper wiki-link, or <strong className={tipStrong}>[No]</strong> to dismiss.</p>
            <p>If your note's address implies a parent that doesn't exist yet, the diagnostics panel will flag it as a <strong className={tipStrong}>missing parent</strong>. Click <strong className={tipStrong}>[Create stub]</strong> to generate a placeholder note for that parent automatically.</p>
          </div>
        ),
      },
    ],
  },
];

// --- Component ---
interface Props {
  isOpen: boolean;
  onClose: () => void;
  isLocalhost: boolean;
}

export const SecondBrainGuide: React.FC<Props> = ({ isOpen, onClose, isLocalhost }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [activeSub, setActiveSub] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => new Set([0]));
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter out localhostOnly sections when not on localhost
  const visibleSections = SECTIONS.filter(s => !s.localhostOnly || isLocalhost);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setActiveSection(0);
      setActiveSub(0);
      setExpandedSections(new Set([0]));
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [isOpen, onClose]);

  const selectSection = useCallback((idx: number, subIdx = 0) => {
    setActiveSection(idx);
    setActiveSub(subIdx);
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    contentRef.current?.scrollTo({ top: 0 });
  }, []);

  const toggleExpanded = useCallback((idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  if (!isOpen) return null;

  const section = visibleSections[activeSection];
  const hasSubs = !!section?.subsections;
  const body = hasSubs
    ? section.subsections![activeSub]?.content
    : section?.content;
  const title = hasSubs
    ? `${section.label} — ${section.subsections![activeSub]?.label}`
    : section?.label;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative flex w-full max-w-3xl h-[85vh] border border-violet-500/20 rounded-sm shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--hub-sidebar-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left nav */}
        <nav className="w-48 flex-shrink-0 border-r border-th-hub-border overflow-y-auto hub-scrollbar py-3">
          {visibleSections.map((sec, i) => {
            const isActive = activeSection === i;
            const isExpanded = expandedSections.has(i);
            const hasSub = !!sec.subsections;

            return (
              <div key={sec.label}>
                {/* Parent label */}
                <button
                  onClick={() => {
                    if (hasSub) {
                      if (isActive) {
                        toggleExpanded(i);
                      } else {
                        selectSection(i, 0);
                      }
                    } else {
                      selectSection(i);
                    }
                  }}
                  className={`w-full text-left px-4 py-1.5 text-[11px] flex items-center gap-1.5 transition-colors ${
                    isActive && !hasSub
                      ? 'text-violet-400 border-l-2 border-violet-400 pl-[14px]'
                      : 'text-th-secondary hover:text-th-primary border-l-2 border-transparent pl-[14px]'
                  }`}
                >
                  {hasSub && (
                    <span className="flex-shrink-0 text-th-muted">
                      <ChevronIcon isOpen={isExpanded} />
                    </span>
                  )}
                  <span>{sec.label}</span>
                </button>

                {/* Subsections */}
                {hasSub && isExpanded && sec.subsections!.map((sub, j) => {
                  const subActive = isActive && activeSub === j;
                  return (
                    <button
                      key={sub.label}
                      onClick={() => selectSection(i, j)}
                      className={`w-full text-left py-1 text-[10px] transition-colors ${
                        subActive
                          ? 'text-violet-400 border-l-2 border-violet-400 pl-[30px]'
                          : 'text-th-tertiary hover:text-th-secondary border-l-2 border-transparent pl-[30px]'
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Right panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-th-hub-border flex-shrink-0">
            <h2 className="text-sm font-semibold text-th-primary truncate">{title}</h2>
            <button
              onClick={onClose}
              className="text-th-muted hover:text-th-secondary transition-colors flex-shrink-0 ml-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto hub-scrollbar px-5 py-4 text-[11px] text-th-secondary leading-relaxed"
          >
            {body}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
