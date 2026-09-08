---
uid: "JdSKWaAz"
address: "Systems Theory//Ashby's Law"
name: "Ashby's Law"
date: "2026-03-08"
---
W. Ross Ashby's Law of Requisite Variety (1956): "only variety can absorb variety": a controller must have at least as many possible responses as the environment has possible disturbances.
- The first law of [[h9K0How0|cybernetics]], sometimes called the most important result in systems theory.
- Formal statement: for a regulator R to control a system S, the variety of R must be greater than or equal to the variety of S. No clever design can circumvent this. It is an absolute constraint, like conservation of energy.
- Examples: a thermostat (2 states) controls temperature (2 states: too hot, too cold). A chess engine needs astronomical variety because chess has astronomical variety. A language model needs enormous variety because language has enormous variety.
- In ML training: [[qcqxPFA0|SFT]] and [[YwfNaR4R|DPO]] are reactive: they redistribute existing variety from the training data but cannot increase it. [[NYb6zLJ5|RL]] is a feedback loop whose variety grows with compute, because the model generates novel behaviors and tests them. This is why RL discovered [[ct4swTMy|chain-of-thought]] reasoning and SFT could not.
- The law explains why [[2oNdlB5L|pretraining]] on diverse data is essential: the model's initial variety must be vast enough to support all downstream specialization. Narrow pretraining limits all subsequent training.

## Interactions

- [[rttI47hN|Systems Theory]] : : Ashby's Law is the foundational constraint of systems theory: no regulator can succeed without matching the variety of what it regulates
- [[h9K0How0|Cybernetics]] : : Ashby formulated the law within cybernetics, the science of control and communication in machines and living things
- [[NYb6zLJ5|RL]] : : RL satisfies Ashby's Law where SFT/DPO cannot: the RL loop generates new behaviors, expanding the model's variety beyond what any static dataset provides
