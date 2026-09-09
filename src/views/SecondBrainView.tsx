// Second Brain / Concept Wiki view component — theme-aware

import React, { startTransition, useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { secondBrainPath, secondBrainUidFromPath } from '../config/categories';
import { useHub } from '../contexts/SecondBrainHubContext';
import { useNavigationTrail } from '../hooks/useNavigationTrail';
import { NavigationTrail } from '../components/wiki/NavigationTrail';
import { WikiContent } from '../components/wiki/WikiContent';
import { NeighborhoodGraph, type Zone } from '../components/wiki/NeighborhoodGraph';
import { RelevanceLeaderboard, type FamilyItem } from '../components/wiki/RelevanceLeaderboard';
import { BridgeScoreBadge } from '../components/wiki/BridgeScoreBadge';

import { useGraphRelevance } from '../hooks/useGraphRelevance';
import type { SortMode, SearchMode, SearchField, FilterState, ViewMode } from '../hooks/useSecondBrainHub';
import { SearchIcon, RocketIcon, CheckIcon, WikiBrainIcon, FileTextIcon } from '../components/icons';
import { postPath, catAccentVar } from '../config/categories';
import { noteLabel, type WikiNoteMeta } from '../types';
import { type Connection } from '../lib/brainIndex';
import { ICON_REF_IN, ICON_REF_OUT } from '../lib/icons';
import { exportNotesAsMarkdown, estimateExport } from '../lib/exportNotes';
import { CopyConfirmModal } from '../components/wiki/CopyConfirmModal';
import { CopyExportModal } from '../components/wiki/CopyExportModal';
import { resolveWikiLinks } from '../lib/wikilinks';
import { WikiLinkPreview } from '../components/wiki/WikiLinkPreview';
import { assignRootColors, hexToRgb, ROOT_NEUTRAL } from '../components/graph/useGraphData';

import '../styles/article.css';
import '../styles/wiki-content.css';
import { ErrorConceptView } from './ErrorConceptView';

/** Display-friendly address: `//` → `/` */
const displayAddress = (addr: string) => addr.replace(/\/\//g, ' / ');

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'most-articles', label: 'most articles' },
  { value: 'fewest-articles', label: 'fewest articles' },
  { value: 'a-z', label: 'A\u2013Z' },
  { value: 'centrality', label: 'central' },
  { value: 'newest', label: 'newest' },
  { value: 'oldest', label: 'oldest' },
  { value: 'most-links', label: 'most links' },
  { value: 'fewest-links', label: 'fewest links' },
  { value: 'depth', label: 'depth' },
  { value: 'shuffle', label: 'shuffle' },
];

const SIMPLIFIED_SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'a-z', label: 'A\u2013Z' },
  { value: 'newest', label: 'newest' },
];

// --- Search Mode Chips ---
// The fields a query is matched against. They stack: any combination, at least one.
const SEARCH_MODES: { value: SearchField; label: string; hint: string }[] = [
  { value: 'name', label: 'name', hint: 'Match node names, paths and aliases' },
  { value: 'content', label: 'content', hint: 'Match text inside notes' },
  { value: 'backlinks', label: 'referenced by', hint: 'Find nodes referenced by matching notes' },
];

// --- StepperInput (inline, moved from sidebar) ---
const StepperInput: React.FC<{
  value: number;
  displayValue?: string;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
}> = ({ value, displayValue, onDecrement, onIncrement, min = -Infinity, max = Infinity }) => (
  <span className="inline-flex items-center border border-th-hub-border text-[10px] tabular-nums">
    <button onClick={onDecrement} disabled={value <= min} className="px-2 py-1 text-th-tertiary hover:text-th-secondary disabled:opacity-30 transition-colors">&minus;</button>
    <span className="px-1.5 py-1 text-th-primary min-w-[20px] text-center">{displayValue ?? value}</span>
    <button onClick={onIncrement} disabled={value >= max} className="px-2 py-1 text-th-tertiary hover:text-th-secondary disabled:opacity-30 transition-colors">+</button>
  </span>
);

// --- Chip (dismissible filter indicator) ---
const Chip: React.FC<{
  label: string;
  onDismiss: () => void;
  color?: 'violet' | 'amber';
}> = ({ label, onDismiss, color = 'violet' }) => {
  const base = color === 'amber'
    ? 'bg-amber-400/20 text-amber-400 border-amber-400/30'
    : 'bg-violet-400/10 text-violet-400 border-violet-400/20';
  const dismissBg = color === 'amber'
    ? 'bg-amber-400/10 hover:bg-amber-400/30'
    : 'bg-violet-400/5 hover:bg-violet-400/20';
  return (
    <span className={`text-[10px] border flex items-center ${base}`}>
      <span className="px-1.5 py-0.5">{label}</span>
      <button
        onClick={onDismiss}
        className={`self-stretch flex items-center justify-center w-5 border-l transition-colors ${dismissBg} ${color === 'amber' ? 'border-amber-400/30 hover:text-white' : 'border-violet-400/20 hover:text-white'
          }`}
      >
        <svg width="7" height="7" viewBox="0 0 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="1" y1="1" x2="6" y2="6" /><line x1="6" y1="1" x2="1" y2="6" />
        </svg>
      </button>
    </span>
  );
};

// --- Phone menu: a native <select> renders as the OS wants; this one renders as the console does ---
const MobileMenu: React.FC<{ label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void; className?: string }> = ({ label, value, options, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.value === value)?.label ?? label;
  return (
    <div className={`md:hidden relative ${className ?? ''}`}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen(o => !o)} className="wiki-mobile-menu-btn"><span>{current}</span><i aria-hidden="true">{open ? '\u25B4' : '\u25BE'}</i></button>
      {open && (
        <>
          <button type="button" aria-label="Close" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
          <div role="listbox" className="wiki-mobile-menu">
            {options.map(o => <button key={o.value} type="button" role="option" aria-selected={o.value === value} onClick={() => { onChange(o.value); setOpen(false); }} className={o.value === value ? 'is-current' : ''}>{o.label}</button>)}
          </div>
        </>
      )}
    </div>
  );
};

