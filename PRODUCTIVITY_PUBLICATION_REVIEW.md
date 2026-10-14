# PR5.40 — Personal task planning route publication proposal

Prepared 2026-10-14; owner approval pending. PR5.39 was pushed as 9b2b93e with clean git status and green Production deployment (58). Live snapshot captured at 2026-10-14T02:07:08.075207+00:00: route draft/unapproved with exactly Things/OmniFocus/2Do; three products already published; 24 attributes, 58 evidence fragments, 23 sources and six target route memberships. Public checkpoint is 15 products and six approved routes.

## Concrete publication change

Change only productivity-apps-you-can-buy-once to status=published and editorially_approved=true, and remove the draft-only sentence from its description. No product, claim, evidence, taxonomy or member row changes. Expected result: 15 published products and seven approved published routes.

Final description:

Compare personal task capture, project organization and scheduling in Things 3, native OmniFocus 4 perpetual editions and direct-purchase 2Do Mac. Apple platforms and purchase channels differ; optional Web access, future upgrades and update eligibility have separate costs.

The comparison is bounded to task capture, project organization and scheduling. 2Do is the direct-store Mac perpetual edition with 18 months of updates and optional renewal; Mac App Store/Setapp subscription editions are excluded. Things platform purchases and OmniFocus native/Web/major-version costs remain distinct. Audience judgments are preserved.

## Qualification and baseline

The complete received PR5.39 snapshot is immutable and SHA-256 pinned in the generator. Compare all twelve stored workflow/purchase/pricing/trade-off claims and their new reviewed source associations to the pinned PR5.36 documentary review. Three published candidates qualify with zero novelty boost. The final description matches the reviewed route text except its removed draft sentence.

All target products, claims, typed evidence links, fragments/sources, linked taxonomies, complete route row and all target memberships are checked under table/advisory locks. PostgreSQL typed normalization handles timestamps; only created_at/updated_at are excluded. Exact publication slug sets and private evidence privileges are guarded. Identity, scope, evidence, source, member, route or lifecycle drift aborts atomically. Repeated application is rejected.

## Validation

128 tests passed; lint and typecheck passed. An isolated PostgreSQL-compatible database reconstructed the live snapshot and confirmed complete rehearsal rollback, five live drift rejection scenarios, one publication apply, repeated apply refusal, every captured table except the target route unchanged, and all 20 verification checks true. Public product RPC workflow scope/source projection was verified. No remote publication was executed.

## Owner sequence

Run PR5.40_REHEARSE.sql and return success. Approve the concrete route publication above explicitly before using PR5.40_APPLY_AFTER_APPROVAL.sql. Then run PR5.40_VERIFY.sql: all 20 checks must be true. Finally inspect the public route, comparison links, three product pages and purchasing/source destinations in an incognito browser. Product pages already existed; the new route should have no draft/publication-block banner.

Do not rerun old import SQL. If drift occurs, obtain a fresh full snapshot; never bypass guards. Route publication completes seven of ten intended routes; Issue #5 remains open.
