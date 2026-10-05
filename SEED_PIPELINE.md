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
