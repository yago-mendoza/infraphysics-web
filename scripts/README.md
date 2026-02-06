# Build Scripts

## `build-content.js`

Main content compiler. Transforms markdown into pre-rendered HTML.

### Pipeline

1. **Regular posts** (`projects/`, `threads/`, `bits2bricks/`): Read via `gray-matter`, compiled through `compileMarkdown()` — a shared 14-step pipeline (backtick protection → preprocessors → blockquotes → marked → Shiki → postprocessors → annotations). Incrementally cached by mtime.

2. **Fieldnotes** (`fieldnotes/*.md`): Individual `.md` files with `address` + `date` frontmatter. Same `compileMarkdown()` pipeline. Incrementally cached by mtime.

3. **Link resolution**: `processAllLinks` runs on ALL compiled HTML (regular + fieldnotes) to resolve `[[wiki-refs]]` and `[[category/slug|text]]` cross-doc links.

### Outputs

| Output | Location | Contents |
|---|---|---|
| Regular posts | `src/data/posts.generated.json` | Projects, threads, bits2bricks. No fieldnotes. |
| Fieldnotes index | `src/data/fieldnotes-index.generated.json` | Metadata array (id, title, address, references, searchText). No `content`. |
| Fieldnote content | `public/fieldnotes/{id}.json` | `{ "content": "<html>..." }` per note. Served as static assets. |
| Categories | `src/data/categories.generated.json` | Category config from `_category.yaml` files. |

### Incremental Cache

**Cache file:** `.content-cache.json` (git-ignored)

Unified cache for both regular posts and fieldnotes. Format:

```json
{
  "version": 1,
  "configHash": "<sha256 of compiler.config.js>",
  "posts":      { "<relative-path>": { "mtime": ..., "result": { ... } } },
  "fieldnotes": { "<filename>":      { "mtime": ..., "metadata": { ... }, "preLinkHtml": "..." } }
}
```

Logic:
- Stores `configHash` (SHA-256 of `compiler.config.js`) + per-file `mtime` + pre-link HTML.
- On build: if `configHash` matches and file `mtime` matches → reuse cached output (skip compilation).
- If `configHash` differs → full rebuild (all content recompiled).
- `processAllLinks` always runs on all content (link targets may change).
- Force full rebuild: delete `.content-cache.json` or pass `--force`.

### Shiki

Only 10 languages are loaded (typescript, javascript, python, rust, go, yaml, json, html, css, bash). Per-language theme pairs are defined in `LANG_THEMES`. Unknown languages fall back gracefully.

## `migrate-fieldnotes.js`

One-time migration script that splits `_fieldnotes.md` into individual files. Already executed — kept for reference.

## `compiler.config.js`

Centralized configuration: preprocessor regex rules, wiki-link settings, image positioning, validation flags.

## `validate-fieldnotes.js`

Three-phase validation: fieldnote internal refs, parent segment existence, regular post wiki-link targets.
