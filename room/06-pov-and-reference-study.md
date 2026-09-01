# POV, identity, and reference study

This document records what has been learned from the owner's feedback and from the Edu Calvo López reference site. It is part of the design memory and should guide future visual decisions.

## The author's point of view

The website is not primarily:

- a CV;
- a conventional engineering portfolio;
- a frontend showcase;
- a productivity dashboard;
- a public software product;
- a record of every temporary interest;
- a page trying to look like Silicon Valley.

It is a personal body of work from an engineer who is genuinely happy to study difficult things. The important quality is not a narrow professional label but the ability to move between domains, identify structure, learn deeply, and turn understanding into explanations, models, experiments, or projects.

The durable territory includes systems thinking, mathematics, data science, data centres, AI, industrial processes, control, robotics, networks, materials, supply chains, infrastructure, and the human brain. These are not a skills list. They are the terrain in which curiosity repeatedly finds useful problems.

The site should communicate:

- an engineer who is restless but not frantic;
- a generalist who can go deep without performing expertise;
- someone who builds because building is pleasurable;
- someone who studies because understanding is pleasurable;
- a person who values density of thought over looking fashionable;
- a mind that can connect theory, practice, failure, constraints, and systems;
- an honest person whose work should speak louder than branding.

## Emotional target

The desired emotional response is not amazement at the interface. It is quiet recognition:

> There is a real mind here. This person notices systems, enjoys hard problems, and makes ideas easier to enter.

The page should feel calm, spacious, exact, curious, and quietly happy. It must never feel like it is trying to prove intelligence through decoration.

## Engineering standard

The interface should behave like good engineering:

- minimum sufficient structure;
- high signal-to-noise ratio;
- clear hierarchy;
- useful constraints;
- graceful failure;
- easy traversal;
- depth available when wanted;
- no component without a job;
- no claim larger than the work supports.

White space is not emptiness. It is capacity. A limited content width is not a lack of ambition. It is a way to make the work legible.

## Reference: Edu Calvo López

Reference pages:

- https://educalvolopez.com/en/sites
- https://educalvolopez.com/en/blog
- https://educalvolopez.com/en/about

The useful lesson is primarily organization and format, not profession or copy.

### Organization

The reference makes a large amount of information feel manageable through a stable, repeated frame:

1. small contextual information;
2. identity and status;
3. clear primary navigation;
4. one focused page purpose;
5. a simple chronological or categorical stream;
6. a modest closing contact/social layer.

The content is extensive, but the interface does not expose the entire underlying system at once.

### Image and identity treatment

The portrait is not presented as a badge inside a software interface. It is part of the identity block. The image, name, role, handle, and connection route form one clear unit.

For InfraPhysics, the portrait should remain real and unforced. It may be treated with a restrained crop, monochrome or low-saturation treatment, a fine frame, or a small signal mark. It should not be surrounded by glows, stars, 3D objects, or pseudo-technical decoration.

### Page format

The reference uses generous margins, a limited central reading width, clear vertical rhythm, and repeated small metadata. Titles do most of the visual work. Lists are lighter than cards. A visitor can scan quickly without feeling the site is shallow.

The correct translation for InfraPhysics is not to copy the exact black background or text. It is to preserve:

- the discipline of the frame;
- the width limits;
- the stable margins;
- the clear hierarchy;
- the compact metadata;
- the use of small visual marks;
- the separation between identity, work, and contact.

### Navbar and footer

The reference navbar is compact, persistent, and secondary to the content. It does not compete with the title. Its grouping is immediately understandable and its rounded/floating treatment gives it a physical boundary without becoming a dashboard.

The InfraPhysics version should use the same organizational discipline while remaining quieter and more architectural. It may become a compact floating plate or restrained edge element rather than a large full-width toolbar.

The footer should close the page rather than repeat every route. It should contain a short identity line, contact/social routes, language, and a small copyright/colophon.

## Visual direction now

The strongest current direction is:

- black and warm white as the base;
- mineral/paper surfaces rather than pure web white;
- fine borders and generous margins;
- very restrained red and blue signals;
- a subtle system trace or process line only when it adds meaning;
- title-led pages;
- lists and streams instead of heavy cards;
- real images and explanatory diagrams;
- no starfield, no 3D decoration, no purple knowledge-graph spectacle;
- no Bauhaus-like grid as a complete identity;
- no visual element louder than the work.

## Translation into content

The public structure remains small:

`Home · Writing · Projects · About · Contact`

Formats remain separate from topics:

`Note · Essay · Rabbit hole · Technical · Opinion · Project · Series`

