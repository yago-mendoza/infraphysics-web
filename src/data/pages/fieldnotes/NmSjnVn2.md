---
uid: "NmSjnVn2"
address: "Cloud//Supabase//Auth//handshake"
name: "OAuth Handshake"
date: "2026-03-15"
---
The one-time exchange where Google and [[Sb7tRx5K|Supabase]] establish trust for a user. Happens once per user, at login. After this, everything flows.

**The chain:**
- Frontend calls `supabase.auth.signInWithOAuth({ provider: 'google' })` → the [[G1anmsE1|SDK]] opens a Google popup
- Google sees which web is requesting and shows consent: "This app wants to read your email. Allow?"
- User says yes. Google says "okay — but to whom do I send the permission?" It checks the [[odwaJwaf|callback URL]] registered in [[Ng9LJhY5|Google Cloud Console]] — that URL points to Supabase
- Google sends an authorization code to Supabase. Supabase catches it — like a mafia guy, handles everything. Verifies the code using the Client Secret (from [[HKOAZq4x|credentials]]), receives access + refresh [[KyOPadSs|tokens]] for Gmail, creates the user in `auth.users`
- Supabase hands the tokens to us once. We store the Gmail tokens in our `profiles` table (server-side, never in the browser). The session token goes into the browser's [[Kg1BQEh8|cookies]]
- From here: every frontend request carries the session cookie → backend reads it → knows who the user is → uses stored Gmail tokens to call [[2DTZTKbQ|Gmail API]] → [[iegOPp9Q|RLS]] ensures each user only sees their own data

One handshake. One time. Elegant. The reason we configured Client ID + Client Secret in Google Cloud: so Supabase can prove it's our legitimate service during this exchange.
---
## Interactions
- [[odwaJwaf|Callback URL]] : : the callback URL is the specific address where Google delivers the authorization code — without it, Google doesn't know where to send the handshake
