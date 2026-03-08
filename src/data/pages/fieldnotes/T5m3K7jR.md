---
uid: "T5m3K7jR"
address: "ML//Transformer//encoder-decoder//T5"
name: "T5"
date: "2026-02-25"
---
Text-to-Text Transfer Transformer (Google, 2019): treats every NLP task as a text-to-text problem. Translation? "translate English to French: ..." produces French text. Summarization? "summarize: ..." produces a summary. Classification? "classify: ..." produces a label.
- The key insight: a unified text-to-text format means one architecture, one [[DxaRVjHg|loss function]], one training procedure for all tasks. No task-specific heads or output layers. The model learns task selection from the prefix.
- The canonical [[4WOV3Wpt|encoder-decoder]] model: the encoder processes the full input with bidirectional [[ml8njOQc|attention]] (like [[MwbJnjdN|BERT]]), the [[Dc8sW4nR|decoder]] generates the output [[Ar7mK4nQ|autoregressively]] (like [[U7ljk7Wf|GPT]]). This combination is more natural for tasks with distinct input and output.
- Trained on C4 (Colossal Clean Crawled Corpus), a cleaned version of [[Xe6SbANI|Common Crawl]]. The T5 paper was also a massive empirical study comparing pre-training objectives, architectures, and transfer strategies, establishing many best practices.
- Compared to decoder-only ([[U7ljk7Wf|GPT]]-style): encoder-decoder is better when the input is a fixed, known text and the output is a transformation of it (translation, summarization). Decoder-only is better for open-ended generation where input and output blur together (conversation, creative writing)
- Spawned the Flan-T5 family ([[qcqxPFA0|SFT]] on 1800+ tasks), which showed that instruction tuning on diverse tasks dramatically improves [[Zs9tN2hF|zero-shot]] and [[IdfB7mVS|few-shot]] performance. This was an early signal that [[qcqxPFA0|SFT]] could unlock capabilities that [[2oNdlB5L|pre-training]] alone couldn't.

