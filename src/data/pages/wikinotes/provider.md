---
slug: provider
uid: "Pv6cDn2Y"
address: "web dev//provider"
name: "provider"
date: "2026-09-19"
aliases: ["hosting provider", "DNS provider", "hosting"]
---
A provider is a company, and a website depends on three separate jobs that a company can do for it. The word hides that separation: *the provider* may mean whoever rents out the name, whoever answers the questions about the name, or whoever keeps the files, and those can be one company, two or three.

- The [[Rg7mKd2Q|registrar]] rents the [[Pv3wHm8R|domain]] by the year and controls the delegation: its panel is where the [[Ns4vTb8W|nameservers]] are written.
- The **DNS provider** holds the [[Zn5qHc7M|zone]] and answers for it: the A, CNAME, MX and TXT records live with whoever manages the [[Jt7nKx4S|DNS]] of that domain, and nowhere else.
- The **hosting provider** is where the site lives. Hosting keeps files and DNS keeps addresses; a record for a subdomain is never stored at the hosting, even when the same company sells both.

A company that sells the three (a registrar with its default DNS and a hosting plan, a site builder that also registered the name) makes them look like one product. They still separate cleanly: each job can be moved to another company without moving the other two, and most confusion about *where do I change this* is a confusion about which of the three jobs the change belongs to.

## Interactions

- [[Hp5nVw9C|Cloudflare]] : : Cloudflare can hold all three jobs for one domain, registrar, DNS and hosting through Pages, which is convenient and is also why its dashboard has to be read as three products and not one