// --- Activity Heatmap (GitHub-style) ---
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ActivityHeatmap: React.FC<{
  allNotes: WikiNoteMeta[];
  dateFilter: string | null;
  onDateClick: (date: string | null) => void;
}> = ({ allNotes, dateFilter, onDateClick }) => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [temporalPreviewIds, setTemporalPreviewIds] = useState<Set<string> | null>(null);
  // Phones: the month that is open as a grid of large day cells (null = none).
  const [phoneMonth, setPhoneMonth] = useState<number | null>(null);

  useEffect(() => {
    const receivePreview = (event: Event) => {
      const ids = (event as CustomEvent<string[] | null>).detail;
      setTemporalPreviewIds(Array.isArray(ids) ? new Set(ids) : null);
    };
    window.addEventListener('wiki-temporal-preview', receivePreview);
    return () => window.removeEventListener('wiki-temporal-preview', receivePreview);
  }, []);

  // Build date → count map
  const dateCounts = useMemo(() => {
    const map = new Map<string, number>();
    allNotes.forEach(n => {
      if (!n.date) return;
      const d = n.date.slice(0, 10);
      map.set(d, (map.get(d) || 0) + 1);
    });
    return map;
  }, [allNotes]);
  const noteIdsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    allNotes.forEach(note => {
      if (!note.date) return;
      const date = note.date.slice(0, 10);
      const ids = map.get(date) ?? [];
      ids.push(note.id);
      map.set(date, ids);
    });
    return map;
  }, [allNotes]);

  // Build weeks grid for the year
  const weeks = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    // Pad to start on Sunday
    const startDay = startDate.getDay();
    const actualStart = new Date(startDate);
    actualStart.setDate(actualStart.getDate() - startDay);

    const result: { date: string; count: number; inYear: boolean }[][] = [];
    let current = new Date(actualStart);

    while (current <= endDate || current.getDay() !== 0) {
      const week: { date: string; count: number; inYear: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = current.toISOString().slice(0, 10);
        week.push({
          date: iso,
          count: dateCounts.get(iso) || 0,
          inYear: current.getFullYear() === year,
        });
        current.setDate(current.getDate() + 1);
      }
      result.push(week);
      if (current > endDate && current.getDay() === 0) break;
    }
    return result;
  }, [year, dateCounts]);

  // Max count for the currently viewed year (drives the color scale)
  const yearMax = useMemo(() => {
    let max = 0;
    for (const week of weeks) {
      for (const day of week) {
        if (day.inYear && day.count > max) max = day.count;
      }
    }
    return max;
  }, [weeks]);

  const rootColors = useMemo(() => assignRootColors(allNotes.map(note => note.address ?? note.title)), [allNotes]);
  const dominantRootByDate = useMemo(() => {
    const contributions = new Map<string, Map<string, number>>();
    allNotes.forEach(note => {
      if (!note.date) return;
      const date = note.date.slice(0, 10);
      const root = note.addressParts?.[0] ?? note.address?.split('//')[0] ?? note.title;
      const roots = contributions.get(date) ?? new Map<string, number>();
      roots.set(root, (roots.get(root) ?? 0) + 1);
      contributions.set(date, roots);
    });
    const result = new Map<string, string>();
    contributions.forEach((roots, date) => {
      const dominant = [...roots].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
      if (dominant) result.set(date, dominant[0]);
    });
    return result;
  }, [allNotes]);
  const temporalDates = useMemo(() => {
    const result = new Map<string, { count: number; root: string }>();
    if (!temporalPreviewIds) return result;
    const rootsPerDate = new Map<string, Map<string, number>>();
    allNotes.forEach(note => {
      if (!temporalPreviewIds.has(note.id) || !note.date) return;
      const date = note.date.slice(0, 10);
      const root = note.addressParts?.[0] ?? note.address?.split('//')[0] ?? note.title;
      const roots = rootsPerDate.get(date) ?? new Map<string, number>();
      roots.set(root, (roots.get(root) ?? 0) + 1);
      rootsPerDate.set(date, roots);
    });
    rootsPerDate.forEach((roots, date) => {
      const ranked = [...roots].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      result.set(date, { count: ranked.reduce((sum, entry) => sum + entry[1], 0), root: ranked[0]?.[0] ?? '' });
    });
    return result;
  }, [allNotes, temporalPreviewIds]);
  const temporalMax = useMemo(() => Math.max(1, ...[...temporalDates.values()].map(value => value.count)), [temporalDates]);

  const cellColor = (date: string, count: number, inYear: boolean) => {
    if (!inYear || count === 0) return 'transparent';
    if (temporalPreviewIds) {
      const match = temporalDates.get(date);
      if (!match) {
        const rgb = hexToRgb(rootColors.get(dominantRootByDate.get(date) ?? '') ?? ROOT_NEUTRAL);
        return `rgba(${rgb.map(Math.round).join(',')}, 0.07)`;
      }
      const rgb = hexToRgb(rootColors.get(match.root) ?? ROOT_NEUTRAL);
      const opacity = .38 + .57 * Math.sqrt(match.count / temporalMax);
      return `rgba(${rgb.map(Math.round).join(',')}, ${opacity.toFixed(2)})`;
    }
    // Hue identifies the root that contributed most that day; opacity carries
    // the independent magnitude signal (total notes written that day).
    const t = yearMax > 1 ? (count - 1) / (yearMax - 1) : 1;
    const opacity = 0.22 + t * 0.63;
    const rgb = hexToRgb(rootColors.get(dominantRootByDate.get(date) ?? '') ?? ROOT_NEUTRAL);
    return `rgba(${rgb.map(Math.round).join(',')}, ${opacity.toFixed(2)})`;
  };

  // Parse dateFilter into single or range for highlighting + click logic
  const parsed = useMemo(() => {
    if (!dateFilter) return null;
    if (dateFilter.includes('..')) {
      const [start, end] = dateFilter.split('..');
      return { type: 'range' as const, start, end };
    }
    return { type: 'single' as const, date: dateFilter };
  }, [dateFilter]);

  const isSelected = (d: string) => {
    if (!parsed) return false;
    if (parsed.type === 'single') return d === parsed.date;
    return d === parsed.start || d === parsed.end;
  };
  const isInRange = (d: string) => {
    if (!parsed || parsed.type !== 'range') return false;
    return d > parsed.start && d < parsed.end;
  };

  const handleCellClick = (clickedDate: string) => {
    if (!parsed) {
      // Nothing selected → single
      onDateClick(clickedDate);
    } else if (parsed.type === 'range') {
      // Range selected → always reset to single
      onDateClick(clickedDate);
    } else {
      // Single selected
      if (clickedDate === parsed.date) {
        onDateClick(null); // deselect
      } else if (clickedDate > parsed.date) {
        onDateClick(`${parsed.date}..${clickedDate}`); // range
      } else {
        onDateClick(clickedDate); // replace with earlier
      }
    }
  };

  const currentYear = new Date().getFullYear();
  // Phones: the month is the unit (cells are too small to tap and there is no hover to preview).
  const phoneDays = useMemo(() => {
    if (phoneMonth === null) return null;
    const m = String(phoneMonth + 1).padStart(2, '0');
    const total = new Date(year, phoneMonth + 1, 0).getDate();
    const lead = new Date(year, phoneMonth, 1).getDay();
    const days = [] as Array<{ date: string; day: number; count: number }>;
    for (let d = 1; d <= total; d++) { const date = `${year}-${m}-${String(d).padStart(2, '0')}`; days.push({ date, day: d, count: noteIdsByDate.get(date)?.length ?? 0 }); }
    return { lead, days };
  }, [phoneMonth, year, noteIdsByDate]);
  const togglePhoneMonth = (i: number) => {
    if (phoneMonth === i) { setPhoneMonth(null); if (activeMonth === i) handleMonthClick(i); return; }
    setPhoneMonth(i);
    if (activeMonth !== i) handleMonthClick(i);
  };
  const monthCounts = useMemo(() => {
    const counts = new Array<number>(12).fill(0);
    noteIdsByDate.forEach((ids, date) => { if (date.startsWith(String(year))) counts[parseInt(date.slice(5, 7), 10) - 1] += ids.length; });
    return counts;
  }, [noteIdsByDate, year]);

  const handleMonthClick = (monthIndex: number) => {
    const m = String(monthIndex + 1).padStart(2, '0');
    const firstDay = `${year}-${m}-01`;
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const lastDayStr = `${year}-${m}-${String(lastDay).padStart(2, '0')}`;
    const range = `${firstDay}..${lastDayStr}`;
    if (dateFilter === range) {
      onDateClick(null);
    } else {
      onDateClick(range);
    }
  };

  const activeMonth = useMemo(() => {
    if (!dateFilter || !dateFilter.includes('..')) return -1;
    const [start, end] = dateFilter.split('..');
    if (start.slice(0, 7) !== end.slice(0, 7)) return -1;
    if (!start.endsWith('-01')) return -1;
    const m = parseInt(start.slice(5, 7), 10) - 1;
    const lastDay = new Date(year, m + 1, 0).getDate();
    if (end.endsWith(`-${String(lastDay).padStart(2, '0')}`)) return m;
    return -1;
  }, [dateFilter, year]);

  // --- Grid click handler (eliminates dead-zone gaps) ---
  // Narrow layouts split the year in two rows so a day stays tappable; each
  // row resolves its own click from its own box.
  const gridRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarWidth, setCalendarWidth] = useState(0);
  useEffect(() => {
    const el = calendarRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(entries => setCalendarWidth(entries[0]?.contentRect.width ?? 0));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const compact = calendarWidth > 0 && calendarWidth / weeks.length < 13;
  const half = Math.ceil(weeks.length / 2);
  const weekRows = compact ? [weeks.slice(0, half), weeks.slice(half)] : [weeks];
  const monthRows = compact ? [[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11]] : [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]];

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>, rowWeeks: typeof weeks) => {
    const grid = e.currentTarget;
    if (grid.children.length < 2) return;
    const rect = grid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Find first visible week column (day labels may be hidden on mobile)
    let firstWeekEl: HTMLElement | null = null;
    for (let i = 0; i < grid.children.length; i++) {
      const child = grid.children[i] as HTMLElement;
      if (!child.hasAttribute('data-day-labels') && child.offsetWidth > 0) {
        firstWeekEl = child;
        break;
      }
    }
    if (!firstWeekEl) return;
    const firstWeekRect = firstWeekEl.getBoundingClientRect();
    const gridStartX = firstWeekRect.left - rect.left;
    const gridX = x - gridStartX;
    if (gridX < 0) return;
    const n = rowWeeks.length;
    const gridWidth = rect.width - gridStartX;
    const gap = 2;
    const colWidth = (gridWidth - (n - 1) * gap) / n;
    const colStep = colWidth + gap;
    const wi = Math.min(Math.max(Math.floor(gridX / colStep), 0), n - 1);
    const rowPitch = colWidth + gap; // square cells: row height = column width
    const di = Math.min(Math.max(Math.floor(y / rowPitch), 0), 6);
    const day = rowWeeks[wi]?.[di];
    if (day?.inYear) handleCellClick(day.date);
  };

  return (
    <div className="relative mx-auto" style={{ maxWidth: '74rem' }}>
      {/* Year selector */}
      <div className="flex items-center gap-2 mb-1.5">
        <button onClick={() => setYear(y => y - 1)} className="text-[10px] text-th-muted hover:text-th-secondary transition-colors">&lsaquo;</button>
        <span className="text-[10px] text-th-muted tabular-nums">{year}</span>
        <button onClick={() => setYear(y => Math.min(y + 1, currentYear))} disabled={year >= currentYear} className="text-[10px] text-th-muted hover:text-th-secondary disabled:opacity-30 transition-colors">&rsaquo;</button>
      </div>
      {/* Grid: one row of weeks, or two on narrow layouts */}
      <div className="md:hidden grid grid-cols-4 gap-1 mt-1 mb-1.5">
        {MONTH_SHORT.map((label, i) => { const active = activeMonth === i; const count = monthCounts[i]; return (
          <button key={label} type="button" onClick={() => togglePhoneMonth(i)} aria-expanded={phoneMonth === i} className={`flex items-center justify-between px-2 h-9 rounded-sm border text-[10px] font-mono transition-colors ${active || phoneMonth === i ? 'text-violet-300 border-violet-400/60 bg-violet-500/10' : count ? 'text-th-secondary border-th-hub-border' : 'text-th-muted border-transparent'}`}>
            <span>{label}</span><span className="tabular-nums text-[9px] opacity-70">{count || ''}</span>
          </button>
        ); })}
        {phoneDays && (
          <div className="col-span-4 mt-1 grid grid-cols-7 gap-[3px]" aria-label={`Days of ${MONTH_SHORT[phoneMonth!]} ${year}`}>
            {DAY_NAMES.map((name, i) => <span key={i} className="text-center text-[8px] text-th-muted leading-none pb-1">{name}</span>)}
            {Array.from({ length: phoneDays.lead }, (_, i) => <span key={`lead-${i}`} />)}
            {phoneDays.days.map(({ date, day, count }) => (
              <button key={date} type="button" onClick={() => handleCellClick(date)} disabled={count === 0} className={`aspect-square rounded-sm border text-[10px] font-mono tabular-nums flex flex-col items-center justify-center gap-0.5 transition-colors ${isSelected(date) ? 'border-violet-400 text-violet-300' : isInRange(date) ? 'border-violet-400/40 text-th-secondary' : count ? 'border-th-hub-border text-th-secondary' : 'border-transparent text-th-muted/50'}`} style={{ backgroundColor: cellColor(date, count, true) }}>
                <span>{day}</span>{count > 0 && <span className="text-[8px] opacity-70">{count}</span>}
              </button>
            ))}
          </div>
        )}
        {dateFilter && <button type="button" onClick={() => onDateClick(null)} className="col-span-4 h-8 rounded-sm border border-th-hub-border text-[9px] font-mono uppercase tracking-wider text-th-tertiary">clear dates</button>}
      </div>
      <div ref={calendarRef} className="hidden md:block overflow-hidden pb-1">
        {weekRows.map((rowWeeks, rowIndex) => (
          <div key={rowIndex} ref={rowIndex === 0 ? gridRef : undefined} className={`flex gap-[2px] cursor-pointer${rowIndex > 0 ? ' mt-2' : ''}`} style={{ width: '100%' }} onClick={e => handleGridClick(e, rowWeeks)} onMouseLeave={() => window.dispatchEvent(new CustomEvent('wiki-calendar-preview', { detail: null }))}>
            {/* Day labels */}
            <div data-day-labels className="hidden md:flex flex-col gap-[2px] mr-0.5 flex-shrink-0">
              {DAY_NAMES.map((name, i) => (
                <div key={i} className="text-[6px] text-th-muted leading-none flex items-center" style={{ width: 8, height: 8 }}>
                  {i % 2 === 1 ? name : ''}
                </div>
              ))}
            </div>
            {rowWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px] flex-1 min-w-0">
                {week.map((day, di) => {
                  const isEmpty = day.count === 0 && day.inYear;
                  return (
                    <div
                      key={di}
                      className="aspect-square w-full"
                      onMouseEnter={() => {
                        const ids = noteIdsByDate.get(day.date);
                        // A real empty day ends the preview. CSS gaps emit no
                        // mouse-enter event, so crossing a narrow gutter still
                        // preserves continuity without making empty cells sticky.
                        window.dispatchEvent(new CustomEvent('wiki-calendar-preview', { detail: ids?.length ? ids : null }));
                      }}
                      style={{
                        backgroundColor: cellColor(day.date, day.count, day.inYear),
                        border: isEmpty ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                        borderRadius: 1,
                        transition: 'background-color 180ms ease, box-shadow 180ms ease, opacity 180ms ease',
                        opacity: day.inYear ? 1 : 0,
                        boxShadow: isSelected(day.date)
                          ? 'inset 0 0 0 1px color-mix(in srgb, var(--wiki-400) 90%, transparent)'
                          : isInRange(day.date)
                            ? 'inset 0 0 0 1px color-mix(in srgb, var(--wiki-400) 35%, transparent)'
                            : 'none',
                      }}
                      title={day.inYear ? `${day.date}${day.count ? ` (${day.count})` : ''}${temporalDates.get(day.date) ? ` · ${temporalDates.get(day.date)!.count} highlighted` : ''}` : undefined}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Month tap targets */}
      {monthRows.map((months, rowIndex) => (
        <div key={rowIndex} className="hidden md:flex gap-[1px] mt-1.5">
          {months.map(i => {
            const label = MONTH_LABELS[i];
            const active = activeMonth === i;
            const isCurrent = i === new Date().getMonth() && year === new Date().getFullYear();
            return (
              <button
                key={i}
                onClick={() => handleMonthClick(i)}
                className={`flex-1 flex items-center justify-center text-[8px] rounded-sm transition-colors ${active ? 'text-violet-300'
                  : isCurrent ? 'text-th-secondary'
                    : 'text-th-muted'
                  }`}
                style={{
                  height: 24,
                  border: active ? '1px solid color-mix(in srgb, var(--wiki-400) 50%, transparent)'
                    : isCurrent ? '1.5px solid rgba(255, 255, 255, 0.18)'
                      : '1px solid transparent',
                }}
              >
                {label}
              </button>
              );
          })}
        </div>
      ))}
    </div>
  );
};

// --- Docked Toolbar ---
const DockedToolbar: React.FC<{
  query: string;
  setQuery: (q: string) => void;
  searchMode: SearchMode;
  setSearchMode: (m: SearchMode) => void;
  searchFields: SearchField[];
  toggleSearchField: (f: SearchField) => void;
  sortMode: SortMode;
  setSortMode: (m: SortMode) => void;
  filterState: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  directoryScope: string | null;
  setDirectoryScope: (s: string | null) => void;
  sortedCount: number;
  unvisitedOnly: boolean;
  setUnvisitedOnly: (v: boolean | ((prev: boolean) => boolean)) => void;
  hasVisited: boolean;
  isVisited: (id: string) => boolean;
  allNotes: WikiNoteMeta[];
  stats: { maxDepth: number };
  inputRef: React.RefObject<HTMLInputElement | null>;
  viewMode: ViewMode;
  sortedResults: WikiNoteMeta[];
  connectionsMap: Map<string, Connection[]>;
}> = ({
  query, setQuery, searchMode, setSearchMode, searchFields, toggleSearchField,
  sortMode, setSortMode,
  filterState, updateFilter, hasActiveFilters, resetFilters,
  directoryScope, setDirectoryScope,
  sortedCount, unvisitedOnly, setUnvisitedOnly, hasVisited,
  allNotes, stats, inputRef, viewMode,
  sortedResults, connectionsMap,
}) => {
    const isSimplified = viewMode === 'simplified';
    // The filters start folded everywhere; a click on the row opens them.
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Panel visibility is independent from filter state. Active constraints
    // must survive a collapse without forcing the controls back open.
    const isFiltersVisible = filtersOpen;

    // --- Bulk copy state ---
    const [bulkCopyState, setBulkCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');
    const [bulkCopyStats, setBulkCopyStats] = useState<string | null>(null);
    const [bulkCopyMode, setBulkCopyMode] = useState(false); // false = metadata, true = full
    const [bulkCopyConfirm, setBulkCopyConfirm] = useState(false); // the check before the copy runs

    const handleBulkCopy = useCallback(async () => {
      if (sortedResults.length === 0) return;
      setBulkCopyConfirm(false);
      setBulkCopyState('copying');
      try {
        const parts: string[] = [];
        if (query) parts.push(`"${query}"`);
        if (directoryScope) parts.push(`root: ${directoryScope}`);
        if (hasActiveFilters) parts.push('filtered');
        const header = parts.length > 0 ? `Second Brain — ${parts.join(', ')}` : 'Second Brain export';

        const result = await exportNotesAsMarkdown(sortedResults, connectionsMap, {
          fullMode: bulkCopyMode,
          header,
        });
        await navigator.clipboard.writeText(result.markdown);
        const chars = result.markdown.length;
        const tokens = Math.round(chars / 4);
        const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
        setBulkCopyStats(`${fmtK(chars)} chars · ~${fmtK(tokens)} tok`);
        setBulkCopyState('copied');
        setTimeout(() => { setBulkCopyState('idle'); setBulkCopyStats(null); }, 3000);
      } catch {
        setBulkCopyState('idle');
      }
    }, [sortedResults, connectionsMap, bulkCopyMode, query, directoryScope, hasActiveFilters]);

    // Root picker state
    const [scopeInput, setScopeInput] = useState('');
    const [scopeOpen, setScopeOpen] = useState(false);
    const scopeBlurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scopeOptions = useMemo(() => {
      const counts = new Map<string, number>();
      allNotes.forEach(note => {
        const root = (note.addressParts || note.address?.split('//') || [note.title])[0];
        if (root) counts.set(root, (counts.get(root) || 0) + 1);
      });
      return [...counts.entries()]
        .map(([path, c]) => ({ path, count: c }))
        .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));
    }, [allNotes]);

    const filteredScopeOptions = useMemo(() => {
      if (!scopeInput) return scopeOptions.slice(0, 12);
      const q = scopeInput.toLowerCase();
      return scopeOptions.filter(o => o.path.toLowerCase().includes(q)).slice(0, 12);
    }, [scopeOptions, scopeInput]);

    // Sort controls: a menu on phones, inline buttons on desktop. They live inside the filter panel in
    // the technical mode and in the results row in the simplified one, which has no panel.
    const sortOptions = isSimplified ? SIMPLIFIED_SORT_OPTIONS : SORT_OPTIONS;
    const sortControls = (
      <>
        <MobileMenu label="Sort" value={sortMode} onChange={value => setSortMode(value as SortMode)} options={sortOptions.map(opt => ({ value: opt.value, label: opt.label }))} className="uppercase tracking-[.08em]" />
        {sortOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSortMode(opt.value)}
            className={`hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded-sm transition-colors ${sortMode === opt.value
              ? 'text-violet-400 bg-violet-400/10'
              : 'text-th-tertiary hover:text-th-secondary'
              }`}
          >
            {opt.label}
          </button>
        ))}
        {!isSimplified && hasVisited && (
          <>
            <span className="text-th-hub-border">|</span>
            <button
              onClick={() => setUnvisitedOnly((v: boolean) => !v)}
              className={`text-[10px] px-1.5 py-0.5 rounded-sm transition-colors ${unvisitedOnly ? 'text-blue-400' : 'text-th-tertiary hover:text-blue-400'
                }`}
            >
              unvisited
            </button>
          </>
        )}
      </>
    );
    // The tally (count, meta or full, copy): one JSX, two homes. Desktop shows it at the end of the search
    // row; phones show it at the right end of the identity strip, where the plain note count used to be.
    const tallyInner = (
      <>
            <span className="text-[9px] text-th-secondary tabular-nums">{sortedCount} {hasActiveFilters || query || directoryScope ? 'results' : 'notes'}</span>
            {(hasActiveFilters || query || directoryScope) && allNotes.length > 0 && (
              <>
                <span className="text-[9px] text-th-muted tabular-nums">{Math.round((sortedCount / allNotes.length) * 100)}%</span>
                <span className="inline-block w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--bg-surface-alt)' }}>
                  <span className="block h-full rounded-full" style={{ width: `${Math.min((sortedCount / allNotes.length) * 100, 100)}%`, backgroundColor: 'color-mix(in srgb, var(--wiki-500) 60%, transparent)' }} />
                </span>
              </>
            )}
            <button
              onClick={() => setBulkCopyMode(m => !m)}
              className="text-[9px] text-th-muted hover:text-th-secondary transition-colors"
              title={bulkCopyMode ? 'Full mode (fetches content)' : 'Metadata mode (fast)'}
            >
              {bulkCopyMode ? 'full' : 'meta'}
            </button>
            <button
              onClick={() => setBulkCopyConfirm(true)}
              disabled={bulkCopyState === 'copying' || sortedCount === 0}
              className="text-th-tertiary hover:text-violet-400 transition-colors disabled:opacity-30"
              title="Copy all results for LLM context"
            >
              {bulkCopyState === 'copied' ? <CheckIcon size={12} /> : bulkCopyState === 'copying' ? <span className="text-[9px]">...</span> : <RocketIcon size={12} />}
            </button>
            {bulkCopyStats && (
              <span className="text-[8px] text-violet-400/70 tabular-nums">{bulkCopyStats}</span>
            )}
      </>
    );
    return (
      <div className="mb-3 border border-th-hub-border rounded-sm" style={{ backgroundColor: 'var(--hub-sidebar-bg)' }}>
        {/* Phones: say where we are before the search box. */}
        <div className="md:hidden wiki-phone-ident"><WikiBrainIcon size={12} className="text-violet-400" /><b>wiki</b><span>InfraPhysics</span><span className="wiki-tally wiki-tally-phone">{tallyInner}</span></div>
        {/* Row 1: Search, and at its end the tally cell (count, meta or full, copy) in its own colour. */}
        <div className="flex flex-wrap items-center gap-2 border-b border-th-hub-border min-w-0">
        <div className="flex flex-1 basis-[14rem] items-center gap-2 px-3 py-2 min-w-0">
          <span className="text-th-tertiary flex-shrink-0"><SearchIcon /></span>
          <input
            ref={inputRef}
            type="text"
            placeholder={
              directoryScope ? `Search in ${directoryScope.replace(/\/\//g, ' / ')}...` : 'Search...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setQuery('');
                (e.target as HTMLElement).blur();
              }
            }}
            autoComplete="off"
            spellCheck={false}
            className="flex-1 min-w-0 font-mono text-[12px] md:text-[11px] focus:outline-none placeholder-th-muted bg-transparent text-th-primary"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-th-tertiary hover:text-th-secondary text-[14px] md:text-[13px] leading-none flex-shrink-0 px-0.5">&times;</button>
          )}
        </div>
        {/* The tally on desktop; on phones it lives in the identity strip above the search. */}
        <span className="wiki-tally hidden md:inline-flex">{tallyInner}</span>
        </div>
        {bulkCopyConfirm && (
          <CopyConfirmModal
            estimate={estimateExport(sortedResults, connectionsMap, bulkCopyMode)}
            source={query ? `Search results for “${query}”` : directoryScope ? `Notes under ${directoryScope}` : hasActiveFilters ? 'Filtered notes' : 'Every note in the wiki'}
            onConfirm={() => { void handleBulkCopy(); }}
            onCancel={() => setBulkCopyConfirm(false)}
          />
        )}

        {!isSimplified && <div className="grid grid-cols-3 gap-px border-b border-th-hub-border bg-th-hub-border p-px" role="group" aria-label="Search fields (stack as many as you need)">
          {SEARCH_MODES.map(mode => { const on = searchFields.includes(mode.value); return <button
            key={mode.value}
            type="button"
            aria-pressed={on}
            onClick={() => toggleSearchField(mode.value)}
            title={mode.hint}
            className={`bg-th-base px-2 py-1.5 text-[10px] transition-colors ${on ? 'bg-violet-400/10 font-medium text-violet-400' : 'text-th-tertiary hover:bg-th-surface hover:text-th-secondary'}`}
          >{mode.label}</button>; })}
        </div>}

        {/* Row 2: Filters (collapsible) — technical mode only */}
        {!isSimplified && (
        <div className="border-b border-th-hub-border">
          <div className={`flex items-center bg-white/[0.03] text-[10px] text-th-secondary transition-colors ${isFiltersVisible ? 'border-b border-th-hub-border' : ''}`}>
            <button
              type="button"
              onClick={() => setFiltersOpen(v => !v)}
              className="flex min-w-0 flex-1 items-center gap-1.5 px-3 py-1.5 text-left cursor-pointer select-none"
              aria-expanded={isFiltersVisible}
            >
              <span>{isFiltersVisible ? '\u25BE' : '\u25B8'}</span>
              <span className="uppercase tracking-wider text-[9px] font-medium">filter &amp; sort</span>
              {(hasActiveFilters || !!directoryScope) && (
                <span className="text-[9px] text-violet-400 tabular-nums">
                  ({[
                    filterState.isolated,
                    filterState.leaf,
                    filterState.bridgesOnly,
                    filterState.hubThreshold > 0,
                    filterState.depthMin > 1,
                    filterState.depthMax !== Infinity,
                    filterState.dateFilter != null,
                    filterState.wordCountMin > 0 || filterState.wordCountMax < Infinity,
                    filterState.articleCountBelow !== null,
                    !!directoryScope,
                  ].filter(Boolean).length})
                </span>
              )}
            </button>
            {!isFiltersVisible && (hasActiveFilters || !!directoryScope) && (
              <button
                type="button"
                onClick={() => { resetFilters(); setDirectoryScope(null); }}
                className="mr-2 border-l border-th-hub-border pl-2 font-mono text-[8px] uppercase tracking-[.08em] text-violet-400/80 transition-colors hover:text-violet-300"
                title="Clear active filters"
              >
                clear
              </button>
            )}
          </div>
          {isFiltersVisible && (
            <div className="pb-2 pt-2">
              {/* All filters in one row: dropdowns + separator + toggle pills */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2 md:py-0 md:gap-3 px-3 sb-filter-row">
                <label className="flex items-center gap-1 text-[10px] text-th-tertiary" title="Distinct public articles with a body wikilink; each article counts once. No tags or unlinked words.">
                  articles &lt;
                  <input aria-label="Article count below" type="number" min="1" step="1" placeholder="∞" value={filterState.articleCountBelow ?? ''}
                    onChange={e => { const n = e.target.value === '' ? null : Number(e.target.value); if (n === null || Number.isInteger(n) && n >= 1) updateFilter('articleCountBelow', n); }}
                    className="w-12 border border-th-hub-border bg-th-surface px-1 py-0.5 text-th-primary" />
                </label>
                <div className="flex items-center gap-1 text-[10px] text-th-tertiary relative">
                  <span>roots</span>
                  <MobileMenu label="Root" value={directoryScope ?? ''} onChange={value => setDirectoryScope(value || null)} options={[{ value: '', label: 'all' }, ...scopeOptions.map(opt => ({ value: opt.path, label: `${opt.path} (${opt.count})` }))]} />
                  <div className="relative hidden md:block">
                    <input
                      type="text"
                      placeholder={directoryScope || 'all'}
                      value={scopeInput}
                      onChange={(e) => { setScopeInput(e.target.value); setScopeOpen(true); }}
                      onFocus={() => { if (scopeBlurRef.current) clearTimeout(scopeBlurRef.current); setScopeOpen(true); }}
                      onBlur={() => { scopeBlurRef.current = setTimeout(() => { setScopeOpen(false); window.dispatchEvent(new CustomEvent('wiki-root-preview', { detail: { root: null } })); }, 150); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') { setScopeInput(''); setScopeOpen(false); (e.target as HTMLElement).blur(); }
                        if (e.key === 'Enter' && filteredScopeOptions.length > 0) {
                          setDirectoryScope(filteredScopeOptions[0].path);
                          setScopeInput(''); setScopeOpen(false); (e.target as HTMLElement).blur();
                        }
                      }}
                      className={`bg-th-surface border font-mono text-[10px] text-th-primary px-1.5 py-0.5 w-24 focus:outline-none transition-colors ${directoryScope ? 'border-violet-400/40' : 'border-th-hub-border'
                        } focus:border-th-border-active`}
                    />
                    {scopeOpen && filteredScopeOptions.length > 0 && (
                      <div
                        onMouseLeave={() => window.dispatchEvent(new CustomEvent('wiki-root-preview', { detail: { root: null } }))}
                        className="absolute top-full left-0 mt-0.5 border border-th-hub-border max-h-40 overflow-y-auto z-20 w-52 thin-scrollbar"
                        style={{ backgroundColor: 'var(--hub-sidebar-bg)' }}
                      >
                        {filteredScopeOptions.map(opt => (
                          <button
                            key={opt.path}
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseEnter={() => window.dispatchEvent(new CustomEvent('wiki-root-preview', { detail: { root: opt.path } }))}
                            onClick={() => { setDirectoryScope(opt.path); setScopeInput(''); setScopeOpen(false); window.dispatchEvent(new CustomEvent('wiki-root-preview', { detail: { root: null } })); }}
                            className="block w-full text-left px-2 py-1 text-[10px] text-th-secondary hover:bg-violet-400/10 hover:text-violet-400 transition-colors truncate"
                          >
                            {opt.path} <span className="text-th-muted">({opt.count})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-th-tertiary">
                  <span>depth</span>
                  <StepperInput
                    value={filterState.depthMin}
                    onDecrement={() => updateFilter('depthMin', Math.max(1, filterState.depthMin - 1))}
                    onIncrement={() => updateFilter('depthMin', filterState.depthMin + 1)}
                    min={1}
                  />
                  <span>&ndash;</span>
                  <StepperInput
                    value={filterState.depthMax}
                    displayValue={filterState.depthMax === Infinity ? '\u221e' : String(filterState.depthMax)}
                    onDecrement={() => updateFilter('depthMax', filterState.depthMax === Infinity ? stats.maxDepth : Math.max(1, filterState.depthMax - 1))}
                    onIncrement={() => {
                      if (filterState.depthMax === Infinity) return;
                      if (filterState.depthMax >= stats.maxDepth) updateFilter('depthMax', Infinity);
                      else updateFilter('depthMax', filterState.depthMax + 1);
                    }}
                  />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-th-tertiary">
                  <span>hubs&ge;</span>
                  <StepperInput
                    value={filterState.hubThreshold}
                    onDecrement={() => updateFilter('hubThreshold', Math.max(0, filterState.hubThreshold - 1))}
                    onIncrement={() => updateFilter('hubThreshold', filterState.hubThreshold + 1)}
                    min={0}
                  />
                </div>
                <span className="text-th-hub-border select-none">|</span>
                <button
                  onClick={() => updateFilter('isolated', !filterState.isolated)}
                  className={`text-[10px] px-1 py-0.5 transition-colors ${filterState.isolated
                    ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30'
                    : 'text-th-tertiary border border-th-hub-border hover:text-th-secondary hover:border-th-border-hover'
                    }`}
                >isolated</button>
                <button
                  onClick={() => updateFilter('leaf', !filterState.leaf)}
                  className={`text-[10px] px-1 py-0.5 transition-colors ${filterState.leaf
                    ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30'
                    : 'text-th-tertiary border border-th-hub-border hover:text-th-secondary hover:border-th-border-hover'
                    }`}
                >leaf</button>
                <button
                  onClick={() => updateFilter('bridgesOnly', !filterState.bridgesOnly)}
                  className={`text-[10px] px-1 py-0.5 transition-colors ${filterState.bridgesOnly
                    ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                    : 'text-th-tertiary border border-th-hub-border hover:text-th-secondary hover:border-th-border-hover'
                    }`}
                >bridges</button>
              </div>
              {/* Heatmap */}
              <div className="mt-2 px-3">
                <ActivityHeatmap
                  allNotes={allNotes}
                  dateFilter={filterState.dateFilter}
                  onDateClick={(d) => updateFilter('dateFilter', d)}
                />
              </div>
              {/* Sort last: the order of the results, under the calendar. */}
              <div className="flex flex-wrap items-center gap-1.5 px-3 pt-2 mt-2 border-t border-th-hub-border">
                <span className="text-[9px] uppercase tracking-wider text-th-muted mr-1">sort</span>
                {sortControls}
              </div>
            </div>
          )}
        </div>
        )}

        {/* Row 3: the simplified sort, or the reset and active chips; nothing when there is nothing to show. */}
        {(isSimplified || hasActiveFilters || !!directoryScope) && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 flex-wrap">
          {isSimplified && sortControls}
          {/* Reset + active chips — technical only */}
          {!isSimplified && (
          <div className="flex items-center gap-1 flex-wrap">
            {(hasActiveFilters || !!directoryScope) && (
              <button
                className="text-[9px] px-1.5 py-0.5 border border-th-hub-border text-th-tertiary hover:text-violet-400 hover:border-violet-400/30 active:bg-violet-400/10 transition-colors"
                onClick={() => { resetFilters(); setDirectoryScope(null); }}
              >
                reset
              </button>
            )}
            {directoryScope && (
              <Chip label={`scope: ${directoryScope.replace(/\/\//g, ' / ')}`} onDismiss={() => setDirectoryScope(null)} />
            )}
            {filterState.dateFilter && (
              <Chip label={filterState.dateFilter.replace('..', ' \u2192 ')} onDismiss={() => updateFilter('dateFilter', null)} />
            )}
            {filterState.isolated && <Chip label="isolated" onDismiss={() => updateFilter('isolated', false)} />}
            {filterState.articleCountBelow !== null && <Chip label={`articles < ${filterState.articleCountBelow}`} onDismiss={() => updateFilter('articleCountBelow', null)} />}
            {filterState.leaf && <Chip label="leaf" onDismiss={() => updateFilter('leaf', false)} />}
            {filterState.bridgesOnly && <Chip label="bridges" onDismiss={() => updateFilter('bridgesOnly', false)} color="amber" />}
            {filterState.depthMin > 1 && <Chip label={`depth \u2265 ${filterState.depthMin}`} onDismiss={() => updateFilter('depthMin', 1)} />}
            {filterState.depthMax !== Infinity && <Chip label={`depth \u2264 ${filterState.depthMax}`} onDismiss={() => updateFilter('depthMax', Infinity)} />}
            {filterState.hubThreshold > 0 && <Chip label={`hubs \u2265 ${filterState.hubThreshold}`} onDismiss={() => updateFilter('hubThreshold', 0)} />}
            {(filterState.wordCountMin > 0 || filterState.wordCountMax < Infinity) && (
              <Chip
                label={`${filterState.wordCountMin}\u2013${filterState.wordCountMax === Infinity ? '\u221e' : filterState.wordCountMax} words`}
                onDismiss={() => { updateFilter('wordCountMin', 0); updateFilter('wordCountMax', Infinity); }}
              />
            )}
          </div>
          )}
        </div>
        )}
      </div>
    );
  };

// --- Articles chip: the article mark and a count; a click lists the articles that link this note and
// opens them. Rendered through a portal so no link nests inside the card link. ---
type UsedIn = { id: string; title: string; category: string };
/** Space the menu needs below the chip before it flips above it; also its height cap. */
const ARTICLES_MENU_MIN = 224;
const ARTICLES_MENU_MAX = 352;
export const ArticlesChip: React.FC<{ articles: UsedIn[] }> = ({ articles }) => {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!anchor) return;
    const close = () => setAnchor(null);
    window.addEventListener('scroll', close, { passive: true });
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close); window.removeEventListener('resize', close); };
  }, [anchor]);
  const count = articles.length;
  // Placement: below the chip when there is room, above it near the bottom edge; the height is capped
  // to the space on that side (and to ARTICLES_MENU_MAX) and the list scrolls inside.
  const placement = useMemo(() => {
    if (!anchor) return null;
    const below = window.innerHeight - anchor.bottom - 12;
    const above = anchor.top - 12;
    const up = below < ARTICLES_MENU_MIN && above > below;
    const room = Math.max(120, Math.min(ARTICLES_MENU_MAX, up ? above : below));
    const right = Math.max(8, window.innerWidth - anchor.right);
    return up ? { bottom: window.innerHeight - anchor.top + 6, right, maxHeight: room } : { top: anchor.bottom + 6, right, maxHeight: room };
  }, [anchor]);
  return (
    <>
      <button type="button" disabled={count === 0} aria-haspopup={count > 0 ? "menu" : undefined} aria-expanded={!!anchor}
        title={count === 0 ? "No article links this note yet" : `${count} article${count === 1 ? "" : "s"} link this note`}
        className={`wiki-articles-chip${count === 0 ? " is-empty" : ""}${anchor ? " is-open" : ""}`}
        onClick={event => { event.preventDefault(); event.stopPropagation(); if (count === 0) return; setAnchor(anchor ? null : event.currentTarget.getBoundingClientRect()); }}>
        <FileTextIcon /><span>{count}</span>
      </button>
      {anchor && createPortal(
        <div className="wiki-articles-veil" onClick={event => { event.stopPropagation(); setAnchor(null); }}>
          <div role="menu" className="wiki-articles-menu" style={placement ?? undefined} onClick={event => event.stopPropagation()}>
            {articles.map(article => (
              <button key={article.id} type="button" role="menuitem" onClick={() => { setAnchor(null); navigate(postPath(article.category, article.id)); }}>
                <i style={{ background: catAccentVar(article.category) }} /><span>{article.title}</span><b>{article.category}</b>
              </button>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

// --- Memoized Grid Card — only re-renders when its own data changes ---
const GridCard = React.memo<{
  note: WikiNoteMeta;
  idx: number;
  focused: boolean;
  visited: boolean;
  onCardClick: (note: WikiNoteMeta) => void;
  incoming: number;
  outgoing: number;
  articles: UsedIn[];
}>(({ note, idx, focused, visited, onCardClick, incoming, outgoing, articles }) => (
  <Link
    data-idx={idx}
    to={secondBrainPath(note.id)}
    onClick={() => onCardClick(note)}
    className={`card-link group p-4 flex flex-col${focused ? ' border-violet-400/50 bg-violet-400/5' : ''}`}
  >
    <div className="mb-0.5 flex items-center gap-1.5">
      <span className={`text-sm font-medium transition-colors group-hover:text-th-primary ${visited ? 'text-blue-400/70' : 'text-violet-400'}`}>
        {noteLabel(note)}
      </span>
      <span className="ml-auto"><ArticlesChip articles={articles} /></span>
    </div>
    <div className="text-[10px] text-th-tertiary mb-1">
      {(note.addressParts?.length ?? note.address?.split('//').length ?? 1) === 1
        ? '/root'
        : displayAddress(note.address || note.title)}
    </div>
    {note.description && (
      <div className="text-xs text-th-secondary line-clamp-2 font-sans">
        {note.description}
      </div>
    )}
    <div className="flex items-center gap-2 mt-auto pt-2.5 text-[10px] text-th-tertiary tabular-nums">
      <span>{outgoing}↗ {incoming}↙</span>
      {note.date && (
        <span className="ml-auto opacity-60">{note.date.slice(0, 10)}</span>
      )}
    </div>
  </Link>
));

export const SecondBrainView: React.FC = () => {
  const hub = useHub();

  const {
    sortedResults,
    activePost,
    backlinks,
    connections,
    mentions,
    neighborhood,
    outgoingRefCount,
    homonyms,
    resolvedHtml,
    contentReadyId,
    indexLoading,
    noteById,
    query,
    setQuery,
    searchActive,
    clearSearch,
    searchMode,
    setSearchMode,
    searchFields,
    toggleSearchField,
    directoryScope,
    setDirectoryScope,
    filterState,
    setFilterState,
    hasActiveFilters,
    resetFilters,
    sortMode,
    setSortMode,
    directoryNavRef,
    isVisited,
    backlinksMap,
    connectionsMap,
    neighborhoodMap,
    addressToNoteId,
    invalidateContent,
    allWikiNotes,
    stats,
    viewMode,
    setViewMode,
  } = hub;

  const isSimplified = viewMode === 'simplified';

  const navigate = useNavigate();
  const { getRelevance, getPercentile } = useGraphRelevance();
  const { trail, scheduleReset, scheduleExtend, truncateTrail, clearTrail } =
    useNavigationTrail({ activePost, directoryNavRef });
  const { id: urlId } = useParams<{ id: string }>();

  useEffect(() => {
    if (activePost && urlId && window.location.pathname !== secondBrainPath(activePost.id)) {
      navigate(secondBrainPath(activePost.id) + window.location.search + window.location.hash, { replace: true });
    }
  }, [urlId, activePost, navigate]);

  // An unknown uid shows the wiki-accented 404 (rendered after every hook, just before the main return).
  const missingNote = Boolean(urlId && !activePost && !indexLoading);

  const effectiveConnections: Connection[] = connections;

  // Simplified mode: force name-only search and clear filters on switch
  useEffect(() => {
    if (isSimplified && searchMode !== 'name') setSearchMode('name');
  }, [isSimplified]);

  useEffect(() => {
    if (isSimplified) resetFilters();
  }, [isSimplified]);

  const toolbarInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus toolbar input when search becomes active (e.g. typed from detail view)
  useEffect(() => {
    if (searchActive && toolbarInputRef.current) {
      toolbarInputRef.current.focus();
    }
  }, [searchActive]);


  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  }, [setFilterState]);

  // Type-to-search: any printable key focuses toolbar input
  // Disabled while focused in inputs or editable elements
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (el.isContentEditable) return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      // Backspace: delete last character from query
      if (e.key === 'Backspace' && query) {
        e.preventDefault();
        setQuery(query.slice(0, -1));
        toolbarInputRef.current?.focus();
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        // Append character to query — this also flips detail→grid when searchActive becomes true
        setQuery(query + e.key);
        // Focus input if toolbar is already rendered (grid view)
        toolbarInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [query, setQuery]);

  // Wiki-link click handler — extend trail with the clicked concept
  const handleWikiLinkClick = useCallback((conceptId: string) => {
    const concept = noteById.get(conceptId);
    if (concept) scheduleExtend(concept);
  }, [noteById, scheduleExtend]);

  // Grid card click — reset trail to single item.
  // Uses ref to avoid re-creating the callback when activePost changes,
  // which would defeat React.memo on grid cards.
  const activePostRef = useRef(activePost);
  activePostRef.current = activePost;

  const handleGridCardClick = useCallback((post: WikiNoteMeta) => {
    if (activePostRef.current?.id !== post.id) invalidateContent();
    clearSearch();
    scheduleReset(post);
  }, [invalidateContent, clearSearch, scheduleReset]);

  // Connection / mention click — extend trail
  const handleConnectionClick = useCallback((post: WikiNoteMeta) => {
    scheduleExtend(post);
  }, [scheduleExtend]);
  const handleNeighborhoodPreview = useCallback((post: WikiNoteMeta | null) => {
    window.dispatchEvent(new CustomEvent('wiki-link-preview', { detail: post?.id ?? null }));
  }, []);

  // Delegated click handler for wiki-ref links inside dangerouslySetInnerHTML regions
  const handleInlineWikiClick = useCallback((e: React.MouseEvent) => {
    const link = (e.target as HTMLElement).closest('a.wiki-ref-resolved') as HTMLAnchorElement | null;
    if (!link) return;
    e.preventDefault();
    const href = link.getAttribute('href');
    if (!href) return;
    const noteId = secondBrainUidFromPath(href);
    if (noteId) handleWikiLinkClick(noteId);
    navigate(href);
  }, [handleWikiLinkClick, navigate]);

  // When search is active, force list view
  const showDetail = activePost && !searchActive;
  const activeFilterMembership = useMemo(() => {
    if (!activePost || (!hasActiveFilters && !directoryScope && !query.trim())) return null;
    return sortedResults.some(note => note.id === activePost.id);
  }, [activePost, directoryScope, hasActiveFilters, query, sortedResults]);

  // Content ready = content loaded for the currently displayed note
  const contentReady = activePost?.id === contentReadyId;

  // Mention hover preview
  const [mentionPreview, setMentionPreview] = useState<{
    visible: boolean; title: string; address: string; description: string; x: number; y: number;
  }>({ visible: false, title: '', address: '', description: '', x: 0, y: 0 });
  const mentionHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMentionPreview = useCallback((m: WikiNoteMeta, e: React.MouseEvent) => {
    if (mentionHideTimer.current) { clearTimeout(mentionHideTimer.current); mentionHideTimer.current = null; }
    setMentionPreview({
      visible: true,
      title: noteLabel(m),
      address: m.address || '',
      description: m.description || '',
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const hideMentionPreview = useCallback(() => {
    mentionHideTimer.current = setTimeout(() => {
      setMentionPreview(p => ({ ...p, visible: false }));
      mentionHideTimer.current = null;
    }, 80);
  }, []);

  // "Unvisited only" filter for grid view
  const [unvisitedOnly, setUnvisitedOnly] = useState(false);

  // Welcome banner — dismissed once via localStorage
  const [welcomeDismissed, setWelcomeDismissed] = useState(() =>
    localStorage.getItem('sb-welcome-dismissed') === '1'
  );
  const dismissWelcome = useCallback((mode?: 'simplified' | 'technical') => {
    if (mode) setViewMode(mode);
    setWelcomeDismissed(true);
    localStorage.setItem('sb-welcome-dismissed', '1');
  }, [setViewMode]);

  // Escape to dismiss welcome banner
  useEffect(() => {
    if (welcomeDismissed) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismissWelcome('technical');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [welcomeDismissed, dismissWelcome]);

  // Mobile "back to top" button — visible when scrolled past threshold
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    let visible = window.scrollY > 400;
    let frame = 0;
    setShowScrollTop(visible);
    const handler = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const next = window.scrollY > 400;
        if (next !== visible) {
          visible = next;
          setShowScrollTop(next);
        }
      });
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => {
      window.removeEventListener('scroll', handler);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Copy export modal state
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Right column: zone filtering toggle (graph always visible)
  const [zoneFilter, setZoneFilter] = useState(true);

  // Right-column zone + detail navigation
  const [activeZone, setActiveZone] = useState<Zone>(null);
  const [focusedDetailIdx, setFocusedDetailIdx] = useState(0);
  const [showDetailFocus, setShowDetailFocus] = useState(false);

  // Build family items for the unified list, filtered by active zone when graph is visible
  const familyItems = useMemo<FamilyItem[]>(() => {
    const items: FamilyItem[] = [];
    if (neighborhood.parent) items.push({ note: neighborhood.parent, zone: 'parent' });
    neighborhood.siblings.forEach(s => items.push({ note: s, zone: 'siblings' }));
    neighborhood.children.forEach(c => items.push({ note: c, zone: 'children' }));
    if (zoneFilter && activeZone) {
      return items.filter(i => i.zone === activeZone);
    }
    return items;
  }, [neighborhood, zoneFilter, activeZone]);

  // Set default zone when note changes — persist previous zone if still valid
  useEffect(() => {
    setActiveZone(prev => {
      if (prev === 'parent' && neighborhood.parent) return 'parent';
      if (prev === 'siblings' && neighborhood.siblings.length > 0) return 'siblings';
      if (prev === 'children' && neighborhood.children.length > 0) return 'children';
      if (neighborhood.siblings.length > 0) return 'siblings';
      if (neighborhood.children.length > 0) return 'children';
      if (neighborhood.parent) return 'parent';
      return null;
    });
    setFocusedDetailIdx(0);
  }, [activePost?.id, neighborhood.siblings.length, neighborhood.children.length, neighborhood.parent]);

  // Reset focused index when zone changes
  useEffect(() => {
    setFocusedDetailIdx(0);
  }, [activeZone]);

  // --- Infinite scroll ---
  const BATCH_SIZE = 50;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visible count when results change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [sortedResults]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + BATCH_SIZE, sortedResults.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sortedResults.length]);

  // Exclude the currently-open note from search results + optional unvisited filter
  const visibleResults = useMemo(() => {
    let results = searchActive && activePost
      ? sortedResults.slice(0, visibleCount).filter(n => n.id !== activePost.id)
      : sortedResults.slice(0, visibleCount);
    if (unvisitedOnly) results = results.filter(n => !isVisited(n.id));
    return results;
  }, [sortedResults, visibleCount, searchActive, activePost, unvisitedOnly, isVisited]);

  // --- Homonyms: other parents that share the same leaf name ---
  const homonymParents = useMemo(() => {
    if (!activePost || homonyms.length < 2) return [];
    return homonyms
      .filter(h => h.id !== activePost.id)
      .map(h => {
        const parts = h.addressParts || [h.title];
        if (parts.length < 2) return null;
        const parentAddr = parts.slice(0, -1).join('//');
        const parentId = addressToNoteId.get(parentAddr);
        const parentNote = parentId ? noteById.get(parentId) || null : null;
        return parentNote ? { parent: parentNote, homonym: h } : null;
      })
      .filter((x): x is { parent: WikiNoteMeta; homonym: WikiNoteMeta } => x !== null);
  }, [activePost, homonyms, noteById, addressToNoteId]);

  const homonymLeaf = useMemo(() => {
    if (!activePost || homonyms.length < 2) return '';
    const parts = activePost.addressParts || [activePost.title];
    return parts[parts.length - 1];
  }, [activePost, homonyms]);

  const [homonymIdx, setHomonymIdx] = useState(0);

  // Reset homonym index when note changes
  useEffect(() => { setHomonymIdx(0); }, [activePost?.id]);

  const cycleHomonym = useCallback((direction: 'prev' | 'next') => {
    if (homonymParents.length === 0) return;
    const next = direction === 'prev'
      ? (homonymIdx - 1 + homonymParents.length) % homonymParents.length
      : (homonymIdx + 1) % homonymParents.length;
    const target = homonymParents[next].homonym;
    setHomonymIdx(next);
    scheduleExtend(target);
    navigate(secondBrainPath(target.id));
  }, [homonymParents, homonymIdx, scheduleExtend, navigate]);

  // Available zones in left→right order (matches SVG layout)
  const availableZones = useMemo<Zone[]>(() => {
    const z: Zone[] = [];
    if (neighborhood.parent) z.push('parent');
    if (neighborhood.siblings.length > 0) z.push('siblings');
    if (neighborhood.children.length > 0) z.push('children');
    return z;
  }, [neighborhood.parent, neighborhood.siblings.length, neighborhood.children.length]);

  // --- Detail-view items for keyboard nav ---
  const detailItems = useMemo(() => {
    if (!showDetail || !activeZone) return [];
    if (activeZone === 'parent') {
      const items: WikiNoteMeta[] = [];
      if (neighborhood.parent) items.push(neighborhood.parent);
      homonymParents.forEach(gp => {
        if (!items.some(i => i.id === gp.parent.id)) items.push(gp.parent);
      });
      return items;
    }
    if (activeZone === 'siblings') return neighborhood.siblings;
    if (activeZone === 'children') return neighborhood.children;
    return [];
  }, [showDetail, activeZone, neighborhood, homonymParents]);

  const [focusedIdx, setFocusedIdx] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  // Auto-select first result when results change
  useEffect(() => {
    setFocusedIdx(0);
  }, [sortedResults]);

  // Detect column count from CSS grid
  const getColCount = useCallback(() => {
    const grid = gridRef.current;
    if (!grid || grid.children.length === 0) return 1;
    const firstTop = (grid.children[0] as HTMLElement).offsetTop;
    let cols = 1;
    for (let i = 1; i < grid.children.length; i++) {
      if ((grid.children[i] as HTMLElement).offsetTop === firstTop) cols++;
      else break;
    }
    return cols;
  }, []);

  // Throttle ref for arrow key repeat
  const lastArrowTime = useRef(0);
  const ARROW_THROTTLE = 80; // ms between arrow key repeats

  // Check if any notes have been visited (for showing unvisited toggle)
  const hasVisited = useMemo(() => sortedResults.some(n => isVisited(n.id)), [sortedResults, isVisited]);

  useEffect(() => {
    if (showDetail) return; // Only active in list view

    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const tag = el.tagName;
      if (el.isContentEditable) return;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA';

      // Any arrow key or Enter from input → transfer focus to grid
      const isArrow = e.key.startsWith('Arrow');
      if (isInput && (isArrow || e.key === 'Enter')) {
        e.preventDefault();
        (e.target as HTMLElement).blur();
        if (e.key === 'Enter') {
          const total = visibleResults.length;
          const idx = focusedIdx >= 0 ? focusedIdx : 0;
          if (idx < total) {
            const note = visibleResults[idx];
            handleGridCardClick(note);
            navigate(secondBrainPath(note.id));
          }
          return;
        }
      } else if (isInput) {
        return;
      }

      const total = visibleResults.length;
      if (total === 0) return;

      // Throttle arrow key repeats
      if (isArrow && e.repeat) {
        const now = Date.now();
        if (now - lastArrowTime.current < ARROW_THROTTLE) return;
        lastArrowTime.current = now;
      }

      const cols = getColCount();
      let next = focusedIdx;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          next = Math.min(focusedIdx + 1, total - 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          next = Math.max(focusedIdx - 1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (focusedIdx + cols < total) next = focusedIdx + cols;
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIdx - cols >= 0) next = focusedIdx - cols;
          break;
        case 'Enter':
          if (focusedIdx >= 0 && focusedIdx < total) {
            e.preventDefault();
            const note = visibleResults[focusedIdx];
            handleGridCardClick(note);
            navigate(secondBrainPath(note.id));
          }
          return;
        case 'Escape':
          if (searchActive && activePost) {
            clearSearch();
          }
          setFocusedIdx(-1);
          return;
        default:
          return;
      }

      setFocusedIdx(next);
      const card = gridRef.current?.querySelector(`[data-idx="${next}"]`) as HTMLElement | null;
      if (card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDetail, focusedIdx, visibleResults, getColCount, handleGridCardClick, navigate, searchActive, activePost, clearSearch]);

  // --- Detail-view arrow-key navigation (right column boxes) ---
  useEffect(() => {
    if (!showDetail) return;

    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (el.isContentEditable) return;

      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && availableZones.length > 1) {
        e.preventDefault();
        const curIdx = activeZone ? availableZones.indexOf(activeZone) : -1;
        const nextIdx = e.key === 'ArrowLeft'
          ? (curIdx <= 0 ? availableZones.length - 1 : curIdx - 1)
          : (curIdx >= availableZones.length - 1 ? 0 : curIdx + 1);
        setActiveZone(availableZones[nextIdx]);
        return;
      }

      const total = detailItems.length;
      if (total === 0) return;

      const isArrow = e.key === 'ArrowUp' || e.key === 'ArrowDown';
      if (isArrow && e.repeat) {
        const now = Date.now();
        if (now - lastArrowTime.current < ARROW_THROTTLE) return;
        lastArrowTime.current = now;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setShowDetailFocus(true);
          setFocusedDetailIdx(prev => Math.min(prev + 1, total - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setShowDetailFocus(true);
          setFocusedDetailIdx(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (focusedDetailIdx >= 0 && focusedDetailIdx < total) {
            e.preventDefault();
            const item = detailItems[focusedDetailIdx];
            handleConnectionClick(item);
            navigate(secondBrainPath(item.id));
          }
          break;
        default:
          return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDetail, detailItems, focusedDetailIdx, handleConnectionClick, navigate, availableZones, activeZone]);

  // Escape in detail view — navigate back to grid
  useEffect(() => {
    if (!showDetail) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return;
      e.preventDefault();
      navigate(secondBrainPath());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDetail, navigate]);

  // Hide detail focus highlight on mouse click (re-shown on next arrow key)
  useEffect(() => {
    if (!showDetail) return;
    const hide = () => setShowDetailFocus(false);
    window.addEventListener('mousedown', hide);
    return () => window.removeEventListener('mousedown', hide);
  }, [showDetail]);

  if (indexLoading) {
    return <div className="animate-fade-in py-12 text-center text-xs text-th-tertiary">Loading index...</div>;
  }

  if (missingNote) return <ErrorConceptView accent="wiki" />;

  return (
    <div className={`animate-fade-in${showDetail ? '' : ' pt-4 md:pt-5'}`}>
      {/* Toolbar — always mounted so type-to-search input exists in DOM.
          Hidden in detail view to avoid layout shift, but input stays focusable. */}
      <div style={showDetail ? { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' } : undefined}>
        <DockedToolbar
          query={query}
          setQuery={setQuery}
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          searchFields={searchFields}
          toggleSearchField={toggleSearchField}
          sortMode={sortMode}
          setSortMode={setSortMode}
          filterState={filterState}
          updateFilter={updateFilter}
          hasActiveFilters={hasActiveFilters}
          resetFilters={resetFilters}
          directoryScope={directoryScope}
          setDirectoryScope={setDirectoryScope}
          sortedCount={sortedResults.length}
          unvisitedOnly={unvisitedOnly}
          setUnvisitedOnly={setUnvisitedOnly}
          hasVisited={hasVisited}
          isVisited={isVisited}
          allNotes={allWikiNotes}
          stats={stats}
          inputRef={toolbarInputRef}
          viewMode={viewMode}
          sortedResults={sortedResults}
          connectionsMap={connectionsMap}
        />
      </div>

      {/* Welcome screen — first visit only, portaled to body to escape transform stacking context */}
      {trail.length > 0 && activePost && <div className="mb-3 max-w-3xl overflow-hidden">
        <NavigationTrail
          trail={trail}
          // React Router runs navigate as a transition; the trail update must ride the same transition or the bar vanishes a frame before the page changes.
          onItemClick={index => { const item = trail[index]; startTransition(() => { truncateTrail(index); navigate(secondBrainPath(item.id)); }); }}
          onAllConceptsClick={() => startTransition(() => { clearTrail(); navigate(secondBrainPath()); })}
        />
      </div>}

      {!welcomeDismissed && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget) dismissWelcome('technical'); }}
        >
          <div className="max-w-lg mx-4 border border-violet-500/25 rounded-xl px-4 sm:px-8 py-8 sm:py-10 bg-th-surface/95 shadow-2xl">
            <p className="text-[15px] text-th-secondary leading-relaxed">
              <strong className="text-violet-400">This is a personal knowledge graph</strong> — a
              working reference I maintain as I study and build. It's not polished for consumption,
              but if you work with systems, infrastructure, or low-level computing, you might find
              useful things here.
            </p>
            <p className="text-[15px] text-th-secondary leading-relaxed mt-4">
              Concepts link to each other, so instead of reading top-to-bottom, you{' '}
              <strong className="text-violet-400">follow connections</strong>. Click any card, then
              follow the links in the body or the reference panel to keep going. The breadcrumb
              trail tracks where you've been.
            </p>
            <p className="text-sm text-th-muted mt-5 italic">Long learning.</p>
            <button
              onClick={() => dismissWelcome('technical')}
              className="mt-8 w-full border border-violet-500/30 px-4 py-3 text-center text-[11px] uppercase tracking-[.12em] text-violet-300 hover:border-violet-500/55 hover:bg-violet-500/10 transition-colors"
            >
              Enter the Wiki
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Detail view — conditional so it doesn't render during search.
           Grid below stays always-mounted for instant search entry. */}
      {showDetail && (
        <div className={isSimplified ? 'max-w-3xl' : 'max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-10'}>
          {/* Left: metadata always visible, body fades when content loads */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-th-heading">
                {noteLabel(activePost!)}
                {!isSimplified && <BridgeScoreBadge percentile={getPercentile(activePost!.id)} />}
                {activeFilterMembership !== null && (
                  <span
                    className={`ml-1.5 inline-flex h-[13px] translate-y-[-0.18em] items-center rounded-[2px] border px-1 font-mono text-[7px] font-medium uppercase leading-none tracking-[.055em] ${activeFilterMembership
                      ? 'border-violet-400/30 bg-violet-400/[.08] text-violet-300/90'
                      : 'border-violet-400/18 bg-violet-400/[.04] text-violet-300/55'
                    }`}
                    title={activeFilterMembership ? 'This concept is included in the current filter' : 'This concept is outside the current filter'}
                  >
                    {activeFilterMembership ? 'in filter' : 'outside filter'}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowCopyModal(true)}
                className="ml-auto shrink-0 text-th-tertiary hover:text-violet-400 transition-colors"
                title="Copy for context"
                aria-label="Copy for context"
              >
                <RocketIcon size={14} />
              </button>
            </div>
            <div className="text-[11px] text-th-tertiary mb-2">
              {activePost!.addressParts && activePost!.addressParts.length > 1
                ? activePost!.addressParts.map((part, i) => {
                  const pathUpTo = activePost!.addressParts!.slice(0, i + 1).join('//');
                  const ancestorId = addressToNoteId.get(pathUpTo);
                  const ancestor = ancestorId ? noteById.get(ancestorId) : undefined;
                  const isLast = i === activePost!.addressParts!.length - 1;
                  return (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="mx-0.5 text-th-muted">/</span>}
                      {isLast
                        ? <span>{part}</span>
                        : ancestor
                          ? <Link to={secondBrainPath(ancestor.id)} className="hover:text-violet-400 transition-colors" onClick={() => {
                            scheduleReset(ancestor);
                          }}>{part}</Link>
                          : <span>{part}</span>
                      }
                    </React.Fragment>
                  );
                })
                : <span>Root node</span>}
            </div>

            {/* ─── Mentioned in (below address) ─── */}
            {mentions.length > 0 && (
              <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-sans">
                {mentions.map((m) => (
                  <Link
                    key={m.id}
                    to={secondBrainPath(m.id)}
                    onClick={() => handleConnectionClick(m)}
                    onMouseEnter={(e) => { showMentionPreview(m, e); window.dispatchEvent(new CustomEvent('wiki-link-preview', { detail: m.id })); }}
                    onMouseLeave={() => { hideMentionPreview(); window.dispatchEvent(new CustomEvent('wiki-link-preview', { detail: null })); }}
                    className={`text-sm font-normal transition-colors no-underline ${isVisited(m.id) ? 'text-blue-400 hover:text-blue-300' : 'text-violet-400 hover:text-violet-300'}`}
                  >
                    {noteLabel(m)}<svg className="inline w-[0.85em] h-[0.85em] ml-0.5 opacity-50" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ verticalAlign: '-0.1em' }}><path fillRule="evenodd" clipRule="evenodd" d={ICON_REF_IN} /></svg>
                  </Link>
                ))}
                <WikiLinkPreview {...mentionPreview} variant="blue" />
              </div>
            )}

            {/* Metadata line */}
            <div className="text-xs text-th-tertiary mb-4 flex items-center gap-2">
              <span>links {'\u2193'} {outgoingRefCount}</span>
              <span>&middot;</span>
              <span>mentioned {'\u2191'} {mentions.length}</span>
            </div>

            {/* Body + Interactions box */}
            <div className="wiki-content-box">
              {/* Content — only this section fades during note transitions */}
              <div
                style={{
                  opacity: contentReady ? 1 : 0,
                  transition: contentReady ? 'opacity 150ms ease-in' : 'none',
                }}
              >
                <div className="article-page-wrapper article-wiki">
                  <WikiContent
                    html={resolvedHtml}
                    className="article-content"
                    onWikiLinkClick={handleWikiLinkClick}
                    isVisited={isVisited}
                  />
                </div>
              </div>

              {/* Curated interactions */}
              {effectiveConnections.length > 0 && (
                  <div>
                    <hr className="border-t border-th-border my-6" />
                    {(() => {
                      const renderItem = (conn: Connection, icon: string, annotationText: string | null) => {
                        const v = isVisited(conn.note.id);
                        return (
                          <div key={conn.note.id}>
                            <Link
                              to={secondBrainPath(conn.note.id)}
                              onClick={() => handleConnectionClick(conn.note)}
                              onMouseEnter={() => window.dispatchEvent(new CustomEvent('wiki-link-preview', { detail: conn.note.id }))}
                              onMouseLeave={() => window.dispatchEvent(new CustomEvent('wiki-link-preview', { detail: null }))}
                              className="wiki-sidelink inline transition-colors no-underline border-b border-solid cursor-pointer"
                              style={{ '--wl-color': v ? 'var(--wiki-link-visited)' : 'var(--cat-wikinotes-accent)' } as React.CSSProperties}
                            >
                              <span className="text-sm">{noteLabel(conn.note)}</span><svg className="inline w-[0.85em] h-[0.85em] ml-0.5 opacity-80" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ verticalAlign: '-0.1em' }}><path fillRule="evenodd" clipRule="evenodd" d={icon} /></svg>
                            </Link>
                            {conn.note.address && (
                              <span className="text-sm text-th-secondary ml-2">{displayAddress(conn.note.address)}</span>
                            )}
                            {annotationText && (
                              <div className="text-sm text-th-secondary mt-0.5 font-sans" onClick={handleInlineWikiClick}>
                                <span dangerouslySetInnerHTML={{ __html: resolveWikiLinks(annotationText, [], noteById).html }} />
                              </div>
                            )}
                          </div>
                        );
                      };

                      if (isSimplified) {
                        // Flat list — no outgoing/incoming split
                        return (
                          <div>
                            <h3 className="text-xs text-th-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              Interactions
                            </h3>
                            <div className="space-y-3">
                              {effectiveConnections.map((conn: Connection) => {
                                const icon = conn.annotation !== null ? ICON_REF_OUT : ICON_REF_IN;
                                const text = conn.annotation ?? conn.reverseAnnotation;
                                return renderItem(conn, icon, text);
                              })}
                            </div>
                          </div>
                        );
                      }

                      const outgoing = effectiveConnections.filter((c: Connection) => c.annotation !== null);
                      const incoming = effectiveConnections.filter((c: Connection) => c.annotation === null);
                      return (
                        <div>
                          <h3 className="text-xs text-th-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            Interactions
                          </h3>
                          {outgoing.length > 0 && (
                            <div className="mb-4">
                              <div className="text-[10px] text-th-muted uppercase tracking-wider mb-2">{'\u2197'} Outgoing ({outgoing.length})</div>
                              <div className="space-y-3">
                                {outgoing.map((conn: Connection) => renderItem(conn, ICON_REF_OUT, conn.annotation))}
                              </div>
                            </div>
                          )}
                          {incoming.length > 0 && (
                            <div>
                              <div className="text-[10px] text-th-muted uppercase tracking-wider mb-2">{'\u2199'} Incoming ({incoming.length})</div>
                              <div className="space-y-3">
                                {incoming.map((conn: Connection) => renderItem(conn, ICON_REF_IN, conn.reverseAnnotation))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
              )}
            </div>
          </div>

          {/* Right panel: context (zone panels) */}
            {!isSimplified ? (
              <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
                <hr className="lg:hidden border-t border-th-border my-6" />
                <div>
                  <NeighborhoodGraph
                    neighborhood={neighborhood}
                    currentNote={activePost!}
                    onNoteClick={handleConnectionClick}
                    isVisited={isVisited}
                    activeZone={zoneFilter ? activeZone : null}
                    onActiveZoneChange={(zone) => { setZoneFilter(true); setActiveZone(zone); }}
                    onNotePreview={handleNeighborhoodPreview}
                    homonymParents={homonymParents}
                    onHomonymNavigate={(homonym) => {
                      scheduleExtend(homonym);
                      navigate(secondBrainPath(homonym.id));
                    }}
                  />
                </div>
                <label className="flex items-center gap-1.5 mt-3 mb-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={zoneFilter}
                    onChange={() => setZoneFilter(v => !v)}
                    className="accent-violet-400 w-3 h-3"
                  />
                  <span className="text-[10px] text-th-muted">filter by zone</span>
                </label>
                <div className="mt-2">
                  <RelevanceLeaderboard
                    mode="family"
                    familyItems={familyItems}
                    noteById={noteById}
                    onNoteClick={handleConnectionClick}
                    isVisited={isVisited}
                    getPercentile={getPercentile}
                  />
                </div>
              </div>
            ) : null}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="lg:hidden w-full mt-8 mb-4 py-2 text-[10px] uppercase tracking-wider text-th-muted hover:text-violet-400 border border-th-hub-border hover:border-violet-400/30 transition-colors"
            >
              Back to top
            </button>
          </div>
      )}

          {/* --- Concept List View (always mounted, hidden when detail is shown) --- */}
          <div style={showDetail ? { display: 'none' } : undefined}>
            <div ref={gridRef} className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(14.5rem, 100%), 1fr))' }}>
              {visibleResults.length > 0 ? (
                visibleResults.map((note, idx) => (
                    <GridCard
                      key={note.id}
                      note={note}
                      idx={idx}
                      focused={focusedIdx === idx}
                      visited={isVisited(note.id)}
                      onCardClick={handleGridCardClick}
                      outgoing={note.references?.length || 0}
                      incoming={(backlinksMap.get(note.id) || []).length}
                      articles={hub.articleUsage.get(note.id) ?? []}
                    />
                ))
              ) : (
                <div className="text-xs text-th-tertiary py-8 text-center col-span-3">
                  No concepts match your search
                </div>
              )}
            </div>
            {/* Infinite scroll sentinel */}
            {visibleCount < sortedResults.length && (
              <div ref={sentinelRef} className="h-1" />
            )}
          </div>

          {/* Mobile floating search button — portal to body to escape animate-fade-in transform stacking context */}
          {showDetail && createPortal(
            <button
              onClick={() => {
                navigate(secondBrainPath());
                setTimeout(() => {
                  toolbarInputRef.current?.scrollIntoView({ block: 'nearest' });
                  toolbarInputRef.current?.focus();
                }, 100);
              }}
              className="wiki-fab lg:hidden fixed bottom-[72px] right-4 z-40 w-11 h-11 rounded-full bg-violet-500/90 text-th-on-accent shadow-lg flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Search concepts"
            >
              <SearchIcon />
            </button>,
            document.body
          )}

          {/* Mobile floating "back to top" button — grid view, after scrolling past first infinite-scroll batch */}
          {!showDetail && showScrollTop && visibleCount > BATCH_SIZE && createPortal(
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="wiki-fab lg:hidden fixed bottom-16 right-4 z-40 w-11 h-11 rounded-full bg-violet-500/90 text-th-on-accent shadow-lg flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Back to top"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            </button>,
            document.body
          )}



          {/* Copy export modal */}
          {showCopyModal && activePost && (
            <CopyExportModal
              note={activePost}
              neighborhood={neighborhood}
              connections={connections}
              backlinks={backlinks}
              connectionsMap={connectionsMap}
              neighborhoodMap={neighborhoodMap}
              noteById={noteById}
              totalNotes={allWikiNotes.length}
              onClose={() => setShowCopyModal(false)}
            />
          )}

        </div>
      );
};
