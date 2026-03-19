---
uid: "nx78Mf8d"
address: "infraphysics//CI/CD"
name: "CI/CD"
date: "2026-03-19"
distinct: ["Web Dev//deploy//CI/CD"]
---

The automated validation pipeline that runs on every push to main via GitHub Actions.

- Current pipeline (`validate.yml`): checkout → npm ci → `npm run build` (compiles all content + production bundle) → typecheck (`tsc --noEmit`) → `check-references.js` (isolated notes, weak parents, duplicate trailing refs, segment collisions)
- The build itself runs 7-phase validation: reference integrity, self-references, bare trailing refs, parent hierarchy, circular references, segment collisions, isolated note detection. Errors fail the build.
- Runs on `ubuntu-latest` with Node 20. Concurrency group cancels in-progress runs on new pushes.
- Currently triggers on push to main only — no PR validation yet, which means broken content can land before CI catches it.

## Interactions

- [[Gk6tPm2H|CI/CD]] : : this is the infraphysics-specific CI/CD setup; the generic concept covers the broader pattern of continuous integration and deployment
- [[gk4wYqzk|Claude Code]] : : Claude Code enforces the same validations locally (build, check-references, preflight) — CI is the automated safety net for when those checks are skipped
