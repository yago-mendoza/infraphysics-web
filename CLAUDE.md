# InfraPhysics — Development Guide

> Instructions for AI coding assistants (Claude Code, Copilot, Cursor, etc.) working on this codebase. Contains automation rules, architecture patterns, and active gotchas. Human developers may also find it useful as a concise architectural reference.

**Concision.** Answer with what resolves the request. No preambles, no reiterations, no conclusions that repeat the above, no explanations of obvious steps. In documentation, state each rule once, in one place, with its exceptions and a minimal example only where the rule is ambiguous; a new preference goes into the file that already owns its subject, never into a new page. Expand when the complexity or the user asks for it. Keep technical detail, uncertainty and the author's voice.

**Before and after every task**, check which automation rules below apply. Every file change, content edit, or structural decision has documentation consequences.

---

## Automation Rules

Mandatory triggers — when X happens, do Y.

### On writing or editing ARTICLES content

**⛔ Standing rule, high priority: no em-dashes in prose.** Never use the em-dash (`—`) as a punctuation break in any body text you write for this site. The author strongly dislikes it and it reads as an AI tell. Use a parenthesis (aside), a period (new sentence), or a comma (light pause) instead, and rebuild the sentence so the punctuation fits its meaning. Routine exception: list-style separators (definition lists, tldr bullets, trailing refs). Otherwise only rare, PUNCTUAL exceptions, never by habit. Full guidance in [pages/STYLE.md](src/data/pages/STYLE.md) (rule 3). This also applies to anything else you write (commit messages, UI copy). The other hard rules of the same rank, no double quotes in prose (use italics), no arrows between concepts (symbols or ASCII `->`), footnotes as `^[…]` before the period, and no *not X, Y* reframes, live in [pages/STYLE.md](src/data/pages/STYLE.md).

**1. Read the authoring docs first.** Never guess syntax, frontmatter, or editorial conventions from memory.

| Doc | What to look up |
|---|---|
| [pages/README.md](src/data/pages/README.md) | Frontmatter schemas, content types, editorial rules, compilation pipeline |
| [pages/STYLE.md](src/data/pages/STYLE.md) | **Hard writing rules, every category, non-negotiable:** no double quotes in prose (italics instead), no arrows between concepts, no em-dashes, typed boxes without title (build error), dense paragraphs over loose one-liners, literal descriptive titles with a description that develops them like an abstract, flat structure (few `#` sections with long bodies, no `##`/`###` unless length forces it, never a heading directly under a heading), footnotes as `^[…]` before the period, no negation-then-reframe (*not X, Y*), context notes short and plain, the kill list. Checked at build as `[STYLE]` warnings where mechanical. |
| [pages/SYNTAX.md](src/data/pages/SYNTAX.md) | All 19 custom syntax features (typed notes, lifted paragraph, parameter sheets, lists, math, images…), edge cases |
| [pages/VOICE.md](src/data/pages/VOICE.md) | **Always consult when writing or editing articles.** How a text sounds once it obeys the hard rules: concrete up, the two-author seam, failure first, rhythm, numbers, certainty, headings by mechanism, the tics table, coining, the final pass. The kill list itself is STYLE.md rule 11. |
| [pages/VISUAL.md](src/data/pages/VISUAL.md) | **Always consult before generating or choosing images.** Photographic language, three registers, kill list, prompt base |
| [_studio/README.md](_studio/README.md) | The workshop next to the site: `_studio/inbox/` (one file per idea or saved item, never compiled; where a theme that does not belong in the current draft goes) and `_studio/twitter/` (the Twitter strategy, the bank of reusable takes and prepared replies, the queue of what is going out, the posted history and examples; `_studio/visuals/articles/` holds image style references for the site). |
| [projects/README.md](src/data/pages/projects/README.md) | Projects editorial voice, storytelling patterns, ctx annotation conventions |
| [essays/README.md](src/data/pages/essays/README.md) | Essays editorial voice, serif typography, blockquote label rules, ctx restrictions |
| [bits2bricks/README.md](src/data/pages/bits2bricks/README.md) | Bits2Bricks editorial voice, tutorial structure |
| [wikinotes/STYLE.md](src/data/pages/wikinotes/STYLE.md) | **Always consult before writing or rewriting a wikinote.** Shape, tone, body versus Interactions, names and casing, paths, size, allowed syntax |

