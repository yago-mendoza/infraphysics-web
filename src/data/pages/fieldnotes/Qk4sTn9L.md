---
uid: "Qk4sTn9L"
address: "Web Dev//HMR"
name: "HMR"
date: "2026-03-10"
---
Hot Module Replacement -- when you change a source file, the browser updates only the affected module without a full page reload. App state (forms, scroll position, data) is preserved.
- [[Vp8rBm5J|Vite]] provides HMR for frontend: change a `.tsx` file, the component updates in the browser instantly
- [[Nx9sGt5L|Wrangler]] has HMR for functions (API/backend): change a handler, Wrangler reloads it. But it does NOT have HMR for frontend -- it serves pre-compiled files from `dist/`
- That's why development uses two terminals: Vite for frontend HMR, Wrangler for the API
- Without HMR, every change requires: save --> rebuild --> manually reload page. With HMR: save --> change appears in the browser
