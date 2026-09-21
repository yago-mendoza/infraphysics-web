---
slug: account-cloudflare
uid: "Ac9nXh5T"
address: "infrastructure//Cloudflare//account"
name: "account"
date: "2026-09-19"
---
An account is the container of everything a customer has in [[Hp5nVw9C|Cloudflare]]. One account holds any number of [[Zn5qHc7M|zones]] and any number of [[Fs8tBm3G|Pages]] projects; there is no one-to-one tie between a zone and a project, or between an account and either.

The account boundary matters in one case. To serve a site on the [[Ax2wJf6R|apex]] of a domain, the zone of that domain and the Pages project have to be in the same account. A zone in the client's account and a project in the agency's account can serve `www`, through a CNAME, and cannot serve the bare domain.

{bkqt/keyconcept}
A client who wants the site without `www` needs the apex. The apex needs zone and project together. The zone has to be the client's, because the domain is the client's. So the project lives in the client's account. It is not a preference, it is the only combination that works.
{/bkqt}
