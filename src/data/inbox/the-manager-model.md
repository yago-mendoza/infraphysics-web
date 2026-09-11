---
title: "The manager model: working with four to ten agents at once"
kind: "essay"
status: "seed"
added: "2026-09-11"
source: "TOPICS (Steinberger transcript, chats)"
---

Steinberger runs 4 to 10 agents in parallel terminals like a team: one on a large feature, one exploring a vague idea, others fixing small bugs and writing docs; the human provides the vision and the glue. Tools as CLIs rather than protocols (an agent pipes a big output through jq before it enters the context; `--help` is discovery); just-in-time context loading; build your own agent loop once to see it is not magic; after a task, ask *what would you have done differently*; do not force your worldview on the agent's variable names. Against: the agentic trap of full orchestration frameworks, MCP (*screw MCPs*: not composable, clutters context), vibe coding without the next-day cleanup.

Two personal threads to hang it on: polyphasic sleep to supervise agents (a tweet), and Carlos Bermejo's *the LLM as a brain coupled to a deterministic rule or scoring system that steers it towards a goal*. The MCP critique is also a counterpoint to add to *MCP before and after*. *Splitting the context window* already touches the parallel-agents part.
