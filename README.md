# infraphysics

Personal website and knowledge system. Articles, projects, field notes, and a second brain built from scratch.

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
- **CodeMirror 6** (in-browser fieldnote editor, localhost only)

---

### Project structure

```
infraphysics-web/
  .claude/
    skills/
      commit/SKILL.md             # /commit — atomic commit proposal workflow
      create-fieldnote/SKILL.md   # /create-fieldnote — process raw input into fieldnotes
  .github/
    workflows/
      validate.yml              # CI: build + type check + fieldnote reference validation
  functions/
    [[catchall]].ts             # Cloudflare Pages Function (dynamic OG tags + JSON-LD for social crawlers)
    api/views/[[slug]].ts       # View counter API (KV-backed, IP-deduped per 24h)
    api/reactions/[[slug]].ts   # Heart reaction toggle API (KV-backed, IP-deduped)
    api/stats.ts                # Bulk stats endpoint (POST slugs → views + hearts)
  vite-plugins/
    fieldnote-editor.js         # Dev server plugin: fieldnote CRUD API (localhost only, 6 endpoints)
  scripts/
    compiler.config.js        # Centralized compiler configuration
    build-content.js          # Markdown → JSON pipeline (triple output)
    validate-fieldnotes.js    # Reference integrity checks
    resolve-issues.js         # Interactive issue resolver (segment collisions, missing parents)
    migrate-to-uids.js        # One-time migration: address-based → UID-based refs
    rename-address.js         # Rename fieldnote address (frontmatter only — refs use stable UIDs)
    check-references.js       # Detect isolated notes, weak parents, stale refs
    analyze-pairs.js          # Relationship analyzer for fieldnote pairs
    preflight.js              # Pre-creation briefing (content, refs, collisions)
    move-hierarchy.js         # Cascading rename for address + all descendants
    compute-graph-relevance.js # Build-time PageRank + proximity → graph-relevance.generated.json
    README.md                 # Build pipeline docs, cache format
  docs/
    validate-fieldnotes-term-err-view.jpg  # Validation output screenshot
  dev-scripts/
    dump-context.sh           # Dev tool: export codebase to a single TXT for LLM context
  src/
    components/
      App.tsx                 # Router + layout shell
      ErrorBoundary.tsx       # React error boundary (prevents white-screen crashes)
      WikiContent.tsx         # HTML renderer with wiki-link resolution + hover preview
      WikiLinkPreview.tsx     # Floating preview card (portal)
      NeighborhoodGraph.tsx   # SVG graph + detail panel (parent/siblings/children)
      RelevanceLeaderboard.tsx # Unified note list (family/all modes) with centrality indicators
      BridgeScoreBadge.tsx    # Colored dot indicating centrality tier (bridge/connector/peripheral)
      DriftDetector.tsx       # "Missing links?" suggestions based on neighbor overlap
      InfoPopover.tsx         # Contextual help popovers (singleton, portal-based)
      SecondBrainGuide.tsx   # Consolidated guide modal for Second Brain (replaces scattered InfoPopovers)
      IslandDetector.tsx      # Topology sidebar: connected components, articulation points (bridges)
      CopyExportModal.tsx     # Scope-selector modal for exporting note context to clipboard (LLM-friendly)
      NavigationTrail.tsx     # Breadcrumb trail for concept navigation
      SearchPalette.tsx       # Global search overlay (Cmd+K)
      RetentionHints.tsx      # Contextual nudges for undiscovered features (scroll depth, wikilinks, search)
      HomeTour.tsx            # Guided tour for landing page
      RotatingTitle.tsx       # Animated header widget
      article/                # ArticleBreadcrumbs, ArticleHashtags, BlogMetabar
      sections/               # SearchResultsList, ProjectsList, ThreadsList, Bits2BricksGrid
      layout/                 # Sidebar, MobileNav, Footer, ArticleFloatingBar, Starfield, DualGrid
      ui/                     # SearchBar, StatusBadge, Highlight
      icons/                  # SVG icon components
      editor/                 # Fieldnote editor (localhost only): CodeMirror, diagnostics, term detection, navigation, trailing refs, new note panel, delete confirmation
    views/
      HomeView.tsx            # Landing page
      SectionView.tsx         # Category listing (projects, threads, bits2bricks)
      PostView.tsx            # Single post renderer
      SecondBrainView.tsx     # Fieldnotes explorer
      AboutView.tsx           # About page
      ContactView.tsx         # Contact form (Formspree)
    data/
      pages/
        README.md               # Authoring hub (frontmatter, content types, editorial rules, pipeline)
        SYNTAX.md               # Syntax reference (16 custom features, edge cases, quick ref)
        projects/             # .md posts + _category.yaml
          README.md             # Projects editorial voice
        threads/              # .md posts + _category.yaml
          README.md             # Threads editorial voice
        bits2bricks/          # .md posts + _category.yaml
          README.md             # Bits2Bricks editorial voice
        fieldnotes/           # Individual {uid}.md files (1 per concept, UID-named)
          README.md             # Fieldnotes management guide (scripts, workflows, errors)
        home/                 # _home-featured.yaml
      posts.generated.json    # Regular posts only (no fieldnotes)
      fieldnotes-index.generated.json  # Fieldnote metadata (no content)
      categories.generated.json
      data.ts                 # Runtime data loader
    public/
      fieldnotes/             # {uid}.json content files (served as static assets)
      fieldnotes-index.json   # Generated: fieldnote metadata index (HTTP-fetched at runtime)
      og-manifest.json        # Generated: URL path → OG metadata for social previews
      sitemap.xml             # Generated: XML sitemap for search engines (322+ URLs)
      robots.txt              # Crawler directives + sitemap reference
      _routes.json            # Cloudflare Pages routing (which paths invoke the Function)
    lib/
      headings.ts             # Shared heading utilities (getActiveChain, ACTIVE_HEADING_THRESHOLD)
      wikilinks.ts            # Runtime wiki-link resolver
      content.ts              # Content utilities
      color.ts                # Color utilities (accentChipStyle)
      date.ts                 # Date formatting
      search.ts               # Search utilities
      brainIndex.ts           # Fieldnotes index (singleton, lazy init, 7 in-memory Maps, HMR-aware)
      exportNotes.ts          # Export fieldnotes as LLM-friendly markdown (htmlToText, batch export)
      addressToId.ts          # Address → slug conversion (deprecated)
      icons.ts                # Centralized SVG icon paths (Heroicons)
      content/                # Shared compile/parse library (used by build scripts + Vite plugin)
    hooks/
      useSecondBrainHub.ts    # Core hub hook: index, search, sort, filter, tree, prefetch (628 lines)
      useNavigationTrail.ts   # Breadcrumb trail with popstate tracking
      useGraphRelevance.ts    # PageRank + proximity data (module-level singleton, lazy import)
      useArticleSearch.ts     # In-page search with DOM tree walker + highlight
      useArticleStats.ts      # Bulk view/heart stats fetch for section listings
      useViewCount.ts         # Per-article view counter (POST on mount, IP-deduped)
      useReaction.ts          # Heart toggle with optimistic update + revert
      useIsLocalhost.ts       # Localhost detection for editor gating
    styles/
      article.css             # Article post view styles (terminal/cyberpunk theme)
      wiki-content.css        # Wiki/second-brain content delta overrides
      editor.css              # CodeMirror overrides for fieldnote editor
    config/                   # Categories config
    constants/                # Layout, theme constants
    types.ts                  # TypeScript interfaces (Post, Category, etc.)
  index.css                   # Global styles (images, wiki-links, animations, components)
  package.json
```

