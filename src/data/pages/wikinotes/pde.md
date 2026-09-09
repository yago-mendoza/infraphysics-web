---
slug: pde
uid: "ucNBFjoJ"
address: "mathematics//differential equations//PDE"
name: "PDE"
date: "2026-09-07"
aliases: ["partial differential equation", "field equation"]
---
A **partial differential equation** has several independent variables, typically space and time, and its unknown is a field: a concentration \(c(x,t)\), a temperature \(T(x,y,z,t)\). Derivatives are partial, one per direction, and the equation relates how the field changes in time to how it varies in space.
- The canonical example is the [[lHnt7xrH|diffusion equation]], where the time rate at a point depends on the curvature of the field around it. Waves, heat and transport are the other classics.
- A PDE needs an initial profile, not just a number, and boundary conditions in space ([[wwPZUijW|initial condition]]). Chop space into nodes and the PDE becomes a large [[VV2OsW44|ODE]] system, one equation per node: that is where the [[4tV2QGXX|graph Laplacian]] comes from, and how PDEs are simulated ([[SQo89ykf|discretization]]).

## Interactions

- [[VV2OsW44|ODE]] : : An ODE follows one point through time; a PDE follows a whole field and couples every point to its neighbors in space. Discretize the space and the PDE turns into an ODE with as many states as nodes, which is why the two share the same stability vocabulary
