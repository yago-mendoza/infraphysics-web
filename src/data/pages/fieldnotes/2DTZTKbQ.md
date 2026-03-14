---
uid: "2DTZTKbQ"
address: "Google//Gmail API"
name: "Gmail API"
date: "2026-03-10"
---
REST API for programmatic access to Gmail mailboxes — read, send, label, search, and manage email without the Gmail UI.
- Having Gmail API in your service is like having an appendix of Google in your app. The user talks directly to Google: gives permission via [[Oa3kTm7D|OAuth 2.0]], and Google hands your app a token to access that user's data. Your app never sees the user's password — just the scoped token Google gave you.
- OAuth 2.0 scoped access: read-only, send-only, or full access. Users must consent explicitly.
- Common uses: automated email parsing (invoices, receipts), CRM integrations, notification systems, email migration tools
- Watch API: push notifications via Google Cloud Pub/Sub when new mail arrives — no polling needed
- Quotas: 250 sends/day for regular accounts, higher for Workspace. Rate limits per user and per project. For heavy batch processing (e.g. scanning thousands of emails), a [[Vf6kRm2D|Vercel Function]] will [[Tm8rBx5K|timeout]] — you need a job queue like [[In7tWs3K|Inngest]] or [[Tr4pDx8L|Trigger.dev]] to process in chunks.
- Not SMTP: the Gmail API is HTTP/JSON-based. For SMTP relay (legacy apps, printers, IoT devices), Gmail's SMTP server is a separate thing.
- Managed through [[Ng9LJhY5|Google Cloud Console]] (API enablement, credentials, quotas)
