# Writing for InfraPhysics

Markdown in this directory is compiled at build time with marked, Shiki and a deliberately small set of structural extensions.

## Source of truth

| Need | Document |
|---|---|
| Supported authoring syntax | [SYNTAX.md](SYNTAX.md) |
| Compiler, cache, outputs and validation | [scripts/README.md](../../../scripts/README.md) |
| Wikinote operations | [wikinotes/README.md](wikinotes/README.md) |
| Project voice and schema | [projects/README.md](projects/README.md) |
| Essay voice and schema | [essays/README.md](essays/README.md) |
| Technical voice and schema | [bits2bricks/README.md](bits2bricks/README.md) |
| How a wikinote is written (shape, tone, names, size, allowed syntax) | [wikinotes/STYLE.md](wikinotes/STYLE.md) |
| Which syntax feature applies in which category | [SYNTAX.md, *Where each feature applies*](SYNTAX.md#where-each-feature-applies) |
| Images and standalone HTML pages | [Attachments](#attachments), below |
| Editorial voice audit and photographic language | `_generation/EDITORIAL-RUBRIC.md`, `_generation/VISUAL-RUBRIC.md` (local, not versioned; ask the author if the folder is missing) |

Do not document grammar in category guides. `SYNTAX.md` is the single syntax reference.

Read in this order: this file, then `STYLE.md`, then `SYNTAX.md` (grammar and the per-category table), then the guide of the category you are writing in. For a wikinote, `wikinotes/STYLE.md` replaces the category guide.

## Content boundaries

- **Projects** document things built: decisions, implementation, evidence and lessons.
- **Essays** make an argument or tell a technical narrative.
- **Technical** explains how something works or how to build it.
- **Wikinotes** define one atomic concept and connect it to the knowledge graph.

Prefer cross-document references over repeating material. Use `[[projects/id|label]]`, `[[essays/id|label]]`, `[[bits2bricks/id|label]]` or a Wiki UID/address as documented in `SYNTAX.md`.

## Front matter

Every page starts with YAML front matter. Category-specific fields and examples live in the category README.

Quote dates and strings containing YAML-sensitive punctuation, especially `: `, `#`, `[`, `{`, `>`, `|`, `*` or `&`. An accidentally parsed object can reach React as content and cause a render error.

For projects, `tldr` is one quoted paragraph:

```yaml
tldr: "A compact statement of the result and why it matters."
```

The `description` is card/metadata copy. Body text before the first heading is the article introduction. `tldr`, introduction, typed notes and dated `>>` annotations serve different purposes and should not duplicate one another.

## Headings

The title comes from the frontmatter; the body never repeats it. Inside the body, `#` is a section, `##` a subsection, `###` a third level used sparingly, and nothing deeper. Every article on the site starts at `#`; do not start at `##` to make headings smaller, because the renderer sizes headings by tag. Wikinotes carry no headings at all (`## Interactions` is reserved for the compiler). Headings are sentence case and are never numbered by hand unless the number is part of the name.

## Attachments

**Images.** Put the master where its kind lives: `media/articles/<id>/cover.<ext>` for the hero, `media/articles/<id>/figures/<slug>.<ext>` for a body figure, `media/site/<path>/<slug>.<ext>` for page art. `media/` is gitignored; `npm run media -- push <id|site>` (or the dev server, a few seconds after you save) encodes and uploads to the CDN and records the object in `src/data/media-manifest.json`. Reference the CDN url in the article (`https://cdn.infraphysics.net/articles/<id>/figures/<slug>.webp`; SVG keeps `.svg`), never a `/articles/...` path, never a version query (the build stamps `?v=` itself). Commands and edge cases: [scripts/README.md](../../../scripts/README.md#article-images). What an image should look like: `_generation/VISUAL-RUBRIC.md`.

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
