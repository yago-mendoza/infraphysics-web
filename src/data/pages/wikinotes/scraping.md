---
slug: scraping
uid: "baInedI5"
address: "web dev//crawling//scraping"
name: "scraping"
date: "2026-09-08"
aliases: ["web scraping", "data extraction"]
---
Extracting from the content the specific data you care about. [[KAtZ68eQ|Parsing]] understands the menu; scraping says "keep only the dish name and the price".

{bkqt/keyconcept|Three steps, three jobs}
HTML, then parse, then an understandable structure, then scrape, then the concrete data.
{/bkqt}

- A scraper decides what to take out of pages; a crawler decides where to go. One program can do both, but they are different decisions, and a scraper often runs on a single known page with no crawling at all.
- Scraping is brittle by nature: it depends on the page's layout, which the site can change any day. When a site offers an [[Ap8rTm3K|API]], asking the warehouse directly beats reading the shelf labels.
- If the data only exists after JavaScript runs, scraping needs a rendered page ([[BG5gXls1|rendering crawler]], [[rSBc7TP1|browser automation]]). Whether scraping is welcome is a question of terms of service and robots rules, not of technical possibility ([[Cx7nWr4L|robots.txt]]).

## Interactions

- [[Ap8rTm3K|API]] : : Scraping reads the labels in the shop and breaks when the shelves are rearranged; an API asks the warehouse for product 123 in JSON and breaks only when the contract changes. Same data, opposite fragility
- [[KAtZ68eQ|parsing]] : : Parsing is complete and neutral, it turns the whole page into a tree; scraping is selective and opinionated, it keeps two fields and discards the rest. You cannot scrape what you have not parsed, and parsing alone gives you no data
