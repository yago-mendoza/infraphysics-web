---
uid: "Lm8xKr3P"
address: "Web Dev//SEO//AEO//llms.txt"
name: "llms.txt"
date: "2026-03-08"
---
- A proposed standard: a plain text file at `/llms.txt` that gives LLMs a concise, structured summary of a website: who runs it, what it contains, and where to find things.
- Analogous to [[Cx7nWr4L|robots.txt]] (tells crawlers what to access) and [[Sm9pLx3R|sitemap]] (tells crawlers what exists), but `llms.txt` tells LLMs what the content *means*.
- Typical structure: site name, author description, site structure (sections with URLs), article listings with one-line summaries.
- Two variants:
  - `llms.txt`: curated, hand-written summary. Concise, editorial. Like a human introducing their site to an AI.
  - `llms-full.txt`: auto-generated, exhaustive. Every article in full plain text. Machine dump for comprehensive indexing.
- ASCII-safe: avoid Unicode characters (em dashes, smart quotes) that might corrupt under different encodings. Use `--` instead of em dashes, straight quotes instead of curly.
- Not yet an official standard (as of early 2026), but gaining adoption. The idea: if you make it trivially easy for an LLM to understand your site, you are more likely to be cited.
