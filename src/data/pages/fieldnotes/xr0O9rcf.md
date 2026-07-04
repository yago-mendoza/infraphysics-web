---
uid: "xr0O9rcf"
address: "Web Dev//SQL//fuzzy matching"
name: "Fuzzy Matching"
date: "2026-03-14"
---
Text search that tolerates typos, partial matches, and misspellings: returns results ranked by similarity instead of requiring exact matches.
- "atention" matches "Attention", "transform" matches "transformers". The query doesn't need to be perfect
- Works by comparing character n-grams (trigrams) or edit distance ([[Ev3pNx7L|Levenshtein]]) between the query and the stored text
- Returns a similarity score (0.0–1.0) so results can be ranked by relevance, not just filtered yes/no
- The `%` operator in [[Pg6tRw2H|PostgreSQL]] (via [[RLDYNfd6|pg_trgm]]) returns `true` if similarity exceeds a threshold. Combine with `ORDER BY similarity()` for ranked results
- Contrast with substring matching (`LIKE '%term%'`): substring is exact and unranked: either the string contains the term or it doesn't. Fuzzy matching handles human error.
- Contrast with full-text search (`tsvector`/`tsquery`): FTS tokenizes and stems words, understands language structure. Fuzzy matching is character-level, dumber but catches typos that FTS misses. They complement each other.