---

### Scripts

| Command | What it does |
|---|---|
| `npm run content` | Compile all markdown into JSON (incremental — only recompiles changed files) |
| `npm run content -- --force` | Force full rebuild (ignore cache) |
| `npm run content:fix` | Compile content + interactively fix segment collisions and missing parents |
| `npm run dev` | Build content + start Vite dev server |
| `npm run build` | Build content + production build |
| `npm run preview` | Preview production build locally |

The build pipeline compiles posts and fieldnotes through a shared 14-step transformation (backtick protection, custom syntax preprocessors, blockquotes, marked, Shiki highlighting, link resolution). Results are cached in `.content-cache.json` by file mtime — subsequent builds only recompile files that changed. Full pipeline and cache details: **[scripts/README.md](scripts/README.md)**

---

### Writing content

All article and fieldnote markdown lives in `src/data/pages/`. The compiler supports a **custom syntax superset** on top of standard GFM: colored text, accent text, typed blockquotes, definition lists, alphabetical lists, context annotations, wiki-links, cross-document links, image positioning, and inline footnotes. Authoring hub (frontmatter, content types, editorial rules): **[src/data/pages/README.md](src/data/pages/README.md)**. Syntax reference (all 16 features, edge cases): **[src/data/pages/SYNTAX.md](src/data/pages/SYNTAX.md)**

---

### Theme system

All colors flow through a three-layer cascade: CSS custom properties in `index.html` (`:root` for dark, `[data-theme="light"]` for light) → Tailwind semantic tokens (`th-*`) in the inline config → `th-*` classes in components. Article styling adds a fourth layer: `--art-accent` per category with `color-mix()` derivations on `.article-page-wrapper`. Never use hardcoded color classes (`text-white`, `bg-gray-900`) — they bypass the cascade and break theme transitions.

