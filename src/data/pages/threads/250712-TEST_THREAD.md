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
featured: true
---

>> 25.07.12 - first version of this syntax reference.
>> 25.07.15 - added definition lists and alphabetical list sections.

some body text between them.

>> 26.02.05 - updated after adding context annotation support.

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

### accent text

wrap text in double dashes: `--accent text--`

this is --accent text-- in a sentence. it uses the category accent color — on this page, that's rose. inside blockquotes, it adapts to the blockquote color instead.

### superscript and subscript

- superscript: `{^:text}` → E = mc{^:2}
- subscript: `{v:text}` → H{v:2}O is water, CO{v:2} is carbon dioxide

### keyboard keys

write `{kbd:key}` for keyboard styling: press {kbd:Ctrl} + {kbd:Shift} + {kbd:P} to open the command palette. use {kbd:Esc} to close.

### combining formats

these can be combined freely. here is _underlined_ text and {#fb7185:colored --accent mixed-- text} with a {^:superscript}.

---

## blockquotes — typed

there are five blockquote types. the syntax is `{bkqt/TYPE}...{/bkqt}` where TYPE is one of: `note`, `tip`, `warning`, `danger`, `keyconcept`.

### note

{bkqt/note}
this is a note blockquote. notes are for supplementary information — things that are good to know but not critical to the main argument.
{/bkqt}

### tip

{bkqt/tip}
this is a tip blockquote. tips suggest practical actions or useful shortcuts that improve workflow.
{/bkqt}

### warning

{bkqt/warning}
this is a warning blockquote. warnings flag potential pitfalls, common mistakes, or things that could go wrong if you're not careful.
{/bkqt}

### danger

{bkqt/danger}
this is a danger blockquote. danger blocks flag critical issues — things that will cause failures, data loss, or security vulnerabilities if ignored.
{/bkqt}

### key concept

{bkqt/keyconcept}
this is a key concept blockquote. key concepts highlight the core ideas — the things you should remember after reading. they are the takeaways.
{/bkqt}

---

## blockquotes — custom labels

by default, each blockquote type shows its standard label ("Note/", "Tip/", etc). you can override it with a custom label using pipe syntax: `{bkqt/TYPE|Custom Label}`.

{bkqt/note|Syntax}
the default label for this type is "Note/" but this one says "Syntax/" because it was written as `{bkqt/note|Syntax}`.
{/bkqt}

{bkqt/warning|Common mistake}
the pipe goes between the type and the closing brace. `{bkqt/warning|Common mistake}` — not `{bkqt/warning}Common mistake:`.
{/bkqt}

{bkqt/keyconcept|Remember this}
custom labels let you give each blockquote a specific, descriptive title while keeping the color and styling of its type.
{/bkqt}

---

## blockquotes — paragraph breaks

use blank lines inside blockquotes to create paragraph breaks. a blank line produces a visible gap between paragraphs.

{bkqt/keyconcept|Multiple paragraphs}
this is the first paragraph of a multi-paragraph blockquote. it introduces the topic.

this is the second paragraph. notice the visible spacing between them. this was produced by writing a blank line between the two paragraphs.

this is a third paragraph. you can chain as many as you need. blank lines also work before list items:

- item one
- item two
- item three
{/bkqt}

---

## blockquotes — syntax adaptation

--accent text-- changes color inside blockquotes to match the blockquote type. compare these:

outside a blockquote: --this accent is rose--.

{bkqt/note|Accent adaptation}
--this accent text adapts to the note color--. it inherits the blockquote's color instead of the category accent.
{/bkqt}

{bkqt/danger|Danger colors}
--accent inside danger-- uses the danger red.
{/bkqt}

{bkqt/tip|Tip colors}
--accent inside tip-- uses the tip green.
{/bkqt}

---

## standard blockquotes (small text)

a `>` line produces small, muted text (not a traditional blockquote):

> this is small text produced by a single `>` prefix. it renders in a smaller font with reduced opacity. useful for asides, attributions, or supplementary notes that shouldn't compete with the main text.

---

## code blocks

fenced code blocks get terminal chrome (title bar with dots) and syntax highlighting via Shiki.

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

inline code is unaffected by preprocessors: `_this stays literal_`, `--and this--`. the backtick protection ensures code content is never transformed.

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

standard GFM tables:

| feature | syntax | example |
|---|---|---|
| colored text | `{#hex:text}` | {#fb7185:rose} |
| superscript | `{^:text}` | x{^:2} |
| subscript | `{v:text}` | H{v:2}O |
| keyboard | `{kbd:key}` | {kbd:Enter} |
| underline | `_text_` | _underlined_ |
| accent text | `--text--` | --accented-- |

---

## lists

### unordered

- first item
- second item with _underline_ and --accent--
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

---

## definition lists

definition lists use `- TERM:: description` syntax. all lines in a contiguous block must use the `::` separator, otherwise they are treated as regular bullet lists.

- latency:: the time between a request and its response, measured in milliseconds
- throughput:: the number of operations a system can handle per unit of time
- jitter:: the variation in latency over time — low jitter means consistent response times
- bandwidth:: the maximum rate of data transfer across a given path

mixed blocks remain untouched — if any line lacks `::`, the whole block stays as bullets:

- this is a normal bullet
- this is also a normal bullet
- and this one too

### definition lists with inline formatting

- `mutex`:: a --mutual exclusion-- lock that prevents concurrent access to shared state
- **RAII**:: {#3B82F6:Resource Acquisition Is Initialization} — a C++ pattern where resource lifetime is tied to object scope
- _deadlock_:: when two or more threads each hold a lock the other needs, and neither can proceed

### definition lists inside blockquotes

{bkqt/keyconcept|Core terms}
key definitions for this section:

- epoch:: one complete pass through the training dataset
- batch size:: the number of samples processed before the model updates its weights
- learning rate:: how much the model adjusts its weights on each update step
{/bkqt}

---

## alphabetical lists

alphabetical lists use `a. text` (lowercase) or `A. text` (uppercase) syntax. items must start at a/A and be sequential.

### lowercase

a. parse the input tokens into an abstract syntax tree
b. run semantic analysis to resolve types and scopes
c. apply optimization passes to the intermediate representation
d. emit target-specific machine code
e. link against external libraries and produce the final binary

### uppercase

A. Requirements gathering and stakeholder interviews
B. System architecture and component design
C. Implementation and unit testing
D. Integration testing and QA review
E. Deployment and post-launch monitoring

### alphabetical lists with inline formatting

a. **tokenization** — split raw text into a sequence of tokens
b. **parsing** — build a tree structure from the token stream using {#3B82F6:recursive descent}
c. **type checking** — verify that every expression has a --consistent type--
d. **code generation** — emit bytecode or machine instructions from the typed AST

### alphabetical lists inside blockquotes

{bkqt/tip|Steps}
follow these steps in order:

a. clone the repository and install dependencies
b. create a `.env` file with the required configuration
c. run the test suite to verify the setup
d. start the development server
{/bkqt}
