# PR5.68 — Guarded writing draft import

Prepared against independently inspected clean actual HEAD7dfe4de3171631bf9e7b94b12fb63d7de9c6c152. Owner screenshots show21 focused tests passing and green Production #86; deployment not independently queried.

## Actual returned baseline

Owner SELECT snapshot captured2026-10-15T06:50:49.805493+00:00, packetPR5.67, semantic SHA256b454b2d3fd7aeb68fb21aea057cc7ab903672b6e3fce94ad65fa031eb11d4b4d. The original Markdown attachment is not modified. The JSON record is decoded and pinned semantically by the builder.

Only existing draft Hemingway Classic matches the broad proposed-slug/name/official-URL collision query. None of the three new reviewed edition identities is present in the returned match set. Both writing routes are absent, memberships absent, required scope columns present, anonymous/private evidence boundary intact. Accepted public sets contain18 products and8 approved routes. This is a dated returned snapshot, not a continuing live connection or a claim that arbitrary other records do not exist.

## Exact write scope

- Three new draft products: Hemingway free web, Grazie Free browser, Real Write dedicated passive detector.
- Nine reviewed attribute claims and three exact-scope alternative relationships; preserve all selected edition and Pro-baseline limitations from PR5.67.
- Eighteen new source pointers and104 provenance fragments with typed evidence links. Pointers are not fabricated source quotations.
- One unapproved draft no-subscription writing route with exactly three new members. Membership order is deterministic; it does not rank accuracy or quality.
- Zero taxonomy writes, zero Classic writes, zero problem/audience claims, zero privacy route changes and zero publication changes. Existing public slug sets remain exact.

The plan excludes every existing product and taxonomy table operation. Evidence and route membership replacement lists are empty. No delete operation is requested. The import uses the established atomic importer, advisory serialization and table locks, with baseline comparisons before writing. New identity aliases, route/provenance collisions, changes to Classic/captured evidence/taxonomy, publication sets or anonymous/private privileges cause an exception before import. Guard comparisons ignore created_at/updated_at for baseline drift, but the importer does not update retained rows; runtime tests verify all retained rows and timestamps unchanged.

## Execution sequence

1. Copy/test/commit the packet according to README.
2. Run supabase/data/PR5.68_REHEARSE.sql in Supabase SQL Editor. Successful rehearsal rolls all changes back. A failure means stop and return the full error; do not remove guards.
3. Only after successful rehearsal, run supabase/data/PR5.68_APPLY_DRAFTS.sql once. It persists only the reviewed unapproved drafts. It does not publish products or approve the route.
4. Run supabase/verification/PR5.68_VERIFY.sql and return the complete29-row check_name,passed result. Every passed value must be true. Stop on false/error. Applying twice is rejected; obtain a fresh snapshot instead of modifying or replaying the import.

No new public approval is requested here. After successful draft verification, prepare a separate publication preflight/review; earlier meditation publication approval does not cover writing.

## Validation

25 focused tests pass.14 database runtime checks pass, including complete rehearsal rollback, alternate identity collisions, retained evidence/taxonomy/lifecycle/publication/privilege drift, apply, repeated apply rejection, and verification detecting changed scope or extra provenance. The SELECT verification produces29 true rows on the applied test fixture. Runtime uses the actual returned Classic/taxonomy/provenance rows plus skeletal non-target published products/routes for public slug-set guards; it is not a complete production clone. No new package installation, app/DB deployment or remote writes performed by the agent.

Generation is deterministic. The packaged SQL is tested and byte-compared against regenerated output before delivery. Current accepted audit remains18/8/2 until separate writing publication acceptance. Existing module-type and LF/CRLF notices may still appear.
