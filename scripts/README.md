# Content tooling

Operational reference for the build-time content pipeline. Supported authoring syntax is documented only in [`src/data/pages/SYNTAX.md`](../src/data/pages/SYNTAX.md); wikinote workflows live in [`wikinotes/README.md`](../src/data/pages/wikinotes/README.md).

## Commands

```bash
npm run content       # compile content and validate references
npm run content:fix   # compile and offer interactive fixes
npm run build         # content + production Vite build, no uploads or studio writes
npm run typecheck     # browser and Pages Function types
npm test              # local regression suites
npm run docs:check    # local guide links and heading anchors
npm run context:check # report stale studio packs without writing
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

`compiler.config.js` contains only active configuration: marked options, Wiki-link matching, image positions, the three inline preprocessors and validation flags. Changes to it, the build script, the shared compiler or its casing helper invalidate the content cache.

## Outputs

| Output | Purpose |
|---|---|
| `src/data/posts.generated.json` | Full compiled Projects, Essays and Bits2Bricks content |
| `src/data/posts-index.generated.json` | Lightweight listing/search metadata |
| `src/data/wikinotes-index.generated.json` | Wikinote metadata without full bodies |
| `public/wikinotes/{uid}.json` | One compiled body per wikinote |
| `src/data/categories.generated.json` | Category configuration |
| `src/data/graph-relevance.generated.json` | Graph relevance and bridge metrics |
| `src/data/graph-thumb.generated.json` | Static layout of the whole wiki graph (positions, root colours, typed edges) drawn as inline SVG on the Home spotlight |
| `src/data/content-routes.generated.json` | Canonical slugs, stable IDs, translations and historical paths |
| `src/data/field-of-view.generated.json` | Home domain evidence and layout |
| `public/wikinotes-index.json` | Public Wiki metadata and search text |
| `public/og-manifest.json` | Social metadata and crawler text lookup |
| `public/llms.txt`, `public/llms-full.txt` | Curated summary with generated listings, and full article text |
| `public/agent-profile.json` | Public machine-readable profile |
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
| `og-cards.js` / `og-precommit.js` | Photograph and publish incremental social cards; see [Share cards](#share-cards) |
| `obsidian-export.js` / `obsidian-import.js` | Obsidian synchronization |
| `media.js` | Article images: optimize masters from `media/` and sync them to Cloudflare R2 |
| `check-tank-lesson.mjs` / `render-tank-figures.mjs` | Validate article 3142718's teaching simulation and regenerate its vector plots; the simulation is [tabla-arr.html](../public/playgrounds/3142718/tabla-arr.html) |

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
| `npm run media -- push [id\|site …]` | Encode what changed (WebP, 1600px covers, 1400px figures, no upscaling; SVG/GIF copied as is; a JPEG twin of the cover for og:image), upload it plus the master under `originals/`, print the URLs. Resumable: objects whose ETag matches the encoded bytes are not re-sent. |
| `npm run media -- sync --soft` | Same for everything; upload errors warn and continue. Explicit command, skips without R2 credentials. `npm run dev` runs it too, at start and again whenever a file under `media/` is added or replaced (`vite-plugins/media-sync.js`), so in day-to-day work you never call push by hand: drop the file in, wait a few seconds, paste the url. |
| `npm run media -- pull [id\|site …]` | Download the masters into `media/` on another machine. |
| `npm run media -- ls [id] [--by date\|size\|name] [--all]` | List the bucket (the dashboard cannot sort). |
| `npm run media -- status` | Local masters vs manifest vs bucket: new, changed, missing, orphans. |
| `npm run media -- rm <key …>` | Delete bucket objects. Explicit keys only. |
| `npm run media -- mv <from> <to>` | Rename a bucket object server-side (nothing re-uploaded); the manifest follows. |
| `npm run media -- url <id>[/<name>]` | Print public URLs. |

Bucket keys: `articles/<id>/cover.webp`, `articles/<id>/cover.jpg`, `articles/<id>/figures/<slug>.webp|.svg`, `site/<path>/<slug>.webp`, and `originals/<same path as media/>` for the masters. Objects are uploaded with `Cache-Control: public, max-age=31536000, immutable`; the build appends `?v=<content hash>` to every CDN url in a post (and uses the JPEG twin for `og:image`), so replacing an image under the same name still refreshes everywhere on the next deploy. A CDN url whose key is not in the manifest prints a `[MEDIA]` warning at build time. Encoding rules live in `RULES` at the top of the script; bump `VERSION` there to re-encode everything. Credentials: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` in `.env` (Object Read & Write token scoped to the bucket).

## Context packs

`npm run context` explicitly runs `scripts/context-pack.js`. It writes two kinds of output, both tracked in git and never edited by hand. Only named generated files are updated, only when their bytes change; there is no timestamp churn or directory cleanup. `npm run context:check` lists stale or missing outputs and exits 1 without writing. The production build does not regenerate studio material.

