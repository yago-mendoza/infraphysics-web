---
slug: hydration
uid: "w3zHyIAB"
address: "web dev//rendering//hydration"
name: "hydration"
date: "2026-09-08"
aliases: ["rehydration"]
---
JavaScript takes the HTML produced by [[nlHnOtKx|SSR]] and adds interactive behavior to it. The server delivers a finished model; JavaScript then connects the buttons and the motors.

{bkqt/keyconcept|The handoff}
SSR gives visible HTML, then hydration runs, then the same HTML is a live interactive application.
{/bkqt}

- The page is readable before hydration and usable after it; the gap between the two is where "the button did nothing" bugs live. Frameworks fight it with partial hydration (only the interactive islands) and streaming.
- Hydration is what makes SSR plus a rich [[doG8Catf|SPA]] possible: server-rendered first paint, client-driven navigation afterwards.

## Interactions

- [[Dq9rVPgJ|CSR]] : : Hydration is CSR's JavaScript run over SSR's HTML: the same components execute in the browser, but instead of building the DOM from nothing they attach to markup that already exists. If the two disagree, the framework warns and rebuilds
