# Writing Pages for InfraPhysics

Authoring guide for all content in `src/data/pages/`. Every markdown file here is compiled at build time into static HTML via a custom pipeline built on **marked** and **Shiki**. The result is a superset of standard markdown: everything GitHub-Flavored Markdown can do still works, plus 16 custom features on top.

**Before writing content**, consult these resources:

| What you need | Where to find it |
|---|---|
| Syntax features (inline formatting, blockquotes, links, images, etc.) | **[SYNTAX.md](SYNTAX.md)** |
| Build pipeline (14 steps, cache, outputs, Shiki config) | **[scripts/README.md](../../scripts/README.md)** |
| Fieldnotes management (scripts, workflows, rename/delete) | **[fieldnotes/README.md](fieldnotes/README.md)** |
| Projects editorial voice | **[projects/README.md](projects/README.md)** |
| Threads editorial voice | **[threads/README.md](threads/README.md)** |
| Bits2Bricks editorial voice | **[bits2bricks/README.md](bits2bricks/README.md)** |

Nothing in this document uses the custom syntax it describes, because GitHub's renderer would mangle it. Everything is explained in prose.

---

## Table of Contents

1. [Frontmatter](#frontmatter)
2. [Content Types and Writing Guidance](#content-types-and-writing-guidance)
3. [Compilation Pipeline](#compilation-pipeline)
4. [Second Brain (Fieldnotes)](#second-brain-fieldnotes)

---

## Frontmatter

Every markdown file starts with a YAML frontmatter block (`---`). Frontmatter schemas are documented in each category's own README:

- **[projects/README.md](projects/README.md)** — universal fields + `status`, `technologies`, `github`, `demo`, `duration`
- **[threads/README.md](threads/README.md)** — universal fields only
- **[bits2bricks/README.md](bits2bricks/README.md)** — universal fields only
- **Fieldnotes** — `uid`, `address`, `name`, `date`, `aliases`, `supersedes`, `distinct`. See [Second Brain](#second-brain-fieldnotes) below.

---

## Content Types and Writing Guidance

### Article intro text

Any text that appears **after the frontmatter but before the first heading** is rendered as an intro paragraph (styled with `.article-intro`). Use it for:
- What this post is about and what to expect
- Who the intended audience is
- Motivation, backstory, or a personal anecdote

The intro is **not** the same as the `description` frontmatter (which is a one-liner for cards and meta tags). The intro is the first thing a reader sees in the article body — it sets the tone.

### When to use `tldr`, `>>` context annotations, or intro text

| Tool | Purpose | Where it appears | When to use |
|---|---|---|---|
| **`tldr` frontmatter** | Central idea at a glance | Header area, above the content | Key takeaways, core premise, project summary bullets |
| **Intro text** | Motivation, audience, what to expect | Between TOC and first heading | First time reading the post — sets expectations |
| **`>> annotations`** | Timestamped post-publication edits | Anywhere in the article body | "Rewrote this section", "corrected after feedback", changelogs |
| **`{bkqt/note}`** | In-flow supplementary information | Wherever placed in body | "See also...", tangential context, clarifications |

`tldr` is metadata. Intro text is narrative. `>>` annotations are a changelog. `{bkqt/note}` is a callout. They serve different purposes and can coexist in the same post.

### Writing conventions per content type

All types share the same compiler and the same 16 custom syntax features (see **[SYNTAX.md](SYNTAX.md)**). The difference is in tone, structure, and which features you'll use most. Each category has its own editorial README with voice guidelines:

**Projects** — Technical case studies. Structure: intro (what/why), implementation sections, results/learnings. Heavy use of code blocks, definition lists, `technologies` and `status` frontmatter. The `>>` annotations are useful for logging progress over time. The `github` and `demo` fields link to live resources. See **[projects/README.md](projects/README.md)**.

**Threads** — Essays and analysis. Structure: intro (thesis), argument sections, conclusion. Heavy use of accent text (`--key claims--`), inline footnotes (`{{ref|explanation}}`), typed blockquotes for key concepts, and `>>` annotations for post-publication corrections. Threads tend to be longer and more prose-heavy. See **[threads/README.md](threads/README.md)**.

**Bits2Bricks** — Tutorials and hardware/software build logs. Structure: intro (what we're building), step-by-step sections, results. Heavy use of code blocks, alphabetical lists for ordered steps, definition lists for terminology, images with side-by-side layouts. More instructional tone than threads. See **[bits2bricks/README.md](bits2bricks/README.md)**.

**Fieldnotes (Second Brain)** — Reference-style concept notes. Short, factual, link-heavy. Body is typically 1-5 paragraphs defining a concept. Heavy use of `[[wiki-links]]` to connect concepts. Trailing `[[refs]]` create bilateral interactions (optionally annotated: `[[addr]] :: why`). No intro text convention — just start with the definition. See [Second Brain](#second-brain-fieldnotes) for full format and **[fieldnotes/README.md](fieldnotes/README.md)** for operations.

### Content separation

Each section has a clear scope. When content could fit in multiple places, these rules decide where it goes.

**Projects** are builds — repos, hardware, software, things that get made. The article documents the journey: design decisions, wrong turns, lessons learned, progress tracking. Theory and conceptual explanations belong in the second brain; step-by-step implementation details that could stand alone as tutorials belong in bits2bricks. A project article can *reference* both (brief annotations, blockquotes, cross-doc links) but should not become a theory explainer or a tutorial itself.

**Threads** are essays — arguments, opinions, narratives, discussions of ideas and current events. They never contain step-by-step implementation details or technical how-tos. When a thread touches something buildable, the implementation lives in a bits2bricks companion piece, linked via a cross-doc reference. Threads can use wiki-links for terminology and inline footnotes for brief definitions, but the depth stays narrative. A thread explains *why something matters*; it does not explain *how to build it*.

**Bits2Bricks** are walkthroughs — tutorials, build logs, technical explanations. They take atomic concepts from the second brain and explain them in context with enough room to breathe: how things work, how to build them, why they break. A bits2bricks article is often a companion piece to a thread (the thread argues *why*; bits2bricks shows *how*) or to a project (the project logs the journey; bits2bricks extracts the reusable lesson).

**Fieldnotes (Second Brain)** are atomic — one concept per note, connected to everything else via wiki-links and trailing refs. They are the building blocks that projects, threads, and bits2bricks all draw from. A fieldnote defines *what* something is. The other sections explain *why it matters* (threads), *how to use it* (bits2bricks), or *what happened when I tried* (projects).

### Cross-referencing between sections

Content flows between sections without repeating itself. When a topic spans multiple formats, use cross-references to connect the pieces. The site has several tools for this — use the right one for each type of connection:

| What you're connecting | Tool | Pattern |
|---|---|---|
| Article → companion in another category | Cross-doc link | `[[bits2bricks/slug\|display text]]` or `[[threads/slug\|display text]]` |
| Article → atomic concept | Wiki-link | `[[concept]]` or `[[parent//child]]` |
| Inline definition of a term | Inline footnote | `{{term\|brief explanation of what it means}}` |
| Brief theory aside (3+ sentences) | Typed blockquote | `{bkqt/keyconcept\|label}...{/bkqt}` or `{bkqt/note\|label}...{/bkqt}` |
| Post-publication update with cross-ref | Context annotation | `>> 26.03.10 - built this into a prototype: [[projects/slug\|link]]` |

**Bidirectional bridges.** When a thread has a bits2bricks companion, both articles should link to each other. The thread points readers to the companion for technical depth ("for the full technical playbook, see..."). The bits2bricks opens by referencing the thread for narrative context ("companion piece to..., which explains why this matters"). Same pattern applies between projects and bits2bricks.

**Don't saturate.** A few well-placed connections are better than linking every term. Cross-doc links should feel like natural "see also" pointers, not a sitemap. Wiki-links work best for terms a reader might not know — don't link common words just because a fieldnote exists for them.

**Theory in projects — the exception.** Projects should stay focused on the build, but sometimes a design decision requires a paragraph of theory to explain *why* that decision was made. Use a typed blockquote (`{bkqt/note}` or `{bkqt/keyconcept}`) for these — it visually separates the theory from the build narrative. If the theory needs more than a blockquote, it belongs in a second brain note or a bits2bricks article, linked from the project.

### Editorial rules

These apply across all content types unless noted otherwise.

**Capitalization.** Always use standard sentence case — capitalize the first word and proper nouns only. Never use title case where every word is capitalized ("The Architecture Of Modern Compilers"). This applies to headings, blockquote labels, table headers, and any user-facing text.

**Blockquotes are for substantial content.** A blockquote must contain enough material to justify the visual weight of a colored container. One sentence is not enough. Two short sentences are not enough. If the content fits in a line or two, use an inline annotation (`{{ref|explanation}}`) instead — that's exactly what they're for. Annotations inside a blockquote do not count as interior content: a single sentence plus a footnote does not justify a blockquote.

**Blockquote colors — projects vs blog.** In **projects**, each blockquote type has a distinct color (green for tip, amber for warning, red for danger, purple for keyconcept). In **blog articles** (threads, bits2bricks), all blockquote types render in the category accent color — there is no per-type color distinction. The types still work as structural markers (labels, semantics) but the visual treatment is uniform.

**Wiki-link colors — projects vs blog.** In **projects**, wiki-links use the default purple. In **blog articles**, wiki-links use the category accent color (rose for threads, blue for bits2bricks).

**Blockquote labels in threads.** Avoid generic single-word nouns like "Note" or "Warning" as labels. The label should hint at what's coming — it can be short, but it must be specific. "What's actually on your disk" is better than "Warning". "The supply chain" is better than "Key concept". This rule is specific to threads: in projects and bits2bricks, generic labels like "Note" or "Tip" are fine because those formats are more utilitarian.

**Context annotations (`>>`) — avoid stacking.** Do not place more than two separate `>>` cards in sequence. If you have several short updates, merge them into a single grouped card (consecutive `>>` lines with no blank line between them). If the point is to show how content evolved over time, prefer the grouped format — one card with multiple dated entries reads as a timeline, while scattered single-entry cards interrupt the flow.

**Context annotations — avoid short singles.** A `>>` card with a five-word message sitting alone looks out of place. Either merge it with an adjacent annotation or expand it to say something worth the visual space. Short annotations are fine when grouped with others inside one card.

**Context annotations — category-specific rules.** Projects and threads use ctx annotations very differently. Projects use them as a project diary (dates before and after the article `date` are valid, and an opening ctx after the intro is expected). Threads restrict them to post-publication updates only (no opening ctx, no dates before the article `date`). See **[projects/README.md](projects/README.md)** and **[threads/README.md](threads/README.md)** for the full rules.

**Tables are for objective data.** Use tables when comparing structured, factual information (specs, API fields, syntax options, dates, metrics). Do not use tables for rhetorical contrasts ("what people hear" vs. "what it actually means"), conceptual analogies ("MRP concept → Finance equivalent"), or terminology glossaries — those are argumentation or explanation, not data. Use prose, definition lists (`TERM:: description`), or blockquotes instead.

**Never use `→` in article prose.** The arrow character looks technical and breaks the conversational tone. Use "becomes", "maps to", "turns into", or rephrase as a sentence.

---

## Compilation Pipeline

The pipeline runs at build time (`npm run content`). No markdown is parsed in the browser. Use `npm run content -- --force` to ignore the cache and recompile everything.

**Important:** Single newlines do NOT create line breaks. The parser uses `breaks: false` (GFM mode). You must use a blank line to start a new paragraph. This is standard GFM behavior.

### Per-file compilation (`compileMarkdown`)

Each markdown file passes through this 15-step pipeline:

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
[13] numberH1Headings            -- auto-number <h1> headings sequentially (1. 2. 3. ...)
[14] highlightCodeBlocks         -- Shiki syntax highlighting per language
[15] applyPostProcessors         -- extensible HTML transforms (currently empty)
```

### After all files are compiled

Two additional passes run on the combined output of ALL files (not per-file):

- **`processAllLinks`** — resolves `[[wiki-refs]]`, `[[category/slug|text]]` cross-doc links, and unresolved markers. Runs on every post every build because link targets change when notes are added/removed. Protected by `processOutsideCode` which shields `<pre>` and `<code>` segments.
- **`processAnnotations`** — converts `{{ref|explanation}}` inline footnotes into numbered markers + annotation blocks. Works inside `<p>`, `<li>`, and `<td>` elements. Also protected by `processOutsideCode`.

### Build outputs

| Output | Location |
|---|---|
| Regular posts | `src/data/posts.generated.json` (projects, threads, bits2bricks — no fieldnotes) |
| Fieldnotes index | `src/data/fieldnotes-index.generated.json` (metadata + searchText, no content) |
| Fieldnote content | `public/fieldnotes/{id}.json` (per-note `{ "content": "<html>" }`) |
| Categories | `src/data/categories.generated.json` (from `_category.yaml` files in each section directory) |

Step 2 is the reason backticks are sacred (see **[SYNTAX.md](SYNTAX.md)** → Edge Cases). Steps 3-4 happen on "safe" markdown where all code has been removed. Step 6 must run before step 11 because marked would auto-link bare URLs inside double brackets and corrupt them.

All configuration lives in `scripts/compiler.config.js`. The main orchestration lives in `scripts/build-content.js`.

---

## Second Brain (Fieldnotes)

Each fieldnote is an individual `.md` file inside `fieldnotes/`. Every file uses YAML frontmatter followed by the body markdown. For the **operational side** (creating, renaming, deleting, available scripts, build errors, cascading effects), see **[fieldnotes/README.md](fieldnotes/README.md)**.

### File format

```yaml
---
uid: "OkJJJyxX"
address: "CPU//ALU"
name: "ALU"
date: "2026-02-05"
aliases: [ALU, arithmetic logic unit]
---
The arithmetic logic unit — the circuit inside a [[vtSgUEG3]] that performs...
[[vtSgUEG3]] :: shares execution resources but cache is per-core — a miss stalls one core, not the whole chip
```

### Frontmatter fields

| Field | Required | Type | What it does |
|---|---|---|---|
| `uid` | yes | string | 8-character alphanumeric string (`[a-zA-Z0-9]`), randomly generated at creation time, never changes. Primary key for all references — stable even when the address is renamed. |
| `address` | yes | string | Hierarchical identifier using `//` as separator. Freely renameable — only affects display and neighborhood computation. |
| `name` | yes | string | Human-friendly display name (typically the last address segment). Used in search, link display text, and UI titles. |
| `date` | yes | string | ISO 8601 date (`YYYY-MM-DD`). |
| `aliases` | no | string[] | Alternative names for the concept. Matched during name search. |
| `supersedes` | no | string | Old address this note replaced. Build-time redirect so stale `[[refs]]` resolve to the new address. **Temporary** — remove after all references are updated. Example: `supersedes: "old//address//name"` |
| `distinct` | no | string[] | Addresses that share a segment name with this note but are intentionally different concepts. Suppresses segment collision warnings. Bilateral — only one note needs the annotation. |

### Filename convention

Each fieldnote file is named `{uid}.md` (e.g. `OkJJJyxX.md`). The UID is the stable identifier from frontmatter. Filenames never change when addresses are renamed.

### Block structure

Each file contains:
1. **Frontmatter:** See table above.
2. **Body** — standard markdown plus all custom inline syntax. Wiki-links in the body are extracted as references.
3. **`---` separator** (only if trailing refs follow).
4. **Trailing references** — standalone `[[uid]] :: annotation` lines at the end. These create intentional **interactions** between concepts.

### Wiki-linking strategy

Write `[[uid|name]]` so the raw markdown is readable. If the pipe text matches the note's current `name`, renames propagate automatically (the build always resolves to the latest name). Use custom display text only when it intentionally differs from the note's name: `[[YwfNaR4R|preference-based methods]]` when the note is named "DPO".

When authoring, also look for **non-literal connections** (e.g. "the reward signal" ⟶ link to `reward model`; "silicon" ⟶ `semiconductor`). AI assistants should suggest these semantic links.

### Trailing refs: contrastive interactions only

Trailing refs are **not** for listing related concepts — body `[[wiki-links]]` already do that. A trailing ref should only exist when you have a **contrastive or non-obvious insight** to explain between two concepts. If you can't write a `::` annotation that reveals something surprising or counterintuitive, the connection belongs in the body text, not in trailing refs.

**Every trailing ref MUST have a `::` annotation.** Bare `[[uid]]` refs without annotations add no value — the relationship is already visible through body links and the hierarchy. The annotation is the entire point.

```
[[vtSgUEG3]] :: shares execution resources but cache is per-core — a miss stalls one core, not the whole chip
[[8P7MMv9C]] :: coordinates shared-state access across the cache-coherence boundary
```

The annotation (everything after `::`) explains **why** the connection is worth calling out. It appears in the UI as an "Interaction."

**Important:** Do not use `|` for annotations in trailing refs. The pipe `|` is reserved for display text in inline wiki-links (`[[address|display text]]`). Use `::` exclusively for trailing ref annotations.

**Bilateral behavior:** If note A has a trailing ref to B, the runtime shows the interaction on **both** A and B's pages. If B also has a trailing ref back to A (with its own annotation), both annotations are displayed. You do not need to add refs on both sides — one is sufficient for bilateral display.

**Annotation examples involving other concepts:** If an annotation uses another concept as an example or illustration (e.g. explaining how Alexa uses an NPU), that cross-concept relationship belongs as a trailing ref **interaction**, not as inline text in the annotation. The interaction section is where concept-to-concept comparisons and examples live.

### Address format

Addresses use `//` as a hierarchy separator.

- `entropy` — single-level concept.
- `CPU//ALU` — ALU is a child of CPU.
- `CPU//ALU//barrel shifter` — three-level nesting.

### Naming conventions

The `address` and `name` fields follow capitalization rules based on what the term represents:

| Category | Rule | Examples |
|---|---|---|
| Product names / brands | Original capitalization | `Claude Code`, `Cortex-A`, `ESP32`, `STM32`, `GPT`, `TinyML` |
| Acronyms | ALL CAPS | `MCU`, `SoC`, `DPO`, `RLHF`, `ALU`, `GIL`, `DMA`, `RAG`, `NPU` |
| Major domain subdivisions | Capitalize first letter | `Training`, `Inference`, `Transformer`, `Alignment`, `Multimodal` |
| Fields / disciplines | lowercase | `electronics`, `compiler`, `hardware`, `manufacturing`, `networking`, `semiconductor` |
| Techniques / patterns | lowercase | `mutex`, `cache`, `pipeline`, `fab`, `firmware`, `register` |
| Proper nouns in compound terms | Capitalize the proper noun only | `Goodhart's curse`, `constitutional AI` |

**Spacing rules:**
- Use **spaces** for multi-word terms: `reward model`, `latent space`, `event loop`, `smart sensor`, `vector database`
- Use **hyphens** only when the hyphen is part of the established name (`Cortex-A`, `Pre-training`, `dot-claude`) or for compound programming terms (`post-processor`, `pre-processor`)
- Avoid gratuitous "AI" — only uppercase `AI` in product names (`Scale AI`) or established technique names (`constitutional AI`). Don't append it as branding.

**Parent requirement:** If you create `CPU//ALU`, the build validator expects a block for `CPU` to exist as well (it issues a warning if missing). This keeps the hierarchy navigable.

**Address depth:** Each `//` step should be a small conceptual jump. Deeper nesting with short steps is always better than shallow nesting with big jumps. The leaf is the actual concept; everything above is the path to reach it. Any node can act as a container if it groups sub-concepts. Abbreviate when possible (`L4` not `transport layer`, `crypto` not `cryptography`, `fs` not `file system`). Examples of good depth: `cybersecurity//crypto//symmetric//AES`, `electronics//signals//analog//filter//low-pass`, `CPU//pipeline//hazard//branch prediction`. Anti-pattern: `steganography` alone at top level (should be `cybersecurity//data hiding//steganography`).

### Writing style

- **No em dashes or en dashes.** Never use `—` or `–` in fieldnote bodies. Use parentheses, semicolons, periods, or commas instead.
- **Use long arrows only.** Never use `→` (U+2192). Always use `⟶` (U+27F6) for arrows in fieldnote content.
- **No blank line after frontmatter.** The first body line starts immediately after the closing `---` (no empty line between them).
- **No invented examples.** Only include examples if the user provided them as input content. Do not fabricate illustrative examples.
- **No manual back-references.** Never write lines like "Referenced from [[uid|name]]" in the body. The web UI calculates and displays back-references automatically.

### References, connections, and mentions

The runtime distinguishes three relationship types:

1. **Connections** — Trailing refs create intentional, bilateral relationships. If A trail-refs B, both A and B show each other in their "Connections" section. Annotations are preserved. **Write the trailing ref on only ONE of the two notes.** The UI automatically crosses it to the other side. Never duplicate a trailing ref on both notes.
2. **Mentions** — Body-text wiki-links (excluding trailing refs) create one-way "mentioned in" backlinks. If A mentions B in its body text, B shows A in a collapsible "Mentioned in" section.
3. **Neighborhood** — Structural context (parent, siblings, children) derived from the address hierarchy. Shown in the right panel on concept pages.

### Supersedes (address rename)

`supersedes` is a **build-time redirect only** — it resolves stale `[[wiki-links]]` to the new address at compile time. It does **not** redirect browser URLs or router paths.

It is a **temporary migration aid**, not permanent metadata:

1. Rename the note (or use `node scripts/rename-address.js "old" "new"`)
2. Add `supersedes: "old address"` so stale `[[refs]]` keep working during transition
3. Once the build confirms all references resolve, **remove** `supersedes` — it has served its purpose

It should not accumulate. After a full rename pass, no stale references remain and the field is unnecessary.

### Validation

The build runs a 7-phase integrity check automatically. Full phase details and error codes: **[fieldnotes/README.md](fieldnotes/README.md#build-time-validation)**.

| # | Check | Severity |
|---|---|---|
| 1 | `[[refs]]` and trailing refs resolve to existing blocks; wiki-links in posts resolve to fieldnotes | ERROR |
| 2 | Notes don't reference themselves | WARN |
| 3 | Trailing refs without `::` annotation | ERROR |
| 4 | Full parent paths exist (`CPU//mutex` not just `mutex`) | WARN |
| 5 | Circular reference detection (opt-in, off by default) | WARN |
| 6 | **Segment collisions** — same segment at different paths, with tier classification (HIGH/MED/LOW) and `distinct` suppression | WARN |
| 7 | Isolated notes (no connections) | INFO |

For deeper audit (duplicate trailing refs, redundant refs, fuzzy duplicates, segment collisions), run `node scripts/check-references.js`.

Errors produce exit code 1. Warnings and info are logged but do not block the build.

### Distinct (segment disambiguation)

When the build flags a segment collision (e.g., `CPU//cache` and `networking//cache` both have leaf segment "cache"), you can suppress it by declaring the notes are intentionally different:

```yaml
---
address: "networking//cache"
distinct: ["CPU//cache"]
---
```

Bilateral — only one note needs the annotation. Stale `distinct` entries (pointing to deleted notes) produce their own warning.

**Auto-generated description:** If a fieldnote has no explicit `description` in frontmatter, the build script extracts the first body line that is not a heading or image as the description. Wiki-link syntax in the description is stripped to plain text.
