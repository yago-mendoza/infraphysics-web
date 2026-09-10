# Minimal editorial syntax

InfraPhysics uses GitHub-Flavored Markdown plus a small set of structural extensions. Projects, Essays, Technical and Wiki notes share this language. Category differences belong to presentation, not grammar.

## Principles

- One syntax per meaning.
- Markdown handles ordinary prose.
- Custom syntax exists only for structures Markdown cannot express clearly.
- Headings are never numbered automatically.
- Colour is not an authoring primitive. The one exception is accent text, which takes the article accent and never a chosen colour. Category identity belongs to links and surrounding UI.
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

Single underscores follow Markdown and therefore mean italic. Horizontal rules, chosen colours (hex or named), shout text and dot separators are not supported; the only colour an author can apply is the article accent, through `{accent:word}` (see Chemical and mathematical forms).

## Headings and exact links

`#` is a section, `##` a subsection, `###` a third level used sparingly; nothing deeper. The article title comes from the frontmatter, so the body starts at `#` and never repeats the title. Do not start an article at `##`: headings are sized by tag, and the index only normalises depth. Wikinotes have no headings (`## Interactions` is reserved).

Rendered headings receive stable anchors. Hovering a heading reveals a chain control on its left. Activating it copies the exact URL to that section. If numbering is wanted, write it manually in the heading.

## Typed notes

```text
{bkqt/note}
Substantial Markdown content.
{/bkqt}
```

Supported types are `note`, `tip`, `warning`, `danger` and `keyconcept`. All types share one visual treatment and inherit the article category accent; the type only preserves semantic meaning. Typed notes have **no title**: the compiler never prints the type's name, and the old `{bkqt/note|Label}` form is rejected (a build error in articles, a `[SYNTAX] BKQT_LABEL` warning in wikinotes). If the box needs a lead, write it as its first sentence, in italics if it must stand apart ([STYLE.md](STYLE.md) rule 4). Quotations use ordinary Markdown; pullquotes do not exist.

```text
> Quoted text.
>
> — Attribution
```

## Lifted paragraph

```text
{lift}
One paragraph of prose.
{/lift}
```

One paragraph the reader should be drawn to, set apart by type alone: in essays it is composed in the display italic, a touch larger and in the heading colour, with more air above and below. No rule, no box, no background: it reads as a change of voice, not as an aside. The fence holds exactly one paragraph of inline Markdown (footnotes, links and emphasis work; lists, math and images do not) and, like every fence, needs a blank line before the opening tag and after the closing one. It is not a pullquote: the text appears once, in its place. Use it at most once per article, for the paragraph the piece has been building towards. Outside essays it renders as a plain paragraph.

## Parameter sheets

```text
{params}
# Geometry
\(A_1, A_2\) = \(1.54\times10^{-2}\,\mathrm{m^2}\) # Tank cross-section
\(k_{pump}\) = \(10^{-3}\) # Pump gain

# Limits
\(h_{max}\) = \(0.6\,\mathrm{m}\)
`--strict`
{/params}
```

A parameter sheet sets symbols, constants, fields or flags like a small configuration file: monospace on the code surface, `key = value  # note`, the value in the category accent, columns aligned across rows. It replaces the three-column *symbol / meaning / value* table, which is not allowed for that purpose any more.

Grammar, one entry per line:

- `key = value # note`: the first ` = ` (spaces required) splits key from value, the last ` # ` splits value from note. Because the spaces are mandatory, `=` or `#` inside math or code never cut a line.
- `key = value` and a bare `key` (a flag, a name) are both valid; the note is optional.
- `# Group`: a line that starts with `# ` is a group heading across the sheet.
- A blank line opens a gap between groups.
- Every part accepts inline Markdown, `\( … \)` math, backticks and wiki-links.
- `{params/2}` lays the rows out two per line on wide screens, for long lists of short entries.

