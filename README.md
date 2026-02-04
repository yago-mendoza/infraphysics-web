# infraphysics

Personal website and knowledge system. Articles, projects, field notes, and a second brain built from scratch.

![build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)

---

### Stack

- **React 19** + **React Router 7** (SPA)
- **Vite 6** (dev server + build)
- **TypeScript**
- **marked** (markdown to HTML, build-time)
- **gray-matter** (frontmatter parsing)
- **Tailwind CSS** (utility styles) + vanilla CSS (content styling)
- **Formspree** (contact form)
- **Cloudflare R2** (image hosting)

---

### Project structure

```
infraphysics-web/
  scripts/
    compiler.config.js        # Centralized compiler configuration
    build-content.js          # Markdown → JSON pipeline
    validate-fieldnotes.js    # Reference integrity checks
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
        projects/             # .md posts + _category.yaml
        threads/              # .md posts + _category.yaml
        bits2bricks/          # .md posts + _category.yaml
        fieldnotes/           # _fieldnotes.md (all concepts in one file)
        home/                 # _home-featured.yaml
      posts.generated.json    # Build output (all posts as JSON)
      categories.generated.json
      home-featured.generated.json
      data.ts                 # Runtime data loader
    lib/
      wikilinks.ts            # Runtime wiki-link resolver
      content.ts              # Content utilities
      color.ts                # Color utilities (hexAlpha)
      date.ts                 # Date formatting
      search.ts               # Search utilities
      brainIndex.ts           # Fieldnotes index helpers
      addressToId.ts          # Address → slug conversion
    styles/
      article.css             # Article post view styles (terminal/cyberpunk theme)
      wiki-content.css        # Wiki/second-brain content rendering (.content-html)
    config/                   # Categories config
    constants/                # Layout, theme constants
    types.ts                  # TypeScript interfaces (Post, Category, etc.)
  index.css                   # Global styles (images, wiki-links, animations, components)
  package.json
```

---

### Build pipeline

> Deep dive on ordering, collision avoidance, and extension points: **[scripts/COMPILER.md](scripts/COMPILER.md)**

```
.md files
  │
  ├── gray-matter ─── frontmatter + raw markdown
  │
  ├── preProcessors ── custom syntax ({#color:text}, {_:underline}, {kbd:key}, etc.)
  │
  ├── preprocessSideImages ── left/right image layouts → flexbox HTML
  │
  ├── marked.parse ── standard markdown → HTML
  │
  ├── postProcessors ── (extensible, currently empty)
  │
  ├── processWikiLinks ── [[address]] → <a class="wiki-ref" data-address="...">
  │
  └── JSON output ── posts.generated.json
```

Run: `npm run content` (or automatically via `npm run dev` / `npm run build`).

---

### Second Brain

The fieldnotes system is a flat knowledge graph stored in `_fieldnotes.md`. Each concept is a block separated by `---`:

```markdown
physics // thermodynamics // entropy
Content about entropy...
[[physics // information theory]]

---

physics // information theory
Content about information theory...
```

- **Addresses** use `//` as hierarchy separator: `domain // subdomain // concept`
- **References** are `[[address]]` links between concepts
- **Backlinks** are computed at runtime in `SecondBrainView.tsx`
- **Validation** checks reference integrity and parent segment existence at build time

---

### Wiki-links

Wiki-links work in **all posts** (projects, threads, bits2bricks, fieldnotes):

**Build-time:** `[[physics // entropy]]` is converted to `<a class="wiki-ref" data-address="physics // entropy">entropy</a>` by the compiler.

**Runtime:** `WikiContent.tsx` resolves each `wiki-ref` against the fieldnotes dataset:
- **Resolved** links get violet styling, a `◇` icon, and `data-title`/`data-description` attributes for the hover preview
- **Unresolved** links get grey styling with a `?` icon and `cursor: not-allowed`

**Hover preview:** Hovering a resolved wiki-link shows a floating card with the concept title, address path, description snippet, and a hint to click. Uses React portal + event delegation.

---

### Custom syntax

The compiler supports custom inline syntax via pre-processors. All rules are defined in `scripts/compiler.config.js`:

| Syntax | Result | Example |
|---|---|---|
| `{#FF0000:text}` | Colored text | `{#e74c3c:danger}` |
| `{_:text}` | Solid underline | `{_:important}` |
| `{-.:text}` | Dashed underline | `{-.:tentative}` |
| `{..:text}` | Dotted underline | `{..:pending}` |
| `{~:text}` | Wavy underline | `{~:disputed}` |
| `{==:text}` | Highlight/mark | `{==:key insight}` |
| `{sc:text}` | Small caps | `{sc:abbreviation}` |
| `{^:text}` | Superscript | `x{^:2}` |
| `{v:text}` | Subscript | `H{v:2}O` |
| `{kbd:text}` | Keyboard key | `{kbd:Ctrl+C}` |

To add new syntax: add an entry to `preProcessors` in `compiler.config.js` with `name`, `pattern`, `replace`.

---

### Compiler config

`scripts/compiler.config.js` controls all build-time processing:

- **`marked`** — Options passed to marked.js (gfm, breaks)
- **`wikiLinks`** — Toggle, regex pattern, and HTML generator for `[[...]]` links
- **`imagePositions`** — Regex and class map for positioned images (`left`, `right`, `center`, `full`)
- **`preProcessors`** — Array of `{name, pattern, replace}` rules applied before markdown parsing
- **`postProcessors`** — Array of rules applied after markdown parsing (extensible)
- **`validation`** — Flags to toggle fieldnote ref validation, parent segment checks, and regular post wiki-link validation

para descargar contexto en batch claude.md tiene isntrucciones de usar un script ya preparado y edita rintelgietmetne qué archivos descargarpo

---

### Image positioning

Use markdown image titles to control layout:

```markdown
![alt](url "center")       → centered block
![alt](url "full")         → full-width block
![alt](url "left:300px")   → floated left, 300px wide
![alt](url "right:250px")  → floated right, 250px wide
```

For side-by-side layouts, write text lines immediately after a positioned image (no blank line). The compiler wraps them in a flexbox container. Leave a blank line to end the side layout.

---

### Development

```bash
npm install          # install dependencies
npm run dev          # build content + start vite dev server
npm run build        # build content + production build
npm run content      # rebuild content JSON only
```

Media goes to Cloudflare R2, not the repo.
