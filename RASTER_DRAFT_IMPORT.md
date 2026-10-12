# PR5.15 — Selective raster draft import

Prepared 2026-10-12 after owner acceptance and deployment of PR5.14 commit 189bef9. The documentation review remains dated 2026-10-12 and bounded to desktop raster layers, painting and basic image adjustment. No new compatibility claims are introduced.

## Selection

Three new draft identities: GIMP (`gimp`), Krita (`krita`), Paint.NET (`paint-net`). Each receives four attributes (no-subscription, pricing model, trade-off summary, supported platforms) and one verified editorial Photoshop alternative anchor scoped to `desktop-raster-layers-painting-basic-adjustment`, with explicit limits. Fifteen claims total. Earlier and newly reviewed source pointers are included. No audience/problem judgments are imported.

These identities were introduced in local previews in PR5.4, but were omitted from prior selective live imports. This packet therefore expects them absent or already exactly matching this packet. A differently configured existing target causes an atomic abort; later published targets cannot be reset to draft.

## Guards and preservation

The local generator reconstructs versioned research and pins the selected bundle and baseline. The SQL runs as one atomic DO statement with an advisory lock, table locks and a ten-second lock timeout. It requires the seven previously accepted published products and both published/approved routes before mutation.

Source and taxonomy collisions use the existing importer policy: matching rows may be reused, conflicting unowned rows abort. Product/attribute/anchor rows are guarded against unexpected contents. Evidence replacement and route membership replacement are disabled; this packet adds pointers and deletes none. Existing product IDs, historical evidence, unrelated relationships, routes and members remain intact. Repeating apply preserves IDs and timestamps. Additional manually attached evidence is retained; this draft import does not certify it for future publication.

No route is imported or published. Anonymous RPC callers cannot read the three drafts; private claim evidence remains inaccessible. Production progress stays at seven published products and two of ten required routes.

## Files and execution

- `supabase/data/PR5.15_REHEARSE.sql`: performs the guarded operations then deliberately rolls back within the statement. Success/no rows returned is expected; changes do not persist.
- `supabase/data/PR5.15_APPLY.sql`: the same guarded selection persists after success; all products remain draft.
- `supabase/verification/PR5.15_VERIFY.sql`: read-only, ten checks, all must be true after apply.
- `scripts/seed/build-raster-draft-import.mjs`: regenerates both SQL files into ignored `.seed-output/raster-draft-import/`; no database connection or remote write.
- `seed/research/raster-draft-import-2026-10-12.json`: pins the reviewed import selection.

Use the existing shared Supabase project and only the supplied SQL targeting `software_discovery`. Execute the entire rehearsal in a fresh SQL Editor query. On success, execute the entire apply in another query, then the verification. Stop on any error or false verification result and retain the error text for diagnosis. Do not use a full seed import; it would include unrelated lifecycle data.

## Validation

78 Node tests, lint, typecheck and build passed. New tests verify the exact selection, drift rejection and correspondence of shipped/generated SQL. Seven isolated PostgreSQL-compatible PGlite scenario groups passed against all repository migrations and the accepted PR5.13 publication state:

1. Rehearsal restores every row and timestamp.
2. Unexpected pre-existing product aborts with no partial changes.
3. Every old product, relationship, route, member and evidence row remains unchanged.
4. All ten shipped read-only checks return true.
5. Repeat apply preserves IDs and timestamps.
6. Later publication, changed scope and changed published prerequisites abort.
7. Anonymous draft RPCs return null; all seven published RPC pages still work and private evidence access is denied.

Live rehearsal/apply/verification is pending owner execution. Publication review follows separately.