Blank lines around the block, as with every fence. Wikinotes may use it too, and creatively: physical constants, protocol fields, port numbers, CLI flags, thresholds, unit conversions, anything that is a list of *name, value, remark*.

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

Footnote numbering restarts per paragraph. The marker goes before the sentence's closing period, never after it, and the text inside is a complete sentence with its own period (`STYLE.md` rule 8). This is the only footnote form: `[^1]` reference footnotes are not supported.

## Chemical and mathematical forms

| Meaning | Syntax |
|---|---|
| Superscript | `{^:2}` |
| Subscript | `{v:2}` |
| Keyboard key | `{kbd:Ctrl+C}` |
| Inline math | `\(E = mc^2\)` |
| Block math | `{math}` … `{/math}` on separate lines, with a blank line before `{math}` and after `{/math}` |

`{accent:word}` sets a word or a short phrase in the article accent (rose in essays, lime in projects, blue in Bits2Bricks) and changes nothing else: no weight, no italic, no background. It is a signpost, not emphasis: use it for a term the reader must be able to spot on the page (a label the text refers back to, a word that names a reading mode), at most a few times per article, and never inside a heading, where inline formatting is stripped. There is no way to choose a colour; `{accent:…}` is the whole colour vocabulary.

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

Use ordinary GFM tables, and only for real tables: several columns whose rows are compared against each other (a model with its relation and its component, a fault mode against four residual bits, a method against what it buys and what it costs). A list of *name, value, remark* is not a table; it is a [parameter sheet](#parameter-sheets).

```text
| Model | Relation | Component |
|---|---|---:|
| \(M_1\) | \(\dot V_1=Q_p-Q_{12}\) | Tank 1 balance |
| \(M_2\) | \(V_1=A_1h_1\) | Tank 1 geometry |
```

Every table on the site is set the same way and there is no per-table styling: no filled header bar, the column titles in small uppercase monospace in the category accent over a single rule, hairline rows, compact body text (0.86rem), the first column flush left and the last flush right. The point of the small type is that a four or five column table fits the reading column without horizontal scroll. Align numeric columns to the right with `---:`. Keep header words short (one or two words); the header is a label, not a sentence. A table that still needs to scroll is usually two tables, or a sheet, or prose. Wiki tables are not allowed (see [wikinotes/STYLE.md](wikinotes/STYLE.md)).

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

>> 26.09.02 [title: A year on] - An update with an optional short title.
```

They remain a first-class primitive for project history and post-publication corrections.

Each card is a native disclosure, closed initially, with no excerpt before opening. The optional `[title: ...]` attribute follows the date; omit it for `A personal note`. Use a few words of plain text (no Markdown or closing brackets). The closed card already shows the avatar, title and date of the first entry next to *Read note*; opening slides that header down a little and reveals the text beside it, in the wider right column, with a short transition. Consecutive annotations share a card: the following entries show their own avatar, title and date beside their text. No relative date is shown. On narrow screens the header stacks above the content. Links in the content keep their normal behavior.

## Where each feature applies

The grammar is one; the subset each category may use is not. Yes means allowed as documented above, a phrase means allowed with a condition, no means never.

| Feature | Projects | Essays | Bits2Bricks | Wikinotes |
|---|---|---|---|---|
| Headings `#`, `##`, `###` | yes | yes, sparingly, never as cliffhangers | yes | no |
| Typed boxes `{bkqt/type}` | yes (tip by default; warning/danger only for real reader risk) | yes | yes | at most one keyconcept per note |
| Box labels `{bkqt/type\|Label}` | no | no | no | no (dropped, build warning) |
| Lifted paragraph `{lift}` | plain paragraph | yes, at most one per essay | plain paragraph | no |
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


Content URL resolution: identity-based Wiki and cross-document references emit the current readable URL. File names and URL history are documented in [CONTENT-URLS.md](../../../scripts/CONTENT-URLS.md).
