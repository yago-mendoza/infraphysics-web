---
# ══════════════════════════════════════════════════════
# PROJECT FRONTMATTER — TEMPLATE
# Copiar este bloque para cada nuevo proyecto.
# ══════════════════════════════════════════════════════

id: my-project-slug-2                    # URL slug (kebab-case)
title: my-project-slug-2                 # Título interno (normalmente = id)
displayTitle: "Dynamic Load Balancer with Auto-Scaling — Bun + Express"
                                       # Título visible. Usa " — " para separar
                                       # la parte A y B del título. Ambas se
                                       # renderizan al mismo tamaño, juntas.
subtitle: "a weekend deep-dive into OS-level request routing"
                                       # Se muestra debajo del título principal
                                       # en un tamaño ligeramente menor y gris.
category: projects
date: 2025-06-01
thumbnail: https://images.unsplash.com/photo-XXXXX?q=80&w=800&auto=format&fit=crop
description: "Built a local auto-scaling load balancer that spins instances, health-checks, and routes traffic based on load — shipped in ~4 hours."
                                       # One-liner que aparece debajo de AUTHOR
                                       # en la cabecera del proyecto.
status: in-progress                    # completed | active | in-progress | archived
                                       # Se muestra arriba a la derecha:
                                       # completed → "FINISHED"
                                       # active / in-progress → "IN PROGRESS"
                                       # archived → "ARCHIVED"
topics: [Load Balancing, Networking, DevOps]
                                       # Conceptos/temas. Pills MORADAS.
                                       # Aparecen encima de technologies.
technologies: [Bun, Express, TypeScript, DevInfra]
                                       # Stack técnico. Pills LIMA.
                                       # Aparecen debajo de topics.
tags: [load-balancer, auto-scaling]    # Tags internos (para búsqueda/filtrado)
github: https://github.com/user/repo
demo: https://demo-url.com
author: Yago Mendoza
notes:
  - Shipped in ~4 hours as a weekend experiment.
  - Built to understand load balancing internals at the OS level.
  - Written with zero external dependencies beyond Express.
                                       # Notas del autor. Cada "- línea" aparece
                                       # como una línea individual bajo la meta.
                                       # Separadas del artículo por línea gruesa.
---


# the core problem

describe what problem exists and why it matters. use plain paragraphs.
the markdown `#` heading renders as LIMA and LARGE.


## the approach

the `##` heading renders as WHITE and medium-sized.


### implementation details

the `###` heading renders as LIGHTER GRAY and smaller.


---

Horizontal rules (`---`) render as a subtle gray line separator.


# syntax reference — custom extensions

Everything below documents the custom syntax available in project
markdown files. This is compiled by `build-content.js` using
`compiler.config.js` preprocessors BEFORE marked parses the markdown.


## text coloring

Inline colored text. The hex code sets the color:

- {#e74c3c:this text is red}
- {#2ecc71:this text is green}
- {#3498db:this text is blue}
- {#a855f7:this text is purple}

Syntax: `{#HEX:text}` where HEX is 3 or 6 hex digits.


## underline

Solid underline for emphasis:

{_:this text is underlined}

Syntax: `{_:text}`


## highlight

{==:highlighted text} stands out with a lime background.

Syntax: `{==:text}`


## superscript and subscript

Mathematical notation: x{^:2} + y{^:2} = r{^:2}

Chemical formulas: H{v:2}O, CO{v:2}, C{v:6}H{v:12}O{v:6}

Syntax: `{^:text}` for superscript, `{v:text}` for subscript.


## small caps

{sc:small caps} are useful for {sc:abbreviations} like {sc:nasa} or {sc:http}.

Syntax: `{sc:text}`


## keyboard shortcuts

Press {kbd:Ctrl+C} to copy, {kbd:Ctrl+V} to paste, {kbd:Ctrl+Shift+I} to open devtools.

Syntax: `{kbd:text}`


## inline code

Reference variables like `loadBalancer.route()` or config values like `MAX_INSTANCES`.
Renders with lima text, dark background, and rounded border.


## code blocks

Fenced code blocks render as a macOS-style terminal window with
three colored dots and a language label in the top-right corner.

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


## blockquotes

> {==:key insight}: the pre-processors run before marked parses
> the markdown, so **bold {#e74c3c:red text}** works because
> the color span is already HTML when marked sees it.

Blockquotes render with a lima left border and subtle green background.


## lists

Unordered lists use a custom lima bullet:

- item with {#a855f7:purple color}
- item with {_:underlined text}
- item with H{v:2}O formula

Ordered lists use lima numbers:

1. first step
2. second step
3. third step


## wiki-links

Reference fieldnotes concepts with double brackets:

This is related to [[Headless device]] concepts.

The output is rendered through a [[UI//GUI]].

Syntax: `[[address]]` or `[[parent//child]]`


## combining syntax

You can nest custom syntax inside markdown formatting:

- **bold {#e74c3c:red text}** works
- > blockquotes can contain {==:highlights} and `code`
- lists can have H{v:2}O and {sc:abbreviations}
