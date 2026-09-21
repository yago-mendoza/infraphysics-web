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

A parenthesis that closes a heading is kept in the heading but set at the body size and weight, in the secondary colour: `# DPO (Direct Preference Optimization)` shows *DPO* as the title and the expansion as a quiet gloss after it. Use it for the expansion of an acronym, a unit, a date, a qualifier. The index shows the title alone (*DPO*), without the parenthesis, and the anchor is built from that title.

## Typed notes

```text
{bkqt/note}
Substantial Markdown content.
{/bkqt}
```

Supported types are `note`, `tip`, `warning`, `danger` and `keyconcept`. All types share one visual treatment and inherit the article category accent; the type only preserves semantic meaning. Typed notes have **no title syntax**: the compiler never prints the type's name, and the old `{bkqt/note|Label}` form is rejected (a build error in articles, a `[SYNTAX] BKQT_LABEL` warning in wikinotes). The lead is the first sentence of the box, in italics ([STYLE.md](STYLE.md) rule 4): `*RLHF is not human in the loop.* This is the key misconception…`. The compiler sets that opening italic sentence as the title line of the box: a plain subhead in the body face, heading colour, a touch larger and heavier, normal casing, on its own line with the body starting under it (never uppercase, mono, italic or coloured), so a box with a lead reads as titled. Two boxes never sit back to back: body text goes between them, or one of them becomes prose. Quotations use ordinary Markdown; pullquotes do not exist.

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

