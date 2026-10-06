# PR3.2B — Evidence mapping and repeatable import plan

PR3.2B emits a review-only relational plan. PR3.2C adds a separately invoked transactional SQL generator; see [IMPORT_SQL.md](IMPORT_SQL.md) for the production workflow approved by the user. Neither generator connects to Supabase, executes the SQL, or commits/pushes code.

## Existing contract and the missing association

PR3.1 bundle version 1 stays intact. `claim_evidence` currently references only `evidence_sources`; there is no durable association to a product attribute, anchor, problem, or audience claim. The new additive migration supplies four typed junction tables with composite foreign keys to the existing claim primary keys. Anchor evidence includes `relationship_type`, so evidence for a complement cannot silently support an alternative.

`evidence_sources.seed_key` is the existing source key from the bundle. `claim_evidence.seed_key` is `seed-claim:` followed by SHA-256 of a JSON array containing product slug, claim collection, target slug, anchor relationship type if applicable, and source key. Both columns are nullable and unique. Existing manually entered records remain NULL and retain their UUIDs. Evidence junctions are private: RLS enabled, no client policies, and privileges revoked from anon/authenticated. No public read policy is broadened.

## Compiler output

```powershell
node scripts/seed/validate.mjs seed/data/notion-vertical-slice.json
node scripts/seed/compile.mjs seed/data/notion-vertical-slice.json .seed-output/notion-vertical-slice.import-plan.json
node --test scripts/seed/database-plan.test.mjs
```

The compiler preserves `contractVersion`, `generatedAt`, `counts`, and the unchanged `bundle`, and adds `databasePlan`. Mapping arrays are deterministically sorted; only the outer generated timestamp changes between identical compilations. Duplicate claim identities/memberships and invalid route positions now fail compilation before a plan is written.

| Input | Target / identity |
|---|---|
| taxonomy and products | existing tables, unique slug |
| sources | evidence_sources, unique seed_key |
| attributes | product_attributes, product + attribute |
| anchors | product_anchors, product + anchor + relationship_type |
| problems | product_problems, product + problem |
| audiences | product_audiences, product + audience |
| claim evidence source keys | claim_evidence plus the corresponding typed evidence junction |
| routes | escape_routes, unique slug |
| route candidates | escape_route_products, route + product |

`$ref` objects are symbolic lookups, not database values or new UUIDs. A future importer must resolve them after upserting parent records. Each operation declares conflict columns and mapped snake_case columns. Unknown null stays null; verified false stays false; exactly one typed attribute value column is populated. Omitted optional metadata maps to null.

The seed contains source references, not excerpts. Generated fragments therefore use `excerpt: null` and an explicitly labelled source-pointer note. This preserves provenance without pretending we captured a quotation. Verification state remains on the claim, not on the fragment.

## Importer protocol

1. Check the target database and apply/verify the additive migration separately. The current approved target is the existing production project; save the production precheck first.
2. Review a live-state diff and establish an explicit ownership manifest for claims, editorial fields, and whole routes. Existing published/manual curation must not be silently overwritten by draft seed values. A matching slug alone does not prove ownership.
3. Use a privileged database role, open one transaction, and acquire a transaction-scoped advisory lock to serialize imports. Never expose write credentials or an importer to clients.
4. Upsert tables in plan order. Resolve every `$ref` to exactly one UUID. Fail and roll back on missing/ambiguous references or ownership conflicts. Preserve existing UUIDs and created_at. Update updated_at only when data actually changes.
5. For each included claim, reconcile its evidence junction: remove links to `seed-claim:` fragments absent from desiredFragmentKeys, retaining manual fragments with NULL seed_key. Empty desired keys explicitly clear old seed-managed links when a claim becomes unknown. Source and fragment records themselves are retained.
6. For explicitly seed-owned routes, remove memberships absent from desiredProductSlugs. An empty route clears old memberships. Membership replacement owns the entire route and requires the manifest; unlike fragments, route memberships currently have no per-row seed ownership column.
7. Verify counts, claim/evidence linkage, null/false preservation, draft publication gates, and the live-state diff before committing. Apply the same plan again and verify stable row counts/UUIDs and no unexpected changes in staging.

Omitted products, claims, sources, and fragments are retained. This increment does not implement deletion or archival of graph claims omitted from a later bundle. Importing a plan is not equivalent to replacing the entire database. Persistent source keys must be reused for repeated imports of the same snapshot; a new dated source key intentionally creates a new provenance record.

## Verification and limits

Six Node tests cover all relationship types, source-pointer association counts, deterministic ordering, stable identities, unknown/false handling, evidence removals, supported attribute types, and rejection of malformed mapping inputs. A local in-memory model exercises repeated upserts against existing IDs, stale-link removal, manual evidence preservation, and route replacement.

PR3.2C additionally executes the migrations and generated SQL in a local PGlite PostgreSQL runtime, including transaction behavior, foreign keys and role privileges. The migration has not been applied to the user's remote database by Codex. `supabase/verification/PR3.2B_VERIFY.sql` supplies post-migration checks, and `PR3.2C_PRECHECK.sql` checks existing production data. The SQL CLI generates files only; execution through a privileged SQL session is separate.
