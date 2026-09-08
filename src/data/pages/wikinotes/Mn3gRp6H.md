---
uid: "Mn3gRp6H"
address: "Web Dev//dev proxy"
name: "Dev Proxy"
date: "2026-03-10"
---
>> 26.03.10 - vite proxies /api/* to wrangler on :8788. browser has no idea it's talking to two processes. this is the kind of thing that takes 40 minutes to understand and 3 seconds to configure. proxy: { '/api': { target: 'http://localhost:8788' } }. that's it. production doesn't need this because pages serves both from the same domain. the proxy only exists to make dev feel like prod. clean.

Proxy in a development environment: the frontend dev server forwards certain requests to another server (backend) on a different port. Avoids CORS issues and simulates the production environment where everything lives on the same domain.

Concrete example with [[Vp8rBm5J|Vite]] + [[Nx9sGt5L|Wrangler]]:
- Vite runs on `localhost:5173` (frontend)
- Wrangler runs on `localhost:8788` (API + [[Wn4pCx7H|D1]])
- In `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8788',
  },
}
```

- Browser requests `/api/contacts` from Vite (5173). Vite sees it's `/api/*`, forwards it to Wrangler (8788). Wrangler queries D1 and returns JSON. The browser has no idea the response came from a different port.
- In production there's no proxy -- [[Fs8tBm3G|Pages]] serves frontend and API from the same domain
