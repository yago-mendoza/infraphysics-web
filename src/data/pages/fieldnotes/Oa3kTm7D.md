---
uid: "Oa3kTm7D"
address: "Security//OAuth 2.0"
name: "OAuth 2.0"
date: "2026-03-12"
---
Authorization protocol that lets a user grant a third-party app access to their data on another service — without sharing their password. The user talks directly to the service (Google, GitHub, etc.), gives permission, and the service hands the app a scoped token.
- The app never sees the user's password. It only gets a token with specific permissions (scopes): "read emails", "view profile", "manage calendar".
- Flow: user clicks "Sign in with Google" → redirected to Google → user consents → Google sends a token back to the app → the app uses that token to call [[vf6KPYwT|Google APIs]] on behalf of the user.
- Having [[2DTZTKbQ|Gmail API]] in your service is like having an appendix of Google in your app. The user gives permission to Google directly, and Google gives you the key to their mailbox. Same pattern for Drive, Calendar, GitHub repos, Slack workspaces.
- [[Sb7tRx5K|Supabase]] uses OAuth 2.0 for its built-in auth — users can sign in with Google, GitHub, etc. and Supabase handles the token exchange.
- [[KyOPadSs|Tokens]] expire. Refresh tokens let the app get new access tokens without bothering the user again.
- The handshake: frontend invokes OAuth popup → Google asks consent → user says yes → Google sends a code to the [[odwaJwaf|callback URL]] → the server (or [[JD6PRNFD|Supabase Auth]]) exchanges the code for access + refresh tokens. One round-trip, then everything flows.
- The [[PkRkL6kd|publishable key]] lives in the frontend (to trigger the popup). The [[PkRkL6kd|secret key]] lives on the server (to complete the exchange). Google Cloud Console is where you register the app, get both keys, and set the callback URL.
- Why can't you skip credentials and just use a library? Because Google needs to control who accesses its users' data. The credentials are the permission: "I'm this app, here's my callback, these are my credentials." Without them, Google rejects everything. The library (SDK) knows *how* to talk to Google. The credentials are the *permission* to do it.
