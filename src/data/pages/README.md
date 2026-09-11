# Writing for InfraPhysics

Markdown in this directory is compiled at build time with marked, Shiki and a deliberately small set of structural extensions.

## Source of truth

| Need | Document |
|---|---|
| Hard writing rules, all categories | [STYLE.md](STYLE.md) |
| Supported authoring syntax | [SYNTAX.md](SYNTAX.md) |
| Compiler, cache, outputs and validation | [scripts/README.md](../../../scripts/README.md) |
| Wikinote operations | [wikinotes/README.md](wikinotes/README.md) |
| Project voice and schema | [projects/README.md](projects/README.md) |
| Essay voice and schema | [essays/README.md](essays/README.md) |
| Technical voice and schema | [bits2bricks/README.md](bits2bricks/README.md) |
| How a wikinote is written (shape, tone, names, size, allowed syntax) | [wikinotes/STYLE.md](wikinotes/STYLE.md) |
| Which syntax feature applies in which category | [SYNTAX.md, *Where each feature applies*](SYNTAX.md#where-each-feature-applies) |
| Images and standalone HTML pages | [Attachments](#attachments), below |
| Voice (how an article sounds once it obeys the hard rules) | [VOICE.md](VOICE.md) |
| Photographic language for every image | [VISUAL.md](VISUAL.md) |
| Article ideas and incoming material, never compiled | [_studio/inbox/README.md](../../../_studio/inbox/README.md) |

Do not document grammar in category guides. `SYNTAX.md` is the single syntax reference.

Read in this order: this file, then `STYLE.md`, then `SYNTAX.md` (grammar and the per-category table), then the guide of the category you are writing in. For a wikinote, `wikinotes/STYLE.md` replaces the category guide.

## Content boundaries

- **Projects** document things built: decisions, implementation, evidence and lessons.
- **Essays** make an argument or tell a technical narrative.
- **Technical** explains how something works or how to build it.
- **Wikinotes** define one atomic concept and connect it to the knowledge graph.

Prefer cross-document references over repeating material. Use `[[projects/id|label]]`, `[[essays/id|label]]`, `[[bits2bricks/id|label]]` or a Wiki UID/address as documented in `SYNTAX.md`.

## Semantic review of wikilinks

Choose body links through contextual editorial review, including when an LLM writes the article. Do not automatically turn matching words into links. Read the sentence in its paragraph and the destination note's actual body. Ask whether following the link would explain the concept used at that point. If it only explains a related concept, a different sense, or a narrower application absent from the passage, leave the words as plain text.

An explicit `[[uid|display text]]` records that editorial choice. Display text may differ grammatically from the note title, but must not conceal a change of meaning. Prefer naming a technical method explicitly when that makes the link clearer. Ordinary words and rhetorical comparisons do not need links merely because a matching Wiki entry exists. Fewer useful links are better than dense but misleading annotations.

For example, simulated event streams are not necessarily AI-generated training data: a note focused on recursive AI training is not a useful destination simply because it is titled *synthetic data*. Likewise, *simulator* in a comparison with a microscope can remain plain text. The compiler checks syntax and destinations; a successful build is not a semantic review. Field of View consumes the annotations after that review and must never determine which links get written.

## Front matter

Every page starts with YAML front matter. Category-specific fields and examples live in the category README.

### File names and public URLs

Articles and Wiki notes require an explicit `slug` in lowercase kebab-case and a matching `<slug>.md` filename. Keep `id`/`uid` stable. Optional `slugAliases` retains previous URL slugs; it is independent of concept `aliases`. Title or address changes leave the slug unchanged. See [content URL operations](../../../scripts/CONTENT-URLS.md) for safe renames and compatibility.

**Translated siblings.** A Spanish version of an article is a sibling file in the same folder, `<slug>.es.md`, with the same `slug`, `id` and `category`, `lang: es`, a `sourceHash` (first twelve hex characters of the SHA-256 of the English body, to detect a stale translation) and only the textual fields (`displayTitle`, `subtitle`, `description`, `tldr`, body). Everything structural (cover, date, tags, related, complexity, featured, hidden) is inherited from the English file. Any version, English or sibling, may carry `ai: true` when it was written with AI: the language control (gear and mobile menu) then shows the two-star mark after that language, and a language the page does not exist in is shown dimmed and struck through. The same hard rules apply in Spanish (STYLE.md), and a `[[uid]]` link takes a Spanish label (`[[uid|etiqueta]]`) because the wiki is English only. The build compiles the sibling like any post and folds it into the English post as `translations.es` (never a post of its own); the page is served at `/es/<canonical url>`, the same slug under a language prefix, and the build prints an `[I18N]` warning when `sourceHash` no longer matches the English body. `scripts/content-files.js` skips siblings when it builds route entries, so the filename check and the slug rules apply to the English file only. The wiki has no translated siblings.

### Tags and the Home map

Public projects, Bits2Bricks and essays require concept `tags`. They drive discovery and the build-time Field of View map, so select them from the article's actual subject, methods and application. Usually three to six central concepts are enough; avoid incidental mentions and editorial labels such as `personal` or `hype`. Each tag must resolve unambiguously to a Wiki name, alias or full address. Missing or ambiguous concepts fail compilation. Create a useful concept note when one is truly missing, following the Wiki workflow.

Keep the implementation stack in `technologies`. For the simulation project, `tags: [ML, time series, healthcare, simulation, evaluation]` describes its subject and method; `technologies: [Python, PyTorch, NumPy, JavaScript]` describes how it was built. A tool belongs in both only when the article substantially discusses the tool itself. Application tags do not establish clinical validity or production deployment.

Each article distributes its base weight across its tags. Distinct Wiki links in the body add a secondary contribution with diminishing returns and a 25% ceiling; repeating a link does not add weight. Both signals inherit the Wiki hierarchy: `time series` belongs to ML, so tagging or linking it relates the article to ML. Links between Wiki notes do not transfer coverage; the evidence must appear in the article itself. Extra tags redistribute the base weight rather than increasing it. Choose tags and links to represent the text faithfully, not to promote a domain in the map. Run `npm run content` after editing. A selected domain also needs a brief explanation of why it matters to the author in `src/data/field-of-view-context.json`; the build reports missing entries. See [AGENTS.md](AGENTS.md) for the authoring checklist and [Field of View](../../../scripts/FIELD-OF-VIEW.md) for the exact method.

Quote dates and strings containing YAML-sensitive punctuation, especially `: `, `#`, `[`, `{`, `>`, `|`, `*` or `&`. An accidentally parsed object can reach React as content and cause a render error.

For projects, `tldr` is one quoted paragraph:

```yaml
tldr: "A compact statement of the result and why it matters."
```

The `description` is card/metadata copy. Body text before the first heading is the article introduction. `tldr`, introduction, typed notes and dated `>>` annotations serve different purposes and should not duplicate one another.

## Headings

The title comes from the frontmatter; the body never repeats it. Inside the body, `#` is a section, `##` a subsection, `###` a third level used sparingly, and nothing deeper. Every article on the site starts at `#`; do not start at `##` to make headings smaller, because the renderer sizes headings by tag. Wikinotes carry no headings at all (`## Interactions` is reserved for the compiler). Headings are sentence case and are never numbered by hand unless the number is part of the name.

## Attachments

**Images.** Put the master where its kind lives: `media/articles/<id>/cover.<ext>` for the hero, `media/articles/<id>/figures/<slug>.<ext>` for a body figure, `media/site/<path>/<slug>.<ext>` for page art. `media/` is gitignored; `npm run media -- push <id|site>` (or the dev server, a few seconds after you save) encodes and uploads to the CDN and records the object in `src/data/media-manifest.json`. Reference the CDN url in the article (`https://cdn.infraphysics.net/articles/<id>/figures/<slug>.webp`; SVG keeps `.svg`), never a `/articles/...` path, never a version query (the build stamps `?v=` itself). Commands and edge cases: [scripts/README.md](../../../scripts/README.md#article-images). What an image should look like: [VISUAL.md](VISUAL.md).

**Standalone HTML pages.** An interactive table, a simulation or any self-contained page that belongs to one article goes in `public/playgrounds/<article-id>/<name>.html` (kebab-case, tracked in git, inline CSS and JS, no site assets). Link it with `[[playgrounds/<article-id>/<name>|text]]`, which renders in the article accent and opens in a new tab. Never put HTML under `media/`. Wikinotes do not link playgrounds.

## Editorial rules

Conventions, not the hard rules (those are in [STYLE.md](STYLE.md)):

- Use sentence case for titles, headings, labels and table headers.
- Start prose list items with a capital letter unless the first token is conventionally lowercase code.
- Use typed notes only for substantial material; use a footnote for a brief aside.
- Use tables for structured factual comparison, not rhetorical contrast.
- Avoid stacking isolated context annotations; group related dated updates.
- Keep project theory brief and link to a wikinote or Technical article when it needs room.
- Do not use decorative syntax, author-controlled colours or redundant variants of standard Markdown.

### Wikinote names

The `name` of a wikinote and the last segment of its `address` are the same string, written as the term appears in the middle of a sentence: common nouns in lowercase (`feedback loop`), proper nouns, products and acronyms in their own casing (`Kalman filter`, `RLHF`, `EtherNet/IP`). Shortest canonical term, no articles, singular unless the concept is inherently plural. The title, card and directory capitalise the first letter when rendering. Full rules, and everything else about how a note is written (shape, tone, body versus Interactions, equations, bold, paths, size, allowed syntax), in [wikinotes/STYLE.md](wikinotes/STYLE.md).

## Build

```bash
npm run content
npm run content:fix
npm run build
```

Generated JSON and HTML are outputs, not authoring sources. Compilation details belong in `scripts/README.md`; wikinote validation and migration workflows belong in `wikinotes/README.md`.
