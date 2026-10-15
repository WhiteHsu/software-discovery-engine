# PR5.58 — Guarded meditation draft import

Clean actual baseline ff5adde inspected. Owner screenshots show successful PR5.57 push and green Production #76, not independently live queried. The owner returned the complete single-cell PR5.57 snapshot captured 2026-10-15T02:16:36.487909Z.

## Observed production baseline

Three existing identities (Medito, Smiling Mind, Healthy Minds Program) are draft. The target meditation route is absent and targets have no other route memberships. Published slug sets contain 15 products and seven approved routes. Required taxonomy and paired scope columns exist; anonymous public RPC/private-evidence privilege boundary passes. Existing 24 attribute claims, three anchors, all linked evidence and taxonomy were captured. No meditation-prefixed source collisions were found. This is owner-returned SQL evidence, not an agent query against production.

The pasted Markdown table doubled backslashes in JSON string escapes. Decode that Markdown representation once, without altering the original attachment, then parse and pretty-print the snapshot as meditation-import-baseline-2026-10-15.json. Original attachment byte SHA-256: cbb65db37d363a9e49008b3c090c66efe44c73522544a015c82f02c4ee180c7f. Parsed JSON semantic SHA-256: 7dd3f87ec63aa10a6653c7c93fda9bd45d146e6fe8ff3d23ac8da5f8d4644831. The generator pins the semantic hash; line endings are portable. Do not hand-edit this baseline to bypass drift checks.

## Exact write scope

The generator starts from PR5.56's pinned, bounded draft review and selects only three products' no-subscription, pricing-model and trade-off-summary attributes (nine rows), and three scoped Calm alternative anchors. It includes only the new meditation-prefixed provenance: 14 sources, 64 source-pointer fragments and typed links. Sources are references to official pages and the owner evidence record, not embedded quotations or raw screenshots. Official retrieval/owner evidence date remains 2026-10-14; editorial verification date remains 2026-10-15. Existing evidence links/fragments/sources are retained additively. Healthy Minds' prior trade-off evidence is retained while its reviewed summary is updated.

Create one draft, editorially unapproved route with the three reviewed members. No product rows or taxonomy rows are written. Products keep their IDs, descriptions and draft lifecycle; unrelated attributes, audiences/problems, anchors, memberships and all existing evidence remain. No engine, schema, policy, application UI, publication checkpoint or public product state changes. Calm limited three-free-listens and unknown environment metadata remain in the underlying review. This is not a clinical, indefinite-free, privacy/offline or full-catalog parity decision.

## Atomic controls

REHEARSE and APPLY are self-contained atomic DO statements using existing serialized importer locking. Full captured target claims, evidence, taxonomy and memberships are compared after typed timestamp normalization; created_at/updated_at differences are excluded from drift matching, while actual unchanged rows are preserved in runtime tests. The guard also checks exact published slug sets, private evidence privileges, absent route and new-source/fragment collisions. Evidence replacement and route-membership replacement lists are empty, so no old links are removed. Any error aborts the statement. A successfully imported route makes repeated apply/rehearsal fail; get a fresh snapshot rather than bypass the guard.

REHEARSE intentionally raises and catches its rollback sentinel internally. SQL Editor may show Success/no rows, with a notice that changes rolled back. APPLY has the same payload and no rollback sentinel. Neither changes product lifecycle or approves publication.

VERIFY is a single SELECT returning 28 booleans: exact reviewed attributes/anchors, source/fragment data and links, retained baseline rows, exact member set, draft route, hidden draft public RPC responses, unchanged published sets and evidence boundary. Date expectations use explicit UTC instants, independent of session timezone. Every passed value must be true. The SELECT does not itself roll back an already completed APPLY; stop and return results if any check fails.

## Validation and delivery

29 focused Node tests passed, including payload restriction, immutable input, tamper rejection, deterministic SQL and existing workflow/route/scope regression checks. Eleven local PostgreSQL-compatible PGlite scenarios passed using current migrations and actual captured target/taxonomy/evidence rows. Local non-target published identities/routes are skeletal rows matching captured slug sets; these tests do not claim to reconstruct all non-target production content. Tests cover rollback of all table rows/timestamps, atomic rejection of drift/manual links/taxonomy/member/route changes, provenance collisions, permission changes, applied-state preservation, repeated apply rejection and verification sensitivity to null fields/missing evidence. All 28 verification checks pass after local apply under UTC, Asia/Taipei and America/New_York. Existing compiler/module warning retained. No live database execution or actual checkout edits by agent.

Next: owner runs REHEARSE, then APPLY_DRAFTS if rehearsal succeeds, then VERIFY and returns all rows. Draft import does not mean publication acceptance; accepted checkpoint remains15 products/7 routes/3 remaining. Publishing requires a separate review and explicit state transition.
