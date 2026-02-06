# Build Scripts

## `build-content.js`

Main content compiler. Transforms markdown into pre-rendered HTML with syntax highlighting, custom syntax processing, and link resolution.

### Pipeline (14 steps)

Both regular posts and fieldnotes pass through the same `compileMarkdown()` pipeline, in this exact order:

| # | Step | Phase | What it does |
|---|---|---|---|
| 1 | `protectBackticks` | Pre-marked | Shields fenced code blocks (` ``` `) and inline code (`` ` ``, ` `` `) with `%%CBLK_N%%` placeholders so no preprocessor touches code content |
| 2 | `applyPreProcessors` | Pre-marked | Runs regex rules from `compiler.config.js` (color, accent, underline, etc.). Heading lines (`# ...`) are temporarily replaced with `%%HEADING_N%%` so inline syntax never modifies them |
| 3 | `processCustomBlockquotes` | Pre-marked | Converts `{bkqt/TYPE}...{/bkqt}` blocks into typed blockquotes (note, tip, warning, danger, keyconcept, quote, pullquote). Supports definition lists and alpha lists inside blockquotes |
| 4 | `restoreBackticks` | Pre-marked | Restores `%%CBLK_N%%` → original code content |
| 5 | `processExternalUrls` | Pre-marked | Converts `[[https://...\|text]]` into `<a class="doc-ref doc-ref-external">` with external link icon. Runs before marked to prevent URL auto-linking corruption |
| 6 | `preprocessSideImages` | Pre-marked | Detects `![alt](src "left/right:width")` followed by text (no empty line). Wraps into `<div class="img-side-layout">` flexbox container |
| 7 | `processDefinitionLists` | Pre-marked | Converts `- TERM:: description` blocks into `<div class="defn-list">` with `<p class="defn">` items |
| 8 | `processAlphabeticalLists` | Pre-marked | Converts sequential `a. / A.` lines into `<ol type="a/A">` |
| 9 | `processContextAnnotations` | Pre-marked | Converts `>> YY.MM.DD - text` lines into `<div class="ctx-note">` with avatar, date formatting, and relative time computation vs article date |
| 10 | `marked.parse` | Marked | Standard GFM parsing. Custom renderer overrides: `blockquote` → `<div class="small-text">` (not `<blockquote>`), `image` → position classes + figcaption support |
| 11 | `stripHeadingFormatting` | Post-marked | Removes all inline HTML tags from `<h1>`-`<h4>` content (no `<code>`, `<em>`, `<strong>` inside headings) |
| 12 | `highlightCodeBlocks` | Post-marked | Shiki dual-theme highlighting. Wraps in `.code-terminal` with macOS dots, language label, copy button |
| 13 | `applyPostProcessors` | Post-marked | Runs post-processor regex rules from `compiler.config.js` (currently empty) |
| 14 | `processAnnotations` | Post-marked | Converts `{{ref\|explanation}}` into superscript notes. Uses balanced-bracket parser for nesting. Runs inside `processOutsideCode` to skip `<pre>`/`<code>` |

### Image renderer

The custom marked renderer handles image positioning via the title field:

```markdown
![alt](src "right")         → <img class="img-float-right">
![alt](src "left:300px")    → <img class="img-float-left" style="width:300px">
![alt](src "center")        → <img class="img-center">
![alt](src "full")          → <img class="img-full">
![alt|Caption](src "center") → <figure class="img-center"><img><figcaption>Caption</figcaption></figure>
```

Positions: `right`, `left`, `center`, `full`. Optional width suffix (e.g. `right:250px`). Pipe `|` in alt text splits into alt + figcaption.

### Blockquote types

```markdown
{bkqt/note}           → <div class="bkqt bkqt-note"> with "Note:" label
{bkqt/tip}            → "Tip:" label
{bkqt/warning}        → "Warning:" label
{bkqt/danger}         → "Danger:" label
{bkqt/keyconcept}     → "Key concept:" label
{bkqt/quote|Author}   → No label, attribution span
{bkqt/pullquote}      → No label, styled as pullquote
{bkqt/note|Custom}    → Custom label overrides default
```

Content inside blockquotes supports definition lists (`- term:: desc`), alphabetical lists (`a. / A.`), numbered lists, and standard markdown. Paragraphs separated by double newlines. Lines separated by single newlines get `bkqt-cont` class.

