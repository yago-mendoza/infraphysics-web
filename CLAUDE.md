# InfraPhysics — Development Guide

> Instructions for AI coding assistants (Claude Code, Copilot, Cursor, etc.) working on this codebase. Contains automation rules, architecture patterns, and active gotchas. Human developers may also find it useful as a concise architectural reference.

## Automation Rules

These are **mandatory triggers** — when X happens, do Y.

### On file create/delete
1. Update file tree in root `README.md`
2. Check if file should be added/removed from `FILES` array in `dev-scripts/dump-context.sh`

### On writing or editing article content
**Before generating or editing any markdown**, read **[src/data/pages/README.md](src/data/pages/README.md)**. It documents every available syntax feature, frontmatter schema per content type (projects, threads, bits2bricks, fieldnotes), edge cases, and recommendations. Never guess syntax from memory — always consult that file.

**Before managing fieldnotes** (creating, renaming, deleting, restructuring), read **[src/data/pages/fieldnotes/README.md](src/data/pages/fieldnotes/README.md)**. It covers the available scripts, step-by-step workflows, cascading effects, and the full error reference. Never rename or delete fieldnotes by hand — use the scripts.

**After editing any `.md` file in `src/data/pages/`**, run `npm run build` to recompile content. Markdown is compiled at build time — changes are invisible until the build runs.

### On syntax/pipeline/frontmatter change
Update `src/data/pages/README.md` — it's the **single source of truth** for content authors. Covers: custom syntax rules (`compiler.config.js`), frontmatter fields, typed blockquotes, wiki-link/cross-doc link processing, image positioning, fieldnotes format, validation rules, Shiki language themes, pipeline ordering.

### On README-worthy documentation
Root `README.md` is a **hub** — max 3 lines per topic, then link to a specialized README:

| README | Covers |
|---|---|
| **scripts/README.md** | Build pipeline (14 steps), cache format, outputs, Shiki, validation |
| **src/data/pages/README.md** | Authoring: frontmatter, custom syntax, wiki-links, edge cases |
| **src/data/pages/fieldnotes/README.md** | Fieldnotes management: scripts, workflows, rename/delete, build errors, cascading effects |

If a new subsystem needs more than a paragraph of docs, extend or create a specialized README and link from root.

### On context dump request
User may say "dump context", "dame un TXT", etc. Before running `dev-scripts/dump-context.sh`:
1. Ask what area/purpose
2. Tailor the `FILES` array (comment out irrelevant, uncomment relevant)
3. Verify files exist
4. Run and report output path

### On address rename (fieldnotes)

