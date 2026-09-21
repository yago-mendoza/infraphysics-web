---
slug: zone
uid: "Zn5qHc7M"
address: "web dev//DNS//zone"
name: "zone"
date: "2026-09-19"
aliases: ["DNS zone"]
---
A zone is the set of [[Jt7nKx4S|DNS]] records of one domain as held by whoever manages its DNS. The A record of the apex, the CNAME of each subdomain, the MX and TXT of the mail all live there. The answer to *where does this record go* is always the zone, never the [[Rg7mKd2Q|registrar]] as such and never the hosting.

Only one zone counts at a time, the one on the [[Ns4vTb8W|nameservers]] the registrar points to. A zone can exist at a provider, complete and correct, and be ignored by the whole internet because the delegation still points elsewhere.

- In [[Hp5nVw9C|Cloudflare]] a zone belongs to an [[Ac9nXh5T|account]], and one account holds any number of zones, one per domain.
- Moving a zone from one Cloudflare account to another carries nothing with it. The records are exported from the old account and imported into the new one by hand, and the certificates are issued again. A list of the client's records is the first thing to secure before any such move.
- Writing to a zone is a permission of its own, separate from publishing a site, as [[At2rGm7K|API token]] explains.

## Interactions

- [[Pv3wHm8R|domain]] : : The domain is the rented name and the zone is the set of records that say where that name points; one is held at the registrar and the other at whoever manages the DNS, which may be a different company
