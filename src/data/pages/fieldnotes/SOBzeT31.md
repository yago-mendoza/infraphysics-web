---
uid: "SOBzeT31"
address: "Web Dev//UI//Schema-Driven UI"
name: "Schema-Driven UI"
date: "2026-03-19"
---

UI generated from metadata definitions rather than hand-coded components. A schema describes fields, types, validation rules, and layout hints -- the runtime interprets the schema and renders the appropriate widgets.

- The schema is the single source of truth: add a field to the definition and the form, table, and API all update
- Trades per-screen polish for scalability -- one rendering engine serves hundreds of entity types
- Common in CRMs (Salesforce), issue trackers (Jira), and low-code platforms (Retool, Airtable)
- The spectrum runs from "config object that picks from a component library" to "full [[HF9my2tV|DSL]] with conditionals and computed fields"
- When the schema grows expressive enough, you're no longer configuring UI -- you're programming in a [[HF9my2tV|DSL]]

## Interactions

- [[PRWiYzcG|GUI]] : : GUI is the rendered output; schema-driven UI is a strategy for *generating* that output from metadata instead of hand-coding it
- [[Uf7pLs4Q|CRUD]] : : most schema-driven UIs auto-generate CRUD interfaces -- the schema defines what CRUD operates on
