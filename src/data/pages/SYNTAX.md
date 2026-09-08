# Minimal editorial syntax

InfraPhysics uses GitHub-Flavored Markdown plus a small set of structural extensions. Projects, Essays, Technical and Wiki notes share this language. Category differences belong to presentation, not grammar.

## Principles

- One syntax per meaning.
- Markdown handles ordinary prose.
- Custom syntax exists only for structures Markdown cannot express clearly.
- Headings are never numbered automatically.
- Colour is not an authoring primitive. Category identity belongs to links and surrounding UI.
- Wiki supports the same content primitives but never allows lateral breakout.

## Standard Markdown

| Meaning | Syntax |
|---|---|
| Heading | `# Heading`, `## Heading` |
| Bold | `**text**` |
| Italic | `*text*` |
| Bold italic | `***text***` |
| Strikethrough | `~~text~~` |
| Inline code | `` `code` `` |
| Code block | Triple backticks with an optional language |
| Internal/in-page link | `[text](/path)` or `[text](#heading)` |
| External link | `[text](https://example.com)` |
| Bullet list | `- Item` |
| Numbered list | `1. Item` |
| Standard quote | `> Quoted text` |

Single underscores follow Markdown and therefore mean italic. Horizontal rules, author-controlled colours, shout text, dot separators and accent-text delimiters are not supported.

## Headings and exact links

`#` is a section, `##` a subsection, `###` a third level used sparingly; nothing deeper. The article title comes from the frontmatter, so the body starts at `#` and never repeats the title. Do not start an article at `##`: headings are sized by tag, and the index only normalises depth. Wikinotes have no headings (`## Interactions` is reserved).

Rendered headings receive stable anchors. Hovering a heading reveals a chain control on its left. Activating it copies the exact URL to that section. If numbering is wanted, write it manually in the heading.

## Typed notes

```text
{bkqt/note|Optional label}
Substantial Markdown content.
{/bkqt}
```

Supported types are `note`, `tip`, `warning`, `danger` and `keyconcept`. Labels are optional. All types share one visual treatment and inherit the article category accent; the type only preserves semantic meaning. In wikinotes typed notes take no label: a label after the pipe is dropped by the compiler and reported as a `[SYNTAX] BKQT_LABEL` warning (see [wikinotes/STYLE.md](wikinotes/STYLE.md)). Quotations use ordinary Markdown; pullquotes do not exist.

```text
> Quoted text.
>
> — Attribution
```

## Structured references

| Destination | Syntax | Rendering |
|---|---|---|
| Wiki concept | `[[uid]]` or `[[uid\|display]]` | Reference icon and preview |
| Project | `[[projects/id\|display]]` | Lime category link and document icon |
| Essay | `[[essays/id\|display]]` | Essay category link and document icon |
| Technical article | `[[bits2bricks/id\|display]]` | Technical category link and document icon |
| External reference | `[[https://example.com\|display]]` | Neutral underline and external icon |
| Article playground (own HTML page) | `[[playgrounds/<article-id>/<name>\|display]]` | Accent-coloured link and document icon, opens `/playgrounds/<article-id>/<name>.html` in a new tab |

Ordinary Markdown links also work. In-page anchors have no destination icon. Unresolved Wiki targets fail validation and have no visible unresolved state.

Wiki links are never bold. `**[[uid|label]]**`, a bold span that contains a Wiki link, or `**` inside the label all fail the build. Bold the surrounding words instead: `[[uid|Attention]] **blocks**`.

Custom-display references also work inside tables; the compiler protects their internal pipe before GFM determines the cells.

## Footnotes

```text
A statement^[A paragraph-scoped clarification.].
```

Footnote numbering restarts per paragraph.

## Chemical and mathematical forms

| Meaning | Syntax |
|---|---|
| Superscript | `{^:2}` |
| Subscript | `{v:2}` |
| Keyboard key | `{kbd:Ctrl+C}` |
| Inline math | `\(E = mc^2\)` |
| Block math | `{math}` … `{/math}` on separate lines, with a blank line before `{math}` and after `{/math}` |

