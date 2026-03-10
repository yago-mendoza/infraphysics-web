---
uid: "Yw7cFx2D"
address: "Web Dev//npx"
name: "npx"
date: "2026-03-10"
---
[[Wk6jPs2D|Node.js]] package runner. Executes packages from the npm registry without installing them globally.
- `npx wrangler dev` runs [[Nx9sGt5L|wrangler]] directly -- no need for `npm install -g wrangler` first
- If the package is already installed locally (in `node_modules/`), it uses that. If not, it downloads it temporarily, runs it, and discards it.
- Comes bundled with npm (which comes with Node.js). No separate installation needed.
- Typical use: running framework CLIs (`npx create-react-app`, `npx vite`, `npx wrangler`) or one-off tools without polluting the global system
