---
id: TEST_BITS2BRICKS
displayTitle: "syntax reference — technical edition"
subtitle: "the same features, demonstrated through code and math"
category: bits2bricks
date: 2025-07-15
thumbnail: https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=400&auto=format&fit=crop
description: "a technical showcase of every markdown extension — text formatting, typed blockquotes, code blocks, tables, images, and links. the accent color here is blue."
tags: [syntax, reference, showcase]
technologies: [Python, PyTorch, NumPy]
github: https://github.com/example/syntax-reference
author: Yago Mendoza
notes:
  - "companion to the threads syntax reference"
  - "same features, different accent color (blue instead of rose)"
context: "technical companion to the threads syntax reference — same features, different accent color"
featured: true
---

# syntax reference — technical edition

this page demonstrates the same formatting features as [[threads/TEST_THREAD|the threads syntax reference]], but with a {#3B82F6:blue accent} instead of rose. everything that uses the category accent color — ==highlights==, --accent text--, inline code borders — will appear in blue here.

---

## text formatting

### colored text

`{#hex:text}` applies inline color. any hex code or CSS color name works:

{#3B82F6:blue is the accent color on this page}. you can also use {#fb7185:rose}, {#a3e635:lime}, {#f59e0b:amber}, or {#8b5cf6:violet}.

### underline, highlight, accent

three bare-delimiter syntaxes:

| what you write | what you get |
|---|---|
| `_underlined_` | _underlined_ |
| `==highlighted==` | ==highlighted== |
| `--accented--` | --accented-- |

_underline_ uses word-boundary matching, so code_with_underscores stays safe. `_literal underscores in code_` are also unaffected. the backtick protection runs before all preprocessors.

### small caps, super, sub, keyboard

- {sc:Small Caps} — `{sc:Small Caps}` — good for abbreviations: {sc:API}, {sc:GPU}, {sc:LSTM}
- x{^:2} + y{^:2} = z{^:2} — `{^:2}` for superscript
- H{v:2}O, CO{v:2}, Fe{v:2}O{v:3} — `{v:2}` for subscript
- {kbd:Ctrl} + {kbd:C} — `{kbd:Ctrl}` for keyboard keys

---

## typed blockquotes

six types, each with its own color. syntax: `{bkqt/TYPE:content}`.

{bkqt/note:a note. neutral color, for supplementary info. notice how ==highlights== and --accent text-- inside this blockquote use the note color, not the page accent.}

{bkqt/tip:a tip. green color, for practical suggestions and shortcuts.}

{bkqt/warning:a warning. amber color, for potential mistakes and pitfalls.}

{bkqt/danger:a danger block. red color, for things that will break if ignored.}

{bkqt/keyconcept:a key concept. for the core idea you should take away from a section.}

### custom labels

override the default label with pipe syntax: `{bkqt/TYPE|Your Label:content}`.

{bkqt/note|Complexity:the time complexity of self-attention is O(n{^:2} · d), where n is sequence length and d is embedding dimension. this means doubling the context window ==quadruples== the compute cost.}

{bkqt/warning|Memory trap:a 100k-token context window with 256-dim embeddings requires storing a 100,000 × 100,000 attention matrix — that's --10 billion floating-point values-- per layer, per head.}

{bkqt/keyconcept|The real lesson:custom labels let you give each blockquote a precise, descriptive title. the type controls the color, the label controls the meaning.}

### paragraph breaks with `/n`

### syntax adaptation inside blockquotes

==highlight== and --accent text-- adapt their color when placed inside a blockquote:

{bkqt/tip|Color proof:==this highlight is green== because it's inside a tip blockquote. --this accent text is also green--. outside this blockquote, they would be {#3B82F6:blue} (the page accent).}

{bkqt/danger|Color proof:==this highlight is red== because it's inside a danger blockquote. --this accent text is also red--.}

---

## code blocks

fenced code blocks get terminal chrome (three dots + language tab) and {sc:Shiki} syntax highlighting.

```python
import torch
import torch.nn as nn

class SelfAttention(nn.Module):
    def __init__(self, embed_dim=64):
        super().__init__()
        self.W_q = nn.Linear(embed_dim, embed_dim)
        self.W_k = nn.Linear(embed_dim, embed_dim)
        self.W_v = nn.Linear(embed_dim, embed_dim)
        self.scale = embed_dim ** 0.5

    def forward(self, x):
        Q = self.W_q(x)
        K = self.W_k(x)
        V = self.W_v(x)
        scores = torch.matmul(Q, K.transpose(-2, -1)) / self.scale
        attn = torch.softmax(scores, dim=-1)
        return torch.matmul(attn, V)
```

```typescript
type Vector = number[];

function dotProduct(a: Vector, b: Vector): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function cosineSimilarity(a: Vector, b: Vector): number {
  const dot = dotProduct(a, b);
  const magA = Math.sqrt(dotProduct(a, a));
  const magB = Math.sqrt(dotProduct(b, b));
  return dot / (magA * magB);
}
```

```bash
# train a model
python train.py --epochs 100 --lr 3e-4 --batch-size 32
tensorboard --logdir=runs/
```

inline code is protected from all preprocessors: `_underscores_`, `==equals==`, `--dashes--` all stay literal inside backticks.

---

## small text (standard blockquotes)

the `>` prefix renders as small, muted text — not a traditional blockquote:

> Vaswani et al., "Attention Is All You Need" (2017). the paper that introduced the transformer architecture and the phrase that became its title.

> the scaling factor d{^:0.5} in scaled dot-product attention prevents softmax saturation. without it, large dot products push the distribution toward one-hot, killing gradients.

---

## links

### wiki links

`[[TERM]]` links to second brain entries: [[ML]], [[GPU]], [[CPU]].

multi-segment: `[[CPU//mutex//GIL]]` → [[CPU//mutex//GIL]] (displays last segment).

### cross-document links

`[[category/slug|Display Text]]` links to posts in other categories:

- [[threads/TEST_THREAD|the threads syntax reference]] — rose-colored link to the companion page
- links are color-coded: green for projects, rose for threads, blue for bits2bricks

### external URL links

`[[https://url|Display Text]]` creates a styled external link with neutral color:

- [[https://arxiv.org/abs/1706.03762|Attention Is All You Need]] — the original transformer paper
- [[https://pytorch.org|PyTorch docs]] — opens in a new tab
- [[https://github.com|GitHub]] — neutral gray, not category-colored

without display text: [[https://example.com]]. external links always open in a new tab.

---

## images with captions

use pipe syntax in alt text: `![alt|Caption text](url "position")`.

![neural network diagram|A caption produced with pipe syntax — write the alt text, then a pipe, then the caption](https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600&auto=format&fit=crop "center")

positions: `"center"`, `"right"`, `"left"`, `"full"`. without a position keyword, the image renders inline.

---

## tables

| era | model | context | parallelizable |
|---|---|---|---|
| 1 | bag-of-words | none | yes |
| 2 | word2vec | local (window) | yes |
| 3 | {sc:LSTM} | sequential (decaying) | no |
| 4 | transformer | global (all-to-all) | yes |

tables support inline formatting: _underline_, ==highlight==, --accent--, {#3B82F6:color}, {sc:Small Caps}, `code`.

---

## lists

### unordered

- first item with _underline_
- second item with ==highlight==
- third item with --accent text--
  - nested with {#3B82F6:colored text}
  - nested with `inline code`
    - deeply nested with {sc:Small Caps}

### ordered

1. write the markdown
2. the build script preprocesses it
3. {sc:Shiki} highlights code blocks
4. the result is ==rendered== in the browser

---

## heading depth

this page uses all four heading levels. `h1`, `h2`, and `h3` appear in the table of contents. `h4` is styled but excluded from the TOC:

#### this is an h4 heading

it works for sub-subsections that don't need TOC visibility.

---

## everything combined

a paragraph that uses ==every feature at once==: _underlined_, --accented--, {#3B82F6:colored}, {sc:Small Caps}, {^:super}, {v:sub}, {kbd:key}, and `code`. followed by a blockquote that demonstrates adaptation:

{bkqt/keyconcept|Accent summary:the accent color on this page is {#3B82F6:blue} because the category is bits2bricks. ==highlights== and --accent text-- both use blue here. inside this blockquote, they use the keyconcept color instead. the companion page — [[threads/TEST_THREAD|threads syntax reference]] — shows the same features in ==rose==.}

> both showcase pages test the identical pipeline. the only difference is the category field in frontmatter, which controls the accent color through CSS custom properties.
