// Knowledge Hub Sidebar — data exploration dashboard for /second-brain* routes

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHub } from '../../contexts/SecondBrainHubContext';
import {
  SearchIcon,
  ChevronIcon,
  FolderIcon,
  BarChartIcon,
  SlidersIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SortAscIcon,
} from '../icons';
import { SECOND_BRAIN_SIDEBAR_WIDTH, SECOND_BRAIN_SIDEBAR_COLLAPSED_WIDTH } from '../../constants/layout';
import type { TreeNode, SearchMode, SortMode, FilterMode } from '../../hooks/useSecondBrainHub';

// --- Collapsible Section ---
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-th-hub-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-wider text-th-tertiary hover:text-th-secondary transition-colors"
      >
        <span className="text-th-muted">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        <ChevronIcon isOpen={open} />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
};

// --- Tree Node ---
const TreeNodeItem: React.FC<{ node: TreeNode; depth?: number }> = ({ node, depth = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1 py-0.5 group"
        style={{ paddingLeft: `${depth * 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-3 h-3 flex items-center justify-center text-th-muted hover:text-th-secondary transition-colors flex-shrink-0"
          >
            <ChevronIcon isOpen={expanded} />
          </button>
        ) : (
          <span className="w-3 h-3 flex-shrink-0" />
        )}

        {node.concept ? (
          <Link
            to={`/second-brain/${node.concept.id}`}
            className="text-[11px] text-th-secondary hover:text-violet-400 transition-colors truncate flex-1"
          >
            {node.label}
          </Link>
        ) : (
          <span className="text-[11px] text-th-muted truncate flex-1">{node.label}</span>
        )}

        {hasChildren && (
          <span className="text-[9px] text-th-muted tabular-nums flex-shrink-0">{node.childCount}</span>
        )}
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children
            .sort((a, b) => a.label.localeCompare(b.label))
            .map(child => (
              <TreeNodeItem key={child.label} node={child} depth={depth + 1} />
            ))}
        </div>
      )}
    </div>
  );
};

// --- Search Mode Chips ---
const SEARCH_MODES: { value: SearchMode; label: string }[] = [
  { value: 'name', label: 'name' },
  { value: 'content', label: 'content' },
  { value: 'backlinks', label: 'backlinks' },
];

// --- Sort Options ---
const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'a-z', label: 'A–Z' },
  { value: 'most-links', label: 'most links' },
  { value: 'fewest-links', label: 'fewest links' },
  { value: 'depth', label: 'address depth' },
];

// --- Filter Chips ---
const FILTER_OPTIONS: { value: FilterMode; label: string }[] = [
  { value: 'orphans', label: 'orphans' },
  { value: 'hubs', label: 'hubs (5+)' },
  { value: 'leaf', label: 'leaf nodes' },
  { value: 'depth1', label: 'depth 1' },
  { value: 'depth2', label: 'depth 2' },
  { value: 'depth3+', label: 'depth 3+' },
];

// --- Main Sidebar ---
export const SecondBrainSidebar: React.FC = () => {
  const hub = useHub();
  if (!hub) return null;

  const {
    query, setQuery,
    searchMode, setSearchMode,
    sortMode, setSortMode,
    activeFilters, toggleFilter,
    stats, tree,
    collapsed, setCollapsed,
  } = hub;

  // Collapsed strip
  if (collapsed) {
    return (
      <aside
        className="hidden md:flex flex-col items-center sticky top-0 h-screen border-r border-th-hub-border"
        style={{
          width: SECOND_BRAIN_SIDEBAR_COLLAPSED_WIDTH,
          minWidth: SECOND_BRAIN_SIDEBAR_COLLAPSED_WIDTH,
          backgroundColor: 'var(--hub-sidebar-bg)',
        }}
      >
        <button
          onClick={() => setCollapsed(false)}
          className="mt-3 text-th-muted hover:text-th-secondary transition-colors p-1"
          title="Expand hub sidebar"
        >
          <PanelLeftOpenIcon />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="hidden md:flex flex-col sticky top-0 h-screen border-r border-th-hub-border overflow-hidden"
      style={{
        width: SECOND_BRAIN_SIDEBAR_WIDTH,
        minWidth: SECOND_BRAIN_SIDEBAR_WIDTH,
        backgroundColor: 'var(--hub-sidebar-bg)',
      }}
    >
      {/* Header */}
      <div className="px-3 py-3 border-b border-th-hub-border flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[11px] font-semibold text-violet-400 lowercase tracking-wide">
            knowledge hub
          </div>
          <div className="text-[9px] text-th-muted mt-0.5">
            {stats.totalConcepts} concepts
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-th-muted hover:text-th-secondary transition-colors p-1"
          title="Collapse hub sidebar"
        >
          <PanelLeftCloseIcon />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto hub-scrollbar">
        {/* Search */}
        <Section title="search" icon={<SearchIcon />} defaultOpen={true}>
          <div className="flex items-center border border-th-hub-border px-2 py-1.5 bg-th-surface focus-within:border-th-border-active transition-colors mb-2">
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-[11px] focus:outline-none placeholder-th-muted bg-transparent text-th-primary"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-th-muted hover:text-th-secondary text-[10px] ml-1 flex-shrink-0"
              >
                &times;
              </button>
            )}
          </div>
          <div className="flex gap-1 flex-wrap">
            {SEARCH_MODES.map(mode => (
              <button
                key={mode.value}
                onClick={() => setSearchMode(mode.value)}
                className={`text-[9px] px-1.5 py-0.5 transition-colors ${
                  searchMode === mode.value
                    ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30'
                    : 'text-th-muted border border-th-hub-border hover:text-th-secondary hover:border-th-border-hover'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Stats */}
        <Section title="stats" icon={<BarChartIcon />} defaultOpen={true}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <div>
              <div className="text-[9px] text-th-muted">concepts</div>
              <div className="text-[11px] text-th-primary tabular-nums">{stats.totalConcepts}</div>
            </div>
            <div>
              <div className="text-[9px] text-th-muted">links</div>
              <div className="text-[11px] text-th-primary tabular-nums">{stats.totalLinks}</div>
            </div>
            <div>
              <div className="text-[9px] text-th-muted">orphans</div>
              <div className="text-[11px] text-th-primary tabular-nums">{stats.orphanCount}</div>
            </div>
            <div>
              <div className="text-[9px] text-th-muted">avg refs</div>
              <div className="text-[11px] text-th-primary tabular-nums">{stats.avgRefs}</div>
            </div>
            {stats.mostConnectedHub && (
              <div className="col-span-2 mt-1">
                <div className="text-[9px] text-th-muted">most connected</div>
                <Link
                  to={`/second-brain/${stats.mostConnectedHub.id}`}
                  className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {stats.mostConnectedHub.displayTitle || stats.mostConnectedHub.title}
                </Link>
              </div>
            )}
          </div>
        </Section>

        {/* Directory Tree */}
        <Section title="directory" icon={<FolderIcon />} defaultOpen={true}>
          <div className="space-y-0.5 max-h-60 overflow-y-auto hub-scrollbar">
            {tree.map(node => (
              <TreeNodeItem key={node.label} node={node} />
            ))}
          </div>
        </Section>

        {/* Filters */}
        <Section title="filters" icon={<SlidersIcon />} defaultOpen={false}>
          <div className="flex flex-wrap gap-1">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f.value}
                onClick={() => toggleFilter(f.value)}
                className={`text-[9px] px-1.5 py-0.5 transition-colors ${
                  activeFilters.has(f.value)
                    ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30'
                    : 'text-th-muted border border-th-hub-border hover:text-th-secondary hover:border-th-border-hover'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Sort */}
        <Section title="sort" icon={<SortAscIcon />} defaultOpen={false}>
          <div className="space-y-0.5">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortMode(opt.value)}
                className={`block w-full text-left text-[10px] px-2 py-1 transition-colors ${
                  sortMode === opt.value
                    ? 'text-violet-400 bg-violet-400/10'
                    : 'text-th-muted hover:text-th-secondary hover:bg-th-surface'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Section>
      </div>
    </aside>
  );
};
