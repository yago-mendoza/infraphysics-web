---
slug: authentication
uid: "4fbNv0Bm"
address: "security//authentication"
name: "authentication"
date: "2026-09-08"
aliases: ["login", "identity verification"]
---
Checking who you are before letting you in. Here there is a lock and a key.
- Mechanisms: a password, a token, a certificate, a session cookie issued after one of them, a second factor. What they share is a verification step before access, which is what distinguishes them from a preference such as [[Cx7nWr4L|robots.txt]].
- Authentication answers "who are you"; authorization answers "what may you do". [[Oa3kTm7D|OAuth 2.0]] is an authorization framework that is often mistaken for the first. [[JD6PRNFD|Auth]] is one concrete implementation of both.
- For crawlers and agents it is the real boundary: everything before it is public by construction, whatever the robots file says, and everything behind it requires credentials, which is why [[rSBc7TP1|browser automation]] with a logged-in session needs the same care as a person.

## Interactions

- [[Oa3kTm7D|OAuth 2.0]] : : OAuth 2.0 delegates authorization (what a third party may do on your behalf) and only proves identity when OpenID Connect is layered on it. "Log in with Google" feels like authentication and is technically an authorization grant with an identity token attached