**2. Verify factual claims.** When writing content that states dates, names, technical specs, historical events, or statistics — use web search to check accuracy. Do not assume recalled facts are correct.

**3. Build after editing.** After editing any `.md` file in `src/data/pages/`, run `npm run build`. Markdown is compiled at build time — changes are invisible until the build runs.

**4. Review with the skill.** To review an existing article (hard rules, form, verified external links, wiki links with a sense check, missing concepts), run `/review-article <slug>`; it reports by default and applies only the mechanical part with `--apply`. Its procedure is `.claude/skills/review-article/SKILL.md`, tracked in git like the hooks.

### On saving material or ideas (Twitter, links, drawings)

Anything kept for later goes to `_studio/`, never to `src/data/pages/`: an idea or a saved tweet, link or quote is one file in `_studio/inbox/` (format in its README, raw text, do not tidy); a dated piece of information (a figure, a claim, a quote to reuse) is one file in `_studio/facts/` with `saved`, `dated`, `source` and `status: unverified` until checked; a tweet or thread kept for how it is written goes to `_studio/twitter/examples/` with its pattern named; an image kept for a style wanted on the site (a mood for covers or figures, not an article image) goes to `_studio/visuals/articles/` with one line in that folder's `STYLE.md` (WebP, long side at most 1600 px, under a megabyte); `pages/VISUAL.md` stays the rule for what is published. An image for a tweet sits beside the tweet's file under `_studio/twitter/`. Tweets follow no canon: there is no style file under `_studio/twitter/` on purpose, and the site's hard rules are not imposed there. To help with a tweet or thread, the context is `_studio/twitter/STRATEGY.md` plus a few files from `examples/` and `posted/`, and the instruction is to match the account, not a rulebook. To find a piece in the studio (*something dry about agents that is ready*, *what did I say about MCP*), run `npm run find -- --tag <tag> --status <status>` (filters in `_studio/twitter/README.md`; the vocabulary is `_studio/twitter/TAGS.md`, `--tags` lists it with counts; `--tvb <text>` searches the author's material in `_studio/ai-ctx/tweets/_add-ctx/`) instead of reading the folders; when adding a piece (a tweet idea, a take, a concept), fill the frontmatter schema completely, always with `date` set to the day it is saved, and add any new tag to TAGS.md first. The finder (`scripts/studio-find.js`) is a tool for the agent, not an interface anyone depends on: when a question would be answered faster with a new filter, output or source, change the script and say so, never read the folders by hand instead. Tone is never a rule in the studio: `mood` is optional description, and the author's own material for a voice (expressions, sentences, moves, allergies) lives in `_studio/ai-ctx/tweets/_add-ctx/`, hand-written, one line per entry with tags, only what the author adds himself (never scraped from his articles), offered to Twitter only and pasted after a tweets pack when wanted; the generator never touches that folder. For an AI outside this repo, `_studio/ai-ctx/<pack>.md` is the one document to paste per job (site, a category, wikinotes, Twitter): it is generated by `scripts/context-pack.js` from the authoring docs (`npm run context`, also in the build), so the docs stay the single source and the packs are never edited by hand. To mine the wiki and the articles for tweet or article ideas, the table in `_studio/README.md` says what each layer yields. The build never reads `_studio/`.

### On adding an HTML page to an article