---

### Second Brain

A flat knowledge graph of `{uid}.md` files in `fieldnotes/`. Each note has a stable 8-char UID (for references and URLs) and an `address` (hierarchical, `//`-separated, for display and neighborhood). Notes link to each other via `[[uid]]` wiki-links — renaming an address changes only one file's frontmatter. Build produces three outputs: a posts JSON (no fieldnotes), a metadata index (no content), and individual `{uid}.json` content files served as static assets. At runtime, the metadata index is fetched via HTTP (cached by CDN, separate from the JS bundle) while note content is fetched on demand. For managing fieldnotes, see **[src/data/pages/fieldnotes/README.md](src/data/pages/fieldnotes/README.md)**.

**In-browser editor** (localhost only): Click a note's edit button to open a CodeMirror editor panel. Features: `[[` navigation dropdown (arrow keys + Enter to jump between notes, Tab to drill into children, filters as you type), smart term detection (highlights unlinked mentions of known notes in purple, offers Yes/No to convert to wiki-links), missing-parent stub creation from diagnostics, delete workflow with impact analysis (shows inbound refs, children, trailing refs — offers stub conversion or permanent delete with ref cleanup), uid protection (read-only, restored on save), resizable diagnostics panel, trailing refs widget, and auto-reload after save via HMR. The editor runs live validation on every keystroke, catching broken references, missing parents, and formatting issues before they reach the build — so most errors are fixed in real time without needing to run the full pipeline.

**Creating fieldnotes:** Use `/create-fieldnote` in Claude Code with raw text, concepts, or notes as input. The skill handles decomposition, dedup, addressing, stubs, and validation automatically.

**Maintenance:** Periodically run `npm run content:fix` to interactively resolve segment collisions and missing parents. Also useful: ask Claude to audit the current state of fieldnotes (address quality, isolated notes, enrichment opportunities, structural improvements) using `check-references.js` and `analyze-pairs.js`.

---

### Build-time content validation

The build pipeline includes a 7-phase integrity checker that catches reference errors, structural inconsistencies, and potential concept duplication before they reach production. This is the repo's own safety net — the kind of link validation and address consistency checks that tools like Obsidian provide via plugins, but implemented directly in the build pipeline so nothing slips through to the deployed site.

| Phase | What it catches | Severity |
|---|---|---|
| Reference integrity | Broken `[[wiki-links]]` in fieldnotes and posts | ERROR (fails build) |
| Self-references | Notes linking to themselves | WARN |
| Bare trailing refs | Trailing `[[ref]]` without a `::` annotation — every interaction must explain why | ERROR (fails build) |
| Parent hierarchy | Missing parent nodes in the address tree | WARN |
| Circular references | Cycles in the reference graph (opt-in) | WARN |
| **Segment collisions** | Same concept name at different hierarchy paths — severity tiers (HIGH/MED/LOW), suppressible with `distinct` frontmatter | WARN |
| Isolated note detection | Notes with no connections to the graph | INFO |

