# Visual

> The companion to [VOICE.md](VOICE.md). That one says how the site writes; this one says how it looks.
>
> Read it before generating, prompting, choosing or retouching any image for the site: article heroes, body figures, home carousel art, plates. It describes one photographic language and three registers of it. Anything outside that language does not go on the site, however good it is on its own.
>
> **One absolute rule:** engineering objects are treated like luxury products, never like factory stock photography. If an image could sit in a supplier catalogue or a plant maintenance report, it fails.

---

## Identity in one sentence

Premium cinematic industrial photography with a high-end technology editorial aesthetic. It sits between real industrial photography, luxury advertising and scientific visualization, and it avoids grime, grunge and any obvious CGI look.

The mood is serious, technical, minimal, slightly futuristic and expensive.

---

## The language

### Light

- Warm, directional, golden-hour key light, balanced by cool graphite shadows. The warm/cool split is the signature; neither side dominates.
- Low key by default. Deep blacks are allowed and often wanted. Never flat catalogue lighting, never an evenly lit room.
- Specular reflections are controlled: crisp, few, placed. Metal shows its edges through highlights, not through overall brightness.
- Contrast moderate to high. Soft atmospheric depth (haze, falloff) rather than fog.

### Matter

- Stainless steel and machined metal, clean and realistic. Surfaces read as maintained, not new-from-the-box and not weathered.
- No grime, no rust, no oil smears, no grunge texture packs. Wear is acceptable only as honest, subtle patina.
- Liquids get a soft volumetric, semi-radiographic treatment: translucent, diffused, lit from within the volume rather than from a spotlight. Never neon, never glowing like a product render.
- Glass, tubing and membranes are transparent and quiet; they should look like they belong in a lab, not a bar.

### Composition

- Ordered and deliberate. One subject, a clear hierarchy, a reason for every element in frame.
- Strong negative space. The subject is allowed to be small against a dark field.
- Subtle depth of field: enough to separate subject from background, not so shallow that the object turns to blur.
- Strong separation between subject and background, obtained with light and depth rather than with outlines or vignettes.
- Machinery is sculptural, not merely functional. Think of a well-lit object on a plinth, not a working floor.

### Palette

- Dark, restrained, mostly neutral: graphite, charcoal, muted steel, warm amber highlights.
- Accents are blue/cyan or amber, used sparingly, as a signal rather than a wash. One accent colour per image is the norm; two only if one is clearly secondary.
- When an image is partly a diagram (flows, zones, states), colour coding is subtle: soft gradients, low-saturation tints, never saturated fills.
- Very little visual noise. Clean gradients, no film grain overlays, no chromatic aberration effects.

---

## The three registers

All three share the language above. They differ in how far they move from photography toward visualization.

### 1. Dark editorial industrial

Very low-key lighting, deep blacks, muted metallic tones, selective warm highlights, strong negative space. A slightly mysterious, almost archival feel. It reads like a spread in a high-end engineering magazine, not like a commercial factory photo.

Use for: article heroes about hardware, historical or archival pieces, anything that should feel weighty and quiet.

### 2. Cinematic technical editorial

Cleaner and more polished than the first. Stronger separation between subject and background, controlled contrast, cool graphite shadows, restrained amber accents. A premium corporate-tech or aerospace campaign feel, very composed.

Use for: project heroes, carousel doors, anything that has to look finished and confident at a glance.

### 3. Scientific-industrial visualization

More graphic and conceptual. Darker overall palette, subtle colour coding, soft gradients, a sense of systems and data rather than pure photography. A mix between scientific imaging, process engineering and luxury brand advertising.

Use for: body figures that explain a mechanism, anything about flows, fields, signals or states, Bits2Bricks illustrations.

---

## Kill list

Reject on sight, no judgment call:

- Grime, grunge, rust, dirt, oil, *industrial decay* textures.
- Obvious CGI: perfect plastic surfaces, glowing edges, HDR bloom, ray-traced showroom floors.
- Ordinary factory or stock photography: fluorescent light, cluttered floors, hi-vis vests, people posing with clipboards.
- Saturated dominant colours, rainbow gradients, neon liquids.
- Visual noise: film grain packs, lens flares, dust particles, chromatic aberration, vignette presets.
- Flat catalogue lighting or white-background product shots.
- Text, labels, logos or UI baked into the image (captions belong to the page).
- Human faces as the subject. Hands and figures are fine when small and anonymous.

---

## Prompt base

Use this as the stem, then add the subject and the register block.

```
Premium cinematic industrial photograph of <SUBJECT>. Clean realistic stainless steel and machined metal, no grime.
Warm directional golden-hour key light balanced by cool graphite shadows, low key, deep blacks, controlled specular
reflections, moderate-to-high contrast, subtle depth of field, soft atmospheric depth. Ordered sculptural composition
with strong negative space; the object treated like a luxury product. Restrained dark palette with a single sparing
<amber|cyan> accent. Liquids translucent and volumetric, semi-radiographic, softly diffused. High-end technology
editorial aesthetic, between real industrial photography, luxury advertising and scientific visualization.
No text, no logos, no people, no CGI look, no lens flare, no grain.
```

Register blocks, append one:

- **Dark editorial industrial:** `Very low-key lighting, muted metallic tones, selective warm highlights, archival engineering-magazine mood, most of the frame in shadow.`
- **Cinematic technical editorial:** `Polished and composed, strong subject-background separation, cool graphite shadows with restrained amber accents, aerospace campaign feel.`
- **Scientific-industrial visualization:** `Graphic and conceptual, dark palette with subtle colour coding and soft gradients, a sense of systems and data, between scientific imaging and process engineering.`

---

## Checking an image

1. **Kill pass.** Anything from the kill list present? Reject.
2. **Language pass.** Warm/cool light split, clean metal, dark restrained palette, one accent, negative space. Missing two of these and it does not belong.
3. **Register pass.** Which of the three is it, and is that the right one for where it goes?
4. **Page pass.** Look at it at the size and place it will be used (hero, card, plate). Article heroes and carousel doors must survive a crop to a wide band; figures must read at column width.
5. **Neighbour pass.** Put it next to the two or three images nearest to it on the site. It should look like the same photographer on the same day.

---

## Where files go

Masters live in `media/` (gitignored) and reach the CDN through `scripts/media.js`; the workflow is in [scripts/README.md](../../../scripts/README.md#article-images) and the rule in [CLAUDE.md](../../../CLAUDE.md) (*On adding or replacing article images*). This document only decides what the image should look like.
