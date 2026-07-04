---
uid: "odwaJwaf"
address: "Security//OAuth 2.0//callback URL"
name: "Callback URL"
date: "2026-03-15"
---
The redirect address where Google sends the authorization code after the user consents. It's how Google knows where to deliver the handshake.
- You register it in [[Ng9LJhY5|Google Cloud Console]] when setting up credentials: "when a user from my app says yes, send the code HERE."
- In a [[Sb7tRx5K|Supabase]] setup, the callback URL points to Supabase's auth endpoint. Supabase handles the code exchange automatically. You copy Supabase's callback URL into Google's config, and Google's Client ID + Client Secret into Supabase's config. They shake hands.
- This is the link that makes the whole [[Oa3kTm7D|OAuth]] chain work: frontend triggers the popup → Google asks the user → user says yes → Google sends a code to this URL → Supabase catches it, exchanges it for [[KyOPadSs|tokens]], and creates the user. One handshake, one time, elegant.
- If the callback URL doesn't match exactly, Google rejects the entire flow. No partial matches, no wildcards in production.
