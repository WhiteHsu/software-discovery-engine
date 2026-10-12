# Raster Publication Review — PR5.16

Publication decision: **pending**. No live database writes or publication have been performed by this packet generator.

Scope: publish exactly GIMP, Krita and Paint.NET, and one route `/escape/photoshop-alternatives-without-a-subscription`. Compare desktop raster layers, painting and basic image adjustment. No full Photoshop feature parity, PSD fidelity, RAW or print workflow promise. Alternative fit is editorial inference based on dated official documentation, without hands-on compatibility testing. No audience/problem claims are introduced. Ranking uses zero novelty boost.

Read RASTER_PUBLICATION_CONTENT.md for all fifteen reviewed claims, dated source pointers and the proposed route description. Primary GIMP FAQ, Krita download and Paint.NET license pages were rechecked on 2026-10-12. The import payload remains identical to accepted PR5.15; historical evidence pointers are retained.

PR5.15 owner evidence: main commit ee1c621 pushed, Production green, rehearsal/apply success, all ten live verification checks true. Three targets remain draft and hidden from anonymous RPC; seven published products and two approved routes are preserved.

## Guards and validation

The generator pins the review manifest and complete target graph. Atomic SQL locks and checks all selected metadata, attributes, scoped anchors, relationships and evidence sets. It rejects missing/changed rows, additional relationships/evidence, other approved-route exposure, altered route membership and publication prerequisites. Existing seven published products and both accepted routes must exist. Rehearsal rolls back all publication changes; repeat apply preserves IDs/timestamps.

81 tests, lint, typecheck and production build passed. Seven isolated PostgreSQL-compatible scenario groups passed: rehearsal rollback; claim/metadata/evidence/prerequisite drift; prior graph preservation; all ten verification checks; repeat apply stability; membership drift; anonymous RPC/engine qualification and private evidence denial. This is isolated PGlite validation, not live Supabase publication acceptance.

## Owner sequence

1. Copy packet `files/` into the repository and run the checks in packet README.
2. Commit/push these nine files. A Vercel rebuild alone does not publish database drafts.
3. Execute `supabase/data/PR5.16_REHEARSE.sql` in the accepted shared project's SQL Editor. Expect success and rollback notice; production remains seven products/two routes.
4. Review the complete content document and explicitly approve publication of the three products and this route. The approval requirement is the established publication decision for this project; successful draft import is not publication approval.
5. Only after approval, execute `supabase/data/PR5.16_APPLY_AFTER_APPROVAL.sql`, then `supabase/verification/PR5.16_VERIFY.sql`. All ten checks must be true.
6. Check the production route, all three product pages, Visit/source destinations and comparison navigation in Incognito.

After approved application, expected production is ten published products and three of ten approved routes. Issue #5 remains open. Do not execute a full seed import.