Blank lines around the block, as with every fence. Wikinotes may use it too, and creatively: physical constants, protocol fields, port numbers, CLI flags, thresholds, unit conversions, anything that is a list of *name, value, remark*. The value is a number, a symbol, a unit, a flag or a field, never a sentence: a sheet whose values are prose (a taxonomy of methods with what each one does, a term with its meaning, a glossary) is not a parameter sheet and must be a [definition list](#lists) or a table. The author has asked for this explicitly; do not stretch the sheet into a layout for text.

## Examples

```text
{example}
Input: What is the capital of France?
Output: The capital of France is Paris.

Input: Write a haiku about rain.
Output: Silver drops descend
Dancing on the quiet earth
Petals bow in thanks
{/example}
```

An example shows a piece of data as it is: a training pair, a prompt with the response that was chosen and the one that was rejected, a request and its reply, a message and what the system answered. It is the form for what used to be a code block that held no code. Every example in the fence renders inside one block, with no kicker or label: the roles in the accent say what it is. The examples form one column as narrow as their text and never wider than 30rem (long lines wrap), centred; the block keeps a thin outline but no fill, only that column carries the code surface, two hairline guides run from the top edge of the block to the bottom one close to the text, and the examples are divided by a rule exactly as wide as the text column, which stops short of the guides. A column whose text reaches the edges of the block loses the guides (measured in the browser).

Grammar:

- `Role: text` opens a turn. The role is one to three words before the first `: ` (`Input`, `Output`, `Prompt`, `Chosen`, `Rejected`, `User`, `Assistant`, `System prompt`…) and is set in the accent; the text takes inline Markdown, backticks and wiki-links.
- A line without a role continues the previous turn on a new line: multi-line outputs (a haiku, reasoning steps between `` `<thinking>` `` tags) are written line by line.
- `Role [faded]: text` dims that turn (muted role and text): the rejected answer of a preference pair, the wrong branch, the line the reader should weigh less.
- A blank line separates examples inside one fence. Blank lines around the fence, as always.

`{example/split}` lays each example out as a box cut into cells by hairlines: the first turn across the top row, the remaining turns side by side under it (two or three cells; on phones they stack). It is the shape for a prompt with its candidate answers:

```text
{example/split}
Prompt: Explain quantum computing.
Chosen: Quantum computing uses qubits that can be in superposition...
Rejected [faded]: Well, quantum computing is very complicated and hard to explain...
{/example}
```

Never a definition list for this: a definition list explains terms, an example exhibits data. Never a code block either, unless the content is a program, a command or a file.

## Sequences

```text
{sequence}
collect preferences # one time > train the reward model # one time > run PPO # many iterations
{/sequence}

{sequence/loop}
generate a response > receive a reward > update the weights > generate again # better this time
{/sequence}

{sequence}
RLHF:: human preferences > reward model > PPO
DPO:: human preferences > direct optimization # no reward model, no RL
{/sequence}
```

A sequence draws steps in order: one quiet dotted vertical rail in the accent with the numbered nodes sitting on it as rings (no arrowheads: the numbers give the direction), the step in the body face beside each node and its note after it in parentheses, in the same face and a quieter colour, in the flow of the text with no box around it. It is the form for what STYLE.md rule 2 forbids in prose (`A → B → C`), for a pipeline, and for two pipelines read against each other, which used to be a two-row table: labelled lanes stand side by side as columns, each under its label (they stack on phones).

Grammar:

- One lane per line. ` > ` (spaces mandatory) separates the steps of a lane. Each step starts with a capital and takes no final period, like a list item.
- The last ` # ` of a step is a short note in lower case, rendered after the step in parentheses and in a quieter grey (*one time*, *many iterations*). It is for a two or three word qualifier on a short step; when the step is a full sentence, fold the qualifier into the sentence, or it reads as a greyed afterthought.
- `Label:: ` at the start of a line names the lane and puts it in its own column.
- `{sequence/loop}` says the steps repeat without drawing a return line: one small chevron floats just above node 1, pointing into it, and one just under the last node, pointing away (out at the bottom, in at the top).
- Every part takes inline Markdown, backticks and wiki-links. Blank lines around the fence.

Two or three steps with nothing to compare are a sentence; a numbered list is for steps that each need a paragraph. A two-row comparison of pipelines is a sequence, not a table.

## Tabs

```text
{tabs}
{tab|1. Pretraining}
One or more paragraphs of Markdown. Fences ({example}, {bkqt/…}, {sequence}, {math}) work inside.
{/tab}
{tab|2. SFT}
…
{/tab}
{/tabs}
```

Tabs put two to four alternatives in one place: a centred row of rectangular buttons, one per panel, over the panel chosen, which sits in a discreet frame so the reader sees exactly what the buttons swap; the other panels are off screen until their button is pressed. Fewer than two or more than four panels is a build error. The content of a panel is ordinary Markdown, boxes and examples included, so a set of examples that would be long in a row, or one full treatment per method, fits here. They earn their place only when every panel is substantial (several paragraphs, or a paragraph with an example or a box): four alternatives of one paragraph each are a list (`a.`, `b.`, `c.`, `d.` or bullets), not tabs, because the buttons cost more than they hide. The other cost is that the panels are never all visible at once: what a reader must see together (a comparison, a contrast) goes in a sequence, a table or prose, never in tabs. Labels are a few words, plain text, without wiki-links. The buttons group themselves: one row when they fit, otherwise the split that leaves the rows closest in width (2 and 2 for similar labels, 3 and 1 when one label is much longer), always centred and in the author's order, so put a long label last if it should be the one that drops to its own row.

## Structured references

| Destination | Syntax | Rendering |
|---|---|---|
| Wiki concept | `[[uid]]` or `[[uid\|display]]` | Wiki-coloured link with a hover preview, no icon |
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

Every line in the contiguous block must use `::`. It renders as a two-column sheet: the term in the heading colour and normal weight in its own column (the column sets it apart, never bold), the description beside it, no separator character and no air between rows (on phones the description drops under the term). A run of items of the shape *this: that* (a stage and what it does, a term and its meaning) is always this list, never bullets or lettered items with a bold label written by hand. This is the form for a term and its meaning, a method and what it does, a field and what it holds: any list of short prose keyed by a name. Numbers, symbols and flags with a value go in a [parameter sheet](#parameter-sheets) instead; a role with the text it produced (input and output, prompt and answers) is an [example](#examples), not a definition. Three parallel one-liners (*X answers this, Y answers that, Z answers the other*) are one paragraph of prose, not a list.

## Tables

Use ordinary GFM tables, and only for real tables: several columns whose rows are compared against each other (a model with its relation and its component, a fault mode against four residual bits, a method against what it buys and what it costs). A list of *name, value, remark* is not a table; it is a [parameter sheet](#parameter-sheets). Two rows that each read as a pipeline are a [sequence](#sequences). A table under three rows or three columns is too small to earn its chrome: write it as prose or a definition list.

```text
| Model | Relation | Component |
|---|---|---:|
| \(M_1\) | \(\dot V_1=Q_p-Q_{12}\) | Tank 1 balance |
| \(M_2\) | \(V_1=A_1h_1\) | Tank 1 geometry |
```

Every table on the site is set the same way and there is no per-table styling: no filled header bar, the column titles in uppercase monospace in the category accent (0.8rem, the one label size shared by sequence lanes, example roles, tab buttons and sheet groups) over a single rule, hairline rows, body text a step under the prose (0.94rem), the first column flush left and the last flush right. A four or five column table of short cells still fits the reading column without horizontal scroll. Align numeric columns to the right with `---:`. Keep header words short (one or two words); the header is a label, not a sentence. A table that still needs to scroll is usually two tables, or a sheet, or prose. Wiki tables are not allowed (see [wikinotes/STYLE.md](wikinotes/STYLE.md)).

## Images

Body images use one composition:

One image:

```text
![Alt|Optional caption](url "center")
![Alt|Optional caption](url "full")
```

`center` stays within the reading column. `full` may break out in articles. Both remain contained in Wiki. Clicking any body image opens a dismissible lightbox.

The alt and the caption are plain text: no `[[wiki-links]]` (they break the image), no `\( … \)` math (the rendered KaTeX is escaped and printed as raw markup) and no inline code. A symbol goes in as the character itself (β, π, ≤); link the concept or set the formula in the prose beside the figure.

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
| Examples `{example}` | yes | rarely | yes, instead of code blocks that hold no code | no |
| Sequences `{sequence}` | yes | rarely | yes, instead of arrows and two-row tables | no |
| Tabs `{tabs}`, two to four panels | yes | no | yes | no |
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
3. Process the small inline extension set, typed notes, the lifted paragraph, parameter sheets, examples, sequences and tabs.
4. Restore protected code.
5. Process structured URLs, definitions, alphabetical lists and context annotations.
6. Normalize nested-list indentation.
7. Parse GFM Markdown.
8. Strip formatting from headings and highlight code.
9. Resolve wiki, cross-document and footnote references.


Content URL resolution: identity-based Wiki and cross-document references emit the current readable URL. File names and URL history are documented in [CONTENT-URLS.md](../../../scripts/CONTENT-URLS.md).
