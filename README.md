# infraphysics

Personal website and knowledge system. Articles, projects, and a wiki of notes built from scratch.

![build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)

---

### Stack

- **React 19** + **React Router 7** (SPA)
- **Vite 6** (dev server + build)
- **TypeScript**
- **marked** + **Shiki** (markdown compilation + syntax highlighting, build-time)
- **gray-matter** (frontmatter parsing)
- **Tailwind CSS via CDN** (utility styles, runtime-generated) + vanilla CSS (content styling)
- **Cloudflare Pages** (hosting + serverless functions)
- **Cloudflare KV** (view counts, heart reactions — IP-deduped)
- **Cloudflare R2** (image hosting)
- **Giscus** (GitHub Discussions-backed comments on articles)
- **Formspree** (contact form)

---

### Project structure

```
infraphysics-web/
  .claude/
    hooks/                      # Claude Code hooks (pre-commit build, wikinote edit guards)
    skills/
      review-article/SKILL.md    # /review-article — review one article: hard rules, form, verified links, wiki links with sense check, missing concepts
  .github/
    workflows/
      validate.yml              # CI: build + type check + wikinote reference validation
  functions/
    [[catchall]].ts             # Cloudflare Pages Function (OG tags + JSON-LD + body content for social + AI crawlers)
    api/views/[[slug]].ts       # View counter API (KV-backed, IP-deduped per 24h)
    api/reactions/[[slug]].ts   # Heart reaction toggle API (KV-backed, IP-deduped)
    api/stats.ts                # Bulk stats endpoint (POST slugs → views + hearts)
    api/analytics.ts            # Lightweight analytics ingest
    api/presence.ts             # Live presence counter
  vite-plugins/
    media-sync.js              # Dev server plugin: syncs media/ to the CDN on start and whenever a master changes
  media/                      # Image masters, gitignored (scripts/media.js mirrors the tree to R2)
    articles/<id>/cover.<ext>   # Hero of an article: index card + article top
    articles/<id>/figures/      # Illustrations inside the article body
    site/<path>/<slug>.<ext>    # Page scaffolding art: home carousel, plates, about
  scripts/
    compiler.config.js        # Centralized compiler configuration
    content-files.js          # Source inventory and slug validation
    migrate-content-slugs.js  # Initial migration (dry run by default, backup on apply)
    rename-content-slug.js    # Rename a URL/file while retaining its previous slug
    content-routes.test.js    # Identity, redirects and metadata regression checks
    CONTENT-URLS.md           # Readable URLs and source filename conventions
    build-content.js          # Markdown → JSON pipeline (triple output)
    validate-wikinotes.js    # Reference integrity checks
    resolve-issues.js         # Interactive issue resolver (segment collisions, missing parents)
    rename-address.js         # Rename wikinote address (frontmatter only — refs use stable UIDs)
    check-references.js       # Detect isolated notes, weak parents, stale refs
    analyze-pairs.js          # Relationship analyzer for wikinote pairs
    preflight.js              # Pre-creation briefing (content, refs, collisions)
    move-hierarchy.js         # Cascading rename for address + all descendants
    obsidian-export.js        # Export wikinotes to Obsidian vault structure
    obsidian-import.js        # Import Obsidian vault back to wikinotes
    compute-graph-relevance.js # Build-time PageRank + proximity → graph-relevance.generated.json
    compute-graph-thumb.js    # Build-time static layout of the wiki graph → graph-thumb.generated.json (Home spotlight)
    og-cards.js               # Share cards: photographs every url's card from the dev server, uploads to R2, records src/data/og-cards.json (npm run og)
    media.js                  # Images: optimize masters from media/ and sync them to Cloudflare R2 (push/pull/ls/status/rm/mv/url)
    README.md                 # Build pipeline docs, cache format
  dev-scripts/
    check-content-slugs.mjs   # Browser regression checks for readable and historical URLs
    dump-context.sh           # Dev tool: export codebase to a single TXT for LLM context
    og-banner.html            # Template for article OG banners
  room/                       # Design room: editorial + visual direction, roadmap, decisions (versioned)
  src/
    components/
      App.tsx                 # Router + layout shell
      ErrorBoundary.tsx       # React error boundary (prevents white-screen crashes)
      SearchPalette.tsx       # Global search overlay (Cmd+K)
      RetentionHints.tsx      # Contextual nudges for undiscovered features (scroll depth, wikilinks, search)
      ExperimentalCursor.tsx  # Optional custom cursor (user preference)
      wiki/                   # Second Brain: WikiContent, WikiLinkPreview, NeighborhoodGraph, RelevanceLeaderboard, BridgeScoreBadge, NavigationTrail, CopyExportModal, CopyConfirmModal, SecondBrainGuide
                              # Article presence sorting/filtering uses lib/wikiArticleUsage.ts
      personal/               # Personal pages: AboutTopBar, ContactLogoSculpture, GraphThumb, HomeVisualLab,
                              #   WikiTerritories (compact root treemap; lib/partitionAreas.ts), PresenceInfo (the "i" by the visit counters)
                              #   StartHere (four-door carousel under the intro) and WikiBanner (closing plate)
      article/                # ArticleBreadcrumbs, ArticleHashtags, BlogMetabar
      sections/               # SearchResultsList, ProjectsList, EssaysList, Bits2BricksGrid
      layout/                 # Sidebar, MobileNav, Footer, AmbientRails, SecondBrainSidebar
      ui/                     # StatusBadge, Highlight, ComplexityBar, TranslationPendingModal (the apology on an untranslated page)
      icons/                  # SVG icon components
      graph/                  # Shared force-directed 2D/3D graph explorer (MiniGraph) and data hooks
    views/
      HomeView.tsx            # Landing page
      SectionView.tsx         # Category listing (projects, essays, bits2bricks)
      PostView.tsx            # Single post renderer
      ContextPreviewView.tsx  # TrialGPT context-note comparisons (/ctx1 through /ctx4; context-preview.css)
      ArticlePostView.tsx     # Article body renderer (wiki-links, hover previews)
      SecondBrainView.tsx     # Wikinotes explorer (/wiki)
      AboutView.tsx           # About page
      CvView.tsx              # CV page (/about/cv)
      StackView.tsx           # Tooling stack page (/about/stack)
      ContactView.tsx         # Contact form (Formspree)
      ThanksView.tsx          # Post-submit thank-you page
      ErrorConceptView.tsx    # Illustrated 404 preview: lost robot with map (/err5)
      LinkedFromTestView.tsx  # Preview of the wiki card's Linked from menu with fake articles (/test/linked-from)
      ShareCardsView.tsx      # Share card gallery, dev only (/og/<kind>/<a|b>)
      OgCardView.tsx          # One share card at 1200 x 630, dev only (/og/card/<kind>/<id>), photographed by scripts/og-cards.js
      shareCardDesigns.tsx    # The share card of each kind: paper and frame with the cover, the clock maze, the brain, or the control traces with the portrait
    legacy/
      home-visuals/           # Retired home visual engine, kept for reference (see its README)
    data/
      pages/
        README.md               # Authoring hub (frontmatter, content types, editorial rules, pipeline)
        SYNTAX.md               # Syntax reference (19 custom features, edge cases, quick ref)
        STYLE.md                # Hard writing rules for every category (quotes, arrows, em-dashes, box titles, paragraph density, literal titles, footnote placement, no not-X-Y reframes); the mechanical ones are [STYLE] build warnings
        projects/             # .md posts + _category.yaml
          README.md             # Projects editorial voice
        essays/              # .md posts + _category.yaml
          README.md             # Essays editorial voice
        bits2bricks/          # .md posts + _category.yaml
          README.md             # Bits2Bricks editorial voice
        wikinotes/           # Individual <slug>.md files (1 per concept, stable UID in frontmatter)
          README.md             # Wikinotes management guide (scripts, workflows, errors)
      agent-profile.json      # Author profile consumed by views and crawlers
      postSummaries.ts        # Lightweight post index for listings
      posts.generated.json    # Regular posts only (no wikinotes)
      posts-index.generated.json  # Post metadata without bodies
      wikinotes-index.generated.json  # Wikinote metadata (no content)
      graph-relevance.generated.json   # PageRank + proximity per wikinote
      graph-thumb.generated.json       # Static wiki graph picture for the Home spotlight
      media-manifest.json     # What scripts/media.js has on the CDN: key, size, dimensions, cache-busting version (read by the build and by lib/cdn.ts)
      categories.generated.json
      data.ts                 # Runtime data loader
    public/
      avatar.jpg              # Self-hosted portrait for the home identity anchor (240px, preloaded from index.html)
      avatar-mini.jpg         # 64px round portrait beside the author name in articles (from avatar.jpg via sharp)
      playgrounds/<article-id>/ # Self-contained HTML pages that belong to one article (interactive tables, simulations), linked with [[playgrounds/<id>/<name>|text]]
      wikinotes/             # {uid}.json content files (served as static assets)
      wikinotes-index.json   # Generated: wikinote metadata index (HTTP-fetched at runtime)
      og-manifest.json        # Generated: URL path → OG metadata + full text body for crawlers
      sitemap.xml             # Generated XML sitemap (route count follows current content)
      feed.xml                # Generated: RSS feed (latest 30 articles)
      llms.txt                # Static: LLM-friendly site summary (manually maintained)
      llms-full.txt           # Generated: all articles in full plain text
      robots.txt              # Crawler directives + sitemap reference
      home-wiki-{dark,light}.png # Console captures, the browser window peeking in under the Home wiki mosaic (retake when the console changes shape)
      _routes.json            # Cloudflare Pages routing (which paths invoke the Function)
      _redirects              # 301s for legacy /blog/threads/* URLs -> /blog/essays/*
    lib/
      headings.ts             # Shared heading utilities (getActiveChain, ACTIVE_HEADING_THRESHOLD)
      wikilinks.ts            # Runtime wiki-link resolver
      content.ts              # Content utilities
      color.ts                # Color utilities (accentChipStyle)
      wikiAccent.ts           # Wiki accent for canvas/three.js code, derived from --wiki-accent (index.html)
      date.ts                 # Date formatting
      search.ts               # Search utilities
      cdn.ts                  # cdn(key): public URL of a media-manifest.json object, with its ?v= stamp
      filterParams.ts         # URL filter param (de)serialization
      engagementApi.ts        # Views / hearts / stats API client
      brainIndex.ts           # Wikinotes index (singleton, lazy init, 7 in-memory Maps, HMR-aware)
      exportNotes.ts          # Export wikinotes as LLM-friendly markdown (htmlToText, batch export)
      projectPresentation.ts # Canonical project topics/technology presentation
      icons.ts                # Centralized SVG icon paths (Heroicons)
      content/                # Shared compile/parse library (used by build scripts + Vite plugin)
    hooks/
      useSecondBrainHub.ts    # Core hub hook: index, search, sort, filter, tree and prefetch
      useNavigationTrail.ts   # Breadcrumb trail with popstate tracking
      useGraphRelevance.ts    # PageRank + proximity data (module-level singleton, lazy import)
      useKeyboardShortcuts.ts # Global keyboard shortcuts (search, theme toggle)
      useArticleSearch.ts     # In-page search with DOM tree walker + highlight
      useArticleStats.ts      # Bulk view/heart stats fetch for section listings
      useViewCount.ts         # Per-article view counter (POST on mount, IP-deduped)
      useReaction.ts          # Heart toggle with optimistic update + revert
      useRouteLanguage.ts     # Languages the current page exists in and the url of each version
      usePresence.ts          # Live presence counter
      useRevealOnScrollUp.ts  # Nav reveal on upward scroll or at page end (articles, touch wiki)
      useProximityReveal.ts   # Nav reveal when the pointer nears the bottom edge (wiki)
    styles/
      global.css              # Global styles (theme tokens, images, wiki-links, animations, components). Linked from index.html
      article.css             # Article post view styles (terminal/cyberpunk theme)
      article-layout.css      # Article page grid and reading column
      editorial-primitives.css # Shared editorial typography primitives
      wiki-content.css        # Wiki/second-brain content delta overrides
      start-here.css          # Home four-door carousel under the intro
      article-geometry.css    # Blog article geometry (breadcrumb, sans title, rounded hero, sticky index; split header for Bits2Bricks)
      wiki-banner.css         # Home closing wiki plate
      project-page.css        # Project article page: full-bleed cover plate, brief strip, summary, numbered index rail
      error-concepts.css      # Minimal 404 previews and theme-aware SVG cartoons
    config/                   # Categories config, analytics, content entities
    constants/                # Layout, theme constants
    contexts/                 # Theme, language preference, article, Second Brain hub, cursor preference
    types.ts                  # TypeScript interfaces (Post, Category, etc.)
  index.html                  # App shell, Tailwind CDN config, theme tokens
  package.json
```

