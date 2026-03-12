---
uid: "vf6KPYwT"
address: "Google//APIs"
name: "APIs"
date: "2026-03-10"
---
The umbrella for Google's 400+ REST and gRPC APIs — Maps, Gmail, Drive, YouTube, Cloud, Ads, and everything else. All managed through [[Ng9LJhY5|Google Cloud Console]].
- Authentication: OAuth 2.0 (user data) or API keys (public data). Service accounts for server-to-server.
- Client libraries in most languages (Python, JS, Java, Go, etc.) — generated from discovery documents.
- API Explorer: browser-based tool to test any Google API call without code.
- Billing: some APIs are free (Calendar, basic Gmail), others are pay-per-use ([[CVqN8DmF|Maps]], Cloud AI, BigQuery).
- Rate limits vary wildly per API. Exponential backoff is standard practice.

## Interactions

- [[2DTZTKbQ]] : : Gmail API is one of the most used Google APIs — representative of the OAuth + REST pattern
- [[CVqN8DmF]] : : Maps Platform is the highest-revenue public API family — pay-per-use model
