---
slug: fetching
uid: "JGc7uotQ"
address: "web dev//crawling//fetching"
name: "fetching"
date: "2026-09-08"
aliases: ["fetch", "HTTP fetch"]
---
Actually making the HTTP request and downloading the resource. Crawling says "let's go to that house"; fetching is knocking on the door and taking what they hand you.
- One fetch is one request over [[g9jb8QD1|HTTPS]]: headers, status code, body. The crawler identifies itself with a User-Agent; the server may answer with content, a [[lEhsh37n|redirect]], an error, or a login wall ([[4fbNv0Bm|authentication]]).
- What comes back is raw: an HTML string, JSON, XML, a PDF. It has not been understood yet; that is [[KAtZ68eQ|parsing]]. If the page builds itself with JavaScript, the fetched HTML may be an empty shell, which is where the [[BG5gXls1|rendering crawler]] comes in.
- Fetching is the only stage of [[RBmlX4Ar|crawling]] that touches the network, so it is where politeness, rate limits and blocking happen.

## Interactions

- [[g9jb8QD1|HTTPS]] : : A fetch is one HTTP request; crawling is the policy of which requests to make and in which order. The protocol note describes the door, the fetching note describes knocking on thousands of them
