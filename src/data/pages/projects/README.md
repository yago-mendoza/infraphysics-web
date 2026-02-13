# Writing Project Articles

Concise editorial guide for project writeups. These are lessons, not rules — apply judgment.

For syntax features, see **[SYNTAX.md](../SYNTAX.md)**. For general authoring rules and cross-referencing, see **[README.md](../README.md)**.

---

### Frontmatter

Every project article starts with a YAML frontmatter block. Prefix filenames with `YYMMDD-` for chronological sorting (e.g. `260121-infraphysics-web.md`). The `id` field determines URLs — the filename is only for directory organization.

| Field | Required | Type | What it does |
|---|---|---|---|
| `id` | yes | string | Unique slug used in URLs and as the primary key. |
| `displayTitle` | no | string | Human-readable title shown in UI. Falls back to `id`. |
| `category` | yes | string | Must be `projects`. |
| `date` | yes | string | ISO 8601 (`YYYY-MM-DD`). When the project was finished or published. |
| `description` | yes | string | One-liner for cards and meta tags. |
| `thumbnail` | no | string | Hero image URL. Prefer Cloudflare R2 or Unsplash. |
| `thumbnailAspect` | no | string | Crop ratio: `full` (default), `wide` (16/7), `banner` (16/4), `strip` (16/2). |
| `thumbnailShading` | no | string | Overlay: `heavy`, `light`, `none` (default). |
| `tags` | no | string[] | Topic tags for filter system. `[tag1, tag2]`. |
| `subtitle` | no | string | Below the title in the article header. |
| `related` | no | string[] | Post IDs for the "Related" section. |
| `featured` | no | boolean | Shows in "Latest Work" on home page. |
| `tldr` | no | string/string[] | Key takeaway lines in the header area. |
| `author` | no | string | Defaults to `Yago Mendoza`. |
| `status` | no | string | Lifecycle badge. Values: `ongoing` (violet), `deployed` (green), `completed` (blue), `arrested` (red). Defined in `STATUS_CONFIG` (`config/categories.tsx`). |
| `technologies` | no | string[] | Tech stack pills in the header. `[TypeScript, React, Vite]`. |
| `github` | no | string | GitHub repo URL. Renders a clickable link in the header. |
| `demo` | no | string | Live demo URL. Same treatment as `github`. |
| `caseStudy` | no | string | External case study URL. |
| `duration` | no | string | Free-form duration (e.g. `4 weeks`, `ongoing`). |

**Example:**

```yaml
---
id: neural-cellular-automata
displayTitle: neural cellular automata
category: projects
date: 2024-06-15
thumbnail: https://pub-xxx.r2.dev/nca-hero.webp
description: self-organizing patterns via learned update rules.
status: ongoing
technologies: [TypeScript, WebGL, React]
github: https://github.com/user/nca
tags: [simulation, graphics, ml]
related: [quantum-interference-visualizer]
---
```

---

### Voice & rhythm

- **Irregular paragraph length.** Some one-liners. Some expansive. Predictable structure kills authenticity.
- **15-paragraph rule.** In any long article, ~15 paragraphs should be in a calmer, more measured register. The rest can be casual/excited. Variation = human.
- **Storytelling over reporting.** Commits are story beats, not changelog entries. "Fixed fixes fixing fixes" needs a sentence explaining *why* that moment mattered — then the technical part comes after, connected to something else so it doesn't feel heavy.
- **Cross-reference constantly.** Wiki-links (`[[concept]]`) aren't decoration — they show how the author's mind connects ideas. Use them mid-sentence, naturally. But verify the target fieldnote exists before adding a wiki-link — broken links fail the build.
- **Plant forward references.** If a concept appears late in the article (e.g. the Second Brain in section 6), mention it casually 2–3 times earlier so it feels like it was always part of the story. Concepts shouldn't appear out of nowhere.

### Blockquote discipline