A block fence (`{math}` … `{/math}` or a typed note `{bkqt/…}` … `{/bkqt}`) placed directly between list items or paragraphs, with no blank line before the opening tag or after the closing one, ends the list and leaves everything after it as literal text: bold, links and further bullets stop rendering. Always isolate these fences with blank lines.

## Lists

Bullet, decimal and nested lists use standard Markdown. Two-space authored nesting is normalized by the compiler to a consistent level.

Alphabetical lists use sequential letters:

```text
a. First
b. Second
c. Third
```

Uppercase `A.`, `B.`, `C.` produces an uppercase alphabetical list.

Definition lists use:

```text
- TERM:: Description
- OTHER TERM:: Description
```

Every line in the contiguous block must use `::`.

## Tables

Use ordinary GFM tables. Compact tables size to their content. Wide tables may exceed the prose column until a viewport-safe maximum, then scroll horizontally. Wiki tables remain inside the Wiki column.

## Images

Body images use one composition:

One image:

```text
![Alt|Optional caption](url "center")
![Alt|Optional caption](url "full")
```

`center` stays within the reading column. `full` may break out in articles. Both remain contained in Wiki. Clicking any body image opens a dismissible lightbox.

Two images side by side:

```text
![First image|First caption](first-url "pair")
![Second image|Second caption](second-url "pair")
```

The two `pair` images must be consecutive. They share one balanced row on larger screens and stack vertically on mobile. Do not use legacy `left` or `right` image positions.

Front matter controls the article hero independently through `thumbnail`, `thumbnailAspect`, `thumbnailShading` and `thumbnailFocus`.

## Context annotations

```text
>> 26.08.31 - A dated update.
>> 26.09.02 - A second consecutive line joins the same card.
```

They remain a first-class primitive for project history and post-publication corrections.

## Where each feature applies

The grammar is one; the subset each category may use is not. Yes means allowed as documented above, a phrase means allowed with a condition, no means never.

| Feature | Projects | Essays | Bits2Bricks | Wikinotes |
|---|---|---|---|---|
| Headings `#`, `##`, `###` | yes | yes, sparingly, never as cliffhangers | yes | no |
| Typed boxes `{bkqt/type}` | yes (tip by default; warning/danger only for real reader risk) | yes | yes | at most one keyconcept per note |
| Box labels `{bkqt/type\|Label}` | no | no | no | no (dropped, build warning) |
| Parameter sheets `{params}` | yes | rarely | yes, instead of symbol tables | yes (constants, ports, flags) |
| Context annotations `>>` | yes: the project diary, opening annotation required | post-publication only, never opening | post-publication corrections only | no |
| Inline footnotes | yes | yes | yes | yes |
| Inline and block math | yes | yes | yes | yes; a block closes its bullet |
| Images, single and pair | yes | yes | yes | no |
| Tables | factual comparison only | rarely | yes | no |
| Definition and alphabetical lists | yes | yes | yes | sparingly |
| Code blocks | yes | yes | yes | only a literal command |
| Wiki links `[[uid]]` | yes | yes | yes | yes |
| Cross-document links `[[projects/…]]` etc. | yes | yes | yes | only when the article is the source |
| Playground links `[[playgrounds/…]]` | yes | yes | yes | no |
| `tldr` frontmatter | yes, one quoted paragraph | no | yes | no |
| Tag chips above the title | no | no | yes (`tags`, `technologies`) | no |
| Double quotes in prose, arrows, em-dashes | no | no | no | no |
| Bold on a wiki link | no | no | no | no |

## Pipeline

1. Extract front matter.
2. Protect code and mathematics.
3. Process the small inline extension set and typed notes.
4. Restore protected code.
5. Process structured URLs, definitions, alphabetical lists and context annotations.
6. Normalize nested-list indentation.
7. Parse GFM Markdown.
8. Strip formatting from headings and highlight code.
9. Resolve wiki, cross-document and footnote references.
