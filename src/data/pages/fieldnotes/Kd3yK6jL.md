---
uid: "Kd3yK6jL"
address: "ML//Training//knowledge distillation"
name: "Knowledge Distillation"
date: "2026-03-02"
---
Training a small "student" model to mimic a large "teacher" model's behavior, instead of training from scratch on raw data.
- The key insight: the teacher's [[Sm8rH4nW|softmax]] output distribution contains more information than hard labels. When GPT-4 says "cat: 0.7, dog: 0.2, tiger: 0.1", that ranking teaches the student about similarity between categories. Hard labels ("cat: 1, everything else: 0") throw this away.
- Temperature scaling amplifies these soft targets: raise the [[Pr11SIS0|temperature]] during distillation to smooth the distribution, making the small differences between non-top classes more visible to the student.
- This is how [[2mR18V1b|TinyML]] and mobile models become practical. A 70B parameter teacher distills its knowledge into a 7B student that runs on a phone. The student can't match the teacher, but it captures 90%+ of the capability at 10% of the cost.
- Closely related to [[Fx87vKe3|Chinchilla]] and [[iTljPiGW|scaling laws]]: if you know the optimal model size for your compute budget, distillation lets you compress a larger model down to that size after training.
- Not just for compression: distillation is also used to transfer capabilities across architectures. A [[QtZjVPKo|Transformer]] teacher can distill into an [[O3ZDwVjm|SSM]] student, or a generalist into a specialist.
- [[avBp6NIF|Synthetic data]] generation is a form of distillation: when you use a large model to generate training data for a smaller model, the synthetic data carries the teacher's implicit knowledge.

## Interactions

- [[qY2jOLny|Quantization]] : : Quantization shrinks precision (float32 to int8), distillation shrinks architecture (70B to 7B). Both reduce inference cost, but distillation can change what the model knows while quantization just changes how it stores weights
