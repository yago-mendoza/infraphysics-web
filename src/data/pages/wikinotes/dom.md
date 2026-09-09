---
slug: dom
uid: "jaoEDAPx"
address: "web dev//rendering//DOM"
name: "DOM"
date: "2026-09-08"
aliases: ["Document Object Model", "HTML versus DOM"]
---
The in-memory representation of the document that the browser builds and that JavaScript can modify. The HTML that arrived is the initial blueprint; the DOM is the building the browser has assembled right now.
- HTML is what the server delivers initially: raw material. HTML and DOM can start similar and end up very different once JavaScript modifies the page, adds elements, fetches data, removes nodes.
- A non-rendering crawler only ever sees the HTML; a [[BG5gXls1|rendering crawler]] and any [[rSBc7TP1|browser automation]] see the DOM. Under [[Dq9rVPgJ|CSR]] the difference is the whole page; under [[nlHnOtKx|SSR]] it is mostly the interactive parts added by [[w3zHyIAB|hydration]].
- [[KAtZ68eQ|Parsing]] HTML produces a tree of the same shape; the DOM is that tree kept alive and mutable inside a running browser.

## Interactions

- [[Cw5rNx6K|Crawler]] : : The crawler's blind spot is exactly the distance between HTML and DOM: it reads the blueprint, the user lives in the building. Every SEO fix for JavaScript sites is a way of shrinking that distance
