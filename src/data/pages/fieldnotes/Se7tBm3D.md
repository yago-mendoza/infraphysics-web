---
uid: "Se7tBm3D"
address: "Cloud//Sentry"
name: "Sentry"
date: "2026-03-12"
---
Error monitoring and performance tracking. [[Ex5rTm9K|External API]]: a small SDK in your app captures errors and sends them to Sentry's servers via HTTP.
- Catches unhandled exceptions, logs stack traces, groups similar errors, alerts on spikes
- Performance monitoring: tracks request latency, slow queries, frontend render times
- SDKs for [[Rc4pBn9L|React]], [[Nx5tWs7J|Next.js]], [[Wk6jPs2D|Node.js]], Python, etc.: drop in and it starts reporting
- Nothing runs on your server: the SDK just sends telemetry data out to Sentry's [[Ex5rTm9K|external API]]
