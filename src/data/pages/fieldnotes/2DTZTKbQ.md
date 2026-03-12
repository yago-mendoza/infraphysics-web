---
uid: "2DTZTKbQ"
address: "Google//Gmail API"
name: "Gmail API"
date: "2026-03-10"
---
REST API for programmatic access to Gmail mailboxes — read, send, label, search, and manage email without the Gmail UI.
- OAuth 2.0 scoped access: read-only, send-only, or full access. Users must consent explicitly.
- Common uses: automated email parsing (invoices, receipts), CRM integrations, notification systems, email migration tools
- Watch API: push notifications via Google Cloud Pub/Sub when new mail arrives — no polling needed
- Quotas: 250 sends/day for regular accounts, higher for Workspace. Rate limits per user and per project.
- Not SMTP: the Gmail API is HTTP/JSON-based. For SMTP relay (legacy apps, printers, IoT devices), Gmail's SMTP server is a separate thing.
- Managed through [[Ng9LJhY5|Google Cloud Console]] (API enablement, credentials, quotas)