### Link processing

`processAllLinks` runs on ALL compiled HTML (regular + fieldnotes) after individual compilation. It resolves `[[...]]` links in a single pass:

| Pattern | Type | Output |
|---|---|---|
| `[[projects/slug\|Display]]` | Cross-doc link | `<a class="doc-ref doc-ref-projects" href="/lab/projects/slug">projects/Display</a>` |
| `[[threads/slug\|Display]]` | Cross-doc link | `<a class="doc-ref doc-ref-threads" href="/blog/threads/slug">threads/Display</a>` |
| `[[bits2bricks/slug\|Display]]` | Cross-doc link | `<a class="doc-ref doc-ref-bits2bricks" href="/blog/bits2bricks/slug">bits2bricks/Display</a>` |
| `[[address]]` | Wiki-ref | `<a class="wiki-ref" data-address="address">last-segment</a>` |
| `[[address\|Custom]]` | Wiki-ref | `<a class="wiki-ref" data-address="address">Custom</a>` |

Cross-doc links **require** display text (`|Display`). Missing display text produces a build error. Each cross-doc category has its own SVG icon. All link processing is wrapped in `processOutsideCode` to skip `<pre>`/`<code>` blocks.

### Outputs

| Output | Location | Contents |
|---|---|---|
| Regular posts | `src/data/posts.generated.json` | Projects, threads, bits2bricks with full HTML content. No fieldnotes. |
| Fieldnotes index | `src/data/fieldnotes-index.generated.json` | Metadata array (id, title, address, addressParts, references, trailingRefs, searchText, description). No `content` field. |
| Fieldnote content | `public/fieldnotes/{id}.json` | `{ "content": "<html>" }` per note. Served as static assets. Stale files auto-cleaned. |
| Categories | `src/data/categories.generated.json` | Category config from `_category.yaml` files. |

### Fieldnote metadata extraction

Each fieldnote `.md` file produces:

- **id**: derived from address — `//` → `--`, `/` → `-`, lowercased (e.g. `CPU//ALU` → `cpu--alu`)
- **displayTitle**: last segment of address
- **description**: first non-heading, non-image text line (wiki-refs stripped to plain text)
- **references**: all `[[...]]` addresses found in body
- **trailingRefs**: `[[...]]` links on the last contiguous lines (used for "see also" display)
- **searchText**: full HTML stripped of tags, lowercased (for client-side search)

### Incremental cache

**Cache file:** `.content-cache.json` (git-ignored)

```json
{
  "version": 1,
  "configHash": "<sha256-16 of compiler.config.js>",
  "posts":      { "<relative-path>": { "mtime": <ms>, "result": { ... } } },
  "fieldnotes": { "<filename>":      { "mtime": <ms>, "metadata": { ... }, "preLinkHtml": "..." } }
}
```

Cache logic:
- `configHash`: first 16 chars of SHA-256 of `compiler.config.js`. If it changes → full rebuild.
- Per-file `mtime` (milliseconds): if mtime matches → reuse cached output, skip compilation.
- `preLinkHtml`: fieldnotes store pre-link HTML so link resolution can always re-run.
- `processAllLinks` always runs on ALL content (link targets may change when notes are added/removed).
- Force full rebuild: `--force` flag or delete `.content-cache.json`.

### Shiki

10 languages loaded: typescript, javascript, python, rust, go, yaml, json, html, css, bash.

Per-language dual-theme pairs (`--shiki-dark` / `--shiki-light`):

| Language | Dark | Light |
|---|---|---|
| TypeScript, JavaScript | one-dark-pro | one-light |
| Python | catppuccin-mocha | catppuccin-latte |
| Rust | rose-pine | rose-pine-dawn |
| Go | min-dark | min-light |
| YAML, JSON | github-dark | github-light |
| **Default** (HTML, CSS, bash, unknown) | vitesse-dark | vitesse-light |

Unknown languages fall back to default themes gracefully (no build error). Code blocks without a language tag get the terminal wrapper but no highlighting.

### Build error handling

The build collects errors from two sources and fails if any exist:
1. **Build errors** (`buildErrors[]`): missing `address` in fieldnote frontmatter, cross-doc links missing display text
2. **Validation errors**: from `validate-fieldnotes.js` (see below)

Non-zero errors → `process.exit(1)`. Warnings (e.g. missing parent segments) do NOT fail the build.