---

### Scripts

| Command | What it does |
|---|---|
| `npm run content` | Compile all markdown into JSON (incremental — only recompiles changed files) |
| `npm run content -- --force` | Force full rebuild (ignore cache) |
| `npm run content:fix` | Compile content + interactively fix segment collisions and missing parents |
| `npm run typecheck` | Type-check the browser app and Cloudflare Functions |
| `npm run dev` | Build content + start Vite dev server |
| `npm run build` | Build content + production build |
| `npm run preview` | Preview production build locally |
| `npm run obsidian:export` | Export wikinotes to Obsidian vault structure |
| `npm run obsidian:import` | Import Obsidian vault back to wikinotes |

The build pipeline compiles posts and wikinotes through one shared transformation: protected Markdown, the small editorial grammar, Marked, Shiki and link resolution. Results are cached in `.content-cache.json`; changes to compiler code or configuration invalidate that cache. Full pipeline details: **[scripts/README.md](scripts/README.md)**

---

### Writing content

All article and wikinote Markdown lives in `src/data/pages/`. One entry point: **[src/data/pages/README.md](src/data/pages/README.md)**, the authoring hub, says where everything is and links down. From there:

- **Hard rules, every category:** [STYLE.md](src/data/pages/STYLE.md). No double quotes, no arrows, no em-dashes (parentheses instead), no box titles, dense paragraphs, literal titles, footnotes as `^[…]` before the period, no *not X, Y* reframes. The mechanical ones come back as `[STYLE]` build warnings.
- **Syntax:** [SYNTAX.md](src/data/pages/SYNTAX.md), the single grammar reference. The grammar is shared by every category; what each category may actually use is a subset, listed in its *Where each feature applies* table.
- **Voice per category:** [projects/README.md](src/data/pages/projects/README.md), [essays/README.md](src/data/pages/essays/README.md), [bits2bricks/README.md](src/data/pages/bits2bricks/README.md): schema, tone, structure, accumulated author feedback.
- **Wikinotes:** [wikinotes/STYLE.md](src/data/pages/wikinotes/STYLE.md) for how a note is written, [wikinotes/README.md](src/data/pages/wikinotes/README.md) for scripts, renames and validation.
- **Attachments:** images (masters in `media/`, served from the CDN) and standalone HTML pages (`public/playgrounds/<article-id>/`), in the hub's *Attachments* section.

