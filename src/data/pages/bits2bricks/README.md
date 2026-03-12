# Writing Bits2Bricks

Editorial guide for bits2bricks articles — tutorials, hardware/software build logs, and hands-on walkthroughs. These lessons accumulate from author feedback. Apply judgment, not rote rules.

For syntax features, see **[SYNTAX.md](../SYNTAX.md)**. For general authoring rules and cross-referencing, see **[README.md](../README.md)**.

---

### Frontmatter

Every bits2bricks article starts with a YAML frontmatter block. Filenames use `YYMMDD-{id}.md` where `{id}` is the 7-digit numeric ID (e.g. `260308-5917362.md`). The `id` field determines URLs — the filename is only for directory organization.

Bits2Bricks use universal fields plus `complexity`. No other category-specific extras.

| Field | Required | Type | What it does |
|---|---|---|---|
| `id` | yes | string | **7-digit numeric ID**, quoted (`"5917362"`). Same number as in the filename. Used in URLs (`/blog/bits2bricks/5917362`) and as the primary key. |
| `displayTitle` | no | string | Human-readable title shown in UI. Falls back to `id`. |
| `category` | yes | string | Must be `bits2bricks`. |
| `date` | yes | string | ISO 8601 (`YYYY-MM-DD`), quoted. Publication date. |
| `description` | yes | string | One-liner for cards and meta tags. |
| `thumbnail` | no | string | Hero image URL. Prefer Cloudflare R2 (`cdn.infraphysics.net`). |
| `thumbnailAspect` | no | string | Crop ratio: `full` (default), `wide` (16/7), `banner` (16/4), `strip` (16/2). |
| `thumbnailShading` | no | string | Overlay: `heavy`, `light`, `none` (default). |
| `tags` | no | string[] | Topic tags for filter system. `[tag1, tag2]`. |
| `subtitle` | no | string | Below the title in the article header. |
| `related` | no | string[] | Post IDs (quoted numerics) for the "Related" section. |
| `featured` | no | boolean | Shows in "Latest Work" on home page. |
| `tldr` | no | string/string[] | Key takeaway lines in the header area. |
| `complexity` | no | number | Difficulty rating (1–10). Used for sorting/filtering. |
| `author` | no | string | Defaults to `Yago Mendoza`. |

**Example:**

```yaml
---
id: "5917362"
displayTitle: "Transformers from scratch"
category: bits2bricks
date: "2026-02-07"
thumbnail: https://cdn.infraphysics.net/5917362-banner.jpg
thumbnailAspect: wide
thumbnailShading: heavy
description: "A patient, ground-up explanation of transformer architecture."
tags: [ai, transformers, deep-learning]
complexity: 8
featured: true
tldr:
  - First takeaway line.
  - Second takeaway line.
related: ["4028591"]
---
```

---

### Voice & tone

<!-- ADD TONE LESSONS HERE as they emerge from author feedback.
     Examples of what belongs here:
     - Register (instructional vs conversational vs lab-notebook)
     - How much hand-holding vs assumed knowledge
     - How to handle "this didn't work at first"
     - When to show vs tell
-->

*No tone lessons recorded yet. This section grows from feedback on published bits2bricks articles.*

---

### Structure

<!-- ADD STRUCTURAL PATTERNS HERE as they emerge.
     Examples of what belongs here:
     - Typical article arc (goal → setup → build → result)
     - How to handle prerequisite knowledge
     - When to use step-by-step vs narrative flow
     - Ideal section length for tutorials
-->

*No structural lessons recorded yet. This section grows from feedback on published bits2bricks articles.*

---

### Emphasis patterns

Bits2Bricks lean heavily on:
- **Code blocks** with language identifiers for implementation steps
- **Alphabetical lists** (`a. b. c.`) for ordered procedures
- **Definition lists** (`- TERM:: desc`) for introducing terminology
- **Side-by-side images** for diagrams alongside explanation text
- **`{bkqt/tip}`** for practical shortcuts and gotchas

Generic blockquote labels ("Note", "Tip", "Warning") are fine in bits2bricks — the format is utilitarian.

**Accent-colored elements.** All blockquote types render in the category accent color (blue) — there is no per-type color distinction. Wiki-links also use the blue accent instead of the default purple. Inline footnote references and notes render in italic. This behavior is shared with threads; only projects uses the per-type blockquote color palette.

---

### What not to do

<!-- ADD ANTI-PATTERNS HERE as they emerge.
     Examples of what belongs here:
     - Over-explaining obvious steps
     - Patterns the author explicitly rejected
     - Common LLM habits that don't fit the voice
-->

*No anti-patterns recorded yet. This section grows from feedback on published bits2bricks articles.*
