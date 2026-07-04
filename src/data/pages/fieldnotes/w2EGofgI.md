---
uid: "w2EGofgI"
address: "Web Dev//SDK"
name: "SDK"
date: "2026-03-15"
---
Wrapper around an [[Ap8rTm3K|API]]. A library that makes talking to a service easier. Instead of writing `fetch('https://supabase.co/rest/v1/contacts')`, you write `supabase.from('contacts').select()`. It puts HTTP requests into typed functions: for mobile apps, [[Wk6jPs2D|Node.js]] servers, Python scripts, whatever platform.
- Not the same as **helpers**: helpers (like `@supabase/ssr`) are framework-specific extras. The [[Sb7tRx5K|Supabase]] SDK is generic TypeScript; the SSR helpers are specifically for [[Nx5tWs7J|Next.js]]: they manage session [[Kg1BQEh8|cookies]] between browser and server. Without them, four lines instead of forty, but you'd have to write the cookie logic yourself.
- A nice way to think about it: a browser tab is like an SDK for people who don't code. You give them a visual layer over the same operations an SDK does with functions. The user has permissions and touches their [[Sb7tRx5K|Supabase]] ([[iegOPp9Q|RLS]] protected), same as an SDK would, but with clicks instead of code.
