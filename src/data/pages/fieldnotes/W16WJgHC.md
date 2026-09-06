---
uid: "W16WJgHC"
address: "infraphysics//compiler//pre-processor"
name: "pre-processor"
date: "2026-02-05"
---
The InfraPhysics pre-processor transforms source text before the main Markdown parser runs. It implements the parts of [[JkzQf7qt|custom syntax]] whose meaning must be established before ordinary Markdown consumes the characters.

- Rules are ordered transformations, so precedence is part of the language. Two individually reasonable replacements can interact differently when their order changes.
- Regex is efficient for local notation but becomes dangerous when a construct is recursive, nested, or context-sensitive. At that point a tokenizer or syntax tree is usually cheaper than accumulating exceptions.
- Generated HTML must preserve escaping and trust boundaries. A convenient notation layer should not silently become an injection layer.

The pre-processor is small, but it behaves like a compiler pass: its observable contract matters more than how little code implements it.
