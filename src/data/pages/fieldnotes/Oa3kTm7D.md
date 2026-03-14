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
- Tokens expire. Refresh tokens let the app get new access tokens without bothering the user again.
