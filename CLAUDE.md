# InfraPhysics — Development Guide

> Instructions for AI coding assistants (Claude Code, Copilot, Cursor, etc.) working on this codebase. Contains automation rules, architecture patterns, and active gotchas. Human developers may also find it useful as a concise architectural reference.

**Before and after every task**, check which automation rules below apply. Every file change, content edit, or structural decision has documentation consequences.

---

## Automation Rules

Mandatory triggers — when X happens, do Y.

### On writing or editing ARTICLES content

**⛔ Standing rule, high priority: no em-dashes in prose.** Never use the em-dash (`—`) as a punctuation break in any body text you write for this site. The author strongly dislikes it and it reads as an AI tell. Use a parenthesis (aside), a period (new sentence), or a comma (light pause) instead, and rebuild the sentence so the punctuation fits its meaning. Routine exception: list-style separators (definition lists, tldr bullets, trailing refs). Otherwise only rare, PUNCTUAL exceptions, never by habit. Full guidance in [EDITORIAL-RUBRIC.md](_generation/EDITORIAL-RUBRIC.md) ("Second absolute rule"). This also applies to anything else you write (commit messages, UI copy). The other two hard rules of the same rank, no double quotes in prose (use italics) and no arrows between concepts, live in [pages/STYLE.md](src/data/pages/STYLE.md).

**1. Read the authoring docs first.** Never guess syntax, frontmatter, or editorial conventions from memory.

| Doc | What to look up |
|---|---|
| [pages/README.md](src/data/pages/README.md) | Frontmatter schemas, content types, editorial rules, compilation pipeline |
| [pages/STYLE.md](src/data/pages/STYLE.md) | **Hard writing rules, every category, non-negotiable:** no double quotes in prose (italics instead), no arrows between concepts, no em-dashes, typed boxes without title (build error), dense paragraphs over loose one-liners, literal descriptive titles with a description that develops them like an abstract, flat structure (few `#` sections with long bodies, no `##`/`###` unless length forces it, never a heading directly under a heading). Checked at build as `[STYLE]` warnings where mechanical. |
| [pages/SYNTAX.md](src/data/pages/SYNTAX.md) | All 19 custom syntax features (typed notes, lifted paragraph, parameter sheets, lists, math, images…), edge cases |
| [EDITORIAL-RUBRIC.md](_generation/EDITORIAL-RUBRIC.md) | **Always consult when writing or editing articles.** Kill list, voice direction, two-author problem, syntactic tics, narrative structure, cross-linking |
| [VISUAL-RUBRIC.md](_generation/VISUAL-RUBRIC.md) | **Always consult before generating or choosing images.** Photographic language, three registers, kill list, prompt base |
| [projects/README.md](src/data/pages/projects/README.md) | Projects editorial voice, storytelling patterns, ctx annotation conventions |
| [essays/README.md](src/data/pages/essays/README.md) | Essays editorial voice, serif typography, blockquote label rules, ctx restrictions |
| [bits2bricks/README.md](src/data/pages/bits2bricks/README.md) | Bits2Bricks editorial voice, tutorial structure |
| [wikinotes/STYLE.md](src/data/pages/wikinotes/STYLE.md) | **Always consult before writing or rewriting a wikinote.** Shape, tone, body versus Interactions, names and casing, paths, size, allowed syntax |

**2. Verify factual claims.** When writing content that states dates, names, technical specs, historical events, or statistics — use web search to check accuracy. Do not assume recalled facts are correct.

**3. Build after editing.** After editing any `.md` file in `src/data/pages/`, run `npm run build`. Markdown is compiled at build time — changes are invisible until the build runs.

### On adding an HTML page to an article

