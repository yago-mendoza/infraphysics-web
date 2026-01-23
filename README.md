# infraphysics-web

No hydration. No wrappers. No bloatware. Just text and images.

## Content

Custom static site generator. Write posts in `src/data/pages/**/*.md` with YAML frontmatter:

```markdown
---
id: post-id
title: post-id
displayTitle: post title
category: projects
date: 2025-01-22
thumbnail: https://...
description: short description.
---

# content here
```

At build time, `scripts/build-content.js` processes all `.md` files → generates JSON → Vite bundles it. No markdown libs in the browser bundle.

Custom image positioning:
```markdown
![alt](url "right:300px")   # float right
![alt](url "left:400px")    # float left
![alt](url "center")        # centered
![alt](url "full")          # full width
```

## Structure

```
src/data/
  pages/**/*.md             # content source
  pages/**/_category.yaml   # category metadata
  data.ts                   # exports posts[] + categoryConfigs
scripts/
  build-content.js          # prebuild: md → json
```

## Infra

Hosted on [Cloudflare Pages](https://pages.cloudflare.com/) via GitHub.
Images are also loaded from R2 Cloudflare storage