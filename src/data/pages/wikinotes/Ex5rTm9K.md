---
uid: "Ex5rTm9K"
address: "Web Dev//API//external API"
name: "External API"
date: "2026-03-12"
---
Pattern where your app makes HTTP requests directly to a third-party service. The service doesn't run inside your server. It lives somewhere else, and you consume it via HTTP.
- Your app is responsible for everything: [[Tm8rBx5K|timeouts]], retries, error handling, authentication, and managing state between calls
- The request happens synchronously inside your [[Bk9sTm2J|backend]] handler (or [[Vf6kRm2D|Vercel Function]]). If the external service is slow, your function waits, and if it waits too long, you hit the [[Tm8rBx5K|timeout]].
- Examples: [[2DTZTKbQ|Gmail API]], [[vf6KPYwT|Google APIs]], [[Rn4kWx8L|Resend]] (email), [[Se7tBm3D|Sentry]] (errors), [[Ph2rDx6K|PostHog]] (analytics), [[Up9sTm4H|Upstash]] (Redis), [[Pc7sTm2K|Pinecone]] (vectors), [[Sb7tRx5K|Supabase]]. All are external APIs that your app calls via HTTP
- [[Oa3kTm7D|OAuth 2.0]] is the standard auth pattern: the user gives permission to the external service, the service gives your app a token
- For heavy batch work against external APIs (e.g. thousands of Gmail calls), a single function will timeout. That's where [[Ev3pNx7L|event-driven processing]] takes over.

## Interactions
- [[Ev3pNx7L|Event-driven API]] : : external API = your app makes the request and waits. Event-driven = your app fires an event and the processing happens outside your request. External is simpler; event-driven handles heavy/long work.