> **`rename-address.js` renames ONE exact address. It does NOT cascade to children.** If the note has children (e.g. `node//child`), each child must be renamed in a separate script call. See "Restructuring a hierarchy" in [fieldnotes/README.md](src/data/pages/fieldnotes/README.md#restructuring-a-hierarchy).

**Simple rename** (no children, no hierarchy change):
1. `node scripts/rename-address.js "old" "new"` — dry-run, review output
2. `node scripts/rename-address.js "old" "new" --apply`
3. `npm run build` to verify
4. Check `distinct` entries in other notes — any referencing the old address are now stale
5. Commit all changed files together

**Restructuring** (moving into/out of a hierarchy, or any rename where the note has children):
1. Use `//` for hierarchy, NOT `/` (`/` is part of a segment name like `I/O`)
2. `node scripts/move-hierarchy.js "node" "X//node"` — dry-run, review plan
3. `node scripts/move-hierarchy.js "node" "X//node" --apply` — execute (cascades to all descendants)
4. `npm run build` to verify
5. `node scripts/check-references.js` to catch orphans, stale `distinct`, one-way refs
6. Commit all changed files together

### On creating fieldnotes (single or bulk)
**Before creating**, check for segment collisions: search existing fieldnote addresses for the last segment of each proposed address (case-insensitive). If the segment already appears anywhere in the hierarchy — even as a non-terminal (e.g. creating `X//Y//Z` when `P//Q//Z//U` exists) — evaluate whether it's the same concept. If it is, the new note may belong under the existing hierarchy instead. This avoids creating notes that immediately trigger build-time collision warnings.

**After creating:**
1. Run `npm run build` to validate all references
2. Run `node scripts/check-references.js` to check for orphans and weak parents
3. Create stub notes for any missing parents
4. Optionally: `node scripts/analyze-pairs.js "addr" --all` to verify expected connections exist

### On Second Brain UX change
If a change affects non-obvious behavior or interaction patterns in the Second Brain (keyboard shortcuts, navigation, visual indicators, filters, etc.), update the **GuidePopup** tips in `src/components/layout/SecondBrainSidebar.tsx` so users can discover the feature via the info icon.

### On any code change
Do **only** what was requested. Do not refactor adjacent code, add extra styling, or make unsolicited improvements. If something else should change, mention it — don't do it.

### On completed task
Append relevant lessons to the **Gotchas** section below. Update or remove stale entries.

---

## Stack

- React 19 + TypeScript, Vite 6, React Router DOM 7
- Tailwind CSS via CDN (NOT npm) — runtime-generated classes, config inline in `index.html`
- Content compiled at build time: marked + Shiki + custom preprocessors

## Routes

- Personal: `/home`, `/about`, `/contact`, `/thanks`
- Lab: `/lab/projects` (dark theme)
- Blog: `/blog/threads`, `/blog/bits2bricks` (light theme)
- Second Brain: `/lab/second-brain`, `/lab/second-brain/:id` (dark theme)
- Post detail: `/lab/:category/:id` (dark), `/blog/:category/:id` (light)
- Theme auto-switch: `/lab/*` → dark, `/blog/*` → light (instant, no transition). Manual toggle (Shift+T) still works per-page.
- Backgrounds: Starfield (personal, dark only), DualGrid (lab/wiki), Clean (blog posts)

---

## Theme System

**Rule: never use hardcoded color classes** (`text-white`, `bg-gray-900`, etc.). Everything goes through the cascade:

```
index.html :root / [data-theme="light"]   →  CSS custom properties
  ↓
inline tailwind.config colors              →  th-* semantic tokens
  ↓
components                                 →  th-* classes
```

### Adding a new color
1. Add to `:root` AND `[data-theme="light"]` in `index.html`
2. Add Tailwind token mapping in inline config
3. Use `th-*` class

### What stays hardcoded (theme-constant)
- Category accents: `--cat-projects-accent`, `--cat-threads-accent`, `--cat-bits2bricks-accent`, `--cat-fieldnotes-accent` — identity colors, same in both themes. Access via `catAccentVar(category)` → returns `var(--cat-*-accent)` string.
- Status colors in `STATUS_CONFIG` (`config/categories.tsx`): raw hex, theme-constant.
- Accent interactions: `hover:text-blue-400` for links.

### Theme switching
Two distinct paths in `ThemeContext`:
- **`setTheme(next)`** — instant, no animation. Used by route auto-switch (`useLayoutEffect` in AppLayout).
- **`toggleTheme()`** — smooth fade via `.theme-transitioning` on `<html>`. Used by manual toggle (Shift+T, search palette).

`.theme-transitioning` transitions **standard properties only** (background-color, color, border-color, box-shadow, fill, stroke, opacity). Never transition custom properties — see Gotchas.

---

## CSS Architecture Patterns

### Targeting rule
Before editing CSS, confirm the **exact file and selector** to modify. Never apply broad/global fixes unless explicitly asked. When the user references a visual element, identify the specific selector first — don't guess from similar names.

### Article accent cascade
```
article.css :root                    →  --art-accent base (lime/projects)
.article-{category}                  →  overrides --art-accent per category
.article-page-wrapper                →  color-mix() derivations (--art-accent-dim, --art-accent-bg, etc.)
```
**Derivations MUST live on `.article-page-wrapper`**, not `:root`. CSS vars resolve at computation time — if derivations are on `:root`, they bake in the default accent and ignore category overrides.

### Second Brain styling
`article.css` (base) + `wiki-content.css` (~50-line delta: purple accent, Inter font, no-uppercase headings, Linux code blocks). Purple cascades through `--art-accent` → `color-mix()` derivations automatically.

### Dynamic category colors on cards
Use `.group-hover-accent` + `--ac-color` CSS custom property. Never hardcode `group-hover:text-blue-400`. Pattern exists in Bits2BricksGrid, SearchResultsList.

### Accent chips
`accentChipStyle()` in `lib/color.ts` returns style object with `color-mix()`. Works with CSS var refs and raw hex.

### Text on accent surfaces
Use `th-on-accent`, not `th-heading`. `th-heading` flips to near-black in light mode — kills contrast on colored backgrounds. `--text-on-accent` stays `#ffffff` in both themes.

---

## Gotchas

Active traps that will break things silently if forgotten. Each one was hit at least once.

### Dynamic Tailwind interpolation
`bg-${color}/20`, `text-${color}` work with CDN play mode but produce **zero CSS** under any build-time pipeline. Fix: pass hex as CSS custom properties on the element and resolve with plain CSS rules. Pattern: `--section-accent`, `--card-accent`, `--ac-color`.

### Light-mode opacity asymmetry
`rgba(255,255,255,0.10)` on black is visible; `rgba(0,0,0,0.10)` on white is nearly invisible. Light borders/surfaces need **2-3x the opacity** of dark counterparts. When adjusting `--bg-surface`, also shift `--content-code-bg` (must stay one step darker than surface).

### Custom property transitions cause flash
Never transition `--cat-threads-accent` AND `color: var(--cat-threads-accent)` simultaneously. The browser double-interpolates — var resolves mid-transition while color runs its own. Fix: `.theme-transitioning` only lists standard properties. `@property` registrations stay for type documentation but are never transitioned.

### `.article-related` accent scope
Related section uses `article-${targetCategory}` but `--art-accent` inherits from the page wrapper (current article's category). Fix: explicit overrides on `.article-related.article-*` selectors with higher specificity.

### Hero gradient in light mode
`linear-gradient(to top, var(--art-surface), transparent)` looks good in dark (fades to black) but washed out in light (white fog). Fix: `[data-theme="light"] .article-hero-gradient { opacity: 0; }`.

### StatusBadge dark/light split
`dark:` styles only apply when `theme !== 'light'`. Light variant uses its own class string. Keep both paths in sync when editing.
