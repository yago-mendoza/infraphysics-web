# Compiler internals

How the build pipeline transforms markdown into rendered HTML, why the stages don't collide, and how to extend it.

---

### Data sources

The compiler reads from one directory: `src/data/pages/`.

```
pages/
  projects/     *.md + _category.yaml
  threads/      *.md + _category.yaml
  bits2bricks/  *.md + _category.yaml
  fieldnotes/   _fieldnotes.md         ← all concepts in one file, split by ---
  home/         _home-featured.yaml
```

Files starting with `_` are never treated as regular posts — `getAllMarkdownFiles()` skips them explicitly. Fieldnotes have a dedicated parser (`processFieldnotesFile()`) that splits the single file by `---` separators.

---

### Pipeline — step by step

Both regular posts and fieldnotes go through the same pipeline:

```
raw markdown
     │
     ├─ gray-matter ──────────── splits YAML frontmatter from body
     │
     ├─ applyPreProcessors ───── custom syntax → HTML spans (regex on raw text)
     │
     ├─ preprocessSideImages ─── ![](url "left|right") + text → flexbox HTML
     │
     ├─ marked.parse ─────────── standard markdown → HTML
     │
     ├─ applyPostProcessors ──── (extensible, currently empty)
     │
     ├─ processWikiLinks ─────── [[address]] → <a class="wiki-ref" data-address="...">
     │
     └─ JSON output ──────────── posts.generated.json
```

---

### Why they don't collide

The key is **ordering**. Each stage consumes a syntax that previous stages have already removed, and produces output that later stages won't misinterpret.

**Stage 1 — Pre-processors (raw markdown).**
They see `{#e74c3c:text}` and replace it with `<span style="color:#e74c3c">text</span>`. After this step, every custom syntax token is gone. Only standard markdown and inline HTML remain.

**Stage 2 — marked (markdown + HTML).**
marked treats HTML tags as passthrough — it does not parse or modify anything inside `<span>`, `<mark>`, `<kbd>`, `<sub>`, `<sup>`, etc. Our injected HTML survives intact. Meanwhile, marked converts `**bold**`, `# headings`, `- lists`, links, images, and everything else as normal.

This is why `**bold {#e74c3c:red text}**` works:

```
input:     **bold {#e74c3c:red text}**
after pre: **bold <span style="color:#e74c3c">red text</span>**
after marked: <strong>bold <span style="color:#e74c3c">red text</span></strong>
```

By the time marked sees the text, the color span is already HTML. marked wraps the whole thing in `<strong>` without touching the span.

**Stage 3 — Wiki-links (final HTML).**
Any `[[address]]` that survived marked's parsing gets converted to `<a class="wiki-ref">`. This works because double-bracket syntax is not valid markdown — marked leaves `[[...]]` as literal text in the HTML output. The regex catches it there.

---

### Why custom syntax uses `{...}` and not markdown-like tokens

Curly braces `{}` are not special in markdown. marked passes them through as-is. Alternative designs and why they fail:

| Alternative | Problem |
|---|---|
| `_text_` for underline | Collides with markdown italic |
| `==text==` for highlight | Some markdown extensions interpret this |
| `^text^` for superscript | Some parsers use this for footnotes |
| `~text~` for wavy | Collides with strikethrough (`~~text~~`) |

Curly braces are safe because:
- marked ignores them completely
- They're visually distinct in source files
- Each syntax starts with a unique prefix (`#`, `_:`, `-.:`, `..:`, `~:`, `==:`, `sc:`, `^:`, `v:`, `kbd:`), making the regex patterns unambiguous

---

### Where errors are caught

#### Build time — `validate-fieldnotes.js`

Runs after the full pipeline, on the final HTML. Three checks, each controlled by a flag in `compiler.config.js`:

| Flag | What it checks |
|---|---|
| `validateFieldnoteRefs` | Every `[[address]]` inside fieldnotes points to an existing fieldnote block |
| `validateParentSegments` | Parent segments in hierarchical addresses (e.g. `LAPTOP` in `LAPTOP//UI`) have their own blocks |
| `validateRegularPostWikiLinks` | Every `data-address` in regular posts (projects, threads, bits2bricks) exists as a fieldnote concept |

Output: errors (hard failures) and warnings (missing parents, unresolved cross-references).

#### Runtime — `wikilinks.ts`

A second pass in the browser. `resolveWikiLinks()` matches each `<a class="wiki-ref">` against the loaded fieldnotes dataset:

- **Found** → adds class `wiki-ref-resolved`, sets `href` to `/second-brain/{id}`, injects `data-title` and `data-description` for hover preview, appends `◇` icon
- **Not found** → replaces with `<span class="wiki-ref-unresolved">`, appends `?` icon, sets `cursor: not-allowed`

This is a safety net. Build-time validation should catch broken links first — the runtime resolver handles edge cases where the dataset is incomplete.

---

### How to extend

#### Adding custom syntax

Add one entry to `preProcessors` in `scripts/compiler.config.js`:

```js
{ name: 'strikethrough-red', pattern: /\{xx:([^}]+)\}/g, replace: '<del style="color:#e74c3c">$1</del>' }
```

No other file needs to change. `applyPreProcessors()` in `build-content.js` iterates the array automatically.

#### Adding post-processing

Same pattern, but in `postProcessors` — these run on HTML after marked:

```js
{ name: 'external-links', pattern: /(<a href="https?:\/\/[^"]*")/g, replace: '$1 target="_blank" rel="noopener"' }
```

#### Adding validation

Add a flag to `validation` in the config, then add a conditional block in `validate-fieldnotes.js` gated by that flag.

---

### Config reference — `scripts/compiler.config.js`

| Key | Type | Purpose |
|---|---|---|
| `marked` | `object` | Options passed to `marked.setOptions()` (gfm, breaks) |
| `wikiLinks.enabled` | `boolean` | Toggle wiki-link processing |
| `wikiLinks.pattern` | `RegExp` | Regex to match `[[...]]` in HTML |
| `wikiLinks.toHtml` | `function` | Converts an address to an `<a>` tag |
| `imagePositions.titlePattern` | `RegExp` | Matches image title positions (left, right, center, full) |
| `imagePositions.classMap` | `object` | Maps position names to CSS classes |
| `preProcessors` | `array` | `{name, pattern, replace}` rules applied before marked |
| `postProcessors` | `array` | `{name, pattern, replace}` rules applied after marked |
| `validation` | `object` | Boolean flags for each validation type |
