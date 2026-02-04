---
id: my-project-slug-2
title: my-project-slug-2
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

Everything below documents every feature available in project
markdown files. Compiled by `build-content.js` using
`compiler.config.js` preprocessors.


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


# highlight

{==:highlighted text} stands out with a lime background.

Syntax reference (preserved): `{==:text}`


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


# inline code

Reference variables like `loadBalancer.route()` or config values like `MAX_INSTANCES`.

Custom syntax inside backticks is **never** processed:

- `{_:text}` shows as literal text, not underlined
- `{==:text}` shows as literal text, not highlighted
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

Typed blockquotes with `{bkqt/type:text}`. Six predefined types,
each with its own color and label. Use `/n` to separate paragraphs.
Lists are supported — `/n` before `- ` or `1. ` starts a list.
Inline code inside blockquotes always takes the blockquote color,
even if wrapped in `{#hex:...}` — the blockquote color wins.

{bkqt/note:this is a note blockquote for additional context or clarifications that complement the main explanation/ninline code like `variables` or `functions()` always matches the blockquote color/nuse `/n` anywhere inside a blockquote to start a new paragraph}

{bkqt/tip:practical advice, shortcuts, or best practices/n- keep them concise and actionable/n- use lists for multiple tips/n- the bullet color matches the blockquote type}

{bkqt/warning:common mistakes, traps, and gotchas — SHA-256 is **not** encryption, this algorithm looks O(n) but worst-case is O(n{^:2})}

{bkqt/danger:things that go seriously wrong/n1. security vulnerabilities/n2. data loss/n3. undefined behavior/nin crypto and if I use this here like `is this red` topics this is critical}

{bkqt/deepdive:for when you dig into the internal "why" — you don't need this to use it, but if you want to understand what's happening underneath, keep reading}

{bkqt/keyconcept:fundamental ideas the reader must take away/n- a hash is a one-way function/n- Big-O describes growth not absolute time}


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
- item with H{v:2}O formula

Ordered lists use lima numbers:

1. first step
2. second step
3. third step


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
link to other posts, each in its category color. Display text is
**required** (build error without it).

- [[projects/my-project-slug-2|Dynamic Load Balancer]] (lime)
- [[threads/some-thread|el texto que quiera que te redirige seguro]] (rose)
- [[bits2bricks/some-build|Arduino Motor Controller]] (blue)

Syntax (preserved inside backticks): `[[address|text]]`


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
| Highlight | `{==:text}` | marked text |
| Superscript | `{^:text}` | raised text |
| Subscript | `{v:text}` | lowered text |
| Small caps | `{sc:text}` | small caps |
| Keyboard | `{kbd:text}` | key style |


# combining syntax

You can nest custom syntax inside markdown formatting:

- **bold {#e74c3c:red text}** works
- lists can have H{v:2}O and {sc:abbreviations}
- {_:underlined with {#3498db:blue inside}}
- {==:highlighted with **bold** inside}


# edge cases

Backtick protection ensures these render as literal code:

- `{_:not underlined}` — custom syntax preserved
- `{==:not highlighted}` — highlighting preserved
- `{^:not super}` — superscript preserved
- `{v:not sub}` — subscript preserved
- `{sc:not smallcaps}` — small caps preserved
- `{kbd:not kbd}` — keyboard preserved
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

Custom syntax inside **bold {_:underlined}** and *italic {==:highlighted}* text.
