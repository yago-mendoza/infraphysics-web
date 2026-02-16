# InfraPhysics — Development Guide

> Instructions for AI coding assistants (Claude Code, Copilot, Cursor, etc.) working on this codebase. Contains automation rules, architecture patterns, and active gotchas. Human developers may also find it useful as a concise architectural reference.

**Before and after every task**, check which automation rules below apply. Every file change, content edit, or structural decision has documentation consequences.

---

## Automation Rules

Mandatory triggers — when X happens, do Y.

### On writing or editing ARTICLES content

**1. Read the authoring docs first.** Never guess syntax, frontmatter, or editorial conventions from memory.

| Doc | What to look up |
|---|---|
| [pages/README.md](src/data/pages/README.md) | Frontmatter schemas, content types, editorial rules, compilation pipeline |
| [pages/SYNTAX.md](src/data/pages/SYNTAX.md) | All 16 custom syntax features, edge cases, quick reference table |
| [projects/README.md](src/data/pages/projects/README.md) | Projects editorial voice, storytelling patterns, ctx annotation conventions |
| [threads/README.md](src/data/pages/threads/README.md) | Threads editorial voice, serif typography, blockquote label rules, ctx restrictions |
| [bits2bricks/README.md](src/data/pages/bits2bricks/README.md) | Bits2Bricks editorial voice, tutorial structure |

**2. Verify factual claims.** When writing content that states dates, names, technical specs, historical events, or statistics — use web search to check accuracy. Do not assume recalled facts are correct.

**3. Build after editing.** After editing any `.md` file in `src/data/pages/`, run `npm run build`. Markdown is compiled at build time — changes are invisible until the build runs.

### On editorial feedback

When the user gives feedback on article quality (tone, structure, storytelling, editorial choices), incorporate the lesson into the README of that article's category folder (e.g. `src/data/pages/projects/README.md`). These READMEs accumulate editorial patterns — they're the memory for how each content type should be written.

### On managing fieldnotes

**Before** creating, renaming, deleting, or restructuring fieldnotes, read **[fieldnotes/README.md](src/data/pages/fieldnotes/README.md)**. It covers available scripts, step-by-step workflows, cascading effects, and the full error reference. Never rename or delete fieldnotes by hand — use the scripts.

**Creating fieldnotes:** Check for segment collisions first — search existing addresses for the last segment of each proposed address (case-insensitive). If it already exists anywhere in the hierarchy, evaluate whether it's the same concept before creating. After creating, run `npm run build`, then `node scripts/check-references.js` for orphans and weak parents, and create stub notes for missing parents.

**Renaming fieldnotes:**

> `rename-address.js` renames ONE exact address. It does NOT cascade to children. See [fieldnotes/README.md](src/data/pages/fieldnotes/README.md#restructuring-a-hierarchy).

- **Simple rename** (no children): dry-run → `--apply` → `npm run build` → check stale `distinct` entries → commit together.
- **Restructuring** (hierarchy change or note has children): use `move-hierarchy.js` instead — it cascades to all descendants. Dry-run → `--apply` → `npm run build` → `check-references.js` → commit together.
- Hierarchy separator is `//`, not `/`. `X//node` = child. `X/node` = literal slash in the segment name.

### On file create/delete

1. Update file tree in root `README.md`
2. Check if file should be added/removed from `FILES` array in `dev-scripts/dump-context.sh`

### On syntax/pipeline/frontmatter change

Update **[SYNTAX.md](src/data/pages/SYNTAX.md)** for syntax features. Update **[pages/README.md](src/data/pages/README.md)** for frontmatter schemas, content types, editorial rules, or pipeline changes. The two files together are the single source of truth for content authors.

### On README-worthy documentation

Root `README.md` is a hub — max 3 lines per topic, then link to a specialized README. If a new subsystem needs more than a paragraph of docs, create a specialized README and link from root.

### On Second Brain UX change

If a change affects non-obvious behavior in the Second Brain (keyboard shortcuts, navigation, visual indicators, filters), update the **GuidePopup** tips in `src/components/layout/SecondBrainSidebar.tsx`.

### On context dump request

User may say "dump context", "dame un TXT", etc. Before running `dev-scripts/dump-context.sh`:
1. Ask what area/purpose
2. Tailor the `FILES` array (comment out irrelevant, uncomment relevant)
3. Verify files exist
4. Run and report output path

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
- Second Brain: `/lab/second-brain`, `/lab/second-brain/:uid` (dark theme)
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

### YAML date auto-parsing
YAML parsers (like `gray-matter`) auto-convert bare `date: 2026-02-15` into a JS `Date` object, which stringifies to a full ISO timestamp (`2026-02-15T00:00:00.000Z`). Always **quote dates** in frontmatter (`date: "2026-02-15"`) to keep them as plain strings. The build normalizes with `.slice(0, 10)` as a safety net, but quoting is the correct fix.

### Blog category list duplicated for OG manifest
`build-content.js` has a local `BLOG_CATS` set (used to build URL paths for `og-manifest.json`) that mirrors `BLOG_CATEGORIES` in `categories.tsx`. If a new blog category is added, update both. Also add the new route pattern to `public/_routes.json`.
