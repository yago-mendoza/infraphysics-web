# Long reconstruction roadmap

This is the working map for the complete visual and experiential reconstruction. It is intentionally expansive. The implementation should move continuously through the list, but each stage must leave the project buildable and understandable.

## A. Identity and visual language

- [x] Define the site as a personal laboratory and durable body of work.
- [x] Separate public sections, content formats, tags, and Second Brain infrastructure.
- [x] Move desktop navigation from vertical dashboard sidebar to a full-width editorial header.
- [x] Replace flat black/white surfaces with mineral paper / graphite surfaces.
- [x] Establish a restrained signal language: red for tension/intervention, blue for structure/flow, graphite for the system.
- [ ] Decide whether the final default theme should be light, dark, or context-aware.
- [ ] Define final type hierarchy: identity face, display title, reading body, metadata mono.
- [ ] Define spacing and width tokens for the wide but calm composition.
- [ ] Define image treatment: authored, diagrammatic, annotated, never generic stock.
- [ ] Define motion rules: explain, reveal, connect; never decorate continuously.
- [ ] Define a small icon/mark language that does not turn the site into an app.
- [ ] Create a visual test page containing typography, signals, diagrams, captions, links, and states.

## B. Global shell

- [x] Replace desktop sidebar with horizontal navigation.
- [ ] Bring mobile navigation into the same editorial language instead of maintaining a separate app-like menu.
- [ ] Add bilingual control to the shell without making language switching feel like a settings panel.
- [ ] Add a compact contact / follow signal in the shell where useful.
- [ ] Rework footer into a short colophon and contact invitation.
- [ ] Remove duplicate navigation between header, footer, and section screens.
- [ ] Make the shell adapt to article, project, and archive modes without visual jumps.
- [ ] Audit fixed overlays so they never hide content under the new header.
- [ ] Add reduced-motion behavior for all new transitions.
- [ ] Test very wide screens, laptops, tablets, and narrow phones.

## C. Home composition

- [x] Replace the old cosmic hero language.
- [x] Introduce face, name, personal-laboratory framing, and systems statement.
- [x] Add a compact field-of-view index for the main intellectual territories.
- [ ] Remove explanatory repetition from the hero.
- [ ] Replace category cards with a more editorial stream of actual work.
- [ ] Add a featured series mechanism.
- [ ] Add a current visual or diagram without turning the home into a gallery.
- [ ] Show projects, writing, and technical pieces in one coherent rhythm.
- [ ] Create a “start anywhere” interaction that reveals different entry points.
- [ ] Add a quiet invitation to About and Contact.
- [ ] Make the home feel authored even when the content list changes.
- [ ] Test whether the visitor understands the person and the territory within five seconds.

## D. Writing and article system

- [ ] Distinguish Note, Essay, Rabbit hole, Technical, Opinion, Project, and Series in presentation rather than only metadata.
- [ ] Keep the public URL model stable while improving format presentation.
- [ ] Build a series header with title, premise, sequence, and next/previous movement.
- [ ] Add lightweight article metadata: type, date, series, topic tags.
- [ ] Avoid forcing “related to” blocks onto every article.
- [ ] Use related work only when it creates a useful next step.
- [ ] Improve article title scale and reading width.
- [ ] Make images, diagrams, sketches, and captions first-class content.
- [ ] Support simple authored diagrams without requiring custom HTML for every post.
- [ ] Create a visual reasoning block for annotated images or sketches.
- [ ] Create a technical block for formulas, code, models, and assumptions.
- [ ] Create a rabbit-hole block for source, question, investigation, synthesis, and artefact.
- [ ] Make bilingual content easy to publish and easy to switch between.
- [ ] Reduce article chrome and let the writing carry authority.
- [ ] Improve end-of-article navigation: next piece, series, one useful related path.

## E. Projects

- [ ] Replace generic project cards with project records.
- [ ] Show project question, constraint, intervention, current state, and evidence.
- [ ] Make images and diagrams more prominent than category badges.
- [ ] Distinguish active, paused, finished, and abandoned without excessive controls.
- [ ] Add project series when several experiments belong together.
- [ ] Make a project page useful to a potential collaborator or employer without becoming a CV.
- [ ] Surface the engineering reasoning, not only the final result.
- [ ] Support small simulations and visual artefacts naturally.
- [ ] Audit project copy for concrete language and remove generic “lab” filler.

## F. About / identity

- [ ] Rewrite About around TRACE and the actual identity material once Maletín is available.
- [ ] Make the opening answer “who is this person?” immediately.
- [ ] Explain breadth as a method, not as a list of interests.
- [ ] Show enjoyment, curiosity, and seriousness together.
- [ ] Keep the page personal without turning it into a life story.
- [ ] Explain the relationship between industrial engineering, systems, robotics, infrastructure, AI, and the brain.
- [ ] Add a concise version for hiring/collaboration readers.
- [ ] Add a longer version for curious readers.
- [ ] Remove old language that frames the site as a developer portfolio.

## G. Contact / attraction

- [ ] Reframe Contact as an invitation to difficult and interesting problems.
- [ ] Explain what kind of conversations are welcome.
- [ ] Show possible collaboration modes without making promises too broad.
- [ ] Include direct email and social links with minimal ceremony.
- [ ] Make the form optional, not the only route.
- [ ] Add a short “you may want to talk if…” section.
- [ ] Make the page feel like an open door, not a recruitment funnel.

## H. Second Brain

- [ ] Define the public value of the archive before redesigning its controls.
- [ ] Remove purple-on-black product styling.
- [ ] Remove or contain public editing affordances where they distract from reading.
- [ ] Simplify the archive landing view.
- [ ] Replace software terminology with language appropriate to a public knowledge archive.
- [ ] Make search and traversal the primary actions.
- [ ] Make connections appear through useful context, not visual noise.
- [ ] Decide whether the 2D graph earns a place at all.
- [ ] Remove the 3D graph from the public experience.
- [ ] Remove graph controls that do not help a visitor understand an idea.
- [ ] Preserve local authoring only if it remains valuable to the owner.
- [ ] Keep the public reading experience independent from the editing system.
- [ ] Make archive pages feel like a library, index, or field guide rather than a data product.

## I. Technical pruning

- [ ] Audit all 3D dependencies and remove unused imports and bundles.
- [ ] Audit all editor components and separate author-only code from public code.
- [ ] Remove dead routes and legacy redirects only after checking content links.
- [ ] Remove duplicated theme logic.
- [ ] Remove unused icons and category abstractions.
- [ ] Reduce generated bundle size where it affects public pages.
- [ ] Preserve content compilation and Markdown portability.
- [ ] Prefer simple components and existing framework primitives over custom injected HTML.
- [ ] Keep editing complexity out of the visitor-facing bundle where possible.
- [ ] Check accessibility after every major structural change.
- [ ] Check keyboard navigation, focus, contrast, and reduced motion.

## J. Validation and release discipline

- [ ] Build after each major surface.
- [ ] Check the local dev server after every shell change.
- [ ] Review Home, About, Contact, Writing, Projects, Archive, and article routes manually.
- [ ] Test light and dark themes.
- [ ] Test bilingual text lengths.
- [ ] Test empty, missing-image, long-title, and long-series states.
- [ ] Check mobile navigation and scrolling.
- [ ] Check image loading and fallback behavior.
- [ ] Confirm no production deployment occurs from this branch.
- [ ] Keep all experimentation isolated on `test-nasty-shifts`.
- [ ] Before merging, produce a visual review summary and a list of intentional removals.
