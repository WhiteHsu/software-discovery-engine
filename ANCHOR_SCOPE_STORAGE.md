# PR5.7 — Persist bounded alternative scope

Owner pushed PR5.6 as 1e1632c. This packet prepares schema/import/RPC support for the personal workflow bound; it imports no graph and publishes nothing. No live database has been changed.

## Changes

A migration adds nullable relationship_scope and scope_description to software_discovery.product_anchors, with a paired slug/nonempty-text constraint. Existing rows retain their identities, status, verification and timestamps, with both new columns null. The composite relationship key is unchanged.

Seed validation accepts either a paired scope/description or an unscoped legacy relationship. The database plan now projects both fields explicitly. The existing compact importer uses table-aware JSON record mapping and therefore preserves these fields once the migration exists. Plans generated after this code change require the new schema, even when values are null.

The published-product RPC returns scope and uses the scoped description when present, otherwise the existing anchor taxonomy description. It retains SECURITY DEFINER, the fixed pg_catalog search path, fully qualified tables, the published-only filter and the existing anon/authenticated execute grants. No new raw evidence, draft, private excerpt or notes access is granted. Product-page Claim typing accepts the legacy null scope.

## Verification

All 52 seed and discovery tests passed, plus lint/typecheck. An isolated local PGlite PostgreSQL-compatible database applied the real migrations and compact SQL importer. Checks passed for:

- preservation of legacy IDs/status/timestamps and null scope values;
- paired scope preservation on initial and repeated import;
- rejection of incomplete scope by the database constraint;
- anon RPC projection of scope/limits and continued hiding of drafts/private notes;
- continued denial of raw evidence access and fallback to the legacy description.

These local checks do not confirm the live Supabase migration. PR5.7_VERIFY.sql is a read-only post-migration check for the operator. No content/status update SQL or seed import payload is supplied. Existing scope claims remain only in local draft fixtures until a separately reviewed content packet is prepared.

## Apply order

First review and commit the code/migration. Schema migration application is a separate operator step; run only 202610070001_anchor_relationship_scope.sql, then PR5.7_VERIFY.sql. Do not rerun prior migrations, seed imports or publication SQL. This migration adds metadata support and replaces the RPC projection; it does not change product/route publication state.

Future scoped content imports must include these paired fields. Legacy seed payloads explicitly project nulls and must not be used to overwrite reviewed scoped content. Prepare selective ownership/baseline checks for any future content application. #5 remains open: scope infrastructure and three qualified local drafts do not constitute an approved published route.
