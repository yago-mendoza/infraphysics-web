---
id: TEST_THREAD
displayTitle: "Syntax reference"
subtitle: "Every formatting feature in one page"
category: threads
date: 2025-07-12
thumbnail: https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400&auto=format&fit=crop
thumbnailAspect: strip # full (auto) / wide (16/7) / banner (16/4) / strip (16/2)
thumbnailShading: heavy # heavy (grayscale+gradient) / light (subtle) / none (crisp natural image)
description: "a complete showcase of every markdown extension available in this system — text formatting, blockquotes, code blocks, images, links, and more."
tags: [syntax, reference, showcase]
author: Yago Mendoza
github: https://github.com/example/syntax-reference
notes:
  - "this file exists to test and document every syntactic feature"
  - "if it renders correctly, the whole pipeline works"
context: "this file exists to test and document every formatting feature in the pipeline this page demonstrates every formatting feature available in the markdown pipeline. each section shows the syntax you write and the result it produces. the accent color on this page is ==rose== because it belongs to the threads category"
featured: true
---

## text formatting

### colored text

write `{#fb7185:text}` to color text with any hex code. examples:

- {#fb7185:rose colored text} — `{#fb7185:rose colored text}`
- {#3B82F6:blue colored text} — `{#3B82F6:blue colored text}`
- {#a3e635:lime colored text} — `{#a3e635:lime colored text}`
- {#f59e0b:amber colored text} — `{#f59e0b:amber colored text}`

you can also use named colors: {#tomato:tomato}, {#coral:coral}, {#gold:gold}.

### underline

wrap text in single underscores: `_underlined text_`

here is some _underlined text_ in a sentence. it works at word boundaries only, so variable_names_like_this won't break. double underscores `__bold__` are unaffected: __this stays bold__.

### highlight

wrap text in double equals: `==highlighted text==`

this is ==highlighted text== in a sentence. inside blockquotes, the highlight color adapts to match the blockquote type (see the blockquotes section below).

### accent text

wrap text in double dashes: `--accent text--`

this is --accent text-- in a sentence. it uses the category accent color — on this page, that's rose. inside blockquotes, it adapts to the blockquote color instead.

### small caps

write `{sc:TEXT}` for small capitals: {sc:Small Caps Text}. useful for abbreviations like {sc:HTML}, {sc:CSS}, {sc:API}.

### superscript and subscript

- superscript: `{^:text}` → E = mc{^:2}
- subscript: `{v:text}` → H{v:2}O is water, CO{v:2} is carbon dioxide

### keyboard keys

write `{kbd:key}` for keyboard styling: press {kbd:Ctrl} + {kbd:Shift} + {kbd:P} to open the command palette. use {kbd:Esc} to close.

### combining formats

these can be combined freely. here is ==highlighted _underlined_ text== and {#fb7185:colored --accent mixed-- text} and {sc:Small Caps} with a {^:superscript}.

---

## blockquotes — typed

there are six blockquote types. the syntax is `{bkqt/TYPE:content}` where TYPE is one of: `note`, `tip`, `warning`, `danger`, `deepdive`, `keyconcept`.

### note

{bkqt/note:this is a note blockquote. notes are for supplementary information — things that are good to know but not critical to the main argument.}

### tip

{bkqt/tip:this is a tip blockquote. tips suggest practical actions or useful shortcuts that improve workflow.}

### warning

{bkqt/warning:this is a warning blockquote. warnings flag potential pitfalls, common mistakes, or things that could go wrong if you're not careful.}

### danger

{bkqt/danger:this is a danger blockquote. danger blocks flag critical issues — things that will cause failures, data loss, or security vulnerabilities if ignored.}

### key concept

{bkqt/keyconcept:this is a key concept blockquote. key concepts highlight the core ideas — the things you should remember after reading. they are the ==takeaways==.}

---

## blockquotes — custom labels

by default, each blockquote type shows its standard label ("Note/", "Tip/", etc). you can override it with a custom label using pipe syntax: `{bkqt/TYPE|Custom Label:content}`.

{bkqt/note|Syntax:the default label for this type is "Note/" but this one says "Syntax/" because it was written as `{bkqt/note|Syntax:content}`.}

{bkqt/warning|Common mistake:the pipe goes between the type and the colon. `{bkqt/warning|Common mistake:content}` — not `{bkqt/warning:Common mistake:content}`.}

{bkqt/keyconcept|Remember this:custom labels let you give each blockquote a specific, descriptive title while keeping the color and styling of its type.}

---

## blockquotes — paragraph breaks

use `/n` inside blockquotes to create paragraph breaks. a single `/n` produces a visible gap between paragraphs.

{bkqt/keyconcept|Multiple paragraphs:this is the first paragraph of a multi-paragraph blockquote. it introduces the topic./nthis is the second paragraph. notice the visible spacing between them. this was produced by writing `/n` between the two paragraphs./nthis is a third paragraph. you can chain as many as you need. `/n` also works before list items:- item one- item two- item three}

---

## blockquotes — syntax adaptation

==highlights== and --accent text-- change color inside blockquotes to match the blockquote type. compare these:

outside a blockquote: ==this highlight is rose== and --this accent is rose--.

{bkqt/note|Highlight adaptation:==this highlight adapts to the note color== and --this accent text also adapts--. both inherit the blockquote's color instead of the category accent.}

{bkqt/danger|Danger colors:==highlight inside danger== and --accent inside danger-- both use the danger red.}

{bkqt/tip|Tip colors:==highlight inside tip== and --accent inside tip-- both use the tip green.}

---

## standard blockquotes (small text)

a `>` line produces small, muted text (not a traditional blockquote):

> this is small text produced by a single `>` prefix. it renders in a smaller font with reduced opacity. useful for asides, attributions, or supplementary notes that shouldn't compete with the main text.

---

## code blocks

fenced code blocks get terminal chrome (title bar with dots) and syntax highlighting via {sc:Shiki}.

```python
def fibonacci(n):
    """Generate first n Fibonacci numbers."""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# usage
for num in fibonacci(10):
    print(num)
```

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

function greet(user: User): string {
  return `Hello, ${user.name}!`;
}
```

```bash
# clone, install, run
git clone https://github.com/example/repo.git
cd repo
npm install
npm run dev
```

inline code is unaffected by preprocessors: `_this stays literal_`, `==this too==`, `--and this--`. the backtick protection ensures code content is never transformed.

---

## links

### wiki links (second brain)

write `[[TERM]]` to link to a second brain entry: [[ML]], [[CPU]], [[GPU]].

multi-segment addresses work too: `[[CPU//mutex//GIL]]` displays as the last segment → [[CPU//mutex//GIL]].

### cross-document links

write `[[category/slug|Display Text]]` to link to another post:

- [[bits2bricks/TEST_BITS2BRICKS|the bits2bricks test page]] — links to the companion showcase in bits2bricks
- the syntax is `[[bits2bricks/TEST_BITS2BRICKS|the bits2bricks test page]]`

cross-doc links are color-coded by category (green for projects, rose for threads, blue for bits2bricks).

### external URL links

write `[[https://url|Display Text]]` to create a styled external link with a neutral color:

- [[https://github.com|GitHub]] — `[[https://github.com|GitHub]]`
- [[https://arxiv.org|arXiv papers]] — `[[https://arxiv.org|arXiv papers]]`
- [[https://developer.mozilla.org|MDN Web Docs]] — `[[https://developer.mozilla.org|MDN Web Docs]]`

without display text, the raw URL is shown: [[https://example.com]]. external links open in a new tab and use a neutral gray color (not category-colored).

---

## images

### basic image

standard markdown image syntax: `![alt text](url)`

### positioned images

add a position keyword as the image title: `![alt](url "center")`, `![alt](url "right")`, `![alt](url "left")`, `![alt](url "full")`.

### images with captions

use pipe syntax in the alt text: `![alt|Caption text](url "center")`

![mountain landscape|This caption was produced with pipe syntax in the alt text](https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop "center")

---

## tables

standard {sc:GFM} tables:

| feature | syntax | example |
|---|---|---|
| colored text | `{#hex:text}` | {#fb7185:rose} |
| small caps | `{sc:text}` | {sc:HTML} |
| superscript | `{^:text}` | x{^:2} |
| subscript | `{v:text}` | H{v:2}O |
| keyboard | `{kbd:key}` | {kbd:Enter} |
| underline | `_text_` | _underlined_ |
| highlight | `==text==` | ==highlighted== |
| accent text | `--text--` | --accented-- |

---

## lists

### unordered

- first item
- second item with _underline_ and ==highlight==
- third item
  - nested item one
  - nested item two
    - deeply nested

### ordered

1. first step
2. second step with {#fb7185:colored text}
3. third step with `inline code`
4. fourth step

---

## horizontal rules

three dashes `---` produce a horizontal divider (like the ones separating each section on this page).

---

## heading levels

this page uses `h1` (the title), `h2` (main sections), and `h3` (subsections). all three appear in the table of contents. heading `h4` is also supported:

#### this is an h4 heading

h4 headings do not appear in the table of contents but are still styled as section headers.

---

## frontmatter fields

this post's frontmatter demonstrates all available fields:

- `id` — unique identifier (matches filename)
- `title` — internal reference title
- `displayTitle` — the title shown to readers (can differ from title)
- `subtitle` — appears below the display title
- `category` — determines accent color and routing (threads → rose)
- `date` — publication date
- `thumbnail` — card image URL
- `description` — preview text for cards and metadata
- `status` — badge shown in the header (active, ongoing, completed, etc.)
- `tags` — used for filtering and related post matching
- `author` — byline
- `github` — link to source repository
- `notes` — author notes shown in the sidebar/meta section
- `featured` — whether to show on the home page

> for the full list of status values: `ongoing`, `implemented`, `active`, `in-progress`, `completed`, `archived`. each renders with a different color dot in the header.
