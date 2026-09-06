---
uid: "JkzQf7qt"
address: "infraphysics//compiler//custom syntax"
name: "custom syntax"
date: "2026-02-05"
---
InfraPhysics custom syntax is a deliberately small extension layer over Markdown for concepts the site uses repeatedly: wiki references, mathematics, typed notes, keyboard keys, superscript, and subscript.

- The notation belongs to the content contract, not to a particular React component. Articles, Wiki notes, static exports, and crawler-readable output should interpret the same source identically.
- Extensions should earn their syntax by making the source easier to read. If an author needs to remember parser implementation details, the abstraction has leaked.
- Ordering and escaping are part of correctness because one transformation can expose characters consumed by the next parser stage.

[[W16WJgHC|pre-processor]] : : Applies the transformations that must occur before ordinary Markdown parsing

The design constraint is restraint: a personal syntax can make writing expressive, but every clever token becomes a permanent compatibility promise.
