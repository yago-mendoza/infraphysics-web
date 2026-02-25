# Custom Syntax Reference

Full reference for every custom syntax feature available in InfraPhysics markdown. This compiler is a superset of GitHub-Flavored Markdown: everything GFM can do still works, plus 16 custom features documented below.

Nothing in this document uses the custom syntax it describes, because GitHub's renderer would mangle it. Everything is explained in prose.

For frontmatter schemas, content types, editorial rules, and the compilation pipeline, see **[README.md](README.md)**.

---

## Quick Reference

| What you want | What you write |
|---|---|
| Red text | `{#e74c3c:text}` |
| Superscript | `{^:text}` |
| Subscript | `{v:text}` |
| Keyboard key | `{kbd:Ctrl+C}` |
| Shout callout | `{shout:text}` |
| Dot separator | `{dots}` |
| Underline | `_text_` |
| Accent color | `--text--` |
| Note callout | `{bkqt/note}` ... `{/bkqt}` |
| Warning with label | `{bkqt/warning\|Custom}` ... `{/bkqt}` |
| Quote (full-width) | `{bkqt/quote\|Author}` ... `{/bkqt}` |
| Pullquote (half-width) | `{bkqt/pullquote}` ... `{/bkqt}` |
| Wiki-link | `[[uid]]` |
| Wiki-link (custom text) | `[[uid\|display text]]` |
| Cross-doc link | `[[threads/slug\|Display Text]]` |
| External link | `[[https://url\|Display Text]]` |
| Heading anchor | `[text](#heading-slug)` |
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

---

## Table of Contents

1. [Inline Formatting](#inline-formatting)
2. [Typed Blockquotes](#typed-blockquotes)
3. [Inline Footnotes](#inline-footnotes)
4. [Links](#links)
5. [Images](#images)
6. [Tables](#tables)
7. [Code Blocks](#code-blocks)
8. [List Indentation and Nesting](#list-indentation-and-nesting)
9. [Definition Lists](#definition-lists)
10. [Alphabetical Lists](#alphabetical-lists)
11. [Context Annotations](#context-annotations)
12. [Standard Blockquotes (Small Text)](#standard-blockquotes-small-text)
13. [Edge Cases and Sacred Rules](#edge-cases-and-sacred-rules)
14. [Syntax Not Supported](#syntax-not-supported)

---

## Inline Formatting

Seven custom inline rules are applied as pre-processors (step 3). They are defined in `compiler.config.js` under `preProcessors`. The compiler processes them in order: curly-brace patterns first (unambiguous delimiters), then bare-delimiter patterns (underscores, dashes).

### Headings are immune

Section headings (`#`, `##`, `###`, `####`) are **never processed** by any inline formatting rules. No accent text, colored text, inline code (backticks), or any other custom syntax will be applied inside a heading line. Headings are plain text only. Use standard capitalization and nothing else.

### H1 auto-numbering

Top-level headings (`#`) are automatically numbered by the compiler (step 13 in the pipeline). A sequential counter prefixes each `<h1>` with `1. `, `2. `, `3. `, etc. **Do not write the numbers in the markdown source** — the compiler adds them. This only applies to `#` (h1). Subheadings (`##`, `###`, etc.) are never numbered.

### Colored text

Write `{#HEX:text}` where HEX is a 3-to-6 character hex code or a CSS named color. The compiler produces a span with an inline `color` style.

- `{#e74c3c:danger}` renders "danger" in red.
- `{#7C3AED:purple note}` renders in violet.
- `{#tomato:warm}` works with named CSS colors.

Use this for one-off color emphasis. For recurring semantic colors, prefer accent text (below).

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

### Dot separator

Write `{dots}` on its own line. Produces a centered `· · ·` divider — the same section-break pattern Medium uses. No content, just three spaced middle dots.

- `{dots}`

Use it between sections or ideas when a horizontal rule (`---`) feels too heavy but you still want a visual pause.

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

All the `{tag:content}` patterns use curly braces because standard markdown never uses `{...}` for anything. This means zero collision risk with headings, emphasis, links, images, lists, or any other markdown construct. The colon separates the tag from the content, and the closing brace is unambiguous. It also makes the syntax greppable: you can search for `{#` to find all colored text, `{^:` for all superscripts, etc.

---

## Typed Blockquotes

Write blockquotes with opening and closing tags:

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

This produces: "counted" with a dotted underline + superscript `1`, and below the paragraph a note: `1 these were called HMMs and later n-gram language models.`

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
- `1` explanation for "counted" with "HMMs" underlined + superscript inside it
- indented below: `1` explanation for "HMMs"

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

Write `[[uid]]` to link to a fieldnote concept, where `uid` is the note's stable 8-character identifier. The compiler generates an element with a `data-uid` attribute. At runtime, `WikiContent.tsx` resolves it against the fieldnotes dataset.

- `[[OkJJJyxX]]` links to the "CPU" fieldnote and displays "CPU" (the note's `name`).
- `[[egoxqpmC]]` links to the "ALU" fieldnote and displays "ALU".
- `[[egoxqpmC|the arithmetic unit]]` links to "ALU" but displays "the arithmetic unit".

**Display text rule:** Without a pipe, the note's `name` field becomes the visible text. With a pipe, you control it explicitly.

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

### In-article heading anchors

Use standard markdown link syntax with `#slug` to link to a heading within the same article. The slug is the heading text lowercased, non-alphanumeric characters removed, spaces replaced with hyphens.

- `[full system access](#your-files-your-secrets)` — links to the heading "Your files, your secrets"
- `[see above](#the-pitch)` — links to the heading "The pitch"

**No `toc-` prefix needed.** The renderer automatically rewrites `#slug` to `#toc-slug` at display time. Clicking the link scrolls instantly to the heading (no smooth animation).

**Slug rules:** Same as GitHub-style heading anchors. `## The Supply Chain` → `#the-supply-chain`. Special characters are stripped, consecutive hyphens collapse, leading/trailing hyphens are removed.

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
- **Annotation dates must be >= article date.** They represent edits made after publishing. Same-day annotations show no relative time.
- **Text supports inline markdown:** bold, italic, code, accent text, colored text — anything that works in a paragraph works in the annotation text. **Exception: inline footnotes (`{{ref|...}}`) are not allowed** — context annotations are quick, informal notes; use parentheses for inline clarifications instead.
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

## Edge Cases and Sacred Rules

### Backticks are sacred

This is the single most important rule. **Anything inside backticks is never touched by the custom syntax pipeline.** The compiler extracts all fenced code blocks and inline code before any pre-processing runs, replacing them with `%%CBLK_N%%` placeholders. After pre-processing and blockquote expansion, it restores them.

This means:
- `{^:2}` in running text becomes a superscript. Inside backticks, it stays literal.
- `{shout:text}` in running text becomes a centered callout. Inside backticks, it stays literal.
- `_text_` in running text becomes underlined. Inside backticks, it stays literal.
- `[[uid]]` in running text becomes a wiki-link. Inside `<pre>` or `<code>` blocks in the final HTML, it is also skipped by the link processor.

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