---

## `compiler.config.js`

Centralized configuration consumed by `build-content.js`. Changing this file invalidates the entire cache (triggers full rebuild via `configHash`).

### Sections

#### `marked`
Options passed to `marked.setOptions()`:
- `gfm: true` — GitHub Flavored Markdown (tables, strikethrough, autolinks)
- `breaks: false` — single newlines do NOT produce `<br>` (need double newline for paragraph break)

#### `wikiLinks`
- `enabled`: master toggle for all `[[...]]` link processing
- `pattern`: regex for matching wiki-links (`/\[\[([^\]]+)\]\]/g`)
- `toHtml(address)`: converts address to `<a class="wiki-ref" data-address="...">` with last segment as display text

#### `imagePositions`
- `positions`: allowed position keywords (`right`, `left`, `center`, `full`)
- `titlePattern`: regex to extract position + optional width from image title field
- `classMap`: position → CSS class mapping (`center` → `img-center`, `right` → `img-float-right`, etc.)

#### `preProcessors`
Regex rules applied BEFORE `marked.parse`, in order. Heading lines are protected (never modified).

| Name | Syntax | Output |
|---|---|---|
| text-color | `{#ff0:text}` or `{#red:text}` | `<span style="color:#ff0">text</span>` |
| small-caps | `{sc:text}` | `<span style="font-variant:small-caps">text</span>` |
| superscript | `{^:text}` | `<sup>text</sup>` |
| subscript | `{v:text}` | `<sub>text</sub>` |
| keyboard | `{kbd:text}` | `<kbd>text</kbd>` |
| shout | `{shout:text}` | `<p class="shout">text</p>` |
| underline | `_text_` | `<span style="text-decoration:underline">text</span>` |
| accent-text | `--text--` | `<span class="accent-text">text</span>` |

**Order matters**: curly-brace patterns (`{...}`) run first (unambiguous delimiters), then bare-delimiter patterns (`_..._`, `--...--`). The underline regex uses negative lookbehind/ahead (`(?<!\w)` / `(?!\w)`) to avoid matching mid-word underscores. The accent-text regex uses negative lookbehind/ahead to avoid matching CSS `---` separators.

#### `postProcessors`
Regex rules applied AFTER `marked.parse` (on HTML). Currently empty — reserved for future use.

#### `validation`
Boolean flags controlling which validation checks run:
- `validateRegularPostWikiLinks`: check that `[[wiki-refs]]` in regular posts point to existing fieldnote addresses
- `validateFieldnoteRefs`: check that `[[refs]]` inside fieldnotes point to existing fieldnote addresses
- `validateParentSegments`: warn when a parent address segment (e.g. `CPU` in `CPU//ALU`) has no dedicated fieldnote file

---

## `validate-fieldnotes.js`

Three-phase reference integrity checker. Called automatically at the end of every build. Errors fail the build; warnings are logged but allowed.

### Phase 1: Fieldnote internal references (`validateFieldnoteRefs`)

For each fieldnote, checks that every `[[address]]` in its `references` array points to an address that exists in the fieldnotes set.

- **Scope**: fieldnote → fieldnote references only
- **Severity**: ERROR (fails build)
- **Example**: `CPU.md` contains `[[GPU//VRAM]]` but no fieldnote has address `GPU//VRAM`

### Phase 2: Parent segment existence (`validateParentSegments`)

For hierarchical addresses (containing `//`), checks that every parent segment has its own dedicated fieldnote.

- **Scope**: address hierarchy integrity
- **Severity**: WARNING (logged, does not fail build)
- **Example**: `CPU//ALU.md` exists but `CPU.md` does not → warns that `CPU` has no dedicated block
- **Logic**: splits `addressParts` and checks all segments except the last

### Phase 3: Regular post wiki-link targets (`validateRegularPostWikiLinks`)

Scans compiled HTML of all non-fieldnote posts for `data-address="..."` attributes and checks each target exists in the fieldnotes address set.

- **Scope**: regular posts (projects, threads, bits2bricks) → fieldnote references
- **Severity**: ERROR (fails build)
- **Example**: a thread article contains `[[chip//SoC]]` but no fieldnote has address `chip//SoC`
- **Implementation**: regex scan on compiled HTML (`data-address="([^"]+)"`), not on raw markdown
