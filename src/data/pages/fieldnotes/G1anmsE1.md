---
uid: "G1anmsE1"
address: "Cloud//Supabase//SDK"
name: "Supabase SDK"
date: "2026-03-15"
distinct: ["Web Dev//SDK"]
---
[[Sb7tRx5K|Supabase]]'s client library — the specific [[w2EGofgI|SDK]] that wraps Supabase's [[WlyXzixc|REST]] API into typed functions. `npm install @supabase/supabase-js` and you're talking to your database in TypeScript.
- Initialize with URL + publishable [[PkRkL6kd|key]]: `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`. That's the whole setup.
- Database: `supabase.from('contacts').select()` instead of `fetch('https://xxx.supabase.co/rest/v1/contacts')`. Filters, joins, inserts, updates — all typed.
- Auth: `supabase.auth.signInWithOAuth({ provider: 'google' })` triggers the [[JD6PRNFD|Auth]] flow. One line to start the whole [[Oa3kTm7D|OAuth]] chain.
- Real-time: `supabase.channel('changes').on('postgres_changes', ...)` subscribes to live database updates via WebSockets.
- Works everywhere: browser, [[Wk6jPs2D|Node.js]] server, React Native, Flutter. The SDK is platform-agnostic.
- **Not the same as helpers**: `@supabase/ssr` is the [[Nx5tWs7J|Next.js]]-specific layer on top. The SDK talks to Supabase; the helpers manage [[Kg1BQEh8|cookies]] and server-side session handling. SDK = generic. Helpers = framework glue.
