---
uid: "Rn4kWx8L"
address: "Cloud//Resend"
name: "Resend"
date: "2026-03-12"
---
Transactional email API. [[Ex5rTm9K|External API]]: your app calls Resend via HTTP to send emails. No SMTP server to manage.
- Send emails via REST API or SDK. Supports React Email templates (JSX → HTML emails).
- Use cases: welcome emails, password resets, notifications, receipts, anything triggered by your app
- Your [[Vf6kRm2D|Vercel Function]] or [[Bk9sTm2J|backend]] calls `resend.emails.send()` → Resend handles delivery, DKIM, SPF, bounce tracking
- Alternative to SendGrid, Mailgun, AWS SES, but with a developer-first API and React Email integration
- For bulk email (newsletters, marketing), you'd use a different tool. Resend is for transactional (event-triggered) email.