When the build reports fixable issues (missing parents, segment collisions), **`npm run content:fix`** runs the same build but launches an interactive resolver: it walks you through each issue, creates stub notes, adds `distinct` entries, and collects merge instructions — all from the terminal. Pending merges are printed at the end as a ready-to-copy Claude instruction block. Full details: **[src/data/pages/fieldnotes/README.md](src/data/pages/fieldnotes/README.md#interactive-mode)**

There is also an optional deep audit script (`node scripts/check-references.js`) that adds duplicate trailing ref detection, redundant ref detection, and fuzzy duplicate detection. Full validation details: **[scripts/README.md](scripts/README.md)**

---

### Platform and deployment

Hosted on **Cloudflare Pages** (SPA + serverless functions). No `wrangler.toml` — configuration lives in the Cloudflare dashboard.

**Required bindings:**

| Binding | Type | Used by |
|---|---|---|
| `VIEWS` | KV Namespace | `functions/api/views/`, `functions/api/reactions/`, `functions/api/stats.ts` |

The `VIEWS` KV namespace stores all engagement data: view counts (`views:{slug}`), heart counts (`hearts:{slug}`), and IP dedup keys (`seen:{hash}`, `heart:{hash}` with 24h TTL). All API functions share this single namespace.

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

**Dev-only API** (served by `vite-plugins/fieldnote-editor.js`, never deployed):

| Endpoint | Method | Description |
|---|---|---|
| `/api/fieldnotes/:uid/raw` | `GET` | Raw markdown + mtime for a fieldnote |
| `/api/fieldnotes/save` | `POST` | Write to disk + incremental rebuild |
| `/api/fieldnotes/create` | `POST` | Create new note + rebuild |
| `/api/fieldnotes/validate` | `POST` | Parse + validate without saving |
| `/api/fieldnotes/analyze-refs` | `POST` | Pre-delete impact analysis (inbound refs, children) |
| `/api/fieldnotes/delete` | `POST` | Delete note + optional trailing ref cleanup |

---

### Article features

Articles include engagement and navigation features layered on top of the base content view:

- **View count + hearts** — POST on mount (IP-deduped), displayed in article header and section listings. Hearts are toggleable per IP.
- **Giscus comments** — GitHub Discussions-backed comment widget at article footer. Config: `yago-mendoza/infraphysics-comments` repo.
- **In-page search** — `Ctrl+F` inside articles highlights matches in the rendered content via DOM TreeWalker. Match count in floating bar.
- **Floating bar** — Sticky bar with TOC dropdown, active heading indicator, search toggle, reading progress, and share button. Visible on all article types.
- **Reading progress** — Horizontal progress bar at top of viewport, driven by scroll position via RAF.
- **Active TOC tracking** — Scroll listener marks the current heading + its ancestor chain in the TOC. Shared algorithm between ArticlePostView and ArticleFloatingBar.
- **Share dropdown** — Copy link, email feedback, Twitter/X share.
- **Retention hints** — Contextual nudges for undiscovered features (wiki-link clicks, search usage, scroll depth, theme toggle). Triggered by usage counters in localStorage, shown as timed toasts.

---

### Social previews

Article URLs return dynamic OG meta tags and JSON-LD structured data for social crawlers and search engines (WhatsApp, Twitter, Discord, Google, etc.) via a Cloudflare Pages Function (`functions/[[catchall]].ts`). The build generates `public/og-manifest.json` mapping every article and fieldnote URL to its title, description, thumbnail, and date. Routing (`public/_routes.json`) limits the Function to article paths only — static assets and section listings are served directly. A `public/sitemap.xml` (generated at build time) and `public/robots.txt` complete the SEO setup.

---

### AI development guide

**[CLAUDE.md](CLAUDE.md)** contains instructions for AI coding assistants working on this codebase: automation rules (what to update when files/syntax change), architecture patterns, theme system rules, and active gotchas. AI tools that read this file will automatically maintain documentation, suggest relevant updates, and follow project conventions.

---

### Media

All images and media assets are hosted on **Cloudflare R2** — never commit binary assets to the repo. Reference them via their R2 URL in markdown.

---

### Development

```bash
npm install          # install dependencies
npm run dev          # build content + start vite dev server (includes editor API on localhost)
npm run build        # build content + production build
```

**Local editor:** The Vite dev server automatically loads `vite-plugins/fieldnote-editor.js`, which exposes the fieldnote CRUD API at `/api/fieldnotes/*`. No extra setup — just `npm run dev` and the editor UI appears on Second Brain note pages.

**KV APIs in dev:** The view count and reaction endpoints (`/api/views/*`, `/api/reactions/*`) only work when deployed to Cloudflare Pages with the `VIEWS` KV binding. In local dev, these calls fail silently — articles render without engagement data.

---

### CI/CD

A GitHub Actions workflow (`.github/workflows/validate.yml`) runs on every push to `main`:

1. **Install** — `npm ci` with dependency cache
2. **Build** — `npm run build` (compiles content + Vite production build)
3. **Type check** — `tsc --noEmit` (non-blocking — reports issues without failing the pipeline)
4. **Validate references** — `node scripts/check-references.js` (fieldnote integrity)

**Deploy** is handled separately by the **Cloudflare Pages GitHub integration** — it triggers automatically on push to `main`, runs its own `npm run build`, and publishes the output. The GitHub Action validates; Cloudflare deploys.

**To deploy:** Just push to `main`. Both the validation workflow and Cloudflare deploy run in parallel. If validation fails, check the Actions tab — the site may already be live but with issues flagged.

---

### Roadmap

Future features under consideration:

- [ ] **LLM Conversational Assistant** — AI-powered search/Q&A over site content. MVP: Cloudflare Worker proxy to Claude Haiku API with system prompt + post summaries. Future: RAG with vector embeddings for semantic search. Includes "Ask Yago" persona mode.
- [ ] **Stripe Donations** — One-time support via Stripe Payment Link (zero backend). Button in footer or `/about`. No memberships or auth initially.
- [ ] **Global Graph View** — Force-directed visualization of the entire Second Brain knowledge graph (D3.js). Nodes sized by backlink count, clusters emerge from connection density. Accessible from `/lab/second-brain/graph` or as a modal.