A self-contained HTML page that belongs to one article (an interactive table, a simulation, a decoy viewer) goes in `public/playgrounds/<article-id>/<name>.html`, kebab-case, tracked in git, served as a static asset at `/playgrounds/<article-id>/<name>.html`. Never put HTML under `media/` (that tree is image masters bound for the CDN) and never link it with a bare markdown link: write `[[playgrounds/<article-id>/<name>|text]]`, which renders as a cross-document link in the article accent and opens in a new tab. The page must be standalone (its own CSS and JS inline, no site assets). Full guide, together with images: [pages/README.md, Attachments](src/data/pages/README.md#attachments); which features each category may use: [SYNTAX.md, Where each feature applies](src/data/pages/SYNTAX.md#where-each-feature-applies).

### On adding or replacing article images

**Before generating, prompting or choosing any image, read [pages/VISUAL.md](src/data/pages/VISUAL.md).** It defines the one photographic language of the site (premium cinematic industrial, dark and restrained, warm key against cool shadows, no grime and no CGI look), its three registers, the kill list and the prompt base.

Never commit article images (the references under `_studio/` are the one tracked exception, kept under a megabyte each) and never link `/articles/...` paths. Put the master where its kind lives: `media/articles/<id>/cover.<ext>` (hero), `media/articles/<id>/figures/<slug>.<ext>` (body illustration), `media/site/<path>/<slug>.<ext>` (page art). With `npm run dev` open the file is uploaded automatically a few seconds after you save it (otherwise `npm run media -- push <id|site>`); reference the CDN url (`https://cdn.infraphysics.net/articles/<id>/figures/<slug>.webp`; SVG keeps `.svg`). In components use `cdn('site/…')` from `src/lib/cdn.ts`, never a hardcoded CDN url. The build stamps `?v=` itself: never write a version query by hand. Workflow and commands: [scripts/README.md](scripts/README.md#article-images).

### On editorial feedback

When the user gives feedback on article quality (tone, structure, storytelling, editorial choices), incorporate the lesson into the README of that article's category folder (e.g. `src/data/pages/projects/README.md`). These READMEs accumulate editorial patterns — they're the memory for how each content type should be written.

### On managing wikinotes

**Before** creating, renaming, deleting, or restructuring wikinotes, read **[wikinotes/README.md](src/data/pages/wikinotes/README.md)**. It covers available scripts, step-by-step workflows, cascading effects, and the full error reference. Never rename or delete wikinotes by hand — use the scripts.

**How the wiki grows:** normally from the author's own text, pasted in at length and explained in his words. The job is storage, not writing: split it into one note per concept, name, address, shape and link each one as `wikinotes/STYLE.md` says, and add nothing he did not say (no facts, examples or depth beyond his; ask about a gap rather than fill it). The same contract is the `wikinotes-from-text` pack in `_studio/ai-ctx/articles/` for an AI outside the editor.

**Creating wikinotes:** Check for segment collisions first — search existing addresses for the last segment of each proposed address (case-insensitive). If it already exists anywhere in the hierarchy, evaluate whether it's the same concept before creating. After creating, run `npm run build`, then `node scripts/check-references.js` for isolated notes and weak parents, and create stub notes for missing parents.

**Renaming wikinotes:**

> `rename-address.js` renames ONE exact address. It does NOT cascade to children. See [wikinotes/README.md](src/data/pages/wikinotes/README.md#restructuring-a-hierarchy).

- **Simple rename** (no children): dry-run → `--apply` → `npm run build` → check stale `distinct` entries → commit together.
- **Restructuring** (hierarchy change or note has children): use `move-hierarchy.js` instead — it cascades to all descendants. Dry-run → `--apply` → `npm run build` → `check-references.js` → commit together.
- Hierarchy separator is `//`, not `/`. `X//node` = child. `X/node` = literal slash in the segment name.

### On publishing or removing articles

When a new article is published or an existing one is removed/renamed:

1. **`npm run build`** regenerates everything automatically: `og-manifest.json` (with full text body), `sitemap.xml`, `feed.xml`, `llms-full.txt`, and `llms.txt`.
1b. **Share cards.** Every url's og:image is a card photographed from the site (`src/views/shareCardDesigns.tsx`, preview at `/og` in dev). The git pre-commit hook (`.githooks/pre-commit`, `scripts/og-precommit.js`, activated by `npm install` through the `prepare` script) regenerates them by itself when a commit stages an article, a translation, a cover or the card designs: it runs `npm run og` (the script starts its own Vite server) and `npm run content` and stages `src/data/og-cards.json` and `public/og-manifest.json` into the same commit, so the deploy leaves with the right cards. Only the cards whose text, cover or design changed are redone; `SKIP_OG=1` skips the hook, and without Chrome or R2 credentials it only warns (then run `npm run og` by hand, followed by `npm run content`). New pages or playgrounds must be listed in both `src/lib/shareCards.ts` and `scripts/og-cards.js`.
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
- Language: English is the base; an article with a translated sibling (`<slug>.es.md`, see [pages/README.md](src/data/pages/README.md#file-names-and-public-urls)) is also served at `/es/<canonical>`, same slug. The url says which version is on screen. The reader preference (`infraphysics:lang`, `LangContext`, default English, never inferred from the browser) only redirects the English url of a translated page to the preferred version (`PostView`). The gear and the mobile menu carry the control (`LangTags`): live on a page that exists in Spanish, where pressing it opens `TranslationPendingModal` (the apology) and changes nothing elsewhere; a language the page does not exist in is dimmed and struck diagonally, and a version written with AI (`ai: true` in that file's frontmatter, carried to the route entry as `aiLangs`) shows the two-star `SparkleIcon` after its label. `useRouteLanguage` says what the current page exists in and which versions are AI-written. The wiki is never translated.
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
The projects branch of `ArticlePostView` renders the cover as a full-bleed plate (`.pj-plate`, meeting the thin black `.article-topbar` that every article page carries on its top edge, fading into the surface) with the title over a blurred scrim, the `ProjectBrief` strip, a labelled summary, the body beside a sticky numbered index (`#article-toc`, the same DOM-toggled `article-toc-link--active` as the blog) and a facts sheet. The old `article-container` / `article-hero` / `article-notes` markup is gone for projects, so those rules in `article.css` are inert there. Body prose is pinned to 1.02rem/1.76 in the sans face on desktop; on phones the site-wide 1.08rem rule applies. Because the plate crops the cover, `thumbnailFocus` in the frontmatter should sit on the subject (the auras cover uses 40, not 0). In every geometry the Giscus comments render after the column grid (`.glab-after`, `.pj-after`, both repeating the grid template so they line up with the body column), never inside the body cell: the sticky index is bounded by its grid row, so comments inside the cell would let it ride down over the discussion.
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

### Graph reading aids: shared prefs, cached workspace, quiet zones for the nav
`useGraphPrefs.ts` keeps the aids shared by every graph surface (neighbourhood radius, pins, show pins, freeze, node size) in `localStorage` and broadcasts `wiki-graph-pref-change`, so the mini map, the expanded workspace and the note card's pin button stay in step. The expanded-only modes (shortest path, isolation, timeline, lenses, legend, density radius) plus the camera live in `expandedCache` inside `MiniGraph.tsx`: the workspace unmounts on close and restores itself on the next open (the first frame applies the remembered camera instead of fitting the graph). Pure traversals live in `graphAnalysis.ts`. Panels that sit near the bottom edge carry `data-nav-quiet`, which `useProximityReveal` honours so the global bar does not slide in over the timeline. The image copy paints the DOM overlay through an SVG `foreignObject` with computed styles inlined; a browser that taints the canvas gets a toast and the graph-only path. Physics runs with `cooldownTicks: Infinity` while settling (it stops by alpha, never mid-motion); the old fixed tick budgets produced the stop-start layout.

### The expanded wiki graph stays under the global nav
The full-screen graph (`graphExpanded` portal in `SecondBrainSidebar.tsx`) is `z-[45]` with its top bar at `z-[46]`; the global nav is `z-50` and its edge hint `z-index: 49`, so the bar still slides in at the bottom edge over the graph, exactly as in console mode. Anything at `z-50` or above inside the wiki (the first-visit welcome modal, the phone hub overlay) is a deliberate modal that covers the nav. Do not raise the graph back above 50.

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
Home labels and shared ambient rails use the sans face with normal casing and spacing. The clock field and its ground (`.home-visual-stage`, a fixed zero-height strip at the hero's resting offset; fixed is safe because the shell's entrance animation is opacity only) never move while the page scrolls over them; the scroll does not push the field, it dissolves it as a pure function of the scroll from the first pixel (`dissolveWith=".home-intro-carousel"`: the target is the fraction of the way to the carousel reaching the viewport top, the engine seeks it at one constant rate (.38 per second: time-bound, so a full disintegration or recomposition always takes about 2.6 s however hard the scrollbar is yanked), and each face goes at its own deterministic threshold, lower rows first, hands turning as it fades; scrolling back recomposes it). Never clip the hero: a clip edge scrolls with the section and cuts the fixed field off abruptly (that was the *vanishes on a fast scroll* bug). The texture reveal is `.home-hero::before`, bound to the hero and scrolling away with it. Do not add a spotlight or elliptical overlay behind the text. The full clock field uses a 75×20 lattice (51×20 on phones) of 2.8px faces at stroke 1.25, seven moving fields at 1.4× radius over a .4 red floor: these are `CLOCK_DEFAULTS` in `HomeVisualLabEngine.tsx`, chosen on the `/home10` playground on 2026-09-11; retune them there and paste the copied JSON into the defaults. The hairline in the left margin of the intro, ticked at the portrait base, the title (oxide) and the tagline, is `.home-datum` in `global.css` (taken from header study 1); it needs `position: relative` on all three hosts explicitly, because the legibility-reserve block that makes them relative only applies from 768px.

Development-only `/home1` through `/home10` are the clock lab (`HomeClockLab.tsx`, `home-clock-lab.css`): the real `/home` with other parameters of the clock field. Every adjustable lives in `ClockParams` in `HomeVisualLabEngine.tsx` with `CLOCK_DEFAULTS` equal to the `/home` look, so `/home` (no `clockParams`) renders exactly as before; studies 1 to 9 are presets in `CLOCK_STUDIES`, study 10 renders `ClockPanel` with one slider per key. Per-frame keys are read from a ref every frame; the structural ones (`cols`, `rows`, grid size and top, `jitter`, `islands`, `linkDensity`, `reach`, `seed`) rebuild the lattice and its topology through `rebuildRef`. A new adjustable is one key in the type, one default, one use in the engine and one entry in `CLOCK_SLIDERS`.

The primary navigation orders Home, About, Essays, Projects, Bits2Bricks, Wiki, Contact. Desktop uses one measured sliding accent behind the links (120ms pause, 440ms travel); keep route matching language-aware and disable the transition for reduced motion.

The shared footer is transparent so the system-field pattern continues through Essays, Bits2Bricks and Projects.

Contact's logo background is fixed to the viewport and portaled to `document.body`; placing it inside the animated page shell makes its fixed position follow the transformed ancestor.

Share-card bodies fit title and subtitle after fonts load; measure child heights plus gaps because `flex-end` can overflow above the box without increasing `scrollHeight`. Do not reinstate line clamps. Kickers use `align-self: flex-start`. Project and Bits2Bricks article cards use 72px text insets and no frame. Bits2Bricks article marks are blue; its section card keeps a white mark. Author thumbnails and personal-page portraits are grayscale.

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

### Translated siblings are folded into the English post, never posts of their own
`build-content.js` compiles `<slug>.es.md` like any post and then `attachTranslations` folds it into its English twin as `translations.es` (textual fields plus body, `stale` when `sourceHash` no longer matches the English body; `[I18N]` warning). The sibling never enters `posts.generated.json` as a separate entry, `content-files.js` skips it (route entries and the *filename must match slug* check are English only) and its route entry only gains `langs: ['es']`. Consumers that iterate posts (listings, search, related, feeds) therefore see one post per id; anything that must show Spanish text has to read `post.translations[lang]` explicitly, as `PostView` does. `og-manifest.json` and the sitemap get one entry per language with `alternates` for hreflang, and `_routes.json` includes `/es/*`. A `/es/` url shares its English twin's og title, description and exhibition card (the build copies them after the cards are applied): what a link shows on X or WhatsApp is always the English card, only the crawler body text is Spanish. Layout checks that read the pathname (`isArticlePage`, `isBlog`, the active nav pill, the footer) go through `stripLang()` from `src/lib/contentRoutes.ts`, otherwise a translated url loses the article chrome and shows the ambient rails.

### Content slug routing

Public article and Wiki URLs and source filenames use explicit slugs. Keep IDs stable; never derive filenames from IDs. Use `scripts/rename-content-slug.js` for a URL rename and preserve `slugAliases`. Address renames do not change URLs. See [CONTENT-URLS.md](scripts/CONTENT-URLS.md). Engagement and Giscus retain numeric storage keys.

Reserve guide filenames (`readme`, `style`, `agents`) as well as Windows device names when choosing a slug. URL history may use inline or multiline YAML; keep both forms covered by the rename tests. Repeating the initial migration must preserve its original report.

### CV print action

The shared About toolbar opens `/Yago-Mendoza-CV.pdf` in a new tab for printing with the browser's PDF viewer. Do not call `window.print()` on Profile or Stack: the website's CV-only print styles hide those pages. The download action uses the same PDF with the `download` attribute.

### Wiki help keyboard isolation

Help search results use a borderless text list, visually distinct from concept cards. Directory root/level selects must use `wiki-root-select`: it supplies opaque theme backgrounds and primary text for both the control and its native options. Translucent surface backgrounds can leave native menus unreadable.

The Wiki guide owns keyboard events while open: stop propagation before the Wiki's window-level type-to-search and grid handlers receive them. Keep focus inside the dialog and restore it to the information button on close. Search results open a topic and scroll to the matching paragraph; help queries must never change the concept search or navigate the underlying page.
## Private admin credential

- `/admin/stats` uses the Cloudflare Pages secret `COUNTERS_ADMIN_TOKEN`.
- Its local copy is `.secrets/admin-stats-token.txt`, excluded from Git. `room/` is disposable scaffolding and must not hold permanent credentials.
- Never print the token, commit it, put it in a URL, or copy its value into documentation. If rotating it, update Cloudflare and the local copy together.
- Local admin requests are proxied by Vite to the authenticated production API; localhost shows real production statistics.

Analytics exploration: `/admin/stats` now separates public totals plus historical offsets, measured daily series and a filtered opening cohort. See `workers/counters/README.md` for deduplication, sample coverage, retention, query limits and measurement costs. The client is `src/lib/siteAnalytics.ts`; verify with `node scripts/site-analytics.test.mjs` plus Worker tests when changing event semantics.

### API and admin security

Read [SECURITY.md](SECURITY.md) before changing API/authentication behavior. `_headers` does not protect Function responses: the middleware sets those headers, including the enforced admin CSP. Keep DOMPurify sanitation after HTML transformations, and do not remove the native limiter binding during Worker deployment. Access and WAF are separate account configuration; do not claim them enabled from repository code. New visible site routes must be recognized by `functions/_lib/security.ts` before analytics can accept them.

Heading-link sanitation regression: preserve `button` elements in `safeHtml`. Removing the wrapper leaves its SVG without `.heading-anchor-link svg` sizing and stroke styles, producing a giant filled icon. Verify heading copy links on an actual article at desktop/mobile widths as well as malicious HTML removal.
