---
uid: "WlyXzixc"
address: "Web Dev//API//REST"
name: "REST"
date: "2026-03-15"
---
An [[Ap8rTm3K|API]] style based on HTTP verbs + URL patterns. The most common way to structure a web API.
- `GET /contacts` — give me the contacts
- `POST /contacts` — create a new one
- `GET /contacts/123` — give me this specific one
- `PUT /contacts/123` — replace this one entirely
- `PATCH /contacts/123` — update some fields
- `DELETE /contacts/123` — delete this one
- The URL identifies the resource, the verb says what to do with it. Clean, predictable, stateless.
- [[Sb7tRx5K|Supabase]] creates REST endpoints automatically from your tables. Define a table, and `GET /rest/v1/contacts` already works — no backend code needed. The [[w2EGofgI|SDK]] wraps these into typed functions.
- REST is the default. Alternatives: GraphQL (one endpoint, flexible queries), WebSockets (real-time, bidirectional), RPC (function calls, not resources).