Standard Markdown does most of the work; the small extension adds typed notes, parameter sheets, definition and alphabetical lists, context annotations, wiki, cross-document and playground links, single or paired images, mathematics and inline footnotes.

---

### Theme system

All colors flow through a three-layer cascade: CSS custom properties in `index.html` (`:root` for dark, `[data-theme="light"]` for light) → Tailwind semantic tokens (`th-*`) in the inline config → `th-*` classes in components. Article styling adds a fourth layer: `--art-accent` per category with `color-mix()` derivations on `.article-page-wrapper`. Never use hardcoded color classes (`text-white`, `bg-gray-900`) — they bypass the cascade and break theme transitions.

The site is dark everywhere by default: one atmosphere from the home to the last wikinote. Light is a single global reader preference (gear, Shift+T), remembered site-wide and never inferred from the OS or tied to a route. A post can force a theme on entry with `theme:` in its frontmatter.

---

### Second Brain

A flat knowledge graph of `<slug>.md` files in `wikinotes/`. Each note has a stable UID for references, an explicit slug for its public URL, and an `address` (hierarchical, `//`-separated, for display and neighborhood). Notes link through `[[uid]]`; an address rename changes only frontmatter. The build produces article JSON, a Wiki metadata index and individual `{uid}.json` payloads fetched on demand. See [Wiki management](src/data/pages/wikinotes/README.md) and [URL conventions](scripts/CONTENT-URLS.md).

