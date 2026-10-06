# Seed Data Pipeline

Issue #3 turns researched software facts into deterministic, reviewable seed inputs.

## PR3.1 contract

1. Research creates a JSON seed bundle.
2. Every asserted product relationship must reference at least one evidence source.
3. Every claim carries `verificationStatus`; confidence and verification time are explicit when known.
4. `unknown` is a valid verification state. Missing evidence must never be converted into `false`.
5. Validation resolves all slug/source references before any database write.
6. Compilation creates a local import plan under `.seed-output/`.
7. PR3.1 deliberately performs **no database writes**. Database application begins only after the seed contract is stable and reviewed.

## Commands

```bash
npm run seed:validate
npm run seed:compile
```

Validate a future bundle:

```bash
node scripts/seed/validate.mjs seed/data/<bundle>.json
node scripts/seed/compile.mjs seed/data/<bundle>.json
```

## Evidence boundary

The current database has canonical `evidence_sources` and `claim_evidence` primitives. PR3.1 preserves evidence references in the seed contract rather than discarding them. A later Issue #3 increment must map those references into durable database claim/evidence associations before evidence-backed production seed data is considered complete.

This is intentional: the pipeline must not pretend provenance is durable until the database representation can actually preserve the relationship.

## PR3.2B review-only database mapping

The compiler now also emits `databasePlan`, while preserving the version-1 bundle and existing import-plan fields. It maps all four product claim types to typed evidence associations with stable seed identities and explicit reconciliation scopes. It performs no database writes.

See [seed/DATABASE_IMPORT_PLAN.md](seed/DATABASE_IMPORT_PLAN.md) for the additive migration, mapping contract, and ownership requirements.

```bash
node --test scripts/seed/database-plan.test.mjs
```

## PR3.2C transactional SQL generator

[seed/IMPORT_SQL.md](seed/IMPORT_SQL.md) documents the production precheck and transactional SQL workflow. The generator performs no database writes and defaults to a ROLLBACK rehearsal. `--commit` explicitly generates a committing import. The migrations and SQL were executed in a local PGlite PostgreSQL runtime; the remote production schema and data must still be checked before use.

```bash
node --test scripts/seed/database-plan.test.mjs scripts/seed/import-sql.test.mjs
node scripts/seed/import-sql.mjs seed/data/notion-vertical-slice.json seed/import-ownership.example.json .seed-output/notion.import.sql --commit
```

## PR3.3 five-ecosystem draft

See [seed/EXPANSION_REVIEW.md](seed/EXPANSION_REVIEW.md) for the 30-product research draft, human review checklist, and five atomic SQL batches. Generate with `node scripts/seed/build-expansion.mjs`. Research and import success do not establish editorial approval.
# PR3.4 official-source review

## PR3.5 editorial fit completion

After applying PR3.4, run `node scripts/seed/build-editorial-fit.mjs`. Outputs go to `.seed-output/editorial-fit`: a reviewed dataset, likely-fit rationale, pending human-review packet with dataset hash, guarded rehearsal/apply SQL, and 17-table verification. This adds only previously absent problems/audiences for the 24 expansion products and four audience definitions. It uses existing evidence references and does not overwrite product facts or source-review changes. Read `seed/EDITORIAL_FIT_REVIEW.md` before using the SQL.

After the PR3.3 production import, use `node scripts/seed/build-source-review.mjs` to generate `.seed-output/source-review`. Read `seed/SOURCE_REVIEW.md` for the findings and execution order. This overlay preserves the original PR3.3 research baseline. It replaces only listed claims and their seed-managed evidence links, requires the stored row and evidence to match the baseline or the reviewed result, and retains source/fragment history. Products and routes remain draft; AI review does not set human approval.
