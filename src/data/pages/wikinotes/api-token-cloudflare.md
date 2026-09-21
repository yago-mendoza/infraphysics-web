---
slug: api-token-cloudflare
uid: "At2rGm7K"
address: "infrastructure//Cloudflare//API token"
name: "API token"
date: "2026-09-19"
---
An API token is the credential a script uses to act on [[Hp5nVw9C|Cloudflare]], and each one carries its own permissions. A token issued to publish a [[Fs8tBm3G|Pages]] project can modify that project and nothing else; editing the records of a [[Zn5qHc7M|zone]] needs a different token with DNS permission. The [[Rg7mKd2Q|registrar]] is a third key again, since it controls the delegation.

Keeping them separate bounds a leak. Whoever obtains the publishing token can replace the site and cannot touch the DNS of the domain, which is the reason to issue the DNS key apart.

A configuration file that lists which zones and projects belong to a deployment describes resources; it grants nothing. Declaring a zone there is a local statement, *this domain is ours*, and the permission comes only from the token. A zone can sit declared for hours before the credential exists, and during those hours nothing can be written to it.

## Interactions

- [[KyOPadSs|token]] : : The same idea as an access token, a string that carries a permission, issued here by hand for a machine and with no user session behind it
- [[PkRkL6kd|API key]] : : An API key mostly identifies which app is calling; a Cloudflare API token is scoped, and the scope is the whole point
