# Writing Pages for InfraPhysics

This is the authoring guide for all content in `src/data/pages/`. Every markdown file here is compiled at build time into static HTML via a custom pipeline built on **marked** and **Shiki**. The result is a superset of standard markdown: everything GitHub-Flavored Markdown can do still works, but the compiler adds inline formatting, typed blockquotes, wiki-links, image layouts, and per-language code highlighting on top.

Nothing in this document uses the custom syntax it describes, because GitHub's renderer would mangle it. Everything is explained in prose.

---

## Table of Contents

1. [Frontmatter](#frontmatter)
2. [Content Types and Writing Guidance](#content-types-and-writing-guidance)
3. [Compilation Pipeline](#compilation-pipeline)
4. [Inline Formatting](#inline-formatting)
5. [Typed Blockquotes](#typed-blockquotes)
6. [Inline Footnotes](#inline-footnotes)
7. [Links](#links)
8. [Images](#images)
9. [Tables](#tables)
10. [Code Blocks](#code-blocks)
11. [List Indentation and Nesting](#list-indentation-and-nesting)
12. [Definition Lists](#definition-lists)
13. [Alphabetical Lists](#alphabetical-lists)
14. [Context Annotations](#context-annotations)
15. [Standard Blockquotes (Small Text)](#standard-blockquotes-small-text)
16. [Second Brain (Fieldnotes)](#second-brain-fieldnotes)
17. [Edge Cases and Sacred Rules](#edge-cases-and-sacred-rules)

---

## Frontmatter

Every markdown file starts with a YAML frontmatter block delimited by `---`. The build script uses **gray-matter** to extract it. Fields that are absent default to `null` in the generated JSON.

### Universal fields (all categories)

| Field | Required | Type | What it does |
|---|---|---|---|
| `id` | yes | string | Unique slug used in URLs, as the primary key, and as the fallback display name when `displayTitle` is absent. The build reads this field directly — it is **not** derived from the filename. |
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

### Filename convention (posts)

Prefix post filenames with the date in `YYMMDD-` format so they sort chronologically in the directory:

```
260206-alignment-is-not-a-vibe-check.md
260205-everything-is-a-pipe.md
250130-anatomy-of-a-markdown-compiler.md
```

The build uses the frontmatter `id` field for URLs and routing — the filename is only for directory organization. The `id` does **not** need to match the filename.

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

### Threads

Threads posts use the universal fields. No additional category-specific fields.

### Bits2Bricks

Bits2Bricks posts use the universal fields. No additional category-specific fields.

### Blog TOC behavior (Threads & Bits2Bricks)

Blog categories (threads, bits2bricks) share the same bordered TOC box as projects. Differences:
- **Max 10 entries** — only the first 10 headings appear in the TOC (projects show all).
- **Font**: Inter instead of monospace. Uppercase labels.
- **Depth-scaled sizing**: depth-0 at `0.75rem`, depth-1 at `0.7rem`, depth-2 at `0.65rem`, depth-3 at `0.6rem`.

### Fieldnotes (Second Brain)

Each fieldnote is an individual `.md` file in `fieldnotes/` with `address` and `date` frontmatter. See the [Second Brain](#second-brain-fieldnotes) section.

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

## Content Types and Writing Guidance

### Article intro text

Any text that appears **after the frontmatter but before the first heading** is rendered as an intro paragraph (styled with `.article-intro`). Use it for:
- What this post is about and what to expect
- Who the intended audience is
- Motivation, backstory, or a personal anecdote

The intro is **not** the same as the `description` frontmatter (which is a one-liner for cards and meta tags). The intro is the first thing a reader sees in the article body — it sets the tone.

### When to use `notes`, `>>` context annotations, or intro text

| Tool | Purpose | Where it appears | When to use |
|---|---|---|---|
| **`notes` frontmatter** | Global notices about the post | Header area, above the content | "WIP", "requires X", "updated timeline", disclaimers |
| **Intro text** | Motivation, audience, what to expect | Between TOC and first heading | First time reading the post — sets expectations |
| **`>> annotations`** | Timestamped post-publication edits | Anywhere in the article body | "Rewrote this section", "corrected after feedback", changelogs |
| **`{bkqt/note}`** | In-flow supplementary information | Wherever placed in body | "See also...", tangential context, clarifications |

`notes` is metadata. Intro text is narrative. `>>` annotations are a changelog. `{bkqt/note}` is a callout. They serve different purposes and can coexist in the same post.

### Writing conventions per content type

All types share the same compiler and the same 16 custom syntax features. The difference is in tone, structure, and which features you'll use most.

**Projects** — Technical case studies. Structure: intro (what/why), implementation sections, results/learnings. Heavy use of code blocks, definition lists, `technologies` and `status` frontmatter. The `>>` annotations are useful for logging progress over time. The `github` and `demo` fields link to live resources.

**Threads** — Essays and analysis. Structure: intro (thesis), argument sections, conclusion. Heavy use of accent text (`--key claims--`), inline footnotes (`{{ref|explanation}}`), typed blockquotes for key concepts, and `>>` annotations for post-publication corrections. Threads tend to be longer and more prose-heavy.

**Bits2Bricks** — Tutorials and hardware/software build logs. Structure: intro (what we're building), step-by-step sections, results. Heavy use of code blocks, alphabetical lists for ordered steps, definition lists for terminology, images with side-by-side layouts. More instructional tone than threads.

**Fieldnotes (Second Brain)** — Reference-style concept notes. Short, factual, link-heavy. Body is typically 1-5 paragraphs defining a concept. Heavy use of `[[wiki-links]]` to connect concepts. Trailing `[[refs]]` populate the "Related concepts" section. No intro text convention — just start with the definition. See [Second Brain](#second-brain-fieldnotes) for full format.

---

## Compilation Pipeline

The pipeline runs at build time (`npm run content`). No markdown is parsed in the browser. Use `npm run content -- --force` to ignore the cache and recompile everything.

**Important:** Single newlines do NOT create line breaks. The parser uses `breaks: false` (GFM mode). You must use a blank line to start a new paragraph. This is standard GFM behavior.

### Per-file compilation (`compileMarkdown`)

Each markdown file passes through this 14-step pipeline:

```
raw markdown
      |
[1]  gray-matter               -- extract frontmatter YAML
[2]  protectBackticks           -- replace code blocks/inline code with %%CBLK_N%% placeholders
[3]  preProcessors              -- custom inline syntax (colors, kbd, superscript, etc.)
[4]  processCustomBlockquotes   -- {bkqt/TYPE}...{/bkqt} blocks
[5]  restoreBackticks           -- put code back in place
[6]  processExternalUrls        -- [[https://...]] links (before marked to avoid URL corruption)
[7]  preprocessSideImages       -- side-by-side image+text layouts
[8]  processDefinitionLists     -- - TERM:: desc → <div class="defn-list">
[9]  processAlphabeticalLists   -- a. text → <ol type="a">
[10] processContextAnnotations  -- >> YY.MM.DD - text → <div class="ctx-note">
[11] marked.parse               -- standard GFM markdown → HTML
[12] stripHeadingFormatting      -- remove inline tags (<code>, <em>, etc.) from h1-h4
[13] highlightCodeBlocks         -- Shiki syntax highlighting per language
[14] applyPostProcessors         -- extensible HTML transforms (currently empty)
```

### After all files are compiled

Two additional passes run on the combined output of ALL files (not per-file):

- **`processAllLinks`** — resolves `[[wiki-refs]]`, `[[category/slug|text]]` cross-doc links, and unresolved markers. Runs on every post every build because link targets change when notes are added/removed. Protected by `processOutsideCode` which shields `<pre>` and `<code>` segments.
- **`processAnnotations`** — converts `{{ref|explanation}}` inline footnotes into numbered markers + annotation blocks. Also protected by `processOutsideCode`.

### Build outputs

| Output | Location |
|---|---|
| Regular posts | `src/data/posts.generated.json` (projects, threads, bits2bricks — no fieldnotes) |
| Fieldnotes index | `src/data/fieldnotes-index.generated.json` (metadata + searchText, no content) |
| Fieldnote content | `public/fieldnotes/{id}.json` (per-note `{ "content": "<html>" }`) |
| Categories | `src/data/categories.generated.json` (from `_category.yaml` files in each section directory) |

Step 2 is the reason backticks are sacred (see [Edge Cases](#edge-cases-and-sacred-rules)). Steps 3-4 happen on "safe" markdown where all code has been removed. Step 6 must run before step 11 because marked would auto-link bare URLs inside double brackets and corrupt them.

All configuration lives in `scripts/compiler.config.js`. The main orchestration lives in `scripts/build-content.js`.

---

## Inline Formatting

Seven custom inline rules are applied as pre-processors (step 3). They are defined in `compiler.config.js` under `preProcessors`. The compiler processes them in order: curly-brace patterns first (unambiguous delimiters), then bare-delimiter patterns (underscores, dashes).

### Headings are immune

Section headings (`#`, `##`, `###`, `####`) are **never processed** by any inline formatting rules. No accent text, colored text, small caps, inline code (backticks), or any other custom syntax will be applied inside a heading line. Headings are plain text only. Use standard capitalization and nothing else.

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

### Shout

Write `{shout:text}`. Produces a centered, uppercase line in body text color. Use it sparingly for dramatic emphasis — a thesis statement, a punchline, or a one-liner that deserves its own breathing room.

- `{shout:attention is all you need}`
- `{shout:there is no cloud}`

The text is centered on the page, rendered in uppercase with subtle letter-spacing and the same color as normal body text. It stands on its own as a block element with generous vertical margin.

### Underline

Write `_text_` (single underscores). Produces an underlined span.

- `_this is underlined_`

**Legacy option.** Underline exists as a formatting tool but is rarely the best choice. In most cases, bold or accent text communicate emphasis more effectively. Underline is available if you need it, but prefer the alternatives above.

**Boundary rule:** The underscores must be at word boundaries. `variable_name_here` will NOT trigger the rule because the underscores are surrounded by word characters. This is by design: the regex uses negative lookbehind/ahead for `\w`, so snake_case identifiers are safe.

### Accent text

Write `--text--` (double dashes). Produces a span with class `accent-text`, which takes the current category's accent color.

- `--important concept--` renders in the article's accent color (lime for projects, rose for threads, blue for bits2bricks).

**When to use it:** Use accent text to highlight things that are surprising, impactful, or that the reader should notice — striking quantities, memorable phrases, key facts, counterintuitive claims. Accent is hot and emotional — it draws the eye to the parts that would make someone stop and re-read.

**Quick rule:** If it's a phrase or revelation you want the reader to *feel* → accent. Examples: --if you make it bigger, it gets smarter--, --hundreds of millions to billions of dollars--, --language contains the structure of thought itself--.

**Boundary rule:** Must not be adjacent to another `-`. So `---` (the horizontal rule) won't trigger.

**Why `--` and not something else?** Double dashes were chosen because they are fast to type, visually distinct from markdown emphasis (`*` / `**`), and don't collide with any standard markdown syntax. The boundary rule prevents false positives with horizontal rules (`---`) and YAML frontmatter delimiters.

### Bold text

Standard markdown bold (`**text**`). No custom syntax — just the built-in `<strong>` element.

**When to use it:** For giving visual weight to a term within a paragraph. The eye catches it when scanning. Use it for: definitions the first time they appear, key conclusions inside a block of text, or words the reader needs to find quickly when skimming. Bold is cold and informative — it marks authority, not novelty.

**Quick rule:** If it's a name, a datum, or a term the reader should retain → bold. Examples: **OpenAI**, **175 billion parameters**, **Attention Is All You Need**, **Anthropic**.

**Bold vs accent:** Bold says "remember this term." Accent says "this should surprise you." A company name is bold. A revelation about that company is accent.

**Bold vs external link:** If the name matters as a term within the argument → bold. If you want the reader to be able to go there → external link. They can coexist in the same article: bold the first time you introduce a name, external link when you provide a concrete reference.

### Italic text

Standard markdown italic (`*text*`). No custom syntax — just the built-in `<em>` element.

**When to use it:** For tonal emphasis — as if you were raising your voice slightly. Also for titles of works, terms in a foreign language, or when introducing a new concept without giving it as much weight as bold.

**Quick rule:** If you would say it out loud with more weight → italic. If you would highlight it with a marker in a book → bold. Bold is visual (you see it scanning the page). Italic is tonal (you hear it while reading). Examples: "it was *genuinely* terrifying", "it doesn't *think* at all".

### Why curly braces for the structured syntax?

All the `{tag:content}` patterns use curly braces because standard markdown never uses `{...}` for anything. This means zero collision risk with headings, emphasis, links, images, lists, or any other markdown construct. The colon separates the tag from the content, and the closing brace is unambiguous. It also makes the syntax greppable: you can search for `{sc:` or `{kbd:` across all pages to find every usage.

---

## Typed Blockquotes

Typed blockquotes use block syntax with an opening tag and a closing tag:

```
{bkqt/TYPE}
content here
{/bkqt}
```

These replace the role that admonitions or callouts play in other systems. The opening `{bkqt/TYPE}` tag must be on its own line. The closing `{/bkqt}` tag must also be on its own line. Content goes on the lines between them.

### Types

| Type | Default label | Color | Use case |
|---|---|---|---|
| `note` | Note | Category accent | Supplementary information |
| `tip` | Tip | Green | Practical actions or shortcuts |
| `warning` | Warning | Amber | Potential pitfalls |
| `danger` | Danger | Red | Critical issues, data loss risks |
| `keyconcept` | Key concept | Purple | Core ideas to retain |
| `quote` | *(none)* | Category accent | Styled quotation with left bar and quotation mark icon |
| `pullquote` | *(none)* | Category accent | Same as `quote` but half-width (stops mid-screen) |

### Quote and pullquote blockquotes

The `quote` and `pullquote` types have a different visual treatment than the other blockquotes: a vertical bar on the left, a large decorative quotation mark, and italic text. They do not show a label header.

Use a pipe to add attribution: `{bkqt/quote|Richard Feynman}`. The attribution appears below the quoted text with an em dash prefix.

**Full-width quote:**

```
{bkqt/quote|Richard Feynman}
What I cannot create, I do not understand.
{/bkqt}
```

**Half-width pullquote** (max-width ~55%, useful for side emphasis):

```
{bkqt/pullquote}
The mask is not the face.
{/bkqt}
```

Both types support all inline formatting inside the quoted text (bold, accent, colored text, etc.).

### Custom labels

Add a pipe and label inside the opening tag: `{bkqt/warning|Memory Trap}`. The label "Memory Trap" replaces "Warning" in the header.

```
{bkqt/warning|Memory Trap}
content here
{/bkqt}
```

### Paragraphs and lists

Use **blank lines** inside blockquotes to separate paragraphs, just like normal markdown:

```
{bkqt/tip}
First paragraph of the tip.

Second paragraph with more detail.
{/bkqt}
```

To include a list, put a blank line before the list items:

```
{bkqt/note}
Intro text explaining what follows.

- item one
- item two
- item three
{/bkqt}
```

**Continuation paragraphs:** Consecutive lines (single newline, no blank line between) are treated as continuation paragraphs and rendered with a text indent. Use this for multi-line passages within a single logical paragraph:

```
{bkqt/keyconcept}
the first line introduces the concept.
this continuation line is indented automatically.
and so is this one.

A blank line starts a new normal paragraph.
{/bkqt}
```

### Inline formatting inside blockquotes

All inline formatting works inside typed blockquotes: colored text, kbd, superscript, code, accent text. Accent text (`--`) adapts its color to match the blockquote's type color.

---

## Inline Footnotes

Use `{{ref|explanation}}` to attach a paragraph-scoped footnote. (Not to be confused with [Context Annotations](#context-annotations), which are timestamped author notes using `>>` syntax.) The `ref` is the word or phrase being annotated — it renders inline with a dotted underline and a superscript number. The `explanation` appears as a numbered note below the paragraph.

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
- Use annotations for brief clarifications or definitions. For longer tangential content, prefer a `{bkqt/note}...{/bkqt}` blockquote instead.

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

**Rendered output:** The display text is prefixed with the target category name (e.g. `[[threads/some-post|Some Post]]` renders as "threads/Some Post"). The link uses a solid underline in the target category's accent color (lime for projects, rose for threads, blue for bits2bricks). On hover, the text takes the current article's accent color. The link opens in a new tab.

**URL mapping:** `projects` → `/lab/projects/`, `threads` → `/blog/threads/`, `bits2bricks` → `/blog/bits2bricks/`.

### External URL links

Write `[[https://url]]` or `[[https://url|Display Text]]` for external links.

- `[[https://github.com/user/repo|GitHub repo]]`
- `[[https://en.wikipedia.org/wiki/Entropy]]` (displays the full URL as text)

These are processed before marked to prevent URL auto-linking corruption. They open in a new tab.

**Visual rendering:** External links use a muted grey text color (lighter in dark mode, darker in light mode) with a solid underline. A small diagonal-arrow icon appears at the end, signaling that the link leaves the site. On hover, the text brightens slightly.

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
- **Wiki content** (`article.css` base + `wiki-content.css` delta overrides): Same `article.css` base rules apply (via `.article-content` class), but with Inter font and purple accent from `.article-wiki` scope. Headers use violet accent, no uppercase on headings.

**Inline formatting works inside table cells.** You can use colored text, kbd, superscript, subscript, accent text, inline code, and underline inside cells. The pre-processors run on the raw markdown before marked parses the table structure.

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
| HTML / CSS / Bash | vitesse-dark | vitesse-light |
| Everything else | vitesse-dark | vitesse-light |

**Code blocks without a language identifier** still get the terminal-style chrome (border, copy button), but no syntax highlighting and no language label. Always specify a language when possible for better readability.

### Inline code

Single backticks for inline code. Double backticks for inline code that contains a single backtick. Both are fully protected from all pre-processors (see [Edge Cases](#edge-cases-and-sacred-rules)). **Never put quotes (single or double) inside inline code** — they can break the placeholder extraction and restoration pipeline.

---

## List Indentation and Nesting

All list types (bullets, numbers, alphabetical letters, definition lists) render with a base left indentation from the text margin.

### Nesting with 2-space indentation

Standard markdown lists (`- ` and `1. `) support nesting. Indent by **2 spaces** to create a child list:

```
- top-level item
  - nested item (2 spaces)
    - deeply nested (4 spaces)
- another top-level item
```

Ordered lists nest the same way:

```
1. first step
2. second step
   1. sub-step a
   2. sub-step b
3. third step
```

Each nesting level is visually indented further. The `marked` parser handles nesting natively — no custom compiler logic is needed. **Maximum depth: 5 levels.** Deeper nesting is technically possible but won't receive additional visual indentation or distinct bullet styling.

### What doesn't nest

Definition lists (`::` syntax) and alphabetical lists (`a. b. c.`) do **not** support nesting. They are processed by custom preprocessors that match from the start of a line. They still receive the base indentation.

---

## Definition Lists

Use `- TERM:: description` syntax to create definition lists. Every line in a contiguous block of `- ` lines must contain `:: ` for the block to be treated as a definition list. If any line lacks `:: `, the entire block is left as a regular bullet list.

```
- latency:: the time between a request and its response
- throughput:: the number of operations per unit of time
- jitter:: the variation in latency over time
```

This produces a `<div class="defn-list">` wrapper containing `<p class="defn"><strong>TERM</strong> — description</p>` for each entry. The wrapper provides the base left indentation. The `:: ` separator is non-greedy — the term is everything before the first `:: `.

### Inline formatting inside definitions

Both the term and description support inline formatting: bold, italic, colored text, inline code, accent text, etc.

```
- `mutex`:: a --mutual exclusion-- lock
- **RAII**:: {#3B82F6:Resource Acquisition Is Initialization} — a C++ pattern
```

### Definition lists inside blockquotes

Definition lists work inside typed blockquotes. The term color adapts to the blockquote's type color (like accent text does).

```
{bkqt/keyconcept|Core terms}
key definitions:

- epoch:: one complete pass through the training dataset
- batch size:: number of samples before a weight update
{/bkqt}
```

---

## Alphabetical Lists

Use `a. text` (lowercase) or `A. text` (uppercase) to create alphabetical ordered lists. Items must start at `a`/`A` and be sequential (`a`, `b`, `c`, ...).

### Lowercase

```
a. first step
b. second step
c. third step
```

Produces `<ol type="a"><li>...</li>...</ol>`.

### Uppercase

```
A. First item
B. Second item
C. Third item
```

Produces `<ol type="A"><li>...</li>...</ol>`.

### Validation

The compiler validates that:
- The first line starts with `a. ` or `A. `
- Each subsequent line follows the expected sequence (`b`, `c`, `d`, ...)
- If the sequence is broken, the block is left as-is for marked to handle

### Inline formatting inside alphabetical lists

Each item supports inline formatting: bold, italic, colored text, inline code, accent text, etc.

```
a. **tokenization** — split raw text into tokens
b. **parsing** — build a tree from the token stream
c. **type checking** — verify --consistent types--
```

### Alphabetical lists inside blockquotes

Alphabetical lists work inside typed blockquotes. Marker colors adapt to the blockquote type color.

```
{bkqt/tip|Steps}
follow these steps:

a. clone the repository
b. install dependencies
c. run the test suite
{/bkqt}
```

---

## Context Annotations

Context annotations are timestamped inline author notes. They appear inside the article body as compact cards with an avatar, date badges, and short comments. Use them to document when and why you made changes, or to add personal context to specific sections.

### Syntax

Write `>> YY.MM.DD - text` on its own line. **Consecutive lines group into a single card:**

```
>> 26.01.15 - initial draft. rough but the structure is there.
>> 26.02.05 - rewrote the scaling section after reading the Chinchilla paper.
```

This produces **one** card with two date+text entries stacked vertically.

**Blank lines between `>>` lines produce separate cards:**

```
>> 26.01.15 - initial draft. rough but the structure is there.

some body text between them.

>> 26.02.05 - rewrote after reading the Chinchilla paper.
```

This produces **two** separate cards.

### Rules

- **Consecutive `>>` lines group.** Lines with no blank line between them merge into a single card with multiple entries separated by a thin divider. A blank line breaks the group into separate cards.
- **Date format:** `YY.MM.DD` — two-digit year, month (01-12), day (01-31). Displayed as `YY · mon DD` (e.g. `26 · feb 05`).
- **Relative time:** Annotations are post-publication edits. The compiler computes time elapsed since the article's `date` frontmatter and shows it in parentheses (e.g. `(3d later)`, `(6m 24d later)`). Omitted when the annotation date is on or before the publication date.
- **Annotation dates must be ≥ article date.** They represent edits made after publishing. Same-day annotations show no relative time.
- **Text supports inline markdown:** bold, italic, code, accent text, colored text — anything that works in a paragraph works in the annotation text.
- **Placement:** Anywhere in the article body. They can appear at the top (for article-level notes), between sections, or inline within content flow.
- **Author avatar:** Currently hardcoded to the site author's GitHub avatar. Future versions may support multi-author annotations.

### Output

Each group of consecutive annotations renders as a single `.ctx-note` div with:
- The author's avatar (26px rounded)
- A `.ctx-note-body` column containing one `.ctx-note-entry` per annotation line, each with:
  - A `.ctx-note-date-row` containing the monospace date badge and optional relative time
  - The annotation text in monospace at muted color
- Entries within a group are separated by a `.ctx-note-divider` (thin accent-tinted line)

### When to use

- **Article changelog:** "rewrote this section", "added examples", "corrected a factual error"
- **Personal timestamps:** "first draft", "published", "updated after reader feedback"
- **Section-level context:** Place before a heading to explain why that section exists or was changed

---

## Standard Blockquotes (Small Text)

The standard markdown blockquote syntax (`> text`) does **not** produce a traditional blockquote. Instead, the compiler overrides it to produce small, muted text. Use it for disclaimers, footnotes, asides, and citations.

For callout-style blocks with color coding and labels, use [typed blockquotes](#typed-blockquotes) instead.

---

## Second Brain (Fieldnotes)

Each fieldnote is an individual `.md` file inside `fieldnotes/`. Every file uses YAML frontmatter with `address` (required) and `date` (required) fields, followed by the body markdown.

### File format

```yaml
---
address: "CPU//ALU"
date: "2026-02-05"
---
The arithmetic logic unit — the circuit inside a [[CPU//core]] that performs...
[[CPU//core]]
[[CPU//register]]
[[CPU]]
```

### Filename convention

The filename is derived from the address: `//` → `_`, `/` → `-`, spaces → `-`, casing preserved. Examples:
- `CPU//ALU` → `CPU_ALU.md`
- `I/O//MMIO` → `I-O_MMIO.md`
- `MEDIA//IMAGE ALIGNMENT` → `MEDIA_IMAGE-ALIGNMENT.md`

### Block structure

Each file contains:
1. **Frontmatter:** `address` (hierarchical path) and `date` (ISO 8601).
2. **Body** -- standard markdown plus all custom inline syntax. Wiki-links in the body are extracted as references.
3. **Trailing references** -- standalone `[[address]]` lines at the end (after the last body text). These populate the "Related concepts" section.

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
1. Every `[[ref]]` inside fieldnotes points to an existing block. **Error** (build fails).
2. Parent address segments have their own blocks. **Warning** (build continues, but the hierarchy will be incomplete).
3. Every wiki-link in regular posts (threads, bits2bricks, projects) points to an existing fieldnote. **Error** (build fails).

Errors produce exit code 1. Warnings are logged but do not block the build.

**Auto-generated description:** If a fieldnote has no explicit `description` in frontmatter, the build script extracts the first body line that is not a heading or image as the description. Wiki-link syntax in the description is stripped to plain text.

---

## Edge Cases and Sacred Rules

### Backticks are sacred

This is the single most important rule. **Anything inside backticks is never touched by the custom syntax pipeline.** The compiler extracts all fenced code blocks and inline code before any pre-processing runs, replacing them with `%%CBLK_N%%` placeholders. After pre-processing and blockquote expansion, it restores them.

This means:
- `{^:2}` in running text becomes a superscript. Inside backticks, it stays literal.
- `{shout:text}` in running text becomes a centered callout. Inside backticks, it stays literal.
- `_text_` in running text becomes underlined. Inside backticks, it stays literal.
- `[[address]]` in running text becomes a wiki-link. Inside `<pre>` or `<code>` blocks in the final HTML, it is also skipped by the link processor.

If you ever need to show custom syntax literally without it being processed, put it in backticks.

### Headings are never stripped

The `displayTitle` frontmatter renders as the page heading in the UI. If you also put a `# Title` in the markdown body, both will appear. This is intentional — you have full control over what headings appear in the content. Most posts start with intro text (no heading) directly after the frontmatter, then use `## Section` headings for the body.

### Cross-doc links require display text

`[[threads/some-post]]` without a pipe and display text will cause a build error. Always write `[[threads/some-post|Some Post]]`. This is enforced to ensure human-readable anchor text.

### External URLs must use double brackets

If you write a bare URL like `https://example.com` in text, marked's GFM mode may auto-link it. For consistent styling and behavior, wrap external URLs in `[[https://example.com|text]]`. This ensures they get the `doc-ref-external` class and open in a new tab.

### Accent text adapts inside blockquotes

When `--accent--` appears inside a typed blockquote, its color adapts to match the blockquote's type color (green for tip, red for danger, etc.) rather than using the default category accent. This is handled by CSS rules in `article.css`.

---

## Syntax Not Supported

For clarity, these common markdown extensions are **not** part of this system:

- **Footnotes** (`[^1]`): Not supported. Use standard blockquotes (`> text`) for asides.
- **Callouts / Admonitions** (`> [!NOTE]`): Use typed blockquotes (`{bkqt/note}...{/bkqt}`) instead.
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
| Shout callout | `{shout:text}` |
| Underline | `_text_` |
| Accent color | `--text--` |
| Note callout | `{bkqt/note}` ... `{/bkqt}` |
| Warning with label | `{bkqt/warning\|Custom}` ... `{/bkqt}` |
| Quote (full-width) | `{bkqt/quote\|Author}` ... `{/bkqt}` |
| Pullquote (half-width) | `{bkqt/pullquote}` ... `{/bkqt}` |
| Wiki-link | `[[concept]]` or `[[parent//child]]` |
| Wiki-link (custom text) | `[[address\|display text]]` |
| Cross-doc link | `[[threads/slug\|Display Text]]` |
| External link | `[[https://url\|Display Text]]` |
| Centered image | `![alt](url "center")` |
| Image with caption | `![alt\|caption](url "center")` |
| Side image + text | `![alt](url "left:300px")` followed by text (no blank line) |
| Definition list | `- TERM:: description` (all lines must have `::`) |
| Alpha list (lower) | `a. first` / `b. second` / `c. third` |
| Alpha list (upper) | `A. First` / `B. Second` / `C. Third` |
| Nested list (1 level) | 2-space indent before `- ` or `1. ` |
| Horizontal rule | `---` on its own line |
| Context annotation | `>> 26.02.05 - annotation text` |
| Inline footnote | `{{ref\|explanation}}` |
| Nested footnote | `{{ref\|text with {{inner\|nested explanation}}}}` |
