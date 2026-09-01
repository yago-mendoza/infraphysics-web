---
uid: "JD6PRNFD"
address: "Infrastructure//Supabase//Auth"
name: "Auth"
date: "2026-03-15"
---
[[Sb7tRx5K|Supabase]]'s built-in authentication system. It's like a toboggan that catches things: you plug in [[Oa3kTm7D|OAuth]] (which is part of its [[w2EGofgI|SDK]]) and it talks directly to Google's API. But Google creates the [[KyOPadSs|tokens]], not Supabase. Supabase just handles the handshake and stores the result.

**The full chain, one time, at the beginning:**
- The [[ISjyfjZ6|frontend]] triggers OAuth. The publishable [[PkRkL6kd|key]] is in the frontend so it knows how to wake up the OAuth popup.
- Google's account system sees which web is making the request and shows the consent popup: "This app wants to read your email. Allow?"
- The user says yes. Google says "okay, permission granted, but to whom?" That's where the [[odwaJwaf|callback URL]] comes in: Google knows our backend because we gave it Supabase's URL when configuring the [[Ng9LJhY5|Google Cloud]] project.
- Google sends a code to Supabase. Supabase catches it automatically. Like a mafia guy, it handles everything for us. It verifies the code, receives the tokens (access + refresh for Gmail), creates the user in `auth.users`, and hands us the tokens once.
- We store the Gmail tokens in our custom `profiles` table. The session token goes into the browser's [[Kg1BQEh8|cookies]]. From here, every request carries identity, and the backend uses the stored Gmail tokens to read email via the [[2DTZTKbQ|Gmail API]].
- The reason this works: we went to Credentials in [[Ng9LJhY5|Google Cloud Console]] and gave it the Client Secret. That's how Supabase can prove it's our legitimate service during the handshake. Google Cloud is where we registered our app and said "trust Supabase when it sends you our users."

Elegant. One handshake per user, one time, everything flows after that. [[iegOPp9Q|RLS]] on the database side ensures each user only sees their own data.

## Interactions
- [[Oa3kTm7D|OAuth 2.0]] : : Supabase Auth wraps the OAuth handshake into a managed flow: you configure credentials once and Supabase handles the code exchange, token storage, and session management automatically
