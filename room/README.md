# Polymath web room

This is the persistent design room for the visual and editorial reconstruction of InfraPhysics.

It records the reasoning behind the work, open questions, rejected directions, and decisions that should survive context changes.

## Current north star

Build a bilingual personal laboratory for learning, building, connecting ideas, and going deep when curiosity demands it.

The site should feel:

- sober, elegant, spacious, and intellectually alive;
- broad without feeling scattered;
- technically credible without looking like a frontend portfolio or internal dashboard;
- personal without becoming a highly configurable product;
- useful to a curious general reader and legible to someone evaluating the author's potential.

## Working identity

The implicit brand is polymathing: a generalist who can move between systems thinking, industrial engineering, robotics, control, networks, mathematics, materials, supply chains, data centers, AI, and the human brain—and can go deep enough to build, explain, or simulate.

The site is not primarily a career page or a live learning diary. It is the durable body of work left after curiosity has done its filtering: things worth keeping, explaining, connecting, or building.

## Architecture decision (2026-08-25)

Keep the public structure small. The working top-level navigation is:

`Home · Writing · Projects · About · Contact`

Content formats are separate from sections and topics:

- Note: short observation or connection;
- Essay: developed argument or view;
- Rabbit hole: deep investigation with an origin, synthesis, and possibly an artefact;
- Technical: explanation, tutorial, model, diagram, or code;
- Opinion: an explicit position;
- Project: something built, simulated, or tested;
- Series: a group of related pieces.

Topics and cross-cutting patterns belong to tags, not top-level pages. Examples include systems thinking, control theory, robotics, AI, brains, networks, datacenters, capacity, failure, and resilience.

The Second Brain is neither a format nor a topic taxonomy. It is the connected knowledge infrastructure behind the public work, exposed only as much as it helps discovery.

Do not force every piece to display a "related to" explanation. Connections should appear naturally through series, links, related work, and occasional visual maps when useful.

## Explicit constraints

- English and Spanish versions should coexist, with a simple settings control.
- Prefer a light visual direction initially, but test it against a refined dark alternative rather than assuming either one.
- Remove 3D and reduce flashy purple-on-black Second Brain presentation.
- Remove or greatly reduce public-facing node editing, graph controls, and software-like complexity.
- Keep the Second Brain as a useful internal encyclopedia / knowledge map, presented simply.
- Preserve breadth and depth without making the site feel crowded.
- Prefer simple content primitives and established frameworks over custom HTML injection where possible.
- Iterate in small visual steps and show the result before extending the system.
- Do not frame the work as temporary "currently learning" content unless that state is genuinely useful.
- Make it fast to turn a conversation, insight, sketch, or research path into a finished public artefact.
