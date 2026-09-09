# Content tooling

Operational reference for the build-time content pipeline. Supported authoring syntax is documented only in [`src/data/pages/SYNTAX.md`](../src/data/pages/SYNTAX.md); wikinote workflows live in [`wikinotes/README.md`](../src/data/pages/wikinotes/README.md).

## Commands

```bash
npm run content       # compile content and validate references
npm run content:fix   # compile and offer interactive fixes
npm run build         # content + production Vite build
```

Delete `.content-cache.json` or pass `--force` to `build-content.js` when a full content rebuild is required.

Home's domain selection, positions and article evidence are generated during content compilation. See [Field of View](FIELD-OF-VIEW.md) for article weights, Wiki hierarchy grouping, tag validation and checks.

## Content names and routes

[CONTENT-URLS.md](CONTENT-URLS.md) defines slugs, filename validation, historical redirects and the rename command. Compilation generates one route registry for the browser and edge function before the Vite build.

## Compiler

`build-content.js` reads Markdown/front matter, calls `compileMarkdown()` from `src/lib/content/compile.js`, resolves the graph after all files are known, validates content and writes generated assets.

The active per-document pipeline is:

1. Protect fenced and inline code.
2. Apply superscript, subscript and keyboard inline rules.
3. Render mathematics and typed notes.
4. Restore protected code.
5. Protect/resolve structured URLs and reference pipes.
6. Render definition lists, alphabetical lists and dated context annotations.
7. Normalize nested-list indentation.
8. Parse GitHub-Flavored Markdown.
9. Clean heading markup and apply Shiki highlighting.
10. Render paragraph-scoped footnotes.
11. Resolve Wiki and cross-document references after every document is compiled.

`compiler.config.js` contains only active configuration: marked options, Wiki-link matching, image positions, the three inline preprocessors and validation flags. Changing it invalidates the content cache.

## Outputs

| Output | Purpose |
|---|---|
| `src/data/posts.generated.json` | Full compiled Projects, Essays and Technical content |
| `src/data/posts-index.generated.json` | Lightweight listing/search metadata |
| `src/data/wikinotes-index.generated.json` | Wikinote metadata without full bodies |
| `public/wikinotes/{uid}.json` | One compiled body per wikinote |
| `src/data/categories.generated.json` | Category configuration |
| `src/data/graph-relevance.generated.json` | Graph relevance and bridge metrics |
| `src/data/graph-thumb.generated.json` | Static layout of the whole wiki graph (positions, root colours, typed edges) drawn as inline SVG on the Home spotlight |
| `public/og-manifest.json` | Social metadata lookup |
| `public/sitemap.xml` | Search sitemap |
| `public/feed.xml` | RSS feed |

Generated files must not be edited by hand.

## Cache

`.content-cache.json` stores the compiler configuration hash and per-file modification time. Unchanged files reuse pre-link HTML; global link resolution still runs because a newly added or renamed note can affect other documents.

## Validation

`validate-wikinotes.js` runs automatically. Errors fail the build; warnings and informational findings do not. Active checks are controlled by `compiler.config.js`:

- Regular-post and wikinote Wiki references.
- Missing parent segments.
- Segment and alias collisions.
- Optional circular-reference detection.
- Isolated-note reporting.

Malformed or retired syntax leaking into output is caught by the syntax guard. Run `npm run content:fix` for issues supported by the interactive resolver.

## Scripts

