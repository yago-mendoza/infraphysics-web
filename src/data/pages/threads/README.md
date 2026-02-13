# Writing Threads

Editorial guide for thread articles — essays, analysis, and long-form arguments. These lessons accumulate from author feedback. Apply judgment, not rote rules.

For syntax features, see **[SYNTAX.md](../SYNTAX.md)**. For general authoring rules and cross-referencing, see **[README.md](../README.md)**.

---

### Frontmatter

Every thread starts with a YAML frontmatter block. Prefix filenames with `YYMMDD-` for chronological sorting (e.g. `260206-alignment-is-not-a-vibe-check.md`). The `id` field determines URLs — the filename is only for directory organization.

Threads use only universal fields — no category-specific extras.

| Field | Required | Type | What it does |
|---|---|---|---|
| `id` | yes | string | Unique slug used in URLs and as the primary key. |
| `displayTitle` | no | string | Human-readable title shown in UI. Falls back to `id`. |
| `category` | yes | string | Must be `threads`. |
| `date` | yes | string | ISO 8601 (`YYYY-MM-DD`). Publication date. |
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

**Example:**

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

---

### Typography

Threads use **Source Serif 4** (serif) for body text, list items, table cells, and blockquote content. Headings, TOC, and UI elements remain in Inter (sans-serif). This is automatic — no frontmatter or class needed. Just write the markdown and the `.article-threads` scope applies the serif font.

Body font size is `0.95rem` with `line-height: 1.55` — slightly smaller and more spacious than the default, tuned for longer prose reading.

---

### Voice & tone

<!-- ADD TONE LESSONS HERE as they emerge from author feedback.
     Examples of what belongs here:
     - Register (formal vs conversational vs mixed)
     - How much humor / personal voice
     - How to handle certainty vs hedging
     - Sentence rhythm patterns that work
     - Opening/closing conventions
-->

*No tone lessons recorded yet. This section grows from feedback on published threads.*

---

### Blockquote labels

Generic labels ("Note", "Warning", "Key concept") are **not allowed** in threads. The label must hint at the content — short but specific:

- "What's actually on your disk" instead of "Warning"
- "The supply chain" instead of "Key concept"
- "The real cost" instead of "Note"

This rule is threads-specific. Projects and bits2bricks can use generic labels.

Blockquote labels in threads are rendered with serif font, no colon after the label, `display: block`, and `font-size: 0.95rem` (matching body text). This is automatic via CSS — no extra markup needed.

---

### Structure

<!-- ADD STRUCTURAL PATTERNS HERE as they emerge.
     Examples of what belongs here:
     - Typical section arc (thesis → evidence → implication)
     - How deep to go on technical detail
     - Where to place the "so what" moment
     - Ideal article length range
     - Heading depth conventions
-->

*No structural lessons recorded yet. This section grows from feedback on published threads.*

---

### Context annotations in threads

In threads, the article `date` is the publication date. Context annotations (`>>`) are strictly **post-publication** — they represent something that happened or was discovered after the article went live. Never use a ctx with a date before the article's `date`.

**Do not use an opening ctx.** Unlike projects (which use a ctx after the intro as a diary entry), threads should not start with a context annotation. The intro text stands on its own. A ctx right after the intro adds nothing — if the comment is worth making, put it in the intro itself.

**When to use ctx in threads:**
- A genuinely relevant update that emerged after publishing (correction, new development, follow-up discovery).
- A cross-reference to a related project or bits2bricks article, with an explicit link to that article. Example: `>> 26.03.10 - built this into a working prototype: [[projects/my-project|project article]]`.

**When not to use ctx in threads:**
- As decoration or commentary on the article's own content.
- For anything that could be said in the body text instead.

---

### Emphasis patterns

Threads lean heavily on:
- **Accent text** (`--key claims--`) for revelations and surprising facts
- **Inline footnotes** (`{{ref|explanation}}`) for definitions and tangential context
- **Typed blockquotes** for core arguments that need visual weight
- **Bold** for proper nouns and terms introduced for the first time

---

### What not to do

<!-- ADD ANTI-PATTERNS HERE as they emerge.
     Examples of what belongs here:
     - Things that felt wrong in review
     - Patterns the author explicitly rejected
     - Common LLM habits that don't fit the voice
-->

*No anti-patterns recorded yet. This section grows from feedback on published threads.*
