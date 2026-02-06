---
id: my-project-slug-2
displayTitle: "Dynamic Load Balancer with Auto-Scaling — Bun + Express"
subtitle: "a weekend deep-dive into OS-level request routing"
category: projects
date: 2025-06-01
thumbnail: https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=400&auto=format&fit=crop
thumbnailAspect: strip # full (auto) / wide (16/7) / banner (16/4) / strip (16/2)
thumbnailShading: heavy # heavy (grayscale+gradient) / light (subtle) / none (crisp natural image)
description: "Built a local auto-scaling load balancer that spins instances, health-checks, and routes traffic based on load — shipped in ~4 hours."
status: ongoing
tags: [Load Balancing, Networking, DevOps]
technologies: [Bun, Express, TypeScript, DevInfra]
github: https://github.com/user/repo
demo: https://demo-url.com
caseStudy: https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf
author: Yago Mendoza
notes:
  - Shipped in ~4 hours as a weekend experiment.
  - Built to understand load balancing internals at the OS level.
  - Written with zero external dependencies beyond Express.
---


# syntax reference

>> 25.06.01 - initial implementation shipped. rough edges but the core routing loop works.
>> 25.06.03 - added health-check probes and auto-scaling thresholds. wrote this doc while refactoring.

Everything below documents every feature available in project
markdown files. Compiled by `build-content.js` using
`compiler.config.js` preprocessors.

## Full-Width Quote (no attribution)

```
{bkqt/quote}
The most dangerous phrase in the language is: we've always done it this way.
{/bkqt}
```

Renders as: left vertical bar, large decorative `"` mark, italic text spanning the full content width.

---

## Full-Width Quote with Attribution

```
{bkqt/quote|Grace Hopper}
The most dangerous phrase in the language is: we've always done it this way.
{/bkqt}
```

Same as above, plus an `— Grace Hopper` attribution line below the text.

---

## Half-Width Pullquote (stops mid-screen)

```
{bkqt/pullquote}
The mask is not the face.
{/bkqt}
```

Max-width ~55%. Useful for emphasis that shouldn't dominate the full line — a thesis statement, a recurring motif, or a one-liner pulled from the surrounding text.

---

## Half-Width Pullquote with Attribution


{bkqt/pullquote|Evan Hubinger, Anthropic}
Deceptive alignment is the central unsolved problem.
{/bkqt}


---

## Inline Formatting Inside Quotes

All inline formatting works inside quote blockquotes:

{bkqt/quote|Apollo Research, 2026}
The intervention as-studied is --not sufficient-- for future models, and **more work** needs to be done.
{/bkqt}

Bold, accent text, colored text, code, etc. all render normally inside the quoted text.

---

## Comparison: Quote vs Pullquote vs Keyconcept

| Type | Visual | Use case |
|---|---|---|
| `quote` | Left bar + `"` icon, italic, full width | Attributed quotations, citations |
| `pullquote` | Left bar + `"` icon, italic, half width | Emphasis, thesis statements, pull-outs |
| `keyconcept` | Colored background band, label header | Core ideas the reader should retain |
| `note` | Colored background band, label header | Supplementary information |

`quote` and `pullquote` are for *someone else's words* (or a distilled version of your own). `keyconcept` and `note` are for *your own explanations*.


# headings

Headings render as monospace uppercase text.

## h2 — white, medium

### h3 — lighter gray, smaller

#### h4 — even lighter, smallest

---

Horizontal rules (`---`) render as a subtle gray line separator.


# text coloring

Inline colored text using hex codes:

