---
slug: redirect
uid: "lEhsh37n"
address: "web dev//SEO//redirect"
name: "redirect"
date: "2026-09-08"
aliases: ["301", "302", "HTTP redirect"]
---
A response that sends the client from one URL to another. You arrive at an address and find a sign: "we moved here".
- It is an HTTP status (301 permanent, 302 or 307 temporary) plus a Location header; the browser or the [[JGc7uotQ|fetcher]] follows it. A permanent redirect tells the [[GYSeFtBh|indexer]] to transfer the old URL's standing to the new one.
- Chains of redirects cost a fetch each and eventually get cut off; loops make the page unreachable. Redirects are also how legacy URLs stay valid after a site restructures, as this site does for its old note paths.
- A redirect changes where you are; a [[7CmKo3ct|canonical]] only changes which copy gets the credit.
