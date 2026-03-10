---
uid: "Fs8tBm3G"
address: "Cloud//Cloudflare//Pages"
name: "Pages"
date: "2026-03-10"
---
[[Hp5nVw9C|Cloudflare]]'s platform for deploying websites. Serves both frontend and backend from the same domain.
- **Frontend**: static files from [[Ht6nWx3K|dist/]] (HTML, CSS, JS) -- the output of [[Vp8rBm5J|Vite]] build or any bundler
- **Backend**: [[Jn4xWp7B|serverless]] functions in the `functions/` directory, running on [[Lk2rXj6D|Workers]] under the hood. This is where the API framework ([[Xd9kLw4B|Hono]]) lives.
- Deploy via [[Nx9sGt5L|CLI]] (`wrangler pages deploy dist`) or connect a GitHub/GitLab repo for auto-deploy on push ([[Gk6tPm2H|CI/CD]])
- Free custom [[Pv3wHm8R|domains]], automatic HTTPS, preview deployments per branch
- The `functions/` directory turns a static site into a full-stack app -- frontend + API in one [[Dx8yLn3F|deployment]]
