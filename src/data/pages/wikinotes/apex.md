---
slug: apex
uid: "Ax2wJf6R"
address: "web dev//DNS//apex"
name: "apex"
date: "2026-09-19"
aliases: ["apex domain", "naked domain", "CNAME flattening"]
---
The apex is the domain with nothing in front of it: `example.com`, as opposed to the subdomain `www.example.com`; it is also called the **naked domain**. In a [[Zn5qHc7M|zone]] it is written `@`. The two behave differently because of one rule of the DNS standard: a CNAME is not allowed at the apex. The apex already carries records that are mandatory for the domain to exist, and a CNAME cannot share a name with any other record.

A subdomain can therefore be pointed at a hosting platform with a CNAME from any DNS provider, while the apex cannot. [[Hp5nVw9C|Cloudflare]] gets around the rule with a technique of its own, **CNAME flattening**, which resolves the alias internally and answers with addresses; it can only do that inside its own DNS.

{bkqt/keyconcept}
Serving a site on the bare domain from [[Fs8tBm3G|Pages]] is what forces the nameservers to move to Cloudflare. With `www` alone, a CNAME at the old DNS provider would have been enough.
{/bkqt}

## Interactions

- [[Ac9nXh5T|account]] : : On a subdomain the CNAME itself is the gesture that proves control of the name; the apex has no such gesture, so Cloudflare demands that the zone and the Pages project sit in the same account
