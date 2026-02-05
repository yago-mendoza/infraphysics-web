---
id: my-project-slug
displayTitle: My Project Title — Subtitle Here
category: projects
date: 2025-06-01
thumbnail: https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=400&auto=format&fit=crop
description: One-liner that appears in the meta line after AUTHOR.
status: completed
technologies: [Bun, Express, TypeScript, DevInfra]
github: https://github.com/user/repo
demo: https://demo-url.com
author: Yago Mendoza
notes:
  - Shipped in ~4 hours as a weekend experiment.
  - Built to understand load balancing internals at the OS level.
  - Written with zero external dependencies beyond Express.
---

# the core problem

describe what problem exists and why it matters.

> {==:key insight}: the single most important realization.

in production systems, things go wrong:

- network failures during database writes
- race conditions between concurrent transactions
- payment gateway success while your DB update fails

so we built a system with `three independent sources of truth` that continuously verify each other.

## the architecture

explain the high-level design and why you chose it.

```typescript
interface LoadBalancer {
  instances: Server[];
  healthCheck(): Promise<boolean>;
  route(request: Request): Server;
}
```

## what broke

document the failures honestly. this is the most valuable section.

---

## results

concrete outcomes. before/after numbers.

## what's next

open questions and future work.
