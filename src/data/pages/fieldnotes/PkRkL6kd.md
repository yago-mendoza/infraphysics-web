---
uid: "PkRkL6kd"
address: "Security//API key"
name: "API Key"
date: "2026-03-15"
---
A credential that identifies your app to a service. Two kinds, and they live in different places:
- **Publishable key** (public) — lives in the [[ISjyfjZ6|frontend]]. Everyone's browser gets it. It's the light lock — enough to know which app is calling, but not enough to access data. In [[Sb7tRx5K|Supabase]], it's the URL + anon key that tells the [[w2EGofgI|SDK]] where the "building" is and opens the front door. The real security is the [[KyOPadSs|token]] + [[iegOPp9Q|RLS]].
- **Secret key** (private) — lives ONLY on the [[Bk9sTm2J|backend]]. Never reaches the browser. In Supabase, the service role key bypasses RLS entirely — it's the master key. In [[Ng9LJhY5|Google Cloud]], the Client Secret proves your server is who it claims to be during the [[Oa3kTm7D|OAuth]] handshake.
- Stored in [[tHKwydrv|environment variables]] (`.env.local` in dev, dashboard in production). Never committed to git, never sent to the frontend.
