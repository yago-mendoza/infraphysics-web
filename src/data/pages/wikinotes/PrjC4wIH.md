---
uid: "PrjC4wIH"
address: "Web Dev//SQL//trigger"
name: "Trigger"
date: "2026-03-15"
---
Code that runs automatically when something happens in a table. You don't call it. The database calls it for you.
- Fires on `INSERT`, `UPDATE`, or `DELETE`. Can run `BEFORE` or `AFTER` the event.
- Example: Roberto's apartment is sold → a trigger automatically invalidates all his matches. Zero extra code needed in the [[Bk9sTm2J|backend]].
- A trigger is a function (`CREATE FUNCTION`) + a binding (`CREATE TRIGGER ... ON table`). The function defines the logic, the binding defines when it fires.
- In [[Sb7tRx5K|Supabase]], triggers are created in the SQL Editor. The Table Editor can't touch them: it only shows rows.
- The invisible automation layer: triggers are one of the things that make a database more than a spreadsheet. The data reacts to itself.

## Interactions
- [[iegOPp9Q|RLS]] : : both are database-level mechanisms that execute without application code: RLS filters reads, triggers automate writes. Together they make the DB self-governing.
