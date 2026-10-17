# PR5.104 — Concrete scoped privacy publication proposal

Owner pushed94cafe4 / Production121 and returned privileged PR5.103 snapshot captured2026-10-17T08:23:42.549617+00:00 (the saved JSON is authoritative). Used the structured JSON export directly, not the escaped Markdown table. Semantic SHA256480ed852d319bf37ca224caf390db9f13dcb8b272edbb1610d333dc5f18cc5c8.

All prior selective import plan rows match actual database records, resolving generated IDs and normalizing timestamp comparisons. Three reviewed editions remain draft, generic LanguageTool remains draft, the privacy route remains unapproved draft, and the existing subscription-free route is published. Public sets21/9, RLS enabled on the three public lifecycle tables, draft public projections null, private evidence boundary true. Stored claims reprojected through rankEscapeCandidates qualify all three reviewed profiles, including exact operation statement, scope, confidence and evidence.

Proposed change: publish only languagetool-local-cli-6-6, vale-local-passive-3-24-0, write-good-local-library-1-0-8 and approve/publish privacy-friendly-grammarly-alternatives. No copy, claims, evidence, taxonomy, memberships or policy changes. These are technical local-operation profiles for passive-construction review, not universal privacy guarantees or complete Grammarly replacements. Public counts would become24 products/10 approved routes; historical acceptance21/9/1 stays unchanged until actual publication and acceptance.

## Execution

1. Run node scripts/seed/build-privacy-publication.mjs and tests in README. These generate local files only.
2. Run only supabase/data/PR5.104_REHEARSE.sql in the existing privileged SQL Editor. Successful execution rolls publication changes back. Expected notice: Privacy publication rehearsal rolled back; no changes persisted. Return success/error; do not change guards.
3. PR5.104_APPLY_AFTER_APPROVAL.sql is the separate concrete persistent proposal, pending owner publication approval after successful rehearsal. It must not be run in this step. No additional approval is needed for the rehearsal already requested in this workflow.
4. After an approved successful apply, run supabase/verification/PR5.104_VERIFY.sql; all22 checks must be true. It checks exact retained data (only intended status changes), public slug sets, qualified public fields, exact operation statement, public policies/RLS and private evidence boundary. Then verify the actual public route and three product pages, including conditions, sources and links, before recording final acceptance.

Both publication SQL variants lock discovery tables briefly (10s lock timeout), verify frozen database state and policy metadata, then update only three product statuses and one route status/approval. Postconditions verify public scope, privacy claim and operation text. Any guard or postcondition failure rolls back atomically. Repeated apply is rejected; obtain a fresh snapshot if drift occurs. No import replay. Generated next-env.d.ts is outside this package.

Validation:23 Node tests passed, including new stored-publication reconstruction, mutation rejection and rehearsal/apply guards plus existing privacy import/runtime/proposal/preview/route suites. SQL generated reproducibly and ZIP hashes checked. No remote publication rehearsal/apply or local PostgreSQL execution by the assistant. This package does not assert publication approval or completion. No application code changed; no new build required.