- **`{bkqt/tip}`** — the default. Lessons, tricks, patterns. The reader *learns* something.
- **`{bkqt/keyconcept}`** — for foundational concepts the rest of the article builds on.
- **`{bkqt/danger}` / `{bkqt/warning}`** — only if the *reader* is exposed to real risk. A mistake *you* made is not a danger to them. Use `{bkqt/danger|In Hindsight}` (always that exact label) for your own bad decisions — prescindible blocks that add context but aren't required for the narrative.
- **`{bkqt/quote}`** — sparingly. One per article max.

### Flow tools

- **Footnotes `{{visible|explanation}}`** — for parenthetical material that would break the sentence rhythm. Better than actual parentheses.
- **Small text `> ...`** — for dispensable technical details (keybindings, exact class names, implementation minutiae). If removing it doesn't hurt the story, it belongs in small text.
- **Context annotations `>> date - text`** — story beats, not documentation. Keep them short and human. See dedicated section below.

### Context annotations in projects

In projects, the article `date` is when the project is finished (or published). Context annotations (`>>`) serve as a **project diary** — they document how the project evolved, both during and after.

**Opening annotation.** Right after the intro text (before the first `#` heading), include a ctx with the date the project actually started. This is the first diary entry: a brief lateral comment, a mood, or a compressed version of what the intro says. The `notes` frontmatter handles factual notices ("WIP", "requires X"); the opening ctx is personal and timestamped.

```
intro text explaining the project...

>> 25.11.02 - started sketching this after getting frustrated with X.

# First heading
```

**During the project.** Annotations can appear anywhere in the body to mark milestones, shifts in direction, or moments worth recording. Dates can be before or after the article's `date` — both are valid because the article is written retrospectively about a project that spans time.

**After the project.** Post-publication updates, corrections, and reflections work the same as in any other category.

### Heading hierarchy

- **Start at `#`.** The article's grand title is already rendered by HTML from frontmatter (`displayTitle`). Inside the article body, `#` is the first level — use it for thematic groups.
- **Nest by theme, not by order.** Group related sections under a shared `#` heading. Don't leave everything flat at the same level — disparate topics (storytelling, technical, tooling) should be visually separated from the index itself.
- **`#` → `##` → `###`** is the full range. `#` for thematic blocks, `##` for sections within them, `###` for sub-sections. Each `#` block gets a brief transitional sentence before its first `##`.

### Structural patterns

- Bad decisions get a consistent format (`{bkqt/danger|In Hindsight}`) and are always skippable — the article must work without them.
- Bug stories are tips, not sections. A four-hour debugging session becomes a `{bkqt/tip}` that teaches the pattern, not a blow-by-blow with code blocks.
- "What I'd do differently" isn't a final section — it's scattered where relevant, inside the red blockquotes.
- Technical deep-dives connect to something narrative. Never a standalone wall of specs. If explaining a CSS cascade, tie it to the moment you discovered it or the bug it caused.

### Justify your decisions

- If you chose X over Y, say *why* with specifics. "I considered MDX" → enumerate the exact features it couldn't handle.
- Name your trade-offs explicitly: "the trade-off was conscious: cohesion over architectural purity."
- Acknowledge the better option without apologizing: "Astro would've been more elegant. I chose React because the project asked for one dominant logic."

### The "systems person" thread

- Weave 4–7 short mentions throughout (not a closing section) acknowledging you're outside your domain: "this is probably not how a frontend engineer would do it," "a language researcher would design this differently," etc.
- These build authenticity. Clustering them at the end makes them feel like a disclaimer.

### What not to do

- Don't use `bloat`, `footprint`, or jargon the author wouldn't naturally use.
- Don't make every section the same length or the same structure. At least one section should be 2–3 lines max (e.g. deployment) to break the rhythm.
- Don't add code blocks to bug stories inside tips — describe the pattern in words.
- Don't use danger/warning for things that only affected you during development.