**Editing wikinotes:** notes are Markdown files in `src/data/pages/wikinotes/`, edited with any editor and checked by `npm run build` and the scripts in `scripts/` (see the wikinotes README). There is no in-browser editor.

**Creating wikinotes:** Follow the preflight and creation workflow in the wikinotes management guide. It covers decomposition, deduplication, addressing, parent stubs and validation.

**Maintenance:** Periodically run `npm run content:fix` to interactively resolve segment collisions and missing parents. Also useful: ask Claude to audit the current state of wikinotes (address quality, isolated notes, enrichment opportunities, structural improvements) using `check-references.js` and `analyze-pairs.js`.

---

### Build-time content validation

The build pipeline includes a 7-phase integrity checker that catches reference errors, structural inconsistencies, and potential concept duplication before they reach production. This is the repo's own safety net — the kind of link validation and address consistency checks that tools like Obsidian provide via plugins, but implemented directly in the build pipeline so nothing slips through to the deployed site.

| Phase | What it catches | Severity |
|---|---|---|
| Reference integrity | Broken `[[wiki-links]]` in wikinotes and posts | ERROR (fails build) |
| Self-references | Notes linking to themselves | WARN |
| Bare trailing refs | Trailing `[[ref]]` without a `::` annotation — every interaction must explain why | ERROR (fails build) |
| Parent hierarchy | Missing parent nodes in the address tree | WARN |
| Circular references | Cycles in the reference graph (opt-in) | WARN |
| **Segment collisions** | Same concept name at different hierarchy paths — severity tiers (HIGH/MED/LOW), suppressible with `distinct` frontmatter | WARN |
| Isolated note detection | Notes with no connections to the graph | INFO |