A self-contained HTML page that belongs to one article (an interactive table, a simulation, a decoy viewer) goes in `public/playgrounds/<article-id>/<name>.html`, kebab-case, tracked in git, served as a static asset at `/playgrounds/<article-id>/<name>.html`. Never put HTML under `media/` (that tree is image masters bound for the CDN) and never link it with a bare markdown link: write `[[playgrounds/<article-id>/<name>|text]]`, which renders as a cross-document link in the article accent and opens in a new tab. The page must be standalone (its own CSS and JS inline, no site assets). Full guide, together with images: [pages/README.md, Attachments](src/data/pages/README.md#attachments); which features each category may use: [SYNTAX.md, Where each feature applies](src/data/pages/SYNTAX.md#where-each-feature-applies).

### On adding or replacing article images

**Before generating, prompting or choosing any image, read [VISUAL-RUBRIC.md](_generation/VISUAL-RUBRIC.md).** It defines the one photographic language of the site (premium cinematic industrial, dark and restrained, warm key against cool shadows, no grime and no CGI look), its three registers, the kill list and the prompt base.

Never commit images and never link `/articles/...` paths. Put the master where its kind lives: `media/articles/<id>/cover.<ext>` (hero), `media/articles/<id>/figures/<slug>.<ext>` (body illustration), `media/site/<path>/<slug>.<ext>` (page art). With `npm run dev` open the file is uploaded automatically a few seconds after you save it (otherwise `npm run media -- push <id|site>`); reference the CDN url (`https://cdn.infraphysics.net/articles/<id>/figures/<slug>.webp`; SVG keeps `.svg`). In components use `cdn('site/…')` from `src/lib/cdn.ts`, never a hardcoded CDN url. The build stamps `?v=` itself: never write a version query by hand. Workflow and commands: [scripts/README.md](scripts/README.md#article-images).

### On editorial feedback

When the user gives feedback on article quality (tone, structure, storytelling, editorial choices), incorporate the lesson into the README of that article's category folder (e.g. `src/data/pages/projects/README.md`). These READMEs accumulate editorial patterns — they're the memory for how each content type should be written.

### On managing wikinotes

**Before** creating, renaming, deleting, or restructuring wikinotes, read **[wikinotes/README.md](src/data/pages/wikinotes/README.md)**. It covers available scripts, step-by-step workflows, cascading effects, and the full error reference. Never rename or delete wikinotes by hand — use the scripts.

**Creating wikinotes:** Check for segment collisions first — search existing addresses for the last segment of each proposed address (case-insensitive). If it already exists anywhere in the hierarchy, evaluate whether it's the same concept before creating. After creating, run `npm run build`, then `node scripts/check-references.js` for isolated notes and weak parents, and create stub notes for missing parents.

**Renaming wikinotes:**

> `rename-address.js` renames ONE exact address. It does NOT cascade to children. See [wikinotes/README.md](src/data/pages/wikinotes/README.md#restructuring-a-hierarchy).

- **Simple rename** (no children): dry-run → `--apply` → `npm run build` → check stale `distinct` entries → commit together.
- **Restructuring** (hierarchy change or note has children): use `move-hierarchy.js` instead — it cascades to all descendants. Dry-run → `--apply` → `npm run build` → `check-references.js` → commit together.
- Hierarchy separator is `//`, not `/`. `X//node` = child. `X/node` = literal slash in the segment name.

### On publishing or removing articles

When a new article is published or an existing one is removed/renamed:

1. **`npm run build`** regenerates everything automatically: `og-manifest.json` (with full text body), `sitemap.xml`, `feed.xml`, `llms-full.txt`, and `llms.txt`.
2. If the article introduces a **new category**, also update `_routes.json` (add the section path so the edge function serves it to crawlers).

### On changing the /about or /home page content

The text that crawlers see for `/about` and `/home` is hardcoded in `build-content.js` (in the `ogManifest` static page entries). If the actual page content changes (AboutView.tsx, HomeView.tsx), update the corresponding `text` field in `build-content.js` to keep them in sync. Crawlers never run JavaScript — they only see what the edge function injects.

### On file create/delete

1. Update file tree in root `README.md`
2. Check if file should be added/removed from `FILES` array in `dev-scripts/dump-context.sh`

### On syntax/pipeline/frontmatter change

Update **[SYNTAX.md](src/data/pages/SYNTAX.md)** for syntax features. Update **[pages/README.md](src/data/pages/README.md)** for frontmatter schemas, content types, editorial rules, or pipeline changes. The two files together are the single source of truth for content authors.

### On README-worthy documentation

Root `README.md` is a hub — max 3 lines per topic, then link to a specialized README. If a new subsystem needs more than a paragraph of docs, create a specialized README and link from root.

### On Second Brain UX change

If a change affects user-facing behavior in the Second Brain (keyboard shortcuts, navigation, visual indicators, filters), update the searchable topics in `src/components/wiki/SecondBrainGuide.tsx`. The sidebar's information button opens this guide. Its search index is derived from the displayed explanations; keep control names and behavior aligned with the current UI.

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
- Blog: `/blog/essays`, `/blog/bits2bricks` (light theme)
- Wiki: `/wiki`, `/wiki/:uid`, and `/wiki/graph`, which opens the console with the graph workspace already expanded (the home wiki banner lands there; closing the workspace navigates to `/wiki`). On phones the expanded graph is a full-screen takeover (`phone` state in `SecondBrainSidebar`), not a strip beside the drawer. Legacy `/lab/second-brain/*` URLs redirect here. No top bar: the global nav is hidden and slides in when the pointer nears the bottom edge (`useProximityReveal`, scroll reveal on touch), with a leading Back arrow to the page the reader came from.
- Post detail: `/lab/:category/:id` (dark), `/blog/:category/:id` (light). Blog articles share one geometry (`article-geometry.css`): essays stack the hero under the meta, Bits2Bricks put it beside the title and number the section index.
- Theme: dark everywhere by default, one atmosphere. Light is a single global reader preference (`infraphysics:theme` in localStorage, gear or Shift+T), remembered for the whole site, never inferred from the OS and never tied to a route. A post may force a theme on entry with `theme:` in its frontmatter (applied, not saved). Light is maintained so it does not break, not designed as a second identity.
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
- Category accents: `--cat-projects-accent`, `--cat-essays-accent`, `--cat-bits2bricks-accent`, `--cat-wikinotes-accent` — identity colors, same in both themes. Access via `catAccentVar(category)` → returns `var(--cat-*-accent)` string.
- Status colors in `STATUS_CONFIG` (`config/categories.tsx`): raw hex, theme-constant.
- Accent interactions: `hover:text-blue-400` for links.
- **Wiki accent is one variable**: `--wiki-accent` in `index.html` `:root`. The scale `--wiki-50` … `--wiki-950` is derived from it with `color-mix()`, the inline Tailwind config maps the `violet` and `purple` palettes onto that scale (so `text-violet-400`, `bg-violet-500/15` follow it), `--cat-wikinotes-accent` and `--wiki-link` point at it, and canvas/three.js code reads it through `lib/wikiAccent.ts` (same mix ratios; keep both in sync). To recolour the wiki, change that one line. Never write a purple hex in wiki code again. The home wiki box shows `public/home-wiki-*.png` (captures of the console) as a browser window peeking in under the domain mosaic; retake them when the console changes shape. The home wiki box shows  (captures of the console) as a dim, sharp backdrop; retake them when the console changes shape.

### Theme switching
Two distinct paths in `ThemeContext`:
- **`applyRoute(override?)`** — instant, no animation. Called from the route `useLayoutEffect` in AppLayout on every navigation: re-applies the saved preference, or the article override.
- **`toggleTheme()`** — smooth fade via `.theme-transitioning` on `<html>`. Used by manual toggle (Shift+T, search palette).
- **Per-article override**: `theme: light` (or `dark`) in a post's frontmatter forces that theme on entry via `applyRoute(override)`, without saving it as the preference. The lookup lives in the AppLayout route effect on purpose: a layout effect in the article view runs *before* the parent's and would be overridden.

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

### Project articles are one geometry, in `project-page.css`
The projects branch of `ArticlePostView` renders the cover as a full-bleed plate (`.pj-plate`, starting 3.5rem below the top edge so an empty band frames the page, fading into the surface) with the title over a blurred scrim, the `ProjectBrief` strip, a labelled summary, the body beside a sticky numbered index (`#article-toc`, the same DOM-toggled `article-toc-link--active` as the blog) and a facts sheet. The old `article-container` / `article-hero` / `article-notes` markup is gone for projects, so those rules in `article.css` are inert there. Body prose is pinned to 1.02rem/1.76 in the sans face on desktop; on phones the site-wide 1.08rem rule applies. Because the plate crops the cover, `thumbnailFocus` in the frontmatter should sit on the subject (the auras cover uses 40, not 0).
### Every error page is the lost robot (`ErrorConceptView`)
One view for every failure: the `*` catch-all in `App.tsx`, a missing article (`PostView`), an unknown wiki uid (`SecondBrainView`, which used to redirect to the grid silently) and the `ErrorBoundary` fallback (`kind="error"`: ERR sign, *Try again* plus a full-reload home link). A url under `/wiki` takes the wiki accent by itself (or pass `accent="wiki"`). A missing page also reports its path through `NotFoundContext` (declared in the view, provided by `AppLayout`): the layout then treats the route as a plain page, whatever the url: no wiki sidebar, no article geometry, no footer, the robot centred in the viewport with nothing to scroll, and the ambient rails around it. `/err5` previews it. It is imported eagerly (never `React.lazy`) so it paints before any Suspense fallback, and it is a client-side page: the SPA still answers unknown urls with HTTP 200, not a real 404 response. Keep styles scoped to `error-concepts.css`, use opaque fills where SVG elements overlap, and respect reduced motion. The requested direction is a relatable drawing with one short line, not a heading and explanatory diagram.

Active traps that will break things silently if forgotten. Each one was hit at least once.

### Wiki-links break image alt/captions
An image's alt and caption live inside `![ ... ]`, so a `[[wiki-link]]` in there closes the alt bracket at its first `]` and the whole image renders as **literal `![…](…)` text** (the wiki-link inside still resolves via `processAllLinks`, which masks the breakage). Rule: **never put `[[…]]` in an image alt or caption** — link the concept in nearby body prose instead. A build-time `[SYNTAX]` guard now flags any literal `](url)` that survives compilation.

### Dynamic Tailwind interpolation
`bg-${color}/20`, `text-${color}` work with CDN play mode but produce **zero CSS** under any build-time pipeline. Fix: pass hex as CSS custom properties on the element and resolve with plain CSS rules. Pattern: `--section-accent`, `--card-accent`, `--ac-color`.

### Light-mode opacity asymmetry
`rgba(255,255,255,0.10)` on black is visible; `rgba(0,0,0,0.10)` on white is nearly invisible. Light borders/surfaces need **2-3x the opacity** of dark counterparts. When adjusting `--bg-surface`, also shift `--content-code-bg` (must stay one step darker than surface).

### Custom property transitions cause flash
Never transition `--cat-essays-accent` AND `color: var(--cat-essays-accent)` simultaneously. The browser double-interpolates — var resolves mid-transition while color runs its own. Fix: `.theme-transitioning` only lists standard properties. `@property` registrations stay for type documentation but are never transitioned.

### `.article-related` accent scope
Related section uses `article-${targetCategory}` but `--art-accent` inherits from the page wrapper (current article's category). Fix: explicit overrides on `.article-related.article-*` selectors with higher specificity.

### Hero gradient in light mode
`linear-gradient(to top, var(--art-surface), transparent)` looks good in dark (fades to black) but washed out in light (white fog). Fix: `[data-theme="light"] .article-hero-gradient { opacity: 0; }`.

### StatusBadge dark/light split
`dark:` styles only apply when `theme !== 'light'`. Light variant uses its own class string. Keep both paths in sync when editing.

### YAML date auto-parsing
YAML parsers (like `gray-matter`) auto-convert bare `date: 2026-02-15` into a JS `Date` object, which stringifies to a full ISO timestamp (`2026-02-15T00:00:00.000Z`). Always **quote dates** in frontmatter (`date: "2026-02-15"`) to keep them as plain strings. The build normalizes with `.slice(0, 10)` as a safety net, but quoting is the correct fix.

### YAML colon-in-scalar → object (tldr crash)
**Always quote every `tldr` bullet** (and any `description`/`subtitle`/string value containing `: `, or starting with `# [ { > | * &`). An unquoted scalar with `: ` (colon + space) is parsed as a `key: value` **mapping**, so the bullet arrives as an *object* → React throws `Objects are not valid as a React child` → blank "Something went wrong" page with **no build error**. The `[SYNTAX]` guard does not catch this (it's a frontmatter parse issue, not compiled-body syntax). Quoting is the fix. Full explanation in `src/data/pages/README.md` (Frontmatter → YAML quoting).

### Strikethrough is double-tilde only — a lone `~` is always literal
marked's built-in strikethrough fires on a **single** `~`, which silently pairs two unrelated tildes into a malformed `<del>` that **truncates the rest of the article** in the browser (no build error, the `[SYNTAX]` guard can't see it). Two everyday sources of stray single tildes: KaTeX emits `~` in MathML (`\tilde`), and authors write `~30W` / `~$6` for "approximately". **Root fix (permanent):** a custom marked inline tokenizer in `build-content.js` (`strictStrikethrough`) makes `~~…~~` the only strikethrough and a lone `~` literal text. Belt-and-suspenders: `processMath` also neutralizes `~` → `&#x7e;` in rendered KaTeX. Rule documented in `SYNTAX.md` (Strikethrough and the tilde rule). So: write `~approximately` freely; use `~~double~~` for an actual strikethrough.

### Per-frame setState starves React Router navigation (dev only)
A `requestAnimationFrame` loop that calls `setState` every frame (the home carousel progress bar did this) keeps React Router's `startTransition` navigation pending forever in dev mode: the URL changes but the page never re-renders. Production was unaffected, which made it look random. Rule: animate per-frame values by writing to a DOM node through a ref (`el.style.transform = ...`), never through React state. If a route ever "changes URL but not screen", look for a state update loop on the page you are leaving.

### CDN image urls must exist in `media-manifest.json`
`build-content.js` rewrites every `cdn.infraphysics.net/articles/...` url in a post to `...?v=<hash>` using `src/data/media-manifest.json`, and swaps a WebP cover for its JPEG twin in `og-manifest.json`. A url whose key is missing from the manifest is left untouched and printed as a `[MEDIA]` warning (not an error, so CI without R2 credentials still builds): it means the master was never pushed, or the name in the markdown does not match the file in `media/`. The manifest is tracked; `media/` is not. Legacy root-level objects (`<id>-banner.png`) still exist in the bucket but nothing references them.

### Context notes animate in two steps (`[open]` then `.is-open`)
A `<details>` cannot transition its content, so `WikiContent` intercepts the click on `.ctx-note-summary`: it sets `open`, then adds `.is-open` on the next frame (the CSS transitions run from that class), and on close removes the class first and clears `open` after the transition. The card has one layout in both states (`display:grid` on the `<details>` itself, header in the left column, the toggle absolutely pinned to the top-right corner, text in the right column): only the text row grows, so nothing relocates when `[open]` flips. Do not give `[open]` or `.is-open` their own geometry (padding, columns, toggle position): that is what produced the jump at the end of the animation.
### Every Pages Function needs its path in `public/_routes.json`
`_routes.json` uses an explicit `include` list, so a new file under `functions/api/` is not served until its path is added there. Without it Cloudflare Pages answers the request as a static asset: a GET gets the SPA `index.html` with status 200 (so `response.ok` is true and only the JSON parse fails) and a POST gets a 405. The client hooks swallow both, so nothing breaks visibly: `/api/analytics` and `/api/presence` shipped this way on 2026-09-01 and the home counter sat frozen at the historical offsets for a week. When adding a function, add the path, deploy, and probe the live url with curl (look at `Content-Type`).

### Blog category list duplicated for OG manifest
`build-content.js` has a local `BLOG_CATS` set (used to build URL paths for `og-manifest.json`) that mirrors `BLOG_CATEGORIES` in `categories.tsx`. If a new blog category is added, update both. Also add the new route pattern to `public/_routes.json`.

### Crawler body text for static pages is hardcoded
The `text` field in `ogManifest['/about']` and `ogManifest['/home']` (in `build-content.js`) is a plain-text copy of what those React components render. It's **not** auto-extracted from the component. If AboutView.tsx or HomeView.tsx content changes, the `text` field must be updated manually or crawlers will see stale content.

### `llms.txt` curated intro is hardcoded
`llms.txt` is now auto-generated by `build-content.js`. Article listings are dynamic, but the intro (About, Site Structure, Second Brain description, Contact) is a static block in the build script. If those sections change, update the template string in `build-content.js`.

### Home clock field: maze topology is cached per lattice size
The maze (islands, edges, origins) is grown once per `(cols, rows)` and reused every frame; only the per-frame fields are recomputed. If the topology is ever made time-dependent again, the cache key in `drawClockMaze` must include that variable or the change will never render.

### Wikinote interactions are graph edges, not reciprocal citations
The graph is bidirectional even when an interaction is written on only one note. For a conceptual pair, keep the clearest causal explanation on one side instead of adding reciprocal trailing refs to both files. Reciprocal entries create `DUPLICATE TRAILING REFS` noise in `check-references.js` without adding connectivity. After a bulk creation pass, run the audit and remove every duplicate introduced by the new notes before considering the batch complete.

### Bulk-editing wikinote frontmatter catches README.md and STYLE.md too
`src/data/pages/wikinotes/README.md` contains a literal `distinct:` line inside a YAML example block, so a bulk script matching frontmatter across `wikinotes/*.md` can rewrite documentation. Exclude `README.md` and `STYLE.md`, and identify notes by their frontmatter UID. Filenames now use descriptive slugs. After an address or hierarchy rename, check `STALE_DISTINCT` warnings because `distinct` stores addresses rather than UIDs.

### Home graphs are build-time pictures, not the live graph
Both wiki graphs on `/home` come from `src/data/graph-thumb.generated.json`, produced by `scripts/compute-graph-thumb.js` at the end of every build (seeded 3D layout, identical across builds). Both the carousel door and the closing plate draw it as inline SVG (`GraphThumb.tsx`), recoloured per placement through the `graph-thumb-*` classes. They copy the root palette and edge colours from `useGraphData.ts`; if those change, update the script and the components. The pinned piece in the carousel is the newest post with `featured: true`.

### Article "Back" goes to the last non-article page of the tab
`AppLayout` stores the previous route in `sessionStorage` (`infraphysics:article-return-to`) whenever an article is entered from a non-article page. Article-to-article navigation keeps the original origin. Since Sep 2026 the fixed top bar that showed this Back link is gone (articles use the global nav sliding in at the bottom edge, whose Back arrow uses the separate `infraphysics:section-return-to` key); the article key is still written but nothing reads it. `ArticleFloatingBar` was removed in Sep 2026 once projects got a sticky index rail like the blog.

### 3D wiki graph draws its edges itself
In `MiniGraph.tsx` the 3D view sets `linkVisibility={false}` and paints every edge in one `THREE.LineSegments` (`syncEdgePositions`, fed from `filtered.links` on each engine tick). One draw call instead of 2,000 keeps rotation and hover cheap. Consequences: the library never runs its link pass in 3D, so it does not fill `inDegree`/`outDegree` on nodes; derive connectivity from `filtered.links` (as `centerGraph` does) or a node filter silently matches nothing and `zoomToFit` becomes a no-op. The 3D ref exposes `scene()` but not `graphData()`; use the component's own graph data. Hover in 3D may set `hoveredId` for the name card, but node colours and the 2D-only `refresh()` effect must never depend on it: either one re-applies materials to 744 meshes per pointer move. Area selection and density inspection are 2D-only tools and are switched off on entering 3D.

### `navigate()` is a transition; state that must change with it goes in the same `startTransition`
React Router 7 runs every `navigate()` as a React transition, so a plain `setState` fired in the same click handler commits one frame earlier than the route change: a bar disappears, then the page switches (wiki trail, cleared search before a note opens). Wrap the companion updates and the `navigate()` call together in `startTransition(() => { ... })`, as the wiki trail handlers and `openGraphNode` do. Do not reach for timeouts or effects to "sync" them.

### Horizontal overflow is clipped with `overflow-x: clip`, never `hidden`
`html, body` in `global.css` and the root wrapper in `App.tsx` use `overflow-x: clip`. `hidden` would turn each of them into a scroll container, and then `position: sticky` anywhere below (the blog article index in `ArticlePostView`, any future sticky rail) anchors to that non-scrolling box and never sticks. `clip` clips the same without creating a scroll container. If you need to clip an ancestor of something sticky, use `clip`.

### Wikinote names are stored in mid-sentence casing
`name` (and the last address segment) is written as the term reads inside a sentence: `feedback loop`, `Kalman filter`, `RLHF`. The build sets `displayTitle` to the capitalised form (`displayName()` in `src/lib/content/casing.js`) and every title, card, search result and directory entry uses it; a bare `[[uid]]` shows the name verbatim mid-sentence and is capitalised by the compiler when it opens a sentence or a bullet (`startsSentence()`). `proper: true` in the frontmatter blocks both. Never capitalise a name in the file to fix a title, and never write `[[uid|Feedback loop]]` to fix a sentence start: both are handled. Rules in `src/data/pages/wikinotes/STYLE.md`.

### The content type is called wikinotes everywhere (renamed Sep 2026)
Sources live in `src/data/pages/wikinotes/`, the build writes `public/wikinotes/{uid}.json` and `public/wikinotes-index.json`, the category key is `'wikinotes'` (og-manifest and the Pages Function) and the accent is `--cat-wikinotes-accent`. There is no in-browser editor and no `/api/wikinotes/*` dev API any more (both removed in Sep 2026): notes are edited as files and checked with the build and the scripts in `scripts/`. Public URLs never carried the old name (`/wiki/:uid`). If "fieldnote" appears anywhere it is stale text, not a contract; the only legitimate mentions are historical (the site-building article, old notes).

### Global CSS is linked from `index.html`, not imported from `index.tsx`
`src/styles/global.css` is referenced with `<link rel="stylesheet" href="/src/styles/global.css">` in `index.html` (Vite bundles it). Keep it as a link: it must sit in `<head>` before the Tailwind CDN's runtime `<style>` element so the cascade order is unchanged. Importing it from `index.tsx` would reorder it relative to the per-view CSS imports.

### Essay typography is pinned at the end of `article-layout.css`
The essays type system (Lora body and subtitle, Newsreader title and headings, 40rem column, drop cap, quiet meta row) is one block at the very end of `src/styles/article-layout.css`, using `.article-essays.article-page-wrapper …` selectors with `!important`. It has to sit last and be that specific because `global.css` and earlier `article.css` blocks also pin essay type with `!important`. Editing font sizes, families or the column width for essays anywhere else will silently lose to this block; change it here.

### Article body type is pinned with `!important` in `global.css` above 768px
A block in `src/styles/global.css` ("One typographic voice") forces `font-size: 1.02rem !important` and `line-height: 1.76 !important` on every `.article-content p/li/td` at 768px and up, so a per-category rule without `!important` (the wiki's `0.875rem` in `wiki-content.css` was one) silently loses on desktop and only applies on phones. Category deltas for body size must carry `!important` too, or be added to that block.

### Body type rules use direct-child selectors, so boxes must be listed explicitly
The body face and size for articles live in `src/styles/article-layout.css` on `.article-content > p`, `> ul > li`, `> ol > li` and `section > p` (direct children, `!important`). Anything nested deeper, a paragraph or a list inside a typed box (`.bkqt`), a definition list, a future fence, does not match and falls back to the sans base of `.article-blog .article-content p`. That is how a keyconcept box in a Bits2Bricks article rendered in Inter inside a serif article. When adding a container that holds prose, add its `p` and `li` to both blocks of that rule (desktop and the 767px one); when writing a typography rule for article prose, never use `>` alone.

### Body heading sizes are pinned in `global.css` for every article
The "One typographic voice" block in `src/styles/global.css` sets `.article-content h2` to 2rem and `h3` to 1.25rem with `!important` above 768px. Any per-category heading scale has to use `!important` from a more specific selector (`.article-blog:not(.article-essays) .article-content h2`, at the end of `article.css`, is the Bits2Bricks one) or the levels collapse: before that scale, `#` and `##` rendered at the same size and `###` at body size. The convention is `#` section, `##` subsection, `###` third level; every article starts at `#`.

### iOS input zoom is blocked from `index.html`, not from CSS
Safari on iPhone zooms into any focused field whose text is under 16px. A one-line script after the viewport meta in `index.html` appends `maximum-scale=1` on iOS only: Safari ignores it for pinch zoom but honours it for that automatic zoom, and Android (which would lose pinch zoom) never sees it. Do not fix it by bumping input sizes to 16px on phones, and do not add `maximum-scale` to the meta itself.

### Every bulk copy of wikinotes goes through `CopyConfirmModal`
The toolbar copy (`SecondBrainView`), the graph area selection (`MiniGraph`) and the per-note dialog (`CopyExportModal`) all show the size and load rating from `estimateExport()` in `src/lib/exportNotes.ts` before anything is fetched or written to the clipboard. The estimate needs no fetch because `searchText` in `wikinotes-index.json` is the plain body of each note; the thresholds (300 KB heavy, 1.5 MB severe) live next to it. A new copy path must open the modal first, not call the exporter directly.

### Block fences (`{math}`, `{bkqt}`) need blank lines around them
A `{math}` … `{/math}` or `{bkqt/…}` … `{/bkqt}` fence written directly between list items or paragraphs (no blank line before the opening tag or after the closing one) closes the block and the compiler emits everything after it as literal text: `**bold**`, `[links](url)` and the following bullets stay unrendered, and the build prints no error (only the `[SYNTAX]` guard notices when a markdown link survives). Always put a blank line before the opening tag and after the closing tag. Documented in `SYNTAX.md` (Typed notes, Chemical and mathematical forms).

### Content slug routing

Public article and Wiki URLs and source filenames use explicit slugs. Keep IDs stable; never derive filenames from IDs. Use `scripts/rename-content-slug.js` for a URL rename and preserve `slugAliases`. Address renames do not change URLs. See [CONTENT-URLS.md](scripts/CONTENT-URLS.md). Engagement and Giscus retain numeric storage keys.

Reserve guide filenames (`readme`, `style`, `agents`) as well as Windows device names when choosing a slug. URL history may use inline or multiline YAML; keep both forms covered by the rename tests. Repeating the initial migration must preserve its original report.

### CV print action

The shared About toolbar opens `/Yago-Mendoza-CV.pdf` in a new tab for printing with the browser's PDF viewer. Do not call `window.print()` on Profile or Stack: the website's CV-only print styles hide those pages. The download action uses the same PDF with the `download` attribute.

### Wiki help keyboard isolation

Help search results use a borderless text list, visually distinct from concept cards. Directory root/level selects must use `wiki-root-select`: it supplies opaque theme backgrounds and primary text for both the control and its native options. Translucent surface backgrounds can leave native menus unreadable.

The Wiki guide owns keyboard events while open: stop propagation before the Wiki's window-level type-to-search and grid handlers receive them. Keep focus inside the dialog and restore it to the information button on close. Search results open a topic and scroll to the matching paragraph; help queries must never change the concept search or navigate the underlying page.
