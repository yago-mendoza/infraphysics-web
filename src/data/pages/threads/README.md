# Writing Threads

Editorial guide for thread articles — essays, analysis, and long-form arguments. These lessons accumulate from author feedback. Apply judgment, not rote rules.

For syntax features, see **[SYNTAX.md](../SYNTAX.md)**. For general authoring rules and cross-referencing, see **[README.md](../README.md)**.

---

### Frontmatter

Every thread starts with a YAML frontmatter block. Filenames use `YYMMDD-{id}.md` where `{id}` is the 7-digit numeric ID (e.g. `260207-5528103.md`). The `id` field determines URLs — the filename is only for directory organization.

Threads have several category-specific fields: `lang`, `lead`, `hidden`, and `complexity`.

| Field | Required | Type | What it does |
|---|---|---|---|
| `id` | yes | string | **7-digit numeric ID**, quoted (`"5528103"`). Same number as in the filename. Used in URLs (`/blog/threads/5528103`) and as the primary key. |
| `displayTitle` | no | string | Human-readable title shown in UI. Falls back to `id`. |
| `category` | yes | string | Must be `threads`. |
| `date` | yes | string | ISO 8601 (`YYYY-MM-DD`), quoted. Publication date. |
| `lang` | no | string | Language code (`en`, `es`). Defaults to `en`. Non-English threads show a small language chip on the card. |
| `thumbnail` | no | string | Hero image URL. Prefer Cloudflare R2 (`cdn.infraphysics.net`) or Unsplash. |
| `thumbnailAspect` | no | string | Crop ratio: `full` (default), `wide` (16/7), `banner` (16/4), `strip` (16/2). |
| `thumbnailShading` | no | string | Overlay: `heavy`, `light`, `none` (default). |
| `subtitle` | no | string | Below the title in the article header. |
| `lead` | no | string | Extended intro paragraph shown on the thread page. Longer than `description` — this is the hook, the editorial voice. Not used in cards or meta tags. |
| `tags` | no | string[] | Topic tags for filter system. `[tag1, tag2]`. |
| `complexity` | no | number | Difficulty rating (1–10). Used for sorting/filtering. |
| `featured` | no | boolean | Shows in "Latest Work" on home page. |
| `related` | no | string[] | Post IDs (quoted numerics) for the "Related" section. |
| `hidden` | no | boolean | If `true`, thread is excluded from listings. Defaults to `false`. |
| `author` | no | string | Defaults to `Yago Mendoza`. |

**Not used in threads:** `description` (threads use `lead` instead), `tldr`, `status`, `technologies`, `github`, `demo`.

**Example:**

```yaml
---
id: "5528103"
displayTitle: "OpenClaw and the keys to your kingdom"
category: threads
date: "2026-02-07"
lang: en
thumbnail: https://cdn.infraphysics.net/5528103-banner.jpg
thumbnailAspect: wide
subtitle: "AI agents, system access, and a trademark claim that backfired."
lead: "An AI agent with full access to your computer sounds amazing until you think about it for five minutes."
tags: [ai, security, agents]
complexity: 4
featured: true
related: ["7463810", "8888777"]
hidden: false
---
```

---

### Typography

Threads use **SF Pro Display** (with system font fallbacks → Inter on non-Mac) for body text, list items, table cells, blockquote content, TOC, and UI elements. Titles and content headings (h1–h4) use **Roboto Slab** (slab serif). This is automatic — no frontmatter or class needed.

Body font size is `0.95rem` with `line-height: 1.55` on mobile, scaling to `1rem` on desktop (uniform with bits2bricks).

**Accent-colored elements.** Blockquotes, wiki-links, and inline footnotes all use the category accent color (rose). There is no per-type color distinction for blockquotes in threads — `tip`, `warning`, `danger`, and `keyconcept` all render in the same rose accent. Inline footnote references and notes render in italic.

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
- **Inline footnotes** (`^[explanation]`) for definitions and tangential context
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
