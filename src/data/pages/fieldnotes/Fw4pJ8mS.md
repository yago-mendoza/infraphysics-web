---
uid: "Fw4pJ8mS"
address: "ML//Transformer//forward pass"
name: "Forward Pass"
date: "2026-03-03"
---
One complete pass through the network: [[Em3xR7wP|embeddings]] + [[eGfBTEQ5|positional encoding]] → { [[ml8njOQc|Attention]] → [[Pr8dt3wz|MLP]] } × N layers → [[mcdxPW3m|layer norm]] → [[2GCBLdlB|LM head]] → [[Lg7cD3vX|logits]] → [[Sm8rH4nW|softmax]] → token.
- The [[Rs6cD4vX|residual stream]] carries information through all layers. Each block adds a delta via [[dTnuW5yO|residual connections]]. The final hidden state is the stream's last value.
- In inference: 1 forward pass = 1 token predicted (one [[Ds4pJ8kF|decoding step]])
- In training: processes the full sequence in parallel. The [[Cm7jR4sQ|causal mask]] ensures each position only sees prior tokens, producing T-1 training examples in one pass.
- Starts from scratch every time. Embeddings are NOT carried over from the previous pass. That would be reinventing [[mBCcy7bn|RNNs]]
- Standard pattern: [Attention → MLP] × N layers. GPT-3: N=96. GPT-2 small: N=12. Each block has [[dTnuW5yO|residual connections]] and [[mcdxPW3m|layer norm]]
- Path through [[RnKMoC3a|latent space]]: alternating context (attention) and fact (MLP): 1 context, 1 fact, 1 context, 1 fact.
