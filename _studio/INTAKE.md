# Intake Guide: Cómo organizar material para _studio

Cuando aportes algo a `_studio`, aquí está cómo categorizarlo. **Responsabilidad del LLM después: decidir si devuelve un artículo, la desarrolla más, o simplemente lo organiza para futuro**.

---

## Tipos de Material (solo 3)

### 1. **Idea**
Concepto, pregunta, toma interesante. **No está desarrollada aún.**

**Características:**
- Una frase a un párrafo máximo
- Sin fecha específica (es general)
- Sin fuente necesaria
- Es el inicio de algo

**Ejemplos:**
- "¿Por qué los LLMs están forzando roles que antes eran gradales?"
- "Hipótesis: X es un proxy de Y"
- "El problema de A es que confunde B con C"

**Dónde va:** `bank/ideas/`
```
bank/ideas/llm-roles.md
bank/ideas/undecided-llm-idea.md  ← si no sabes aún qué tipo de artículo
```

**Frontmatter mínimo:**
```yaml
date: "2026-02-14"
tags: [topic1, topic2]
```

---

### 2. **Fact**
Dato específico, verificable, con fuente. **Lo importante aquí son los tags** para organizarlo después.

**Características:**
- Figura, estadística, fecha, cita textual
- Tiene `source:` (URL, publicación, paper)
- Tiene `date:` (cuándo se publicó la fuente, no cuándo lo guardaste)
- `status: unverified` hasta que lo compruebes
- 1–3 oraciones máximo
- **Tags bien definidos** (para encontrarlo después cuando escribas un artículo sobre ese tema)

**Ejemplos:**
```
---
date: "2025-02-15"
source: "Scaleup Magazine, 'Microsoft's $80B Capex Year'"
status: unverified
tags: [capex, ai-spending, microsoft, infrastructure]
---

Microsoft gastó $80 mil millones en capex en 2025, según reportes internos.
```

O una cita:
```
---
date: "2026-01-15"
source: "Sam Altman, entrevista en Dwarkesh Patel"
status: verified
tags: [agi-timelines, altman, opinion]
---

"...la AGI podría llegar en 5 años, pero con incertidumbre +/- 3 años."
```

**Dónde va:** `bank/facts/`
```
bank/facts/microsoft-capex.md
bank/facts/sam-altman-timeline.md
```

**Frontmatter:**
```yaml
date: "YYYY-MM-DD"  ← cuándo se publicó la fuente
source: "URL or publication"
status: unverified | verified | stale
tags: [tag1, tag2, tag3]  ← IMPORTANTE: bien organizados
```

---

### 3. **Source**
Artículo, ensayo, paper, recurso **largo y gordo** que guardas como referencia. Tipo enciclopedia de un tema.

**Características:**
- Material largo (500+ palabras, puede ser muchísimo)
- Completo o casi (no es un extracto)
- URL y metadata de dónde viene
- Tu anotación personal: **por qué lo guardaste, en qué contexto, para qué tipo de artículo podría ser útil**
- Tags para contexto (no para el contenido del source, sino para cuándo lo usarías)

**Ejemplos:**
- Un ensayo completo de alguien experto en X
- La guía de una librería o framework
- Un paper largo con análisis detallado
- Una serie de threads de alguien que sabe
- Una recopilación tipo "State of X 2025"

**Documento example:**
```
---
date: "2025-01-20"
source: "https://dwarkeshpatel.com/p/sam-altman-agi-timeline"
tags: [agi, timelines, long-form-interviews]
why: "Sam's timeline thinking vs research consensus. Referencia para future essay on AGI projections."
read: false  ← si ya lo leíste
---

[Tu resumen / puntos clave / o solo el link si lo leerás después]
```

**Dónde va:** `bank/sources/`
```
bank/sources/dwarkesh-sam-timeline.md
bank/sources/anthropic-constitution-paper.md
bank/sources/tldraw-docs.md
```

**Frontmatter:**
```yaml
date: "YYYY-MM-DD"  ← cuándo se publicó
source: "URL"
tags: [context-tags]  ← para cuándo lo usarías
why: "Por qué lo guardaste"
read: false | true  ← opcional
```

---

## Árbol Resultante

```
_studio/_inbox/bank/
├── facts/
│   ├── microsoft-capex.md
│   ├── sam-altman-timeline.md
│   └── ...
├── sources/
│   ├── dwarkesh-sam-timeline.md
│   ├── anthropic-constitution.md
│   └── ...
└── ideas/
    ├── llm-roles.md
    ├── undecided-hypothesis.md
    └── ... (sin subcarpetas: son solo ideas)
```

---

## Flujo de Ejemplo

**Tú:** "Oye, me acaba de pasar una idea sobre roles con LLMs."

→ Es una **idea**. Entra en `bank/ideas/`.

**Tú:** (después) "Encontré un artículo completo sobre esto. Super bueno, 50 páginas."

→ Es un **source**. Entra en `bank/sources/`.

**Tú:** (después) "Hay un dato específico en ese source que es importante: X es así."

→ Es un **fact**. Lo extraes y entra en `bank/facts/`.

**LLM:** (en el futuro, cuando escribas un artículo sobre roles)
- Busca `bank/ideas/` con tags [roles, llms]
- Busca `bank/facts/` con tags [roles, llms]
- Busca `bank/sources/` con tags [roles, llms]
- Propone: "Aquí está todo el material. ¿Por dónde empezamos?"

---

## Tags: Cómo Usarlos

**Tags son para encontrar después**, cuando escribas. No necesitas un sistema perfecto. Pero sí consistencia:

- Tema principal: `[agi]`, `[llms]`, `[roles]`, `[infrastructure]`
- Subtema: `[timelines]`, `[safety]`, `[scaling]`
- Tipo de recurso (sources solo): `[long-form]`, `[paper]`, `[essay]`, `[guide]`
- Fuente (facts solo): `[microsoft]`, `[altman]`, `[research]`
- Estado (facts): `[unverified]`, `[important]`, `[draft]`

**Ejemplo:**
- Fact: `tags: [agi, timelines, altman, opinion]`
- Source: `tags: [agi, long-form, interview, research]`
- Idea: `tags: [agi, organization, hypothesis]`

---

## Cuándo No Está Claro

Si guardas algo y **no sabes si será un essay, un project, o un bits2bricks**, eso es normal. Los tags resuelven eso:

```
---
tags: [undecided, ai-systems]  ← "undecided" cuando no sabes qué tipo
---
```

Después, cuando está más claro, editas los tags.

---

## Responsabilidad del LLM

Cuando aportes algo a `_studio`, el LLM debería:

1. **Identificar** qué tipo es (idea, fact, source)
2. **Moverlo al lugar correcto** (`bank/ideas/`, `bank/facts/`, `bank/sources/`)
3. **Llenar frontmatter** (date, source si aplica, tags, why si es source)
4. **Verificar tags** (¿son descriptivos? ¿se pueden usar después para encontrarlo?)
5. **Opcionalmente:** Si es una idea, preguntar "¿En qué dirección la desarrollamos?" Si es un fact, ofrecer verificación.

---

## Notas

- **No hay cantidad mínima.** Una frase es una idea válida.
- **Las fechas son cuándo se publicó**, no cuándo lo guardaste.
- **Tags son todo.** Un fact sin tags buenos es invisible después.
- **Sources se guardan **enteros** (o links + tu resumen), no extractos.**
- **Facts son lo contrario: extractos concentrados** + tags.
- **No necesitas llenar todo.** Si algo no aplica, no lo escribas.
- **El LLM puede reorganizar.** Si guardas algo sin estar seguro, el LLM lo categoriza.