- {#e74c3c:this text is red}
- {#2ecc71:this text is green}
- {#3498db:this text is blue}
- {#a855f7:this text is purple}

Colored inline code — the color wraps the code element:

- {#a855f7:`compiler.config.js`} renders purple
- {#e74c3c:`ERROR_CODE`} renders red

Syntax: `{#HEX:text}` — content inside backticks stays literal.


# underline

{_:this text is underlined}

Syntax reference (preserved inside backticks): `{_:text}`



# superscript and subscript

Mathematical notation: x{^:2} + y{^:2} = r{^:2}

Chemical formulas: H{v:2}O, CO{v:2}, C{v:6}H{v:12}O{v:6}

Syntax reference (preserved): `{^:text}` for superscript, `{v:text}` for subscript.


# small caps

{sc:small caps} are useful for {sc:abbreviations} like {sc:nasa} or {sc:http}.

Syntax reference (preserved): `{sc:text}`


# keyboard shortcuts

Press {kbd:Ctrl+C} to copy, {kbd:Ctrl+V} to paste, {kbd:Ctrl+Shift+I} to open devtools.

Syntax reference (preserved): `{kbd:text}`


# shout

Centered uppercase callout for dramatic emphasis:

{shout:there is no cloud — it's just someone else's computer}

Syntax reference (preserved inside backticks): `{shout:text}`


# inline code

Reference variables like `loadBalancer.route()` or config values like `MAX_INSTANCES`.

Custom syntax inside backticks is **never** processed:

- `{_:text}` shows as literal text, not underlined
- `--text--` shows as literal text, not accented
- `{^:text}` shows as literal text, not superscript
- `{#ff0000:text}` shows as literal text, not colored
- `[[address]]` shows as literal text, not a wiki-link
- `[[projects/slug|text]]` shows as literal text, not a cross-doc link
- `{bkqt/note:text}` shows as literal text, not a blockquote


# code blocks

Fenced code blocks render as a macOS-style terminal window with
colored dots and a language label.

```typescript
interface LoadBalancer {
  instances: Server[];
  healthCheck(): Promise<boolean>;
  route(request: Request): Server;
}
```

```python
# Language is auto-detected from the fence label
def health_check(instance: Server) -> bool:
    return instance.ping() < 100
```


# blockquotes

Typed blockquotes with `{bkqt/TYPE}...{/bkqt}` block syntax. Six predefined types,
each with its own color and label. Use blank lines to separate paragraphs.
Lists are supported — a blank line before `- ` or `1. ` starts a list.
Inline code inside blockquotes always takes the blockquote color,
even if wrapped in `{#hex:...}` — the blockquote color wins.

{bkqt/note}
this is a note blockquote for additional context or clarifications that complement the main explanation

inline code like `variables` or `functions()` always matches the blockquote color

use `/n` anywhere inside a blockquote to start a new paragraph
{/bkqt}

{bkqt/tip}
practical advice, shortcuts, or best practices

- keep them concise and actionable
- use lists for multiple tips
- the bullet color matches the blockquote type
{/bkqt}

{bkqt/warning}
common mistakes, traps, and gotchas — SHA-256 is **not** encryption, this algorithm looks O(n) but worst-case is O(n{^:2})
{/bkqt}

{bkqt/danger}
things that go seriously wrong

1. security vulnerabilities
2. data loss
3. undefined behavior

in crypto and if I use this here like `is this red` topics this is critical
{/bkqt}

{bkqt/keyconcept}
fundamental ideas the reader must take away

- a hash is a one-way function
- Big-O describes growth not absolute time
{/bkqt}


# inline annotations

Write `{{ref|explanation}}` to attach a footnote. The ref renders with a dotted underline and a superscript number, and the explanation appears below the paragraph. Explanations can themselves contain nested annotations.

this algorithm runs in {{O(n log n)|where n is the number of elements in the input array.}} on average, but degrades to {{O(n{^:2})|this worst case occurs when the {{pivot|the element chosen as a reference point for partitioning the array.}} selection is consistently poor, e.g. already-sorted input with naive pivot.}} in the worst case.

multiple annotations in the same paragraph get sequential numbers. numbering resets per paragraph. nested annotations indent further at the same size.


# small text

The `>` markdown syntax now produces small fine-print text instead
of blockquotes. Useful for disclaimers, footnotes, and asides.

> this is small text rendered from the > markdown syntax.
> it appears in a smaller font, muted color, and lighter weight.
> useful for disclaimers and secondary information.


# lists

Unordered lists use a custom lime bullet:

- item with {#a855f7:purple color}
- item with {_:underlined text}
  - nested item at level 2
  - another nested item
    - deeply nested at level 3
    - still level 3
      - level 4 item
        - level 5 — maximum depth
- item with H{v:2}O formula

Ordered lists use lime numbers:

1. first step
2. second step
   1. sub-step a
   2. sub-step b
3. third step

Definition lists use `::` syntax — they're indented like regular lists:

- UART:: universal asynchronous receiver-transmitter
- SPI:: serial peripheral interface
- I{^:2}C:: inter-integrated circuit


# links

All internal links use `[[address|text]]`. The address pattern
determines the type. All render with dashed underline.

## second-brain links

Single word or `//` paths resolve to fieldnote concepts:

This is related to [[Headless device|este es un nodo]] concepts.

The output is rendered through a [[UI//GUI|este es un nodo]].

With explicit display text: [[compiler|the project compiler]].

## cross-document links

Addresses starting with `projects/`, `threads/`, or `bits2bricks/`
link to other posts. Display text is **required** (build error without it).
Text color is normal (inherited), with a solid underline in the target
category's accent color and the category sidebar icon at the end.

- [[projects/my-project-slug-2|Dynamic Load Balancer]] — lime underline, gear icon
- [[threads/everything-is-a-pipe|everything is a pipe]] — rose underline, document icon
- [[bits2bricks/custom-syntax-pcb|Custom Syntax PCB]] — blue underline, grad cap icon

Syntax (preserved inside backticks): `[[address|text]]`

## external links

Write `[[https://url|Display Text]]` for external links. They render
in muted grey with a solid underline and a diagonal-arrow icon at the
end, signaling that the link leaves the site.

- [[https://openai.com|OpenAI]] — grey text, arrow icon
- [[https://github.com|GitHub]] — grey text, arrow icon

Syntax (preserved inside backticks): `[[https://url|text]]`


# images

Standard image positioning:

Center: `![alt](src "center")`

Full width: `![alt](src "full")`

Side layouts pair an image with text in a flexbox row:

`![alt](src "left:300px")` or `![alt](src "right:300px")`


# tables

| Feature | Syntax | Output |
|---------|--------|--------|
| Color | `{#hex:text}` | colored text |
| Underline | `{_:text}` | underlined text |
| Accent | `--text--` | accented text |
| Superscript | `{^:text}` | raised text |
| Subscript | `{v:text}` | lowered text |
| Small caps | `{sc:text}` | small caps |
| Keyboard | `{kbd:text}` | key style |


# combining syntax

You can nest custom syntax inside markdown formatting:

- **bold {#e74c3c:red text}** works
- lists can have H{v:2}O and {sc:abbreviations}
- {_:underlined with {#3498db:blue inside}}


# edge cases

Backtick protection ensures these render as literal code:

- `{_:not underlined}` — custom syntax preserved
- `--not accented--` — accent preserved
- `{^:not super}` — superscript preserved
- `{v:not sub}` — subscript preserved
- `{sc:not smallcaps}` — small caps preserved
- `{kbd:not kbd}` — keyboard preserved
- `{shout:not a shout}` — shout preserved
- `{#ff0000:not red}` — color preserved
- `[[not a link]]` — wiki-link preserved
- `[[projects/slug|text]]` — cross-doc preserved
- `{bkqt/note:not a blockquote}` — bkqt preserved

Empty and minimal syntax:

- {#aaa:x} — single char colored
- {^:n} — single char super
- {v:n} — single char sub

Multiple custom syntax on one line:

{#e74c3c:red}, {#2ecc71:green}, and {#3498db:blue} in sequence.

Custom syntax inside **bold {_:underlined}** and *italic --accented--* text.
