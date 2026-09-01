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

Rendered headings receive stable anchors. Hovering a heading reveals a chain control on its left. Activating it copies the exact URL to that section. If numbering is wanted, write it manually in the heading.

## Typed notes

```text
{bkqt/note|Optional label}
Substantial Markdown content.
{/bkqt}
```

Supported types are `note`, `tip`, `warning`, `danger` and `keyconcept`. Labels are optional. All types share one visual treatment and inherit the article category accent; the type only preserves semantic meaning. Quotations use ordinary Markdown; pullquotes do not exist.

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
| Essay | `[[threads/id\|display]]` | Essay category link and document icon |
| Technical article | `[[bits2bricks/id\|display]]` | Technical category link and document icon |
| External reference | `[[https://example.com\|display]]` | Neutral underline and external icon |

Ordinary Markdown links also work. In-page anchors have no destination icon. Unresolved Wiki targets fail validation and have no visible unresolved state.

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
| Block math | `{math}` … `{/math}` on separate lines |

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