`_studio/articles/1-articles-format/write-<category>.md`, one pasteable pack per article job: the prompt for that job, the no-tics paragraph, then the frontmatter/pipeline hub, syntax, hard rules, voice, visual guide and category README in `src/data/pages/` assembled with headings shifted down one level and relative links redirected to their source files, for an AI outside the repo. Adding a doc to a pack is one line in the `PACKS` table of the script.

`_studio/twitter/0-gen_prompts/_format_ctx/NO-TICS.md`, a copy of `src/data/pages/NO-TICS.md` with relative links redirected to their source files. The tweet prompts beside it are hand-written, because tweets follow no canon and there is no format doc to concatenate; the paragraph is the one thing both channels share, so the compile drops it there and each prompt names it. Everything else under `_format_ctx/` is the author's own material and is never regenerated.

## Finding studio pieces

`npm run find -- <filters>` runs `scripts/studio-find.js`: it reads titled frontmatter pieces (plain prompts and reference lists are excluded) under `_studio/_inbox/`, `_studio/twitter/` and `_studio/articles/` (skipping the generated packs) and prints the matches (`--folder` for bank categories; `--tag`, repeatable; `--kind`, `--status`, `--mood`, `--format`, `--lang`, `--signal`, `--source`, `--text`). `--tags` lists the vocabulary with counts and flags tags missing from `_studio/twitter/gen_prompts/_format_ctx/_vocabulary/TAGS.md`. `--links` prints the traceability graph between `_studio/_inbox/bank/` and `_studio/articles/queue/` and lists what is broken (a one-way link, a dead slug, a topic with no source). --folder accepts a branch path (articles/projects) or a folder name (additions, across categories). Bank items are read recursively, derive their kind from the folder, and use folder-qualified references such as `articles/essays/watts-and-tons`; queues retain their frontmatter kind. Nothing enforces those fields at build time, so this is the only check. `--tvb <text>` searches the hand-written line-per-entry files (`_format_ctx/` and `_inbox/motherlode/`). The schema is in `_studio/README.md`. The script is a tool for whoever searches, the agent included: extend it when a question needs a filter it lacks.

## Share cards

The shared inventory is [share-card-catalog.js](../src/lib/share-card-catalog.js); [shareCards.ts](../src/lib/shareCards.ts) maps content onto the designs in [shareCardDesigns.tsx](../src/views/shareCardDesigns.tsx). Register personal pages, sections and playgrounds once in that inventory. Articles and Wiki notes come from compiled indexes; translated articles share the English card.

Run `npm run content` first, then `npm run og -- <kind|id>`, then `npm run content` to connect the new cards to crawler metadata. The renderer starts Vite at 127.0.0.1:5197 with media synchronization disabled, uses headless Chrome at a 1200 x 630 viewport, and uploads JPEGs capped at 550 KB. Credentials are the same as media; Chrome is discovered locally or through `CHROME_PATH`.

`--dry --force --limit 1` renders a sample without uploading or changing manifests (Chrome still writes its local profile/cache). `--base <url>` uses an existing Vite server whose own media-watcher settings remain in effect. `--force` refreshes the selected scope. Text, versioned covers, shared design sources, icons, avatar, theme/font declarations and the essay background invalidate cached cards. Missing images fail readiness. Obsolete routes are pruned only on unscoped runs; objects still used by a current route are retained after slug renames.

`npm install` activates [.githooks/pre-commit](../.githooks/pre-commit). The hook compiles content, renders changed cards and recompiles metadata if necessary, then stages the two card manifests. It skips with a warning when tooling is missing or card inputs/manifests have unstaged edits, preserving partial staging. `SKIP_OG=1` skips explicitly. Rendering failures are reported but do not block the commit; check the output before publishing. CI consumes the tracked manifests and does not photograph or upload cards.

## Build and verification boundaries

`npm run build` compiles Markdown, resolves links, writes crawler/discovery assets and bundles the SPA into `dist/`. It reads tracked media/card manifests and never reads or writes studio content. Media uploads and context regeneration are explicit commands; development still syncs images automatically unless `MEDIA_SYNC=0` is set. Push changed masters before building their references.

`npm run docs:check` checks local Markdown links and heading targets across repository guides, excluding published articles, disposable `room/` and studio by default. Add `-- --studio` for a read-only studio link audit. External URLs and inline code paths are not checked. `npm run find -- --links` reports studio traceability gaps; it does not fail the site build.

The validation workflow runs the production build, both TypeScript projects, local regression suites, guide links and Wiki reference checks. Worker integration checks are separate: [counters verification](../workers/counters/README.md#local-verification). Cloudflare Pages deploys independently of GitHub Actions, so a failed validation does not itself block a deployment.
