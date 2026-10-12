# PR5.19 — Selective AI Optional evidence refresh

Issue #5. Prerequisite: owner-pushed PR5.18 commit 261e131; Production green and owner reports the prescribed regression checks normal. Source clicks are accepted as an aggregate owner report, without individual screenshots or exhaustive source-content verification. Production remains ten published products and three approved routes.

## Exact writes

Update only ai-optional on already-published AFFiNE, AppFlowy and Anytype using the pinned PR5.18 review. AFFiNE confidence 0.90; AppFlowy and Anytype 0.85; true/verified, dated 2026-10-12. Add six reviewed source records and six claim-evidence pointers/links. Retain all historical pointers. Existing sources already attached to these claims are verified without modification.

No product, taxonomy, anchor, audience, problem or route writes. Product IDs, metadata, publication states and timestamps remain intact. Existing route memberships and accepted offline qualification remain intact. Notion Alternatives Without AI stays unpublished and should still return 404 in production.

The claim means optional AI need not be activated for installed native personal note/object organization. It is not an AI-free-interface, no-network-processing or privacy guarantee. The documentary scope and limitations remain those in NOTION_AI_WORKFLOW_REVIEW.md. This packet introduces no new factual research.

## Atomic guards

The generator validates the pinned source review, complete reconstructed input and exact reviewed output. SQL locks the relevant tables under the existing advisory lock and checks the ten accepted published products and three approved routes. All three target product identities, metadata, claims, scopes, source metadata, fragments and complete relationship/evidence sets are compared against the accepted before/after data. Historical source pointers from the initial baseline are included: PR5.12 intentionally retained pointers even when the newer fixture's evidence list replaced them.

Missing or changed baseline rows, extra relationships/evidence, later no-AI route publication and unexpected approved-route exposure abort the statement. Only exact accepted baseline or exact reviewed rows are allowed. Existing matching reviewed data supports repeat application without changing IDs or timestamps. Rehearsal catches its rollback sentinel after all writes, reverting the entire inner transaction. No deletions or evidence replacements are enabled.

## Validation

90 Node tests, lint and typecheck passed. Production build passed. Isolated PostgreSQL-compatible tests reconstructed the accepted imports/publications, confirmed full rehearsal rollback, rejected AI/metadata/evidence/scope/lifecycle drift, checked every old record survives except the three intended attributes, confirmed repeat-apply stability, passed all ten shipped verification checks, and confirmed anonymous RPC qualification for both offline and no-required-AI workflows while private claim evidence stays inaccessible. These isolated tests are not live Supabase execution.

## Owner steps

1. Copy packet files, run the local checks in README, commit and push this increment.
2. In the existing lingyu-prayer Supabase SQL Editor, run the entire supabase/data/PR5.19_REHEARSE.sql. Success with no rows is expected; the rehearsal notice reports rollback.
3. If rehearsal succeeds, run the entire supabase/data/PR5.19_APPLY.sql. This persists only the reviewed attribute/evidence refresh.
4. Run supabase/verification/PR5.19_VERIFY.sql. Exactly ten rows must all be true. If an exception or false check appears, send the result and stop before further SQL; do not remove guards.
5. Check production AFFiNE/AppFlowy/Anytype show AI Optional true with new dated source links; click one new source per product. Confirm the offline route still lists all three and the no-AI route remains 404.

Do not import the full draft bundle or run old import/publication packets. Do not set local preview flags in Vercel. Publishing the fourth route requires a separate complete route review; this packet grants no route approval.