When the build reports fixable issues (missing parents, segment collisions), **`npm run content:fix`** runs the same build but launches an interactive resolver: it walks you through each issue, creates stub notes, adds `distinct` entries, and collects merge instructions — all from the terminal. Pending merges are printed at the end as a ready-to-copy Claude instruction block. Full details: **[src/data/pages/wikinotes/README.md](src/data/pages/wikinotes/README.md#interactive-mode)**

There is also an optional deep audit script (`node scripts/check-references.js`) that adds duplicate trailing ref detection, redundant ref detection, and fuzzy duplicate detection. Full validation details: **[scripts/README.md](scripts/README.md)**

---

### Platform and deployment

Hosted on **Cloudflare Pages** (SPA + serverless functions). No `wrangler.toml` — configuration lives in the Cloudflare dashboard.

**Required bindings:**

| Binding | Type | Used by |
|---|---|---|
| `VIEWS` | KV Namespace | `functions/api/views/`, `functions/api/reactions/`, `functions/api/stats.ts` |

The `VIEWS` KV namespace stores all engagement data: view counts (`views:{slug}`), heart counts (`hearts:{slug}`), and IP dedup keys (`seen:{hash}`, `heart:{hash}` with 24h TTL). All API functions share this single namespace.

Site-wide analytics include documented historical baselines from before the global endpoint existed. On 2026-09-01, the 27 published article counters summed to 249 verified views. A conservative allowance of 51 untracked views across Home, About, Writing, Wiki, index and Contact routes produces a 300-page-view baseline. Because sessions and unique visitors cannot be reconstructed from article counters, their 130-visit and 100-visitor baselines are explicitly estimates, based on roughly three pages per historical visitor and a modest return-visit rate. Live analytics accumulate on top of these frozen values.

**Images:** the look is defined in [_generation/VISUAL-RUBRIC.md](_generation/VISUAL-RUBRIC.md) (premium cinematic industrial, three registers, kill list, prompt base); read it before generating or choosing one. Masters live in `media/` (gitignored), sorted by what they are: `articles/<id>/cover.<ext>` for a hero, `articles/<id>/figures/<slug>.<ext>` for body illustrations, `site/<path>/<slug>.<ext>` for page art. `npm run media -- push <id|site>` encodes them to WebP and uploads them to R2 under the same path, and `npm run build` syncs quietly. Components get urls through `cdn(key)` in `src/lib/cdn.ts`. The tracked `src/data/media-manifest.json` is what the build uses to stamp `?v=` on CDN urls and to flag references to files that were never pushed. Full workflow: **[scripts/README.md](scripts/README.md#article-images)**.

**Routing:** `public/_routes.json` controls which paths invoke the Pages Function vs serve static assets. API paths (`/api/*`) and article paths (for OG tags) route to the Function; everything else is served directly from the build output.

**Deploy:** Push to `main` triggers automatic deployment via Cloudflare Pages GitHub integration. No manual deploy step.

---

### API

Serverless endpoints running as Cloudflare Pages Functions. All responses include CORS headers (`Access-Control-Allow-Origin: *`).

| Endpoint | Method | Description |
|---|---|---|
| `/api/views/{slug}` | `GET` | Return view count |
| `/api/views/{slug}` | `POST` | Increment view count (IP-deduped per 24h via SHA-256 hash) and return new count |
| `/api/reactions/{slug}` | `GET` | Return heart count + whether caller's IP has hearted |
| `/api/reactions/{slug}` | `POST` | Toggle heart for caller's IP, return new count + hearted status |
| `/api/stats` | `POST` | Bulk fetch: `{ slugs: [...] }` → `{ [slug]: { views, hearts } }` (capped at 50) |


---

### Article features

Articles include engagement and navigation features layered on top of the base content view:

- **View count + hearts** — POST on mount (IP-deduped), displayed in article header and section listings. Hearts are toggleable per IP.
- **Giscus comments** — GitHub Discussions-backed comment widget at article footer. Config: `yago-mendoza/infraphysics-comments` repo.
- **Contents control** — Project articles show a left-edge indicator (one line per top-level heading) that opens a lateral table of contents. Essays and Bits2Bricks carry a sticky index of the top-level sections beside the body instead. There is no fixed top bar in articles: the global nav slides in at the bottom edge with a Back arrow.
- **Reading progress** — Horizontal progress bar at top of viewport, driven by scroll position via RAF.
- **Active TOC tracking** — Scroll listener marks the current heading + its ancestor chain in the TOC. One scroll listener in ArticlePostView toggles the active class on the index links of every category (blog side index, projects rail).
- **Share sheet**: the share button dims the page and opens a centred card with the options side by side (X, LinkedIn, Reddit, Hacker News, copy link, copy the text).
- **Retention hints** — Contextual nudges for undiscovered features (wiki-link clicks, search usage, scroll depth, theme toggle). Triggered by usage counters in localStorage, shown as timed toasts.

### Contact form (Formspree)

`/contact` posts to Formspree form `xojwnobl` from `src/views/ContactView.tsx` and redirects to `/thanks`. Submissions live in the Formspree dashboard: sign in at [formspree.io](https://formspree.io) with `contact@infraphysics.net` (password in the password manager, never in this repo), open the form, tab *Submissions*. Notification emails go to the address set in the form's *Settings*; to receive them elsewhere, add that address there and confirm Formspree's verification email.

---

### Crawler visibility and AEO (Answer Engine Optimization)

The site is an SPA — without server-side rendering, crawlers see an empty `<div id="root"></div>`. A Cloudflare Pages Function (`functions/[[catchall]].ts`) intercepts requests from both social crawlers (Facebook, Twitter, etc.) and AI crawlers (GPTBot, ClaudeBot, Googlebot, PerplexityBot, etc.) and injects:

- **`<head>`**: OG tags, Twitter cards, canonical URL, and JSON-LD structured data (Article + BreadcrumbList for posts, WebSite for `/home`, ProfilePage with Person schema for `/about`)
- **`<body>`**: Full article text in semantic `<article>` HTML with heading, paragraphs, date, and author footer — so AI crawlers can read and index the actual content, not just metadata

The build generates `public/og-manifest.json` mapping every URL to its metadata **plus full plain text body** for regular posts. For wikinotes, the edge function fetches individual `public/wikinotes/{uid}.json` at runtime and strips HTML. Section pages (`/blog/essays`, `/lab/projects`, etc.) include article listings.

**Additional discovery files (all generated at build time):**

| File | What it is |
|---|---|
| `public/llms.txt` | Static summary for LLMs — who, what, site structure, article list with URLs (manually maintained) |
| `public/llms-full.txt` | All published articles in full plain text, auto-generated from post content |
| `public/feed.xml` | RSS feed (latest 30 articles) with `<link rel="alternate">` in `index.html` for autodiscovery |
| `public/sitemap.xml` | XML sitemap for current static pages, posts and wikinotes |
| `public/robots.txt` | Crawler directives + sitemap reference |

Routing (`public/_routes.json`) sends article paths, section pages, `/home`, and `/about` through the edge function. Static assets bypass it.

---

### AI development guide

Repository conventions live alongside the systems they describe: this README for architecture and deployment, `scripts/README.md` for the compiler, and `src/data/pages/wikinotes/README.md` for knowledge-graph operations. Keep those documents synchronized when their respective contracts change.

---

### Development

```bash
npm install          # install dependencies
npm run dev          # build content + start vite dev server
npm run build        # build content + production build
```

**KV APIs in dev:** Cloudflare Pages Functions are not available behind Vite. Localhost therefore reads the canonical counters from `https://infraphysics.net` over CORS. Local article views use `GET` so previewing does not alter production analytics; reaction toggles still target the canonical API. A failed request remains unavailable (`null`) and is never displayed as a false zero.

---

### CI/CD

A GitHub Actions workflow (`.github/workflows/validate.yml`) runs on every push to `main`:

1. **Install** — `npm ci` with dependency cache
2. **Build** — `npm run build` (compiles content + Vite production build)
3. **Type check** — `tsc --noEmit` (non-blocking — reports issues without failing the pipeline)
4. **Validate references** — `node scripts/check-references.js` (wikinote integrity)

**Deploy** is handled separately by the **Cloudflare Pages GitHub integration** — it triggers automatically on push to `main`, runs its own `npm run build`, and publishes the output. The GitHub Action validates; Cloudflare deploys.

**To deploy:** Just push to `main`. Both the validation workflow and Cloudflare deploy run in parallel. If validation fails, check the Actions tab — the site may already be live but with issues flagged.

---

### Roadmap

Future features under consideration:

- [ ] **LLM Conversational Assistant** — AI-powered search/Q&A over site content. MVP: Cloudflare Worker proxy to Claude Haiku API with system prompt + post summaries. Future: RAG with vector embeddings for semantic search. Includes "Ask Yago" persona mode.
- [ ] **Stripe Donations** — One-time support via Stripe Payment Link (zero backend). Button in footer or `/about`. No memberships or auth initially.
- [x] **Wiki Console graph explorer** — Shared mini/expanded force-directed map with 2D/3D views, semantic highlighting and centrality/root coloring at `/wiki`.

Content uses readable filenames and URL slugs with stable internal IDs. See [URL conventions and renaming](scripts/CONTENT-URLS.md).
# Counters migration and private stats

The optional SQLite Durable Object backend and standalone `/admin/stats` panel are documented in [workers/counters/README.md](workers/counters/README.md), including local tests, authentication, cutover and recovery. KV remains the default until explicitly switched. There is no default admin password and no automatic expiry for daily aggregates.
