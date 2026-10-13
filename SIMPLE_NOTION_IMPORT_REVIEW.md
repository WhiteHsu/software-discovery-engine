# PR5.24 selective basic-note import

PR5.23 was accepted and pushed as 89f10f8 on 2026-10-13. This packet imports its pinned documentary/editorial review; it does not publish Simple Notion, Joplin or Simplenote.

## Mutation scope

- Create exactly one new draft product identity: Simplenote. Existing Joplin/Obsidian names, descriptions, URLs, lifecycle states, UUIDs and timestamps are not written.
- Update seventeen reviewed attributes: five each for Joplin/Obsidian and seven for Simplenote. Other attributes, problems and audiences are untouched.
- Import three verified Notion alternative anchors scoped to `personal-basic-note-capture-edit-organization`, with the exact PR5.23 limitations.
- Add required source/claim evidence pointers while retaining historical pointers. No evidence removal or replacement.
- No taxonomy, route or membership writes. The current Simple Notion draft membership still includes Logseq until a separately reviewed publication packet replaces it. Local PR5.23 preview membership is a separate fixture.

Obsidian remains publicly visible, so its reviewed pricing/trade-off claims and bounded Notion anchor will appear through its existing public product RPC after APPLY. Joplin and Simplenote remain hidden from that RPC. This is an update to an existing published product's reviewed claims, not approval of the new route or other products. Production stays ten published products and four approved published routes.

## Preconditions and atomic behavior

The generator reconstructs PR5.23 from its pinned input/review hashes and rejects modified source, scope, evidence, identity or approval data. The SQL locks graph tables and takes the existing transaction-scoped advisory lock. It checks the ten accepted products/four routes, the draft Simple Notion route, and absence of approved route exposure for the three targets.

Complete before/after target rows, evidence identities and relationship counts are guarded, including untouched claims. Taxonomy must match the reviewed baseline. New source/identity collisions, missing baseline rows, widened scope, unexpected evidence and publication drift abort the statement. Rows may match either the reviewed prior state or the already-imported state for repeat application. Existing Simplenote can only match the reviewed draft identity and guarded relationship sets.

REHEARSE executes the same mutation then raises/catches the dedicated rollback SQLSTATE inside the atomic block. Success plus the rollback notice means no data persisted. APPLY persists only when the entire statement succeeds. These files have no remote execution mechanism.

## Validation

101 Node tests, lint, typecheck and production build pass. Six local PGlite PostgreSQL checks execute the seven migrations and an accepted-state fixture: full-row rehearsal rollback; apply preservation of existing product metadata, unrelated claims/routes/taxonomy and historical evidence; repeat-apply ID/timestamp stability; claim/scope/publication drift rejection; extra evidence-link rejection; ten verification checks all true.

The fixture removes the unqualified fourth offline member, matching the accepted PR5.13 publication. This is local database simulation, not confirmation of current Supabase contents. Native application usage/migration was not tested. Source review and all limitations remain those of PR5.23; no new vendor claims are introduced.

## Owner sequence

1. Overlay the seven packet files and run the README checks. Commit/push only these files.
2. In the existing `lingyu-prayer` project, run `supabase/data/PR5.24_REHEARSE.sql` as a complete statement. Confirm success and the rehearsal rollback notice.
3. Run `supabase/data/PR5.24_APPLY.sql`, then `supabase/verification/PR5.24_VERIFY.sql`. Require exactly ten true checks. If a guard rejects, retain the error for review; do not remove guards or run the full draft seed importer.
4. On production, confirm the existing Obsidian page and its bounded Notion scope. Simple Notion, Joplin and Simplenote remain unpublished. Share SQL results and the Obsidian page evidence for acceptance.

Issue #5 remains open. No owner Supabase execution or new publication approval is recorded by this packet.