| Script | Role |
|---|---|
| `build-content.js` | Compilation, global link resolution and generated outputs |
| `validate-wikinotes.js` | Graph/content integrity checks |
| `resolve-issues.js` | Interactive fixes emitted by validation |
| `preflight.js` | Address and collision checks before creating notes |
| `move-hierarchy.js` | Planned/dry-run hierarchy moves and reference updates |
| `rename-address.js` | Simple address rename workflow |
| `check-references.js` | Reference inspection |
| `analyze-pairs.js` | Relationship inspection |
| `compute-graph-relevance.js` | Graph scoring data |
| `compute-graph-thumb.js` | Deterministic force layout of the wiki graph for the Home spotlight |
| `og-cards.js` | Share cards (og:image). With the dev server running, `npm run og -- --base http://localhost:3000` drives headless Chrome through `/og/card/<kind>/<id>` for every article, playground, wiki note, section and personal page, encodes a 1200 x 630 JPEG under 550 KB, uploads it to R2 as `og/<kind>/<id>.jpg` and records it in `src/data/og-cards.json` (tracked). Incremental: a card is redone only when its text, cover or the design sources change; `--force` redoes the scope, `--dry` renders without writing, `--limit N` samples. Then `npm run content` points `og-manifest.json` at the cards |
| `obsidian-export.js` / `obsidian-import.js` | Obsidian synchronization |
| `media.js` | Article images: optimize masters from `media/` and sync them to Cloudflare R2 |
| `check-tank-lesson.mjs` / `render-tank-figures.mjs` | Validate article 3142718's teaching simulation and regenerate its vector plots; see [experiment notes](../public/playgrounds/3142718/README.md) |

Detailed flags and edge cases for wikinote operations remain in the wikinotes management guide rather than being duplicated here.

## Article images

Masters live in `media/` (gitignored) and the folder says what a file is; the bucket key mirrors the path:

| Folder | What | Encoding |
|---|---|---|
| `media/articles/<id>/cover.<ext>` | Hero of an article: index card and article top | WebP 1600px + JPEG twin for og:image |
| `media/articles/<id>/figures/<slug>.<ext>` | Illustrations inside the body | WebP 1400px; SVG and GIF copied as they are |
| `media/site/<path>/<slug>.<ext>` | Page scaffolding art: home carousel, plates, about | WebP 1600px |

Names are lowercase slugs. `scripts/media.js` encodes and uploads to the R2 bucket behind `cdn.infraphysics.net`; the tracked `src/data/media-manifest.json` records what the CDN holds. Components take urls from `cdn(key)` in `src/lib/cdn.ts`, which reads the same manifest. App-shell assets that are preloaded same-origin (`public/avatar.jpg`, the home wiki captures, `og-image.jpg`) stay in `public/` on purpose.

| Command | Does |
|---|---|
| `npm run media -- push [id\|site …]` | Encode what changed (WebP, 1600px covers, 1400px figures, no upscaling; SVG/GIF copied as is; a JPEG twin of the cover for og:image), upload it plus the master under `originals/`, print the URLs. Resumable: objects already on the CDN at the same size are not re-sent. |
| `npm run media -- sync --soft` | Same for everything; never fails. Runs first in `npm run build`, and skips when `.env` has no R2 credentials (CI). `npm run dev` runs it too, at start and again whenever a file under `media/` is added or replaced (`vite-plugins/media-sync.js`), so in day-to-day work you never call push by hand: drop the file in, wait a few seconds, paste the url. |
| `npm run media -- pull [id\|site …]` | Download the masters into `media/` on another machine. |
| `npm run media -- ls [id] [--by date\|size\|name] [--all]` | List the bucket (the dashboard cannot sort). |
| `npm run media -- status` | Local masters vs manifest vs bucket: new, changed, missing, orphans. |
| `npm run media -- rm <key …>` | Delete bucket objects. Explicit keys only. |
| `npm run media -- mv <from> <to>` | Rename a bucket object server-side (nothing re-uploaded); the manifest follows. |
| `npm run media -- url <id>[/<name>]` | Print public URLs. |

Bucket keys: `articles/<id>/cover.webp`, `articles/<id>/cover.jpg`, `articles/<id>/figures/<slug>.webp|.svg`, `site/<path>/<slug>.webp`, and `originals/<same path as media/>` for the masters. Objects are uploaded with `Cache-Control: public, max-age=31536000, immutable`; the build appends `?v=<content hash>` to every CDN url in a post (and uses the JPEG twin for `og:image`), so replacing an image under the same name still refreshes everywhere on the next deploy. A CDN url whose key is not in the manifest prints a `[MEDIA]` warning at build time. Encoding rules live in `RULES` at the top of the script; bump `VERSION` there to re-encode everything. Credentials: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` in `.env` (Object Read & Write token scoped to the bucket).
