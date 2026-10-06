# PR3.3 — Five-ecosystem research draft

Research date: 2026-10-06. Human review: **pending**. Remote import: **pending**.

This increment adds 24 candidates to the six-product Notion slice, yielding 30 unique draft products across Notion, Todoist, Grammarly, Adobe/PDF, and Calm/meditation. The research inputs are in `seed/research/expansion-2026-10-06.json`; the version-1 seed format and database schema remain unchanged.

Three text attributes carry platform scope, pricing model, and trade-offs through the existing typed claim/evidence pipeline. A model's source inspection does not establish human approval. `verified` denotes a direct source-backed assertion in this draft; `likely` denotes provisional interpretation. Sources are provenance pointers, not invented quotations. Research timestamps denote source inspection dates, not hands-on app testing.

All products remain draft. Existing routes, memberships, product metadata, and original claims are preserved. No new escape routes or publication changes are included.

## Review method

For each product in `EXPANSION_REVIEW_CHECKLIST.md`, inspect the linked official references and the generated claim values. Check edition, platform, region, pricing model, evidence freshness, and suitability as an alternative. Mark a product reviewed only after checking its original and new claims; do not treat a successful import as editorial approval. Record reviewer name, date, and any rejected or revised claims before considering publication.

The anchor relationship is normally `likely`: comparable product scope does not prove feature parity or migration suitability. Foxit's direct Adobe comparison supports its explicit alternative positioning, but individual feature parity still needs review. Some candidates are well-known; the final discovery shortlist should consider the project's lesser-known-software thesis, not merely the count target. Meditation records describe app content and access, not treatment outcomes.

## Outstanding research gaps

- Anytype: full download and pricing pages returned no extractable text. Official search snippets only support provisional platform and pricing summaries; trade-off claim remains unknown.
- Logseq: pricing page returned no extractable text. Pricing model remains unknown. Current repository distinguishes DB/mobile alpha from file-graph releases; do not transfer old file-workflow claims to the DB edition without review.
- Antidote: recorded Windows desktop and Web scope is deliberately incomplete, rather than guessing every supported OS or edition.
- Stirling PDF: Web/desktop/self-hosted deployment is documented; exact desktop OS coverage still needs review.
- Balance: subscription amounts and trial duration depend on the current offer and remain unspecified.
- Existing Notion evidence/qualifications must still receive human review; missing anchor claims on Anytype, Joplin, and Logseq have not been invented to make all six qualify.
- AFFiNE's current official pricing page separates MIT editor code from the EE backend. Review existing self-hosting and license claims against that scope before publication.

## Generate and validate

```powershell
node --test scripts/seed/database-plan.test.mjs scripts/seed/import-sql.test.mjs scripts/seed/import-sql-compact.test.mjs scripts/seed/build-expansion.test.mjs
node scripts/seed/build-expansion.mjs
node scripts/seed/validate.mjs .seed-output/expansion/five-ecosystems.json
```

Generated files live under `.seed-output/expansion/`, which is ignored. The five JSON batches and five SQL batches are derived from the research inputs plus the original Notion bundle. Each SQL batch is a single atomic statement under 200 KB. The five batches together are **not** one transaction. They are individually repeatable, so a failed later batch can be corrected without recreating earlier rows.

## Production import after review

Use the already installed PR3.2B mapping migration. Do not rerun it, the original initial import, or the initial-empty-database undo. Generate SQL from the reviewed source records, then run whole files in this order:

1. `01_notion_IMPORT.sql` — identical existing records plus new text claims.
2. `02_todoist_IMPORT.sql`
3. `03_grammarly_IMPORT.sql`
4. `04_adobe-pdf_IMPORT.sql`
5. `05_calm_IMPORT.sql`
6. `06_CHECK_COUNTS.sql` — compares the complete dataset with expected total counts.

The empty ownership manifest allows new rows and identical existing rows, while refusing changes to existing owned content. If a review changes an existing original claim or metadata, explicitly scope the ownership manifest for that reviewed identity and regenerate the SQL; do not bypass the guard. Counts assume the production graph still contains only the initial six-product seed, with no manual additions. Additional records require scoped verification instead of assuming total-count equality.

This package prepares the count/coverage target; Issue #3 stays open until review gaps, the required dataset review, and production verification are resolved. Human review is required before any seed product is published.
