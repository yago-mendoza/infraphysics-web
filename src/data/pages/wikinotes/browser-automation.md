---
slug: browser-automation
uid: "rSBc7TP1"
address: "web dev//crawling//browser automation"
name: "browser automation"
date: "2026-09-08"
aliases: ["headless browser", "Playwright", "Puppeteer"]
---
Software that controls a real browser or its equivalent: executes JavaScript, clicks, types, waits, scrolls. Instead of simply requesting the HTML, it acts like a mechanical user.
- It serves three masters. A [[BG5gXls1|rendering crawler]] uses it to see the page a human sees. A scraper uses it when the data appears only after interaction ([[baInedI5|scraping]]). An [[QOPrOeTc|web agent]] uses it as a tool to act, not just to read.
- The cost is a browser per session: memory, seconds per page, and a fingerprint sites can detect and block. Plain [[JGc7uotQ|fetching]] is a thousand times cheaper and is the right default whenever the HTML already carries the content ([[nlHnOtKx|SSR]]).
- Because it runs the site's JavaScript, it is also a security boundary: the automation sees cookies, forms and logged-in state, which is why an agent driving a browser needs the same care as a person with the same access ([[4fbNv0Bm|authentication]]).

## Interactions

- [[mydQy6ia|Tool Use]] : : A browser is the most general tool an agent can hold: the agent decides, the automation acts, and every page becomes both an observation and an action surface. Tool use notes describe the decision; this is the hand
