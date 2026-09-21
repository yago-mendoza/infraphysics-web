---
slug: pages-dev
uid: "Pd4kVz8N"
address: "infrastructure//Cloudflare//Pages//pages.dev"
name: "pages.dev"
date: "2026-09-19"
proper: true
aliases: ["deployment URL", "preview URL"]
---
Every [[Fs8tBm3G|Pages]] project gets a hostname under `pages.dev` built from its own name: the project `my-site` answers at `my-site.pages.dev`. The hostname belongs to that project alone. Deleting or renaming a different project, even one with a similar name, does not change it and does not free it for another to inherit.

Each individual deployment also gets an address of its own, a hash in front of the project hostname (`8981d139.my-site.pages.dev`), which keeps serving that exact version.

Cloudflare serves those per-deployment addresses with the header `x-robots-tag: noindex`, and that is correct and desirable even when the site is in production. It keeps search engines from indexing loose versions of the site; only the stable address is meant to be indexed. A publishing check that demands the absence of noindex on every host will reject a good release.

## Interactions

- [[qmp1wh7j|indexability]] : : The noindex on a deployment address is indexability used on purpose: the page stays reachable for whoever has the link and is kept out of the catalogue
