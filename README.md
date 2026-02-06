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
- **Formspree** (contact form)
- **Cloudflare R2** (image hosting)

---

### Project structure

```
infraphysics-web/
  scripts/
    compiler.config.js        # Centralized compiler configuration
    build-content.js          # Markdown → JSON pipeline (triple output)
    validate-fieldnotes.js    # Reference integrity checks
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
      RotatingTitle.tsx       # Animated header widget
      sections/               # SearchResultsList, ProjectsList, ThreadsList, Bits2BricksGrid
      layout/                 # Sidebar, MobileNav, Footer, Starfield, DualGrid
      ui/                     # SearchBar, StatusBadge, Highlight
      icons/                  # SVG icon components
    views/
      HomeView.tsx            # Landing page
      SectionView.tsx         # Category listing (projects, threads, bits2bricks)
      PostView.tsx            # Single post renderer
      SecondBrainView.tsx     # Fieldnotes explorer
      AboutView.tsx           # About page
      ContactView.tsx         # Contact form (Formspree)
    data/
      pages/
        README.md               # Authoring guide (frontmatter, syntax, pipeline, edge cases)
        projects/             # .md posts + _category.yaml
        threads/              # .md posts + _category.yaml
        bits2bricks/          # .md posts + _category.yaml
        fieldnotes/           # Individual .md files (1 per concept)
        home/                 # _home-featured.yaml
      posts.generated.json    # Regular posts only (no fieldnotes)
      fieldnotes-index.generated.json  # Fieldnote metadata (no content)
      categories.generated.json
      data.ts                 # Runtime data loader
    public/
      fieldnotes/             # {id}.json content files (served as static assets)
    lib/
      wikilinks.ts            # Runtime wiki-link resolver
      content.ts              # Content utilities
      color.ts                # Color utilities (accentChipStyle)
      date.ts                 # Date formatting
      search.ts               # Search utilities
      brainIndex.ts           # Fieldnotes index helpers
      addressToId.ts          # Address → slug conversion
    styles/
      article.css             # Article post view styles (terminal/cyberpunk theme)
      wiki-content.css        # Wiki/second-brain content delta overrides
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
| `npm run dev` | Build content + start Vite dev server |
| `npm run build` | Build content + production build |
| `npm run preview` | Preview production build locally |

The build pipeline compiles posts and fieldnotes through a shared 14-step transformation (backtick protection, custom syntax preprocessors, blockquotes, marked, Shiki highlighting, link resolution). Results are cached in `.content-cache.json` by file mtime — subsequent builds only recompile files that changed. Full pipeline and cache details: **[scripts/README.md](scripts/README.md)**

---

### Writing content

All article and fieldnote markdown lives in `src/data/pages/`. The compiler supports a **custom syntax superset** on top of standard GFM: colored text, accent text, typed blockquotes, definition lists, alphabetical lists, context annotations, wiki-links, cross-document links, image positioning, and inline footnotes. Full authoring reference with frontmatter schemas per category, syntax examples, and edge cases: **[src/data/pages/README.md](src/data/pages/README.md)**

---

### Theme system

All colors flow through a three-layer cascade: CSS custom properties in `index.html` (`:root` for dark, `[data-theme="light"]` for light) → Tailwind semantic tokens (`th-*`) in the inline config → `th-*` classes in components. Article styling adds a fourth layer: `--art-accent` per category with `color-mix()` derivations on `.article-page-wrapper`. Never use hardcoded color classes (`text-white`, `bg-gray-900`) — they bypass the cascade and break theme transitions.

---

### Second Brain

A flat knowledge graph of individual `.md` files in `fieldnotes/`. Each note has an `address` (hierarchical, `//`-separated) and links to other notes via `[[wiki-links]]`. Build produces three outputs: a posts JSON (no fieldnotes), a metadata index (no content), and individual content files served as static assets. At runtime, the index loads eagerly while content is fetched on demand per note. Wiki-links are resolved at fetch time against the loaded index.

---

### Build-time content validation

The build pipeline includes a 6-phase integrity checker that catches reference errors, structural inconsistencies, and potential concept duplication before they reach production. This is the repo's own safety net — the kind of link validation and address consistency checks that tools like Obsidian provide via plugins, but implemented directly in the build pipeline so nothing slips through to the deployed site.

| Phase | What it catches | Severity |
|---|---|---|
| Reference integrity | Broken `[[wiki-links]]` in fieldnotes and posts | ERROR (fails build) |
| Self-references | Notes linking to themselves | WARN |
| Parent hierarchy | Missing parent nodes in the address tree | WARN |
| Circular references | Cycles in the reference graph (opt-in) | WARN |
| **Segment collisions** | Same concept name appearing at different hierarchy paths — flags potential duplication with severity tiers (HIGH/MED/LOW) and supports `distinct` frontmatter for intentional disambiguation | WARN |
| Orphan detection | Notes with no connections to the graph | INFO |

There is also an optional deep audit script (`node scripts/check-references.js`) that adds one-way trailing ref analysis, redundant ref detection, and fuzzy duplicate detection. Full validation details: **[scripts/README.md](scripts/README.md)**

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
npm run dev          # build content + start vite dev server
npm run build        # build content + production build
```
