---
uid: "iegOPp9Q"
address: "Security//RLS"
name: "RLS"
date: "2026-03-15"
aliases: ["Row Level Security"]
---
Database-level lock. Every row has an owner (`user_id`). RLS ensures only that owner can see it: even if the code has a bug that requests "give me all contacts" without filtering, the DB says "no, you're Carmen, you only get yours."
- Second layer of security: even if the first one fails (a [[Bk9sTm2J|backend]] bug, a badly protected endpoint), the DB holds. Malicious code can push, but the database won't release another user's data.
- In [[Sb7tRx5K|Supabase]]: enabled per table. Each table has policies like `SELECT only if auth.uid() = user_id`. Supabase connects this to its [[Oa3kTm7D|OAuth]] system: the session [[KyOPadSs|token]] identifies the user, and RLS filters automatically.
- Without RLS, security depends 100% on your code filtering correctly. With RLS, the DB is the last line of defense. The difference between "I trust I locked the door" and "the door locks itself."
---
## Interactions
- [[Oa3kTm7D|OAuth 2.0]] : : OAuth identifies who the user is (the session token). RLS uses that identity to decide which rows they can see. OAuth is "who are you", RLS is "what can you touch".
