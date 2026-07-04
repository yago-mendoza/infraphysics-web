---
uid: "Sb7tRx5K"
address: "Cloud//Supabase"
name: "Supabase"
date: "2026-03-12"
---
Open-source backend-as-a-service built on [[Pg6tRw2H|PostgreSQL]]. Combines auth/roles + a robust relational database + real-time APIs in one service. It's a [[Bk9sTm2J|backend]] for your users: a separate server from your [[ISjyfjZ6|frontend]] that communicates via API.
- The database IS PostgreSQL: full [[Sv2nKx8R|SQL]], JOINs, and you can install extensions like [[Pv3kBx9D|pgvector]] for vector search
- Auth with roles: email, [[Oa3kTm7D|OAuth]], magic links. Built in with row-level security (RLS). Users get permissions per table, per row. No third-party auth service needed.
- Real-time: subscribe to database changes via WebSockets. The API pushes updates to connected clients instantly
- Storage: file uploads with access control (like a simple [[S3m8Kw4R|S3]])
- SDK for [[Rc4pBn9L|React]], [[Nx5tWs7J|Next.js]], Flutter: client libraries that talk to the Supabase API
- Common pairing: [[Vc3pLx8B|Vercel]] + Supabase = frontend on Vercel, database + auth + storage + real-time on Supabase
- The PostgreSQL they give you is yours to use however you want. If you need to store additional client data, run custom queries, or add tables beyond what the SDK manages, you can connect directly and use it as a regular Postgres database. Full access.
- **Table Editor vs SQL Editor**: the Table Editor is visual: spreadsheet view, click to edit rows, filter, sort. The SQL Editor is for commands: [[1sqlzLdR|DDL]], [[PrjC4wIH|triggers]], [[UU9d6RWw|indexes]], [[iegOPp9Q|RLS]] policies, complex queries. Table Editor only touches rows; SQL Editor can do everything. It even lets you save queries as favorites.
- **Architecture**: URL (where the "building" is) + publishable [[PkRkL6kd|key]] (front door, light lock) + [[KyOPadSs|session token]] per user (real identity) + [[iegOPp9Q|RLS]] (the database-level lock). The publishable key is not the security. The token + RLS is.
- [[JD6PRNFD|Supabase Auth]] handles [[Oa3kTm7D|OAuth]] natively with Google: one login does both identity + Gmail access.
