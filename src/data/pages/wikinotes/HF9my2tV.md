---
uid: "HF9my2tV"
address: "Web Dev//UI//Schema-Driven UI//DSL"
name: "DSL"
date: "2026-03-19"
---

Domain-Specific Language -- a language designed for a narrow problem domain rather than general-purpose programming. SQL is a DSL for relational data. CSS is a DSL for styling. Terraform HCL is a DSL for infrastructure.

- When a schema-driven UI config becomes expressive enough (conditionals, computed fields, validation expressions), it *is* a DSL
- Internal DSL: embedded in a host language (React JSX, Ruby ActiveRecord queries, Drizzle ORM's query builder)
- External DSL: standalone syntax with its own parser (SQL, regex, GraphQL)
- The power/complexity tradeoff: a DSL restricts what you can express, which is the point -- constraints make it harder to do the wrong thing
- Risk: a DSL that keeps growing features eventually becomes a bad general-purpose language (see: Salesforce SOQL, Jira JQL growing conditionals)
