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
