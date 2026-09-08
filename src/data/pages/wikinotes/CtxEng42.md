---
uid: "CtxEng42"
address: "ML//agent//context engineering"
name: "Context Engineering"
date: "2026-09-03"
---

Prompt engineering asks how to phrase an instruction. Context engineering asks what the model should know at this exact inference step.

For an agent, context may contain system instructions, conversation history, visible tool schemas, retrieved memory, project rules, tool observations, and summaries. These compete inside a finite [[JUby2DIy|context window]].

The harness performs **context assembly**:

{math}
c_t=A_H(i,h_t,m_t,T_t,o_t)
{/math}

It decides what to preserve, retrieve, summarize, truncate, or omit before the next generation. This policy can change behavior without changing model weights or the user's request.

The hard part is not maximizing included information. It is preserving causal and decision-relevant evidence while removing material that is stale, redundant, or likely to distract the next action.

## Interactions

- [[HaRn3sA1|agent harness]] : : Context assembly is the harness policy that constructs the model's perceived state at every step
