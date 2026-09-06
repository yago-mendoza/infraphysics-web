---
uid: "A9DuyXJ2"
address: "ML//CNN//convolution"
name: "Convolution"
date: "2018-01-05"
---
A convolution applies the same learned kernel at every spatial position, producing a local weighted sum. Small kernels can compose edges and textures into progressively larger receptive fields.

- Weight sharing makes the operation translation **equivariant**: shifting the input shifts the feature map. Invariance requires an additional mechanism such as pooling, aggregation, or training augmentation.
- The kernel encodes locality as an architectural prior. This makes [[G1JW8o79|CNNs]] data-efficient for images, but less natural when every location must interact globally from the first layer.
- Padding, stride, and boundary handling are not implementation trivia; they determine which spatial information survives and how coordinates leak into the representation.
