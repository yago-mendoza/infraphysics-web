---
slug: csr
uid: "Dq9rVPgJ"
address: "web dev//rendering//CSR"
name: "CSR"
date: "2026-09-08"
aliases: ["client-side rendering"]
---
Client-side rendering: the browser's JavaScript generates most of the content. The server sends the pieces and the instructions, and your browser builds the page.

{bkqt/keyconcept|The CSR sequence}
Nearly empty HTML, then JavaScript loads, then data is fetched, then the DOM is complete.
{/bkqt}

- What arrives over the wire is a shell, often a single empty container and a script tag; the page the user sees exists only in the [[jaoEDAPx|DOM]] after scripts run. That is why simple crawlers, which read the fetched HTML and never execute JavaScript, see nothing ([[Cw5rNx6K|Crawler]]).
- The fixes are on either side: the site can render on the server ([[nlHnOtKx|SSR]]) or pre-render at build time, or the crawler can render ([[BG5gXls1|rendering crawler]]). This site is CSR with an edge function that injects content for bots, one of the hybrid answers.
- CSR is not the same as a [[doG8Catf|SPA]]: the first says where the HTML is built, the second says whether navigation reloads the document.
