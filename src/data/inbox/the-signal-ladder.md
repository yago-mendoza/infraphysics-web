---
title: "The signal ladder: SFT, DPO and RL as three questions"
kind: "addition"
status: "seed"
added: "2026-09-11"
target: "bits2bricks/how-llms-learn"
source: "AEO-PLAYBOOK (Sep 2026)"
---

Each post-training technique answers one question. SFT: what does a good answer look like (format). DPO: which of these is better (preference). RL: what is worth doing (utility). Each step gives the model more freedom (SFT copies, DPO ranks, RL discovers) and each introduces its own failure: SFT overfits the format, DPO cannot explore past its preference data, RL games any metric it is given. The decision is not which technique is best but which failure mode you can afford.

A closing section for *How LLMs learn*, or a standalone piece; the question *SFT vs DPO* comes up constantly.