Tags describe domains and patterns. Second Brain remains the underlying archive and connection layer.

Series are important because they let a body of thought grow without forcing the entire site into a large taxonomy. A data-centre series, brain series, or systems series can move between essays, technical explanations, notes, and projects while remaining one recognizable investigation.

## What must be reviewed next

- navbar position, width, and physical boundary;
- footer density and content;
- content max-width and horizontal margins on every view;
- image crop and identity block;
- exact home-to-writing transition;
- whether the system trace remains or becomes article-only;
- article metadata and series presentation;
- About architecture around TRACE;
- Contact as an invitation to difficult problems;
- Second Brain as a quiet archive rather than a product.

## Geometry learned from the Edu Calvo reference

- The important borrowing is organizational, not orange styling: a deliberately narrow editorial center with useful ambient margins.
- Wide screens become three zones: visitor/place context, durable content, visits/theme/social context.
- At medium widths the rails disappear and the bottom navigation contracts into current section + Menu.
- At mobile widths navigation remains a small bottom plate and opens a full-height vertical index.
- Contact already has the right typographic voice. Propagate its serif/sans hierarchy; keep mono only for coordinates, dates and technical signals.
- The center should read as roughly 66–72 characters, with lists using the full center and images at text width or only slightly wider.

## Hero visual grammar

- One abstract system must imply optimization, compute fabric, data flow, neural dynamics and control without literal chip/brain/datacenter icons.
- Current direction: a potential landscape with minima, ridge, capacity contours, RGB data packets and damped trajectories with memory.
- It belongs underneath identity, not in a separate showcase box. Motion is slow and purposeful; reduced-motion remains first-class.
- External rendering libraries were evaluated. Pixi is excellent for very large sprite counts and regl for WebGL commands, but neither supplies the conceptual model. Prefer the smaller native canvas until GPU scale is genuinely needed.

## Naming the knowledge layer

- Public label: **Wiki**, not Archive or Second Brain.
- Archive implies stored finished pieces; Wiki correctly promises many terms, short reference entries and navigation through links.
- Keep "Second Brain" only as an internal implementation/domain name while migration remains expensive.
- The Wiki is an immersive knowledge surface. Ambient visitor/visits/social rails disappear throughout `/lab/second-brain`, including both index, entry and map views.

## Home visual experiments

- `/home` is the control: no animated visual at all.
- `/home1` is now a nonlinear closed-loop phase portrait: numerically integrated state trajectories, actuator saturation, energy and estimator uncertainty.
- `/home2` is a local gradient/Hessian field: many tiny directional traces reveal attractors and curvature without a literal surface.
- `/home3` is now a cyberphysical loop: sensing, state estimation, control, plant, feedback, a closed-loop step response and two-link robot kinematics.
- Keep content and layout identical across all four routes so evaluation isolates the visual instrument.

### Second exploration set

- `/home4`: Lorenz state-space sculpture; three nearly identical initial conditions expose deterministic chaos under a slow camera rotation.
- `/home5`: Gray–Scott reaction–diffusion; local equations produce emergent material/biological structure.
- `/home6`: Kuramoto oscillator network; distributed agents move from phase disagreement toward collective synchronization.
- Unlike experiments 1–3, these occupy a dedicated visual stage with no typography over them. The failed overlap in home3 demonstrated that mathematical legitimacy cannot compensate for poor information layering.
- `/home7` deliberately breaks the paper language: a dark interactive system aperture containing a time-dependent double-gyre flow. Pointer input adds a vortex and perturbs all trajectories. The disruption is encapsulated in its own stage so the editorial identity below remains calm.

### Third exploration rule: header atmosphere, not hero module

- The visual is the top counterpart of the footer: ambient framing behind the first viewport, never a module that pushes identity downward.
- All seven experiments now share full-viewport background geometry, controlled opacity and protected editorial hierarchy.
- `/home1` is the previously favored vector field. `/home2` becomes topographic contours; `/home3` wave interference; 4–7 retain chaos, emergence, synchronization and transport as quiet patterns.
- Every experiment has a distinct custom cursor on fine-pointer devices. Cursors disappear on touch devices and never change layout.

### Nordic material pass

- Home1 remains the vector-field benchmark; Home4 is retained and deepened with a mineral atmosphere, cold light, warm contamination and cast shadow.
- Home2–3 and Home5–7 are replaced by singular material gestures: frosted aurora, precision dial, paper strata, editorial modules and a metallic ribbon.
- Reference lesson from Linear, Anthropic, Vercel and World: memorable technical brands repeat one legible object or gesture; they do not ask one hero visualization to enumerate every capability.
