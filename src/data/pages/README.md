# Writing Pages for InfraPhysics

This is the authoring guide for all content in `src/data/pages/`. Every markdown file here is compiled at build time into static HTML via a custom pipeline built on **marked** and **Shiki**. The result is a superset of standard markdown: everything GitHub-Flavored Markdown can do still works, but the compiler adds inline formatting, typed blockquotes, wiki-links, image layouts, and per-language code highlighting on top.

Nothing in this document uses the custom syntax it describes, because GitHub's renderer would mangle it. Everything is explained in prose.

---

## Table of Contents

1. [Frontmatter](#frontmatter)
2. [Compilation Pipeline](#compilation-pipeline)
3. [Inline Formatting](#inline-formatting)
4. [Typed Blockquotes](#typed-blockquotes)
5. [Links](#links)
6. [Images](#images)
7. [Tables](#tables)
8. [Code Blocks](#code-blocks)
9. [Standard Blockquotes (Small Text)](#standard-blockquotes-small-text)
10. [Second Brain (Fieldnotes)](#second-brain-fieldnotes)
11. [Edge Cases and Sacred Rules](#edge-cases-and-sacred-rules)

---

## Frontmatter

Every markdown file (except `_fieldnotes.md`) starts with a YAML frontmatter block delimited by `---`. The build script uses **gray-matter** to extract it. Fields that are absent default to `null` in the generated JSON.

### Universal fields (all categories)

| Field | Required | Type | What it does |
|---|---|---|---|
| `id` | yes | string | Unique slug. Must match the filename without `.md`. Used in URLs, as the primary key, and as the fallback display name when `displayTitle` is absent. |
| `displayTitle` | no | string | Human-readable title shown in the UI (headings, cards, browser tab). Falls back to `id` if missing. |
| `category` | yes | string | One of `projects`, `threads`, `bits2bricks`. Determines which section lists the post and which accent color it gets. |
| `date` | yes | string | ISO 8601 date (`YYYY-MM-DD`). Shown in post headers and used for default sort order (newest first). |
| `description` | yes | string | One-liner. Appears on listing cards, meta tags, and search result excerpts. Keep it short. |
| `thumbnail` | no | string | URL to an image. Shown as the hero image on the post page and as the card thumbnail in listings. Prefer Cloudflare R2 or Unsplash URLs. |
| `thumbnailAspect` | no | string | Controls the crop ratio of the hero image. Values: `full` (auto height), `wide` (16/7), `banner` (16/4), `strip` (16/2). Default is `full`. |
| `thumbnailShading` | no | string | Overlay filter on the hero image. Values: `heavy`, `light`, `none`. Default is `none`. |
| `tags` | no | string[] | Topic tags shown as pills/hashtags. Used by the filter system in section listings. YAML array syntax: `[tag1, tag2, tag3]`. |
| `author` | no | string | Defaults to `Yago Mendoza` if absent. |
| `subtitle` | no | string | Appears below the title in the article header. |
| `related` | no | string[] | Array of post IDs. The "Related" section at the bottom of a post will show these. If empty, the system picks random posts from the same category. |
| `featured` | no | boolean | Flag for potential featured/pinned treatment in listings. |
| `notes` | no | string or string[] | Author notes displayed in the project header area. Can be a single string or a YAML array. |

### Projects-specific fields

These fields only have an effect when `category: projects`.

| Field | Type | What it does |
|---|---|---|
| `status` | string | Lifecycle badge shown in the post header and as a filterable chip in the projects listing. Values: `ongoing`, `implemented`, `active`, `in-progress`, `completed`, `archived`. Each has a hardcoded accent color defined in `STATUS_CONFIG` (`config/categories.tsx`). |
| `technologies` | string[] | Tech stack shown as pills in the post header and as filterable chips in the listing. Syntax: `[TypeScript, React, Vite]`. |
| `github` | string | URL to the GitHub repository. Renders a clickable icon/link in the post header. |
| `demo` | string | URL to a live demo. Same treatment as `github`. |
| `caseStudy` | string | URL to an external case study. |
| `duration` | string | Free-form project duration string (e.g. `4 weeks`, `ongoing`). |

### Threads-specific fields

| Field | Type | What it does |
|---|---|---|
| `context` | string | An author-perspective introduction displayed in a special bar before the article body. Useful for setting personal context or motivation. Only threads use this field in practice. |

### Bits2Bricks

Bits2Bricks posts use the universal fields. They can technically use `context` (the type allows it), but no current posts do.

### Fieldnotes (Second Brain)

Fieldnotes do **not** use YAML frontmatter. They live in a single file (`fieldnotes/_fieldnotes.md`) with a completely different structure. See the [Second Brain](#second-brain-fieldnotes) section.

### Example frontmatters

**Project:**

```yaml
---
id: neural-cellular-automata
displayTitle: neural cellular automata
category: projects
date: 2024-06-15
thumbnail: https://pub-xxx.r2.dev/nca-hero.webp
description: self-organizing patterns via learned update rules.
status: completed
technologies: [TypeScript, WebGL, React]
github: https://github.com/user/nca
demo: https://nca.infraphysics.dev
tags: [simulation, graphics, ml]
related: [quantum-interference-visualizer]
---
```

**Thread:**

```yaml
---
id: entropy-and-software-decay
displayTitle: entropy and software decay
category: threads
date: 2024-01-10
thumbnail: https://images.unsplash.com/photo-xxx
description: why code rots without maintenance.
tags: [physics, systems, maintenance]
context: "you've probably felt it before..."
featured: true
---
```

**Bits2Bricks:**

```yaml
---
id: fpga-uart-controller
displayTitle: FPGA UART controller
category: bits2bricks
date: 2024-08-01
thumbnail: https://pub-xxx.r2.dev/fpga-hero.webp
thumbnailAspect: banner
description: hardware serial communication from scratch.
tags: [fpga, verilog, hardware]
---
```

---

## Compilation Pipeline

The pipeline runs at build time (`npm run content`). No markdown is parsed in the browser. The output is a JSON array of posts with pre-rendered HTML in the `content` field.

Processing order:

```
raw markdown
      |
      v
[1]  gray-matter           -- extract frontmatter YAML
      |
      v
[2]  protectBackticks      -- replace code blocks/inline code with %%CBLK_N%% placeholders
      |
      v
[3]  preProcessors         -- custom inline syntax (colors, kbd, superscript, etc.)
      |
      v
[4]  processCustomBlockquotes -- {bkqt/TYPE:content} blocks
      |
      v
[5]  restoreBackticks      -- put code back in place
      |
      v
[6]  processExternalUrls   -- [[https://...]] links (before marked to avoid URL corruption)
      |
      v
[7]  preprocessSideImages  -- side-by-side image+text layouts
      |
      v
[8]  marked.parse          -- standard GFM markdown to HTML
      |
      v
[9]  highlightCodeBlocks   -- Shiki syntax highlighting per language
      |
      v
[10] postProcessors        -- extensible HTML transforms (currently empty)
      |
      v
[11] processAllLinks       -- [[wiki-refs]], [[category/slug|text]], unresolved markers
      |
      v
posts.generated.json
```

Step 2 is the reason backticks are sacred (see [Edge Cases](#edge-cases-and-sacred-rules)). Steps 3-4 happen on "safe" markdown where all code has been removed. Step 6 must run before step 8 because marked would auto-link bare URLs inside double brackets and corrupt them.

All configuration lives in `scripts/compiler.config.js`. The main orchestration lives in `scripts/build-content.js`.

---

## Inline Formatting

Eight custom inline rules are applied as pre-processors (step 3). They are defined in `compiler.config.js` under `preProcessors`. The compiler processes them in order: curly-brace patterns first (unambiguous delimiters), then bare-delimiter patterns (underscores, equals, dashes).

### Headings are immune

Section headings (`#`, `##`, `###`, `####`) are **never processed** by inline formatting rules. No highlight, accent text, colored text, small caps, or any other effect will be applied inside a heading line. Headings are plain text. Use standard capitalization and nothing else.

### Colored text

Write `{#HEX:text}` where HEX is a 3-to-6 character hex code or a CSS named color. The compiler produces a span with an inline `color` style.

- `{#e74c3c:danger}` renders "danger" in red.
- `{#7C3AED:purple note}` renders in violet.
- `{#tomato:warm}` works with named CSS colors.

Use this for one-off color emphasis. For recurring semantic colors, prefer accent text (below).

### Small capitals

Write `{sc:TEXT}`. Produces a span with `font-variant: small-caps`. Useful for abbreviations and acronyms that look too loud in full caps.

- `{sc:HTML}`, `{sc:NASA}`, `{sc:MLCC}`

### Superscript

Write `{^:text}`. Produces a `<sup>` element.

- `x{^:2}` renders as x-squared.
- `E = mc{^:2}`

### Subscript

Write `{v:text}`. Produces a `<sub>` element. The `v` is a visual mnemonic (arrow pointing down).

- `H{v:2}O` renders as the water formula.
- `CO{v:2}` for carbon dioxide.

### Keyboard keys

Write `{kbd:key}`. Produces a `<kbd>` element styled as a keyboard key.

- `{kbd:Ctrl}`, `{kbd:Shift+Enter}`, `{kbd:Esc}`

### Underline

Write `_text_` (single underscores). Produces an underlined span.

- `_this is underlined_`

**Boundary rule:** The underscores must be at word boundaries. `variable_name_here` will NOT trigger the rule because the underscores are surrounded by word characters. This is by design: the regex uses negative lookbehind/ahead for `\w`, so snake_case identifiers are safe.

### Highlight

Write `==text==` (double equals). Produces a `<mark>` element (yellow highlight by default, adapts inside blockquotes).

- `==key insight==` highlights the text.

**Boundary rule:** Must not be adjacent to another `=`. So `===` won't trigger.

### Accent text

Write `--text--` (double dashes). Produces a span with class `accent-text`, which takes the current category's accent color.

- `--important concept--` renders in the article's accent color (lime for projects, rose for threads, blue for bits2bricks).

**Boundary rule:** Must not be adjacent to another `-`. So `---` (the horizontal rule) won't trigger.

**Why `--` and not something else?** Double dashes were chosen because they are fast to type, visually distinct from markdown emphasis (`*` / `**`), and don't collide with any standard markdown syntax. The boundary rule prevents false positives with horizontal rules (`---`) and YAML frontmatter delimiters.

### Why curly braces for the structured syntax?

All the `{tag:content}` patterns use curly braces because standard markdown never uses `{...}` for anything. This means zero collision risk with headings, emphasis, links, images, lists, or any other markdown construct. The colon separates the tag from the content, and the closing brace is unambiguous. It also makes the syntax greppable: you can search for `{sc:` or `{kbd:` across all pages to find every usage.

---

## Typed Blockquotes

Write `{bkqt/TYPE:content}` for a callout box. These replace the role that admonitions or callouts play in other systems.

### Types

| Type | Default label | Color | Use case |
|---|---|---|---|
| `note` | Note | Category accent | Supplementary information |
| `tip` | Tip | Green | Practical actions or shortcuts |
| `warning` | Warning | Amber | Potential pitfalls |
| `danger` | Danger | Red | Critical issues, data loss risks |
| `keyconcept` | Key concept | Purple | Core ideas to retain |

### Custom labels

Add a pipe before the colon to override the default label: `{bkqt/warning|Memory Trap:content here}`. The label "Memory Trap" replaces "Warning" in the header.

### Paragraph breaks

Use `/n` inside a blockquote to force a paragraph break. The compiler converts `/n` to a double newline before parsing.

- `{bkqt/tip:First paragraph/nSecond paragraph}` produces two paragraphs inside the callout.

To start a list after text, use `/n` before the list: `{bkqt/note:Intro text/n- item one/n- item two}`.

### Inline formatting inside blockquotes

All inline formatting works inside typed blockquotes: colored text, kbd, superscript, code, highlight, accent text. Highlight (`==`) and accent text (`--`) adapt their color to match the blockquote's type color.

---

## Inline annotations

Use `{{ref|explanation}}` to attach a paragraph-scoped footnote. The `ref` is the word or phrase being annotated — it renders inline with a dotted underline and a superscript number. The `explanation` appears as a numbered note below the paragraph.

### Syntax

```
it just {{counted|these were called HMMs and later n-gram language models.}}.
```

This produces: "counted" with a dotted underline + superscript `¹`, and below the paragraph a note: `¹ these were called HMMs and later n-gram language models.`

### Multiple annotations per paragraph

You can use multiple annotations in the same paragraph. Each gets a sequential number (1, 2, 3...) scoped to that paragraph — numbering resets for the next paragraph.

```
the model uses {{attention|a mechanism that lets the model weigh which parts of the input matter most.}} and {{embeddings|dense vector representations of tokens in a high-dimensional space.}} to process input.
```

### Nested annotations

Explanations can themselves contain annotations. Nested annotations are indented one level further, at the same font size, with their own numbering.

```
it just {{counted|these were called {{HMMs|Hidden Markov Models — a class of probabilistic models.}} and later n-gram language models.}}.
```

This produces:
- `¹` explanation for "counted" with "HMMs" underlined + superscript inside it
- indented below: `¹` explanation for "HMMs"

There is no depth limit — you can nest annotations inside nested annotations.

### Notes

- Annotations are paragraph-scoped: numbering resets per `<p>`.
- The `ref` part renders with a dotted underline. The `explanation` renders in sans-serif at text-mid color.
- Nested annotations indent further but keep the same font size.
- Annotations are skipped inside code blocks.
- Use annotations for brief clarifications or definitions. For longer tangential content, prefer a `{bkqt/note:...}` blockquote instead.

---

## Links

The system supports three kinds of links, all using double-bracket syntax `[[...]]`. The double-bracket convention was chosen because it is the de facto standard for wiki-style linking (Wikipedia, Obsidian, Notion) and doesn't collide with markdown's single-bracket link syntax `[text](url)`.

### Wiki-links (Second Brain references)

Write `[[address]]` to link to a fieldnote concept. The compiler generates an element with a `data-address` attribute. At runtime, `WikiContent.tsx` resolves it against the fieldnotes dataset.

- `[[entropy]]` links to the "entropy" fieldnote and displays "entropy".
- `[[CPU//ALU]]` links to the "CPU//ALU" fieldnote and displays "ALU" (the last segment).
- `[[CPU//ALU|the arithmetic unit]]` links to "CPU//ALU" but displays "the arithmetic unit".

**Display text rule:** Without a pipe, the last `//`-separated segment becomes the visible text. With a pipe, you control it explicitly.

**Resolution:** If the address maps to an existing fieldnote, the link becomes clickable with a violet dashed underline and a diamond icon (`◇`). Hovering shows a preview card with the concept's title, address path, and description. If unresolved, the link is greyed out with a question mark (`?`) and is not clickable.

**Validation:** The build script validates that every wiki-link in regular posts (threads, bits2bricks, projects) points to an existing fieldnote. Broken references cause build errors.

### Cross-document links

Write `[[category/slug|Display Text]]` to link to another post (not a fieldnote).

- `[[threads/entropy-and-software-decay|read about software entropy]]`
- `[[projects/neural-cellular-automata|NCA project]]`
- `[[bits2bricks/fpga-uart-controller|FPGA UART]]`

Valid categories: `projects`, `threads`, `bits2bricks`.

**Display text is required.** The build will fail with an error if you omit it. This is intentional: cross-doc links should always have human-readable anchor text, not raw slugs.

The link opens in a new tab and gets a category-colored style (`doc-ref-projects`, `doc-ref-threads`, `doc-ref-bits2bricks`).

### External URL links

Write `[[https://url]]` or `[[https://url|Display Text]]` for external links.

- `[[https://github.com/user/repo|GitHub repo]]`
- `[[https://en.wikipedia.org/wiki/Entropy]]` (displays the full URL as text)

These are processed before marked to prevent URL auto-linking corruption. They render as neutral grey links that open in a new tab.

**Why double brackets for external URLs too?** Consistency. All "reference-style" links use `[[...]]`. Standard markdown links `[text](url)` still work for inline linking, but the double-bracket variant gives uniform styling across wiki-refs, cross-doc refs, and external refs.

---

## Images

Standard markdown images work as-is. The compiler adds positioning and caption support via the image's title attribute (the string in quotes after the URL).

### Positioned images

- `![alt](url "center")` -- centered block image.
- `![alt](url "full")` -- full-width image (edge to edge).
- `![alt](url "left:300px")` -- floated left with a 300px max-width.
- `![alt](url "right:250px")` -- floated right with a 250px max-width.

Without a title, images render inline as standard markdown.

### Captions (figcaption)

Add a pipe in the alt text to create a figure with a caption: `![alt text|Caption goes here](url "center")`. Everything after the pipe becomes a `<figcaption>`. Everything before is the actual alt text.

### Side-by-side layouts

When an image with a `left` or `right` position is immediately followed by text lines (no blank line between), the compiler wraps them in a flexbox container. The image floats to one side and the text flows beside it.

```markdown
![diagram](url "left:400px")
This text appears to the right of the image.
It can span multiple lines.
```

Leave a blank line after the text to end the side-by-side layout and return to normal flow.

---

## Tables

Standard GFM (GitHub-Flavored Markdown) table syntax. No custom table syntax.

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
```

Tables are styled differently depending on context:
- **Article posts** (`article.css`): Terminal/cyberpunk aesthetic. Headers use the category accent color, uppercase, small font. Cells have subtle bottom borders.
- **Wiki content** (`wiki-content.css`): Clean, neutral. Headers have a light background, cells have full borders.

**Inline formatting works inside table cells.** You can use colored text, kbd, superscript, subscript, accent text, highlight, inline code, and underline inside cells. The pre-processors run on the raw markdown before marked parses the table structure.

---

## Code Blocks

### Fenced code blocks

Use triple backticks with a language identifier. The compiler syntax-highlights them via **Shiki** and wraps them in a terminal-style chrome with a language label and a copy button.

Supported languages with optimized theme pairs:

| Language | Dark theme | Light theme |
|---|---|---|
| TypeScript / JavaScript | one-dark-pro | one-light |
| Python | catppuccin-mocha | catppuccin-latte |
| Rust | rose-pine | rose-pine-dawn |
| Go | min-dark | min-light |
| YAML / JSON | github-dark | github-light |
| Everything else | vitesse-dark | vitesse-light |

### Inline code

Single backticks for inline code. Double backticks for inline code that contains a single backtick. Both are fully protected from all pre-processors (see [Edge Cases](#edge-cases-and-sacred-rules)).

---

## Standard Blockquotes (Small Text)

The standard markdown blockquote syntax (`> text`) does **not** produce a traditional blockquote. Instead, the compiler overrides it to produce small, muted text. Use it for disclaimers, footnotes, asides, and citations.

For callout-style blocks with color coding and labels, use [typed blockquotes](#typed-blockquotes) instead.

---

## Second Brain (Fieldnotes)

Fieldnotes live in a single file: `fieldnotes/_fieldnotes.md`. They do not use YAML frontmatter. Instead, they use a block-based format separated by `---` (three dashes on their own line).

### Block structure

```
address
# Optional Heading
Body markdown with [[wiki-refs]] to other concepts.
More text...

[[trailing-ref-1]]
[[trailing-ref-2]]
---
next-address
Body of next concept...
---
```

Each block contains:
1. **Line 1: Address** -- the concept's hierarchical path. This is the unique identifier.
2. **Optional heading** -- a `# Heading` line. If present, it becomes the display title.
3. **Body** -- standard markdown plus all custom inline syntax. Wiki-links in the body are extracted as references.
4. **Trailing references** -- standalone `[[address]]` lines at the end of the block (after the last body text). These are collected separately and used to populate the "Related concepts" section.

### Address format

Addresses use `//` as a hierarchy separator.

- `entropy` -- single-level concept.
- `CPU//ALU` -- ALU is a child of CPU.
- `CPU//ALU//barrel shifter` -- three-level nesting.

**ID generation:** The address is normalized to a URL-safe slug: lowercase, `//` becomes `--`, `/` becomes `-`, spaces become `-`. So `CPU//ALU` becomes `cpu--alu`.

**Parent requirement:** If you create `CPU//ALU`, the build validator expects a block for `CPU` to exist as well (it issues a warning if missing). This keeps the hierarchy navigable.

### References and backlinks

Every `[[address]]` in a fieldnote's body is extracted into a `references` array. The system uses these to compute backlinks at runtime: if concept A references concept B, then B's page shows a backlink to A.

Trailing refs (the `[[...]]` lines at the end of a block) go into a separate `trailingRefs` array. They populate the "Related concepts" sidebar.

### Validation

The build script validates:
1. Every `[[ref]]` inside fieldnotes points to an existing block.
2. Parent address segments have their own blocks.
3. Every wiki-link in regular posts (threads, bits2bricks, projects) points to an existing fieldnote.

Validation failures produce build errors (exit code 1).

---

## Edge Cases and Sacred Rules

### Backticks are sacred

This is the single most important rule. **Anything inside backticks is never touched by the custom syntax pipeline.** The compiler extracts all fenced code blocks and inline code before any pre-processing runs, replacing them with `%%CBLK_N%%` placeholders. After pre-processing and blockquote expansion, it restores them.

This means:
- `{^:2}` in running text becomes a superscript. Inside backticks, it stays literal.
- `_text_` in running text becomes underlined. Inside backticks, it stays literal.
- `[[address]]` in running text becomes a wiki-link. Inside `<pre>` or `<code>` blocks in the final HTML, it is also skipped by the link processor.

If you ever need to show custom syntax literally without it being processed, put it in backticks.

### Word-boundary rules prevent false positives

- **Underscores** (`_text_`): The regex requires non-word characters around the underscores. `snake_case_name` will not be underlined. Only `_standalone words_` with space or punctuation boundaries trigger.
- **Double equals** (`==text==`): Must not be adjacent to another `=`. `===` is safe.
- **Double dashes** (`--text--`): Must not be adjacent to another `-`. `---` (horizontal rule) and YAML `---` delimiters are safe.

### First h1 is stripped in posts

The compiler removes the first `<h1>` from article post content because the `displayTitle` field already renders as the page heading. If you start your markdown with `# Title`, it won't appear twice.

### Cross-doc links require display text

`[[threads/some-post]]` without a pipe and display text will cause a build error. Always write `[[threads/some-post|Some Post]]`. This is enforced to ensure human-readable anchor text.

### Blockquote `/n` vs real newlines

Inside typed blockquotes, you cannot use real newlines because the regex captures everything between `{bkqt/TYPE:` and the closing `}` greedily. Use `/n` for paragraph breaks. Before list items specifically (`- ` or `1. `), `/n` becomes a single newline (so the list syntax is valid markdown). Everywhere else, `/n` becomes a double newline (paragraph break).

### External URLs must use double brackets

If you write a bare URL like `https://example.com` in text, marked's GFM mode may auto-link it. For consistent styling and behavior, wrap external URLs in `[[https://example.com|text]]`. This ensures they get the `doc-ref-external` class and open in a new tab.

### Highlight and accent text adapt inside blockquotes

When `==highlight==` or `--accent--` appears inside a typed blockquote, their color adapts to match the blockquote's type color (green for tip, red for danger, etc.) rather than using their default styling. This is handled by CSS rules in `article.css`.

---

## Syntax Not Supported

For clarity, these common markdown extensions are **not** part of this system:

- **Footnotes** (`[^1]`): Not supported. Use standard blockquotes (`> text`) for asides.
- **Callouts / Admonitions** (`> [!NOTE]`): Use typed blockquotes (`{bkqt/note:...}`) instead.
- **Task lists** (`- [ ]`): Not supported.
- **Emoji shortcodes** (`:emoji:`): Not supported. Use actual Unicode emoji if needed.
- **Sidenotes / Margin notes**: Not supported. Use side-by-side image layouts for visual asides.
- **LaTeX math** (`$formula$`): Not supported. Use superscript/subscript for simple formulas. For complex math, consider embedding an image.

---

## Quick Reference

| What you want | What you write |
|---|---|
| Red text | `{#e74c3c:text}` |
| Small caps | `{sc:TEXT}` |
| Superscript | `{^:text}` |
| Subscript | `{v:text}` |
| Keyboard key | `{kbd:Ctrl+C}` |
| Underline | `_text_` |
| Highlight | `==text==` |
| Accent color | `--text--` |
| Note callout | `{bkqt/note:content}` |
| Warning with label | `{bkqt/warning\|Custom:content}` |
| Wiki-link | `[[concept]]` or `[[parent//child]]` |
| Wiki-link (custom text) | `[[address\|display text]]` |
| Cross-doc link | `[[threads/slug\|Display Text]]` |
| External link | `[[https://url\|Display Text]]` |
| Centered image | `![alt](url "center")` |
| Image with caption | `![alt\|caption](url "center")` |
| Side image + text | `![alt](url "left:300px")` followed by text (no blank line) |
