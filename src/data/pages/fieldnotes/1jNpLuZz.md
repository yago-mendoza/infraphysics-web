---
uid: "1jNpLuZz"
address: "UI//Schema-Driven UI//EAV"
name: "EAV"
date: "2026-03-19"
---

Entity-Attribute-Value -- a database pattern where instead of one column per field, you store rows of (entity_id, attribute_name, value). Every "field" is a row, not a column.

- Enables unlimited custom fields without schema migrations -- Salesforce and Jira use this under the hood
- The tradeoff is brutal: no column types, no foreign keys, no indexes on specific attributes, queries become multi-join nightmares
- `SELECT value FROM attributes WHERE entity_id = 42 AND attribute = 'email'` vs `SELECT email FROM contacts WHERE id = 42`
- Querying "all contacts where email contains X" requires scanning the entire attributes table filtered by attribute name
- The alternative (and usually the better one): JSONB columns in [[Sv2nKx8R|SQL]] for flexible fields on top of a typed relational core

## Interactions

- [[Sv2nKx8R|SQL]] : : EAV trades away everything SQL is good at (types, constraints, indexes) in exchange for schema flexibility
