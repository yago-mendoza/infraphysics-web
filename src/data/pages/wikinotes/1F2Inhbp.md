---
uid: "1F2Inhbp"
address: "Web Dev//frontend//layout//viewport"
name: "Viewport"
date: "2026-03-10"
---
The rectangular area of the browser window where content is visible. Everything the user can see without scrolling fits inside the viewport. Its dimensions drive responsive design, media queries, and viewport-relative units.

- `<meta name="viewport" content="width=device-width, initial-scale=1.0">` -- tells mobile browsers to match the viewport width to the device screen instead of defaulting to a ~980px desktop layout. Without it, the page renders at desktop width and gets scaled down to fit, making everything tiny.
- **Visual viewport** vs **layout viewport**: the layout viewport is the full area the page is rendered into (controlled by the meta tag). The visual viewport is the portion the user actually sees -- it shrinks when the user pinch-zooms in. On desktop they're usually identical. On mobile, pinch-zoom separates them.
- **Viewport units**: `vw` (1% of viewport width), `vh` (1% of viewport height). Problem: on mobile, `100vh` includes the address bar area, so content overflows when the bar is visible.
- **Dynamic viewport units** (CSS spec 2022): `dvh` (dynamic viewport height) ** adjusts as the mobile browser chrome appears/disappears. `svh` (small ** with chrome visible), `lvh` (large -- chrome hidden). `dvh` is what most people actually want when they write `100vh`.
- **`window.innerWidth` / `window.innerHeight`**: JS access to the visual viewport dimensions. Changes on resize, orientation change, and zoom.