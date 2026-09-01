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
| `displayTitle` | no | string | Human-readable title shown in UI. Falls back to `id`. **Sentence case** — capitalize the first word and proper nouns only, never title case. |
| `category` | yes | string | Must be `threads`. |
| `date` | yes | string | ISO 8601 (`YYYY-MM-DD`), quoted. Publication date. |
| `lang` | no | string | Language code (`en`, `es`). Defaults to `en`. Non-English threads show a small language chip on the card. |
| `thumbnail` | no | string | Hero image URL. Prefer Cloudflare R2 (`cdn.infraphysics.net`) or Unsplash. |
| `thumbnailAspect` | no | string | Crop ratio: `full` (default), `wide` (16/7), `banner` (16/4), `strip` (16/2). |
| `thumbnailShading` | no | string | Overlay: `heavy`, `light`, `none` (default). |
| `thumbnailFocus` | no | number | Vertical crop anchor for the banner, % from top: `0` = top, `50` = center (default), `100` = bottom. Only bites on cover-cropped aspects (`wide`/`banner`/`strip`), not `full`. Use it to keep the important part of a tall image in frame. |
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

**Think like George Hotz, write like a person.** The author's voice is someone who thinks in systems, is blunt, and doesn't perform coolness. The text should read like a smart person thinking out loud — messy, abrupt, with the emphasis landing because the observation is true, not because the sentence was engineered to sound good. Hotz doesn't workshop punchlines. He states things and moves on.

**Transitions are original thoughts, not bridges.** When moving between topics, the transition should be whatever thought the author's brain would actually produce in that moment — a question that occurs to them, an implication they can't ignore, a "wait, so if X then what about Y." Never use empty rhetorical bridges ("Here's where it gets interesting", "And that brings us to", "Result?"). If you can't think of a genuine thought that connects two ideas, just start the next idea. Abrupt is better than fake smooth.

**Personal rawness is good, performed vulnerability is not.** One or two real details (too many screens, 3am, no sunlight) land because they're specific. Four stacked self-deprecating details in a row ("alone, too many monitors, vitamin D deficient, dopamine loops from a terminal") become a comedy routine — a writer constructing a relatable self-portrait for effect. Keep the rawness, lose the performance.

**Let facts land on their own.** A strong number or a concrete finding doesn't need an abstract restatement after it. "27 years. Nobody found it." moves forward. "27 years, hiding in plain sight while humans walked past it for three decades" is a writer admiring their own sentence. If the reader already felt it land, move on or add a *new* detail.

**Endings should stop, not land.** Paragraphs end when the thought is done. Not with a mic-drop, not with an engineered kicker, not with a bumper sticker. Real writing doesn't resolve neatly. Hotz's real endings tend to be either abrupt (he just stops) or trail into the next idea.

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

**Dense monologue over sectioned cliffhangers.** Threads work best as a continuous flow of thought, not as sections with dramatic reveals. Avoid headings that function as cliffhangers ("the canary", "it knows you're watching"). If the piece is dense enough, the reader follows the thought without needing signposts. Headings are optional — use them only when the topic genuinely shifts and the reader needs a breath, not for dramatic pacing.

**Technical depth goes to fieldnotes.** When a thread touches a technical concept that needs more than a sentence of explanation (activation steering procedures, SAE architecture, vector arithmetic), extract the definition into a fieldnote and link it from the thread. The thread keeps the narrative and the "so what." The fieldnote keeps the "how it works."

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
- **Bold text** (`**key claims**`) for terms and conclusions worth retaining
- **Inline footnotes** (`^[explanation]`) for definitions and tangential context
- **Typed blockquotes** for core arguments that need visual weight
- **Bold** for proper nouns and terms introduced for the first time

---

### What not to do

**Kill list (thread-specific, in addition to the global kill list in EDITORIAL-RUBRIC.md):**

- **"Not X. Y." inversions.** "That's not alignment. That's alignment faking." / "Not because it's broken — because it's too good." This is the single most overused rhetorical structure in tech blog posts. One per article absolute max, and only if the reframe adds real information. Prefer stating the conclusion directly.
- **Tricolons and stacked parallel clauses.** "Not touching the weights. Not touching the attention heads. Just intercepting the bus." Three beats for dramatic escalation is speechwriting, not thinking. Compress into one sentence or vary the structure.
- **Aphorisms and bumper stickers.** "Same muscle, different jersey." / "The model broke the scoreboard." If a sentence sounds like it was designed to be screenshotted and shared, it's too polished. State the point plainly.
- **Anadiplosis (echo transitions).** "Because they need time. Time to let the partners..." Repeating a word across a sentence boundary for rhetorical effect. Just say it once.
- **Staccato noun lists for gravitas.** "Operating systems. Middleware. Servers." as standalone dramatic fragments. List them inline or use a single phrase ("the infrastructure stack").
- **Empty intensifiers and hollow closers.** "Result?" / "Here's where it gets under your skin." / "tells you everything about what they're bracing for." These announce that something important is coming instead of just saying the important thing.
- **Words that signal performed casualness.** "vibes", "rent-free", "lives in my head", "changed everything", "let that sink in." Internet-speak that sounds casual but is actually a rhetorical device.
- **Em dash parentheticals that add nothing.** Long dashes used to insert asides that don't contain new information or interesting observations. If the aside isn't worth its own sentence, cut it.

**The core anti-pattern:** rhetorical scaffolding. The ideas are good but packaged in structures that reveal a writer constructing effect rather than a person thinking. Hotz's real power comes from not caring whether it sounds powerful. If a sentence feels engineered, it probably is.
