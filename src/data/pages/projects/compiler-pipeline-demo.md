---
id: compiler-pipeline-demo
title: compiler-pipeline-demo
displayTitle: compiler pipeline demo
category: projects
date: 2025-01-30
thumbnail: https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=400&auto=format&fit=crop
description: showcasing the custom compiler pipeline.
status: completed
technologies: [TypeScript, Marked, Vite]
tags: [compiler, markdown, tooling]
---

# compiler pipeline demo

this project documents and tests the {==:entire compilation pipeline} of infraphysics — from raw markdown to rendered HTML.

## custom syntax in action

the compiler supports {#7C3AED:colored text} inline. this is {#e74c3c:red}, this is {#2ecc71:green}, and this is {#3498db:blue}.

text can be {_:underlined solid}, {-.:underlined dashed}, {..:underlined dotted}, or {~:underlined wavy} — each with its own semantic intent.

chemical formulas: H{v:2}O, CO{v:2}, C{v:6}H{v:12}O{v:6}

mathematical notation: x{^:2} + y{^:2} = r{^:2}, or E = mc{^:2}

{sc:small caps} are useful for {sc:abbreviations} like {sc:nasa} or {sc:http}.

press {kbd:Ctrl+C} to copy, {kbd:Ctrl+V} to paste, {kbd:Ctrl+Shift+I} to open devtools.

## wiki-links

this compiler pipeline is related to [[Headless device]] concepts — the build runs headlessly, no GUI needed.

the output is ultimately rendered through a [[UI//GUI]], but the compilation itself is pure CLI.

## mixed markdown + custom syntax

> {==:key insight}: the pre-processors run {_:before} marked parses the markdown, so **bold {#e74c3c:red text}** works because the color span is already HTML when marked sees it.

- item with {#7C3AED:violet color}
- item with {~:wavy underline}
- item with H{v:2}O formula
