# Content tooling

Operational reference for the build-time content pipeline. Supported authoring syntax is documented only in [`src/data/pages/SYNTAX.md`](../src/data/pages/SYNTAX.md); fieldnote workflows live in [`fieldnotes/README.md`](../src/data/pages/fieldnotes/README.md).

## Commands

```bash
npm run content       # compile content and validate references
npm run content:fix   # compile and offer interactive fixes
npm run build         # content + production Vite build
```

Delete `.content-cache.json` or pass `--force` to `build-content.js` when a full content rebuild is required.

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
| `src/data/fieldnotes-index.generated.json` | Fieldnote metadata without full bodies |
| `public/fieldnotes/{uid}.json` | One compiled body per fieldnote |
| `src/data/categories.generated.json` | Category configuration |
| `src/data/graph-relevance.generated.json` | Graph relevance and bridge metrics |
| `public/og-manifest.json` | Social metadata lookup |
| `public/sitemap.xml` | Search sitemap |
| `public/feed.xml` | RSS feed |

Generated files must not be edited by hand.

## Cache

`.content-cache.json` stores the compiler configuration hash and per-file modification time. Unchanged files reuse pre-link HTML; global link resolution still runs because a newly added or renamed note can affect other documents.

## Validation

`validate-fieldnotes.js` runs automatically. Errors fail the build; warnings and informational findings do not. Active checks are controlled by `compiler.config.js`:

- Regular-post and fieldnote Wiki references.
- Missing parent segments.
- Segment and alias collisions.
- Optional circular-reference detection.
- Isolated-note reporting.

Malformed or retired syntax leaking into output is caught by the syntax guard. Run `npm run content:fix` for issues supported by the interactive resolver.

## Scripts

| Script | Role |
|---|---|
| `build-content.js` | Compilation, global link resolution and generated outputs |
| `validate-fieldnotes.js` | Graph/content integrity checks |
| `resolve-issues.js` | Interactive fixes emitted by validation |
| `preflight.js` | Address and collision checks before creating notes |
| `move-hierarchy.js` | Planned/dry-run hierarchy moves and reference updates |
| `rename-address.js` | Simple address rename workflow |
| `check-references.js` | Reference inspection |
| `analyze-pairs.js` | Relationship inspection |
| `compute-graph-relevance.js` | Graph scoring data |
| `obsidian-export.js` / `obsidian-import.js` | Obsidian synchronization |
| `migrate-to-uids.js` | Historical UID migration utility |

Detailed flags and edge cases for fieldnote operations remain in the fieldnotes management guide rather than being duplicated here.
