# Writing Essays

Editorial guide for essays — essays, analysis, and long-form arguments. These lessons accumulate from author feedback. Apply judgment, not rote rules.

For syntax features, see **[SYNTAX.md](../SYNTAX.md)**. For general authoring rules and cross-referencing, see **[README.md](../README.md)**.

---

### Frontmatter

Every essay starts with a YAML frontmatter block. Filenames use `<slug>.md`. The explicit `slug` field determines the public URL; `id` remains the stable internal identity. See [URL conventions](../../../../scripts/CONTENT-URLS.md).

Essays have several category-specific fields: `lang`, `hidden`, and `complexity`.

| Field | Required | Type | What it does |
|---|---|---|---|
| `id` | yes | string | **7-digit numeric ID**, quoted (`"5528103"`). Same number as in the filename. Used in URLs (`/blog/essays/5528103`) and as the primary key. |
| `displayTitle` | no | string | Human-readable title shown in UI. Falls back to `id`. **Sentence case** — capitalize the first word and proper nouns only, never title case. |
| `category` | yes | string | Must be `essays`. |
| `date` | yes | string | ISO 8601 (`YYYY-MM-DD`), quoted. Publication date. |
| `lang` | no | string | Language code (`en`, `es`). Defaults to `en`. Non-English essays show a small language chip on the card. |
| `thumbnail` | no | string | Hero image URL. Put the master in `media/articles/<id>/cover.<ext>`, run `npm run media -- push <id>`, and use the printed `https://cdn.infraphysics.net/articles/<id>/cover.webp`. Body figures go in `media/articles/<id>/figures/<slug>.<ext>` and are served as `articles/<id>/figures/<slug>.webp` (SVG keeps `.svg`). Unsplash urls still work. See [scripts/README.md](../../../../scripts/README.md#article-images). |
| `thumbnailAspect` | no | string | Crop ratio: `full` (default), `wide` (16/7), `banner` (16/4), `strip` (16/2). |
| `thumbnailShading` | no | string | Overlay: `heavy`, `light`, `none` (default). |
| `thumbnailFocus` | no | number | Vertical crop anchor for the banner, % from top: `0` = top, `50` = center (default), `100` = bottom. Only bites on cover-cropped aspects (`wide`/`banner`/`strip`), not `full`. Use it to keep the important part of a tall image in frame. |
| `shareCard` | no | string | Unset = the share card (og:image) is the generic essay card on the paper ground. `cover` puts the article's own cover under it, shaded, with the same faint grid on top. The card is photographed at commit time (pre-commit hook) or with `npm run og`. |
| `thumbnailWidth` | no | string | Unset = the hero is as wide as the reading column, aligned with the text margins. `full` makes it wider, edge to edge with the page padding. With `thumbnailAspect: full` the image is always shown whole. |
| `thumbnailZoom` | no | number | Scale factor for the card thumbnail in the essays grid (`1.15` = 15% zoom in). Use it when the card crop shows the image background. Unset = `1`. |
| `subtitle` | no | string | Below the title in the article header, and the card and meta copy. Two short sentences at most, see *Subtitles* below. |
| `tags` | yes | string[] | Central concepts resolving to Wiki notes; feed discovery and Home's Field of View. See [tagging policy](../README.md#tags-and-the-home-map). |
| `complexity` | no | number | Difficulty rating (1–10). Used for sorting/filtering. |
| `featured` | no | boolean | Shows in "Latest Work" on home page. |
| `related` | no | string[] | Post IDs (quoted numerics) for the "Related" section. |
| `hidden` | no | boolean | If `true`, essay is excluded from listings. Defaults to `false`. |
| `theme` | no | string | `light` or `dark`. Forces that theme when the essay is opened (for example a banner with a baked-in frame that only works on white). The reader can still toggle afterwards. Unset = the blog zone preference. |
| `author` | no | string | Defaults to `Yago Mendoza`. |

**Subtitles.** An essay subtitle is one or two short sentences, never a summary of the sections, and it has to tell a reader who sees only the card what the piece is about: *AI is changing what a successor can learn from a company's mistakes, and what a competitor may be able to reconstruct* names the actors and the tension in one line. A quoted line from the essay (*His competitors know what he knows.*) reads well under the title but says nothing to someone browsing, so it only works paired with a sentence that states the subject. What went wrong before that rule: *What a veteran's judgment leaves behind in the record, how much of it a competitor can now rebuild without a leak, and what a successor needs in order to inherit the rest* packed three sections into one sentence and read as a table of contents. If the subtitle needs a comma-separated list to be complete, it is describing the essay instead of opening it. Projects and Bits2Bricks do the opposite (technical and exact, one sentence, STYLE.md rule 6); the essay subtitle is the one place where a literal line from the text beats a catalogue entry.

**No `lead`.** Essays carry a title and a subtitle, nothing else above the body. Anything a deck paragraph would say belongs in the first paragraphs of the essay itself, in its own voice.

**Not used in essays:** `description` (the `subtitle` doubles as card and meta copy), `tldr`, `status`, `technologies`, `github`, `demo`.

**Example:**

```yaml
---
id: "5528103"
displayTitle: "OpenClaw and the keys to your kingdom"
category: essays
date: "2026-02-07"
lang: en
thumbnail: https://cdn.infraphysics.net/articles/5528103/cover.webp
thumbnailAspect: wide
subtitle: "AI agents, system access, and a trademark claim that backfired."
tags: [ML, security, agent]
complexity: 4
featured: true
related: ["7463810", "8888777"]
hidden: false
---
```

---

### Typography

Essays use **Lora** for body text, list items and the subtitle (italic), and **Newsreader** for the title and the content headings. Body is `1.06rem` with `line-height: 1.8` on a `40rem` reading column; the title is Newsreader 400 at up to `3.6rem`; the opening paragraph gets a drop cap in the category accent; the meta row (date, author, views, hearts, share) is set in the body serif with no pills or dot separators. All of it is automatic (no frontmatter or class needed) and lives in one block at the end of `src/styles/article-layout.css`. These choices came out of the style lab (`/r6` body and subtitle, `/r14` title).

Body font size is `0.95rem` with `line-height: 1.55` on mobile, scaling to `1rem` on desktop (uniform with bits2bricks).

**Accent-colored elements.** Blockquotes, wiki-links, and inline footnotes all use the category accent color (rose). There is no per-type color distinction for blockquotes in essays — `tip`, `warning`, `danger`, and `keyconcept` all render in the same rose accent. Inline footnote references and notes render in italic.

**Boxes are plates, the lifted paragraph is a voice.** In essays only, a typed box renders as a tinted plate that bleeds past the column edges (rose wash, slight radius, padding on all four sides; a hairline in dark). That look says *object apart*: use boxes for what the reader may skip and what sits outside the thread (an aside, a precision, a warning). For the one paragraph the reader must not skip and that belongs to the thread, use `{lift}` instead: a change of voice, never a box. The two never overlap. Bits2Bricks keeps the flat in-column box.

---

### Voice & tone

**Think like George Hotz, write like a person.** The author's voice is someone who thinks in systems, is blunt, and doesn't perform coolness. The text should read like a smart person thinking out loud — messy, abrupt, with the emphasis landing because the observation is true, not because the sentence was engineered to sound good. Hotz doesn't workshop punchlines. He states things and moves on.

**Transitions are original thoughts, not bridges.** When moving between topics, the transition should be whatever thought the author's brain would actually produce in that moment — a question that occurs to them, an implication they can't ignore, a "wait, so if X then what about Y." Never use empty rhetorical bridges ("Here's where it gets interesting", "And that brings us to", "Result?"). If you can't think of a genuine thought that connects two ideas, just start the next idea. Abrupt is better than fake smooth.

**Personal rawness is good, performed vulnerability is not.** One or two real details (too many screens, 3am, no sunlight) land because they're specific. Four stacked self-deprecating details in a row ("alone, too many monitors, vitamin D deficient, dopamine loops from a terminal") become a comedy routine — a writer constructing a relatable self-portrait for effect. Keep the rawness, lose the performance.

**Endings stop.** Hotz's real endings are abrupt or trail into the next idea; the general rule (no summary, no engineered kicker) is [VOICE.md](../VOICE.md), *The seam*.

---

### Blockquote labels

Typed boxes have no title, in essays or anywhere else ([STYLE.md](../STYLE.md) rule 4). The compiler does not print the type's name and `{bkqt/type|Label}` is a build error. If a box needs a lead, make it the first sentence of the box, in italics when it has to stand apart: `*What's actually on your disk.*` followed by the text. The type (`note`, `tip`, `warning`, `danger`, `keyconcept`) only carries the semantics.

---

### Structure

**Dense monologue over sectioned cliffhangers.** Essays work best as a continuous flow of thought, not as sections with dramatic reveals. Avoid headings that function as cliffhangers ("the canary", "it knows you're watching"). If the piece is dense enough, the reader follows the thought without needing signposts. Headings are optional — use them only when the topic genuinely shifts and the reader needs a breath, not for dramatic pacing.

**Headings name the mechanism** ([VOICE.md](../VOICE.md), *Headings*), and essays use them only when the topic genuinely shifts.

**Technical depth goes to wikinotes.** When an essay touches a technical concept that needs more than a sentence of explanation (activation steering procedures, SAE architecture, vector arithmetic), extract the definition into a wikinote and link it from the thread. The thread keeps the narrative and the "so what." The wikinote keeps the "how it works."

**One article or two.** Before polishing, ask whether the draft is one piece that moves in one direction with enough pull to carry a reader, or two or three pieces forced into one. The symptom is a theme that belongs to the argument but suddenly takes the spotlight for a few paragraphs and then vanishes: it is there to add information or to look clever, and in its own article it would plant a seed that could grow branches. When a theme surfaces and does not come back, either cut it down to the sentence the argument needs or take it out and give it its own file in `_studio/inbox/`. The same audit asks whether one or two themes should shrink rather than leave.

**Insight after insight.** Write to make the reader understand, at the length each thought needs, with no constraint of equal section lengths and no *First:*, *Third:* scaffolding or stack of headings that breaks the read. The failure mode is a text that only exposes facts and sounds like journalism; the target is logic that advances, one insight leading to the next, readable in one sitting and feeling shorter than it is. Nothing already said gets lost in the process; it gets carried.

---

### Context annotations in essays

In essays, the article `date` is the publication date. Context annotations (`>>`) are strictly **post-publication** — they represent something that happened or was discovered after the article went live. Never use a ctx with a date before the article's `date`.

**Do not use an opening ctx.** Unlike projects (which use a ctx after the intro as a diary entry), essays should not start with a context annotation. The intro text stands on its own. A ctx right after the intro adds nothing — if the comment is worth making, put it in the intro itself.

**When to use ctx in essays:**
- A genuinely relevant update that emerged after publishing (correction, new development, follow-up discovery).
- A cross-reference to a related project or bits2bricks article, with an explicit link to that article. Example: `>> 26.03.10 - built this into a working prototype: [[projects/my-project|project article]]`.

**When not to use ctx in essays:**
- As decoration or commentary on the article's own content.
- For anything that could be said in the body text instead.

**How to write one:** short and plain, whatever the thought behind it (STYLE.md rule 10). The body of the essay may be elaborate; the note in the margin never is.

---

### Emphasis patterns

Essays lean heavily on:
- **Bold text** (`**key claims**`) for terms and conclusions worth retaining
- **Inline footnotes** (`^[explanation]`) for definitions and tangential context
- **Typed blockquotes** for core arguments that need visual weight
- **One lifted paragraph** (`{lift}` … `{/lift}`, see [SYNTAX.md](../SYNTAX.md)) for the paragraph the essay has been building towards: display italic, slightly larger, no box. At most one per essay; it is a change of voice, not an aside.
- **Bold** for proper nouns and terms introduced for the first time

---

### What not to do

**Kill list, essay-specific.** The global one is [STYLE.md](../STYLE.md) rule 11; reframes are rule 9; tricolons, mic drops and bumper stickers are VOICE.md, *Tics that survive once*. What essays add:

- **Anadiplosis (echo transitions).** "Because they need time. Time to let the partners..." Repeating a word across a sentence boundary for rhetorical effect. Just say it once.
- **Staccato noun lists for gravitas.** "Operating systems. Middleware. Servers." as standalone dramatic fragments. List them inline or use a single phrase ("the infrastructure stack").
- **Words that signal performed casualness.** "vibes", "rent-free", "lives in my head", "changed everything", "let that sink in." Internet-speak that sounds casual but is actually a rhetorical device.

**The core anti-pattern:** rhetorical scaffolding. The ideas are good but packaged in structures that reveal a writer constructing effect rather than a person thinking. Hotz's real power comes from not caring whether it sounds powerful. If a sentence feels engineered, it probably is.
