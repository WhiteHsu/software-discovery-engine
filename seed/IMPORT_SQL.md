# PR3.2C — Transactional seed SQL import

## SQL Editor size fix

The first compact revision still depended on a temporary results table, which the remote SQL Editor reported missing. The current compact revision uses one self-contained `DO` statement: no temporary tables, session functions, or separate COMMIT are required. In apply mode, PostgreSQL commits the statement atomically on success; exceptions roll back all of its changes. Rehearsal mode raises and catches a private exception to roll back its mutation block. Run the separate counts query after success. An error from a separate results statement in an older version does not prove whether the import committed; inspect counts rather than assuming the database is empty.

The initial per-row emitter produces a roughly 1.08 MB query for the Notion seed, which the production SQL Editor rejected before execution. Use the compact emitter for SQL Editor execution instead. It embeds the same validated plan once and executes it through temporary helpers in a single transaction, retaining ownership checks, source-reference resolution, no-op upserts, evidence reconciliation, and post-write verification. It returns all 17 table summaries in one result. No permanent helper functions or tables are added.

```powershell
node --test scripts/seed/database-plan.test.mjs scripts/seed/import-sql.test.mjs scripts/seed/import-sql-compact.test.mjs
node scripts/seed/import-sql-compact.mjs seed/data/notion-vertical-slice.json seed/import-ownership.example.json .seed-output/notion.import.sql --commit
```

The compact Notion query is about 147 KB. It has passed the same 13 local PostgreSQL integration checks; actual SQL Editor acceptance is still confirmed by executing the replacement file remotely. If the mapping migration and its verification already succeeded, do not rerun the migration. Replace the rejected 04 query with the compact SQL and execute the whole file. The first-import undo generator remains available in import-sql.mjs.

At the user's request, use the existing production project; no staging project or staging marker is required. All changes target `software_discovery` only. This generator never connects to Supabase or reads credentials. SQL must be reviewed and executed explicitly through a privileged SQL session, such as the Supabase SQL Editor.

## Production steps

1. Run `supabase/verification/PR3.2C_PRECHECK.sql` and save the result. For the initial import, all 13 data counts should be zero. If there is existing data, inspect it first; do not assume it belongs to this seed. If tables are missing, verify PR2.1–PR2.4 migrations before continuing.
2. If both seed_key columns are absent and evidence_junction_tables is zero, run `supabase/migrations/202610060001_seed_claim_evidence_mapping.sql` once. If both columns exist and four junctions exist, skip that migration. A partial/mixed state requires investigation rather than retrying blindly.
3. Run `supabase/verification/PR3.2B_VERIFY.sql`. It checks migration structure and client privacy without importing data.
4. Generate and execute the COMMIT import SQL below. The default rehearsal variant ends in ROLLBACK and is optional. All SQL for a run must be executed together; do not highlight and execute just part of the file.

```powershell
node --test scripts/seed/database-plan.test.mjs scripts/seed/import-sql.test.mjs
node scripts/seed/import-sql.mjs seed/data/notion-vertical-slice.json seed/import-ownership.example.json .seed-output/notion.import.sql --commit
```

For an optional rehearsal, omit `--commit`. Generation itself performs no writes. Generated SQL performs verification after each upsert and returns 17 table summaries before ending the transaction. Expected row counts: 6 products, 66 attributes claims, 3 anchor claims, 17 problem claims, 18 audience claims, 15 sources, 83 fragments, 83 evidence links across four junctions, 3 draft routes, and 5 memberships. Products and routes remain draft; no discovery pages are published.

## Ownership and re-import

The example ownership manifest has empty lists: new rows may be inserted and identical rows may be re-imported, but different existing rows or route memberships abort the transaction. A subsequent intentional content update needs an explicit local manifest listing the product slugs, route slugs, source keys, and taxonomy slugs being managed. Only list reviewed identities; an existing matching slug alone does not prove ownership.

Unique slugs and seed keys resolve existing UUIDs. The SQL never replaces UUIDs or created_at. No-op upserts preserve updated_at. Advisory and table locks serialize writes within the graph schema. Unresolved references, ownership conflicts, SQL/constraint errors, or stored values differing from the seed abort the transaction. If a client leaves the session in an aborted transaction after an error, execute `ROLLBACK;` before another attempt.

Unknown null and verified false remain distinct. Empty evidence clears old seed-managed links for included claims, retaining manual evidence. Owned routes reconcile their whole membership. Omitted graph claims and unused fragments/sources are retained; this is not a whole-database replacement.

Source fragments are labelled provenance pointers with null excerpts, not invented quotations. String content is escaped and procedural delimiters avoid user-data collisions. The databasePlan from PR3.2B is recreated from validated seed input rather than executing an arbitrary edited plan.

## Undo for the first empty-database import

Git revert does not undo database data. To generate a narrowly scoped data reset:

```powershell
node scripts/seed/import-sql.mjs seed/data/notion-vertical-slice.json seed/import-ownership.example.json .seed-output/notion.undo-initial.sql --undo-initial
```

Use this ONLY when the saved precheck confirmed the graph was empty before the first import. The SQL requires the current graph to contain exactly the seed rows, with identical content and no additional graph tables. It rejects edited/new/manual data, then deletes rows in dependency order in one transaction; migrations remain installed. It does not restore a previously populated graph. For an existing dataset, use a database backup or an explicit reverse migration instead.

## Verification

Built-in Node tests cover plan mapping and SQL generation. A separate local PGlite PostgreSQL runtime, with pgcrypto, executed all five migrations unchanged, PR3.2B verification, rollback rehearsal, committed import/re-import, UUID/timestamp preservation, atomic rejection, ownership checks, manual evidence retention, typed foreign keys, client permissions, and hostile string round trips. This is actual PostgreSQL SQL execution in an embedded runtime; it does not establish that a remote Supabase project's roles, installed migrations, grants, or data match locally. Production precheck and post-import results are therefore still required.

No new application dependency is introduced. Optional PostgreSQL test harness files are supplied separately as review material. Do not copy them or generated SQL into application source directories.
