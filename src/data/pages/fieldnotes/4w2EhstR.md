---
uid: "4w2EhstR"
address: "CS//complexity theory"
name: "Complexity Theory"
date: "2026-03-06"
---
The study of how many resources (time, space, randomness) a problem requires to solve — not whether it is solvable, but how hard it is.
- Organizes problems into complexity classes: P (polynomial time), NP (verifiable in polynomial time), [[QGrQxZe0|PSPACE]] (polynomial space), EXPTIME, and many others.
- The P vs NP question is the central open problem: can every problem whose solution is efficiently verifiable also be efficiently solved? Widely believed false, unproven since 1971.
- Reductions: proving problem A is at least as hard as problem B by showing that solving A would solve B. This is how PSPACE-completeness is established.
- In ML: training a neural network is NP-hard in the worst case, but gradient descent finds good-enough solutions in practice — the loss landscape of real problems is friendlier than worst-case theory predicts.
- [[Wkwgtznl|Compositionality]] connects complexity to [[Et5mN8wJ|extended thinking]]: chain-of-thought gives the model polynomial scratch space (the context window), enabling it to tackle problems that would require exponential search in a single forward pass.
