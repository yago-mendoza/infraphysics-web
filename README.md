# infraphysics

A personal website. A place to store thoughts, articles, and logs. Nothing mystical about it.

![build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)

### Boring Stack

* **Astro / Node.js**
* **Markdown** (Resolved at build time, not interpreted)
* **Cloudflare R2** (Image hosting)

### File Layout

```text
src/
  data/
    pages/        <-- The MD files (posts/articles)
    categories/   <-- YAML configs (_category.yaml)
scripts/
  build-content.js <-- The "Minimalist Zola" engine

```

Boring on purpose `¯\_(ツ)_/¯`

---

### Infraphysics Engine

I use Markdown for articles and posts. The `build-content.js` script is a minimalist build-time processor. It avoids client-side overhead by flattening everything into optimized JSON before the site even deploys.

> **Markdown Image Hacks:**\
> Use titles in MD to control layout: `![alt](url "position:width")`.
> * `left` / `right`: floats the image.
> * `center` / `full`: standard block positioning.
> 
> 
> **Cheap trick:** successive text lines (no break) align to the side of the image. To "reset" and return to normal left-aligned text under the image, just leave a blank line.

---

### The Build Pipeline

```javascript
// build-content.js internals
- Scans /pages for .md files
- Parses Frontmatter (gray-matter)
- Preprocesses side-by-side layouts:
    - Finds ![alt](src "left|right")
    - Aggregates following lines into a flexbox container
    - Stops at the first empty line \n\n
- Compiles Markdown to HTML (marked.js)
- Maps YAML category configs
- Spits out posts.generated.json

```

---

### Workflow (notes to self)

* **Creating a post:** not rocket science. Upload the `.md` and compile.
* **Media:** do not bloat the repo. Images must be uploaded to **Cloudflare R2**.
* **Deployment:** `npm run build`. This triggers the pipeline. If the JSON is stale, the site is stale.

### Dev notes

The `preprocessSideImages` function is the only "clever" part. It captures text lines following a positioned image and wraps them into `div.img-side-layout`. This keeps the CSS logic out of the writing flow while allowing for complex layouts.