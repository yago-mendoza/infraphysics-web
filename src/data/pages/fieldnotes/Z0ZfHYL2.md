---
uid: "Z0ZfHYL2"
address: "ML//Multimodal//Whisper"
name: "Whisper"
date: "2026-02-27"
---
- Whisper is OpenAI's 2022 [[578K1Mhu|multimodal]] speech-recognition model, trained on roughly 680,000 hours of weakly supervised multilingual audio.
- It frames transcription, translation, language identification, and timestamps as token prediction in one sequence-to-sequence model.
- Scale and noisy web data gave it unusually broad zero-shot robustness, but domain vocabulary, overlapping speakers, hallucination during silence, and timestamp accuracy still require evaluation in the actual deployment environment.
- Distilled and accelerated variants trade some generality or precision for production latency.

Whisper's lasting shift was operational: high-quality multilingual ASR became a downloadable component rather than a specialized cloud integration.
