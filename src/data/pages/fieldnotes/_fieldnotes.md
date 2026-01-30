Headless device
# Introduction
A computational unit (laptop) lacking [[UI//GUI]]. No display subsystem, no icons, no windows. Interface limited to command line (pure input/output via keyboard and ASCII code).
`some code`
---
LAPTOP//UI
Interface channel linking human intent to machine response (voice, neural, gesture, ...).
[[UI//GUI]]
---
IPAD//UI
...
[[LAPTOP//UI]]
---
UI//GUI
[[LAPTOP//UI]] subtype.
Fancy front-end for your bits.
---
IPAD
A device.
---
MEDIA//IMAGE ALIGNMENT
Images can be positioned in notes.
![code on screen](https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=400&auto=format&fit=crop "right:200px")
This text flows alongside the image on the right. Useful for annotating diagrams or referencing visual material inline.
---
compiler
The build-time system that transforms raw markdown into rendered HTML. Runs headlessly via Node.js — no [[UI//GUI]] involved. The pipeline is: pre-processors, side-image layout, marked.parse, post-processors, wiki-link injection.
[[compiler//pre-processor]]
[[compiler//post-processor]]
[[compiler//pipeline]]
---
compiler//pipeline
The ordered sequence of transformations applied to each markdown file. Custom syntax is resolved {_:before} marked runs, so HTML spans survive the markdown parser. Wiki-links are injected {_:after} all HTML is generated.
[[compiler//pre-processor]]
[[compiler//post-processor]]
[[compiler]]
---
compiler//pre-processor
A transformation rule applied to raw markdown {_:before} marked.parse. Each rule is a regex pattern with a replacement string. Pre-processors handle custom syntax like colored text, underlines, highlights, superscripts, subscripts, and keyboard keys.
[[compiler//pipeline]]
[[compiler]]
---
compiler//post-processor
A transformation rule applied to HTML {_:after} marked.parse. Currently unused but extensible — add entries to the postProcessors array in compiler.config.js.
[[compiler//pipeline]]
[[compiler]]
---
compiler//custom syntax
Inline formatting extensions beyond standard markdown. Defined as pre-processor rules in compiler.config.js. Includes: colored text, solid/dashed/dotted/wavy underlines, highlights, small caps, superscript, subscript, keyboard keys.
[[compiler//pre-processor]]
[[compiler]]