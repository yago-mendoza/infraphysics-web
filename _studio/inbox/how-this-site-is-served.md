---
title: "How this site is served: SPA, SSG, and what Astro would have changed"
kind: "addition"
status: "seed"
added: "2026-09-11"
target: "projects/building-infraphysics"
source: "TOPICS (questions to answer)"
tags: ["infraphysics","tooling","explainer"]
---

Questions the author wants answered well enough to write them into the site-building article: the real advantages of Astro; where the HTML is compiled and by whom; whether part of the markdown compiles at build time and what ships to the server, JS or only HTML; whether that is SSG or something else and what SPA is the antonym of; when image links inside the compiled HTML load; where latency can come from (a DOM updating, or is the DOM static here); whether Astro would have done anything better and what that something would have been.

Related note from a session: switching `loading="lazy"` on in build-content.js changes how markdown images compile, and cached articles keep the old tags until a forced rebuild.
