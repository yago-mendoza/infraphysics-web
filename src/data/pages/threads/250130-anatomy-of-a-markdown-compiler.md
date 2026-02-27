---
id: anatomy-of-a-markdown-compiler
displayTitle: anatomy of a markdown compiler
category: threads
date: 2025-01-30
thumbnail: https://images.unsplash.com/photo-1516116216517-838c2b4c4e8e?q=80&w=400&auto=format&fit=crop
description: how custom syntax coexists with standard markdown.
lead: "The trick isn't writing a parser. It's knowing when each transformation runs."
tags: [compilers, syntax, markdown]
---

# anatomy of a markdown compiler

writing your own markup extensions on top of markdown is a _delicate_ balance. the trick is ordering — knowing _when_ each transformation runs.

## the ordering problem

imagine you write `{#e74c3c:some **bold** text}`. what happens?

1. {#7C3AED:pre-processors} fire first — the color syntax becomes `<span style="color:#e74c3c">some **bold** text</span>`
2. {#7C3AED:marked} parses next — it sees `**bold**` inside the span and converts it to `<strong>bold</strong>`
3. result: {#e74c3c:some **bold** text} — both work

if the order were reversed, marked would see `{#e74c3c:...}` as plain text and leave it as-is. the braces would survive into the HTML literally. _that would be a bug_.

## entropy and compilers

every transformation adds entropy to the pipeline. each processing stage is a black box that transforms input without visual feedback. errors compound silently.

the solution: validation at the end. after the full pipeline runs, the validator checks every `data-address` attribute in the output HTML against the fieldnotes database. broken links are caught at _build time_, not runtime.

## syntax cheat sheet

| what you write | what you get |
|---|---|
| `{#FF0000:text}` | {#FF0000:colored} |
| `_text_` | _underlined_ |
| `--text--` | --accented-- |
| `{^:text}` | x{^:2} |
| `{v:text}` | H{v:2}O |
| `{kbd:text}` | {kbd:Enter} |
