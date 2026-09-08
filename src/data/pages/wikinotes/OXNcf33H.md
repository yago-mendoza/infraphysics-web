---
uid: "OXNcf33H"
address: "Web Dev//UI//Schema-Driven UI//Configurable Data Model"
name: "Configurable Data Model"
date: "2026-03-19"
---

The product pattern where the data model itself is user-configurable -- the schema is the product. Airtable, Notion databases, headless CRMs, and any platform where users define their own entity types, fields, and relationships.

- Sits between "fixed schema with customization options" (HubSpot custom properties) and "write your own code" (bespoke CRM)
- The user builds the schema through UI (drag fields, set types, define relations) rather than writing SQL or code
- Storage typically uses [[1jNpLuZz|EAV]], JSONB columns, or a hybrid -- the flexibility cost is paid at the database layer
- The hard part isn't storing flexible data -- it's querying, indexing, and validating it efficiently
- Airtable solved it with per-base SQLite. Notion solved it with a single enormous Postgres table. Neither is elegant.

## Interactions

- [[Uf7pLs4Q|CRUD]] : : a configurable data model generates its CRUD operations from the schema -- the user never defines endpoints, they define entities
