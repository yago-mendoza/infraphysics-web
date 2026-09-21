---
slug: custom-domain
uid: "Cd6yMw2S"
address: "infrastructure//Cloudflare//Pages//custom domain"
name: "custom domain"
date: "2026-09-19"
aliases: ["522", "error 522"]
---
A custom domain is a name owned by the site operator and attached to a [[Fs8tBm3G|Pages]] project, so that the site answers at `demo.example.com` and not only at its [[Pd4kVz8N|pages.dev]] address. It takes two separate things, and having one without the other fails in a recognisable way.

- The first is a DNS record in the [[Zn5qHc7M|zone]] saying that the name goes to Cloudflare. DNS points the name.
- The second is the name registered in the Pages project. A subdomain needs its name registered in the Pages project, each one separately: having `www` on the list does nothing for `demo`.
- With the record and without the registration, the request reaches Cloudflare and no project claims it: the visitor sees **error 522**.
- With the registration and without the record, the name resolves to nothing and never reaches the project.

For a subdomain the record can be a CNAME kept at any DNS provider. For the bare domain the rules are stricter, as [[Ax2wJf6R|apex]] explains.

## Interactions

- [[Nx9sGt5L|Wrangler]] : : Wrangler only uploads files; attaching a domain to the project is a different operation, done through the domains endpoint of the API or in the dashboard, and a deploy never does it
