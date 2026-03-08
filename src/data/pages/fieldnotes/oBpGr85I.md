---
uid: "oBpGr85I"
address: "ML//GPT//GPT-3//in-context learning"
name: "In-Context Learning"
date: "2020-10-15"
---
The model adapts its behavior based on what's in the [[JUby2DIy|context window]], without any weight updates.
- The broader concept behind [[IdfB7mVS|few-shot learning]]: give examples in the prompt -> model generalizes. But also includes implicit pattern matching with zero examples.
- Mechanistic explanation: [[Ih8nK5xW|induction heads]] — circuits of [[Hd4nK8xS|attention heads]] that find previous occurrences of patterns and copy what followed. "El gato duerme... El gato ____" -> "duerme".
- During training, when induction heads emerge there's a **phase transition** — abrupt loss drop as the model suddenly learns to follow context patterns.
- Still not fully understood beyond induction heads — is it gradient descent in the [[Fw4pJ8mS|forward pass]]? More complex pattern matching? Likely multiple mechanisms.
- [[Et5mN8wJ|Extended thinking]] exploits this at its deepest: the model's own generated reasoning tokens become part of the context, and in-context learning mechanisms process them to produce better final answers.
- Why [[yK3RLt0K|RAG]], [[IdfB7mVS|few-shot]], [[ct4swTMy|chain of thought]], and [[ovLF1FzI|prompt engineering]] work: induction heads and related circuits are reading the context and propagating patterns to new tokens.

## Interactions

- [[Ih8nK5xW|induction head]] : : Induction heads are the mechanistic substrate of in-context learning — concrete circuits that copy patterns from context
- [[IdfB7mVS|few-shot learning]] : : Few-shot is in-context learning made explicit — provide examples and let the model's pattern-copying circuits generalize
