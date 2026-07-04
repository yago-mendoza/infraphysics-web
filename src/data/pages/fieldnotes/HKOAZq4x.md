---
uid: "HKOAZq4x"
address: "Cloud//Supabase//credentials"
name: "Supabase Credentials"
date: "2026-03-15"
---
The three pieces that connect your app to [[Sb7tRx5K|Supabase]]. Think of it as: address, front door key, and master key.
- **URL** (`SUPABASE_URL`): where the building is. The address of your Supabase instance. Public, everyone can know it.
- **Publishable key** (`SUPABASE_ANON_KEY`): the front door. A light lock that identifies which app is calling. Every user's browser gets it. It's NOT the security, just enough for Supabase to know who's knocking. The real security is the [[KyOPadSs|session token]] + [[iegOPp9Q|RLS]].
- **Secret key** (`SUPABASE_SERVICE_ROLE_KEY`): the master key. Bypasses [[iegOPp9Q|RLS]] entirely: full access to every row in every table. Lives ONLY on the [[Bk9sTm2J|backend]], in [[tHKwydrv|environment variables]]. Never, ever reaches the browser. If this leaks, anyone can read any user's data.
- All three go in `.env.local` for local dev. In production ([[Vc3pLx8B|Vercel]], [[Fs8tBm3G|Cloudflare]]), they live in the platform's secrets dashboard. The [[G1anmsE1|SDK]] reads URL + anon key. The server reads URL + service role key.
- The publishable key on the frontend is fine because it can't do anything without a valid session token. RLS makes sure every query is scoped to the authenticated user. The key opens the door, but the bouncer (RLS) checks your ID.
