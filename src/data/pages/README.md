# Writing for InfraPhysics

Markdown in this directory is compiled at build time with marked, Shiki and a deliberately small set of structural extensions.

## Source of truth

| Need | Document |
|---|---|
| Supported authoring syntax | [SYNTAX.md](SYNTAX.md) |
| Compiler, cache, outputs and validation | [scripts/README.md](../../../scripts/README.md) |
| Fieldnote operations | [fieldnotes/README.md](fieldnotes/README.md) |
| Project voice and schema | [projects/README.md](projects/README.md) |
| Essay voice and schema | [threads/README.md](threads/README.md) |
| Technical voice and schema | [bits2bricks/README.md](bits2bricks/README.md) |

Do not document grammar in category guides. `SYNTAX.md` is the single syntax reference.

## Content boundaries

- **Projects** document things built: decisions, implementation, evidence and lessons.
- **Essays** make an argument or tell a technical narrative.
- **Technical** explains how something works or how to build it.
- **Fieldnotes** define one atomic concept and connect it to the knowledge graph.

Prefer cross-document references over repeating material. Use `[[projects/id|label]]`, `[[threads/id|label]]`, `[[bits2bricks/id|label]]` or a Wiki UID/address as documented in `SYNTAX.md`.

## Front matter

Every page starts with YAML front matter. Category-specific fields and examples live in the category README.

Quote dates and strings containing YAML-sensitive punctuation, especially `: `, `#`, `[`, `{`, `>`, `|`, `*` or `&`. An accidentally parsed object can reach React as content and cause a render error.

For projects, `tldr` is one quoted paragraph:

```yaml
tldr: "A compact statement of the result and why it matters."
```

The `description` is card/metadata copy. Body text before the first heading is the article introduction. `tldr`, introduction, typed notes and dated `>>` annotations serve different purposes and should not duplicate one another.

## Editorial rules

- Use sentence case for titles, headings, labels and table headers.
- Start prose list items with a capital letter unless the first token is conventionally lowercase code.
- Use typed notes only for substantial material; use a footnote for a brief aside.
- Use tables for structured factual comparison, not rhetorical contrast.
- Avoid stacking isolated context annotations; group related dated updates.
- Keep project theory brief and link to a fieldnote or Technical article when it needs room.
- Do not use decorative syntax, author-controlled colours or redundant variants of standard Markdown.

## Build

```bash
npm run content
npm run content:fix
npm run build
```

Generated JSON and HTML are outputs, not authoring sources. Compilation details belong in `scripts/README.md`; fieldnote validation and migration workflows belong in `fieldnotes/README.md`.
