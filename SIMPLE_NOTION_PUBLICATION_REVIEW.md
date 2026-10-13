# PR5.25 bounded basic-note publication review

Decision: owner approved publication on 2026-10-13; live execution/acceptance pending. Prepared 2026-10-13 after owner acceptance of PR5.24 commit 0716823, live import/verification and production Obsidian comparison scope.

## Proposed publication

- Publish the existing Joplin and Simplenote drafts. Existing published Obsidian retains its UUID, metadata, claims and timestamps.
- Publish exactly `/escape/simple-notion-alternatives` with member order Joplin, Obsidian, Simplenote and zero novelty scores.
- Populate the confirmed empty production draft with the three reviewed members. Logseq's product, claims and other memberships remain intact.
- Preserve all imported source/claim evidence, taxonomy, unrelated products and the four accepted public routes.

Current production: ten products/four approved routes. Approved successful apply would produce twelve products/five approved routes. No remote execution or approval is included in this packet.

The public text is reproduced in SIMPLE_NOTION_PUBLICATION_CONTENT.md and pinned in seed/research/simple-notion-publication-review-2026-10-13.json. Scope is `personal-basic-note-capture-edit-organization`: native basic personal notes without configuring structured databases or mandatory plugins. Notion also supports ordinary pages. No measured speed advantage, full database/team-workspace parity or tested migration is claimed. Optional sync/services and Simplenote's account, data-handling and attachment limitations remain visible.

## Gates and SQL behavior

The generator reconstructs the accepted PR5.23/PR5.24 review and requires exactly three qualified candidates under the existing engine. Publication readiness is simulated with published states; this does not change live lifecycle states. Pinned hashes reject altered identity, source, scope, route text/order or approval data.

The atomic SQL locks graph tables and takes the existing advisory lock. Before publication it requires the ten named accepted products and four routes, Joplin/Simplenote drafts, and complete exact imported target rows and evidence sets. It rejects unexpected approved route exposure. The route must match the owner-diagnosed production draft exactly: rubric description, October 6 verification date, Notion anchor, draft/unapproved lifecycle and zero members; or the exact reviewed state. The original seed fixture is not the production route checkpoint. Unexpected members or metadata still fail.

Only the two product lifecycle states, the one route's description/date/approval and its three-member set are written. All source/attribute/anchor/audience/problem rows are verified, not upserted. Public RPC projections must expose all three products with the bounded anchor and three verified constraints. Repeat execution accepts only the complete reviewed twelve-product/five-route state and retains IDs/timestamps.

REHEARSE executes these publication changes inside a rollback block and emits `PR5.25 rehearsal rolled back; no publication persisted`. APPLY_AFTER_APPROVAL has identical guards and persists atomically; its file name is not approval. Do not edit the pinned manifest to mark approval.

## Validation and remaining acceptance

105 Node tests, lint, typecheck and production build pass. Six PGlite PostgreSQL execution checks confirm: rejection of original-member/imported-scope drift; every-row rehearsal rollback; mutation limited to two lifecycle states and one route/member set; repeat-apply UUID/timestamp stability; all ten read-only verification checks true; atomic rejection of later claim/member-score drift. Complete snapshots prove historical evidence, Obsidian and unrelated graph rows remain unchanged.

These checks use a local accepted-state fixture. No Supabase PR5.25 execution, new publication approval, native-app benchmark or migration test is claimed.

Owner sequence: overlay/check/commit/push the nine files; run the complete REHEARSE SQL in the existing project; review the proposed public content and explicitly approve publication of the two products and this route. Only after approval run APPLY_AFTER_APPROVAL, then VERIFY (ten true checks). Complete production route/three-product navigation, official Visit destinations and one source sample per newly published product. Issue #5 remains open.

## PR5.25 rehearsal checkpoint correction

The owner diagnosis confirmed the production route has the rubric description, last_verified_at=2026-10-06T00:00:00Z and no members. The original publication packet incorrectly used the seed draft description, null date and three seed members. Generator and both SQL files now pin the diagnosed checkpoint. Four publication unit tests and six PostgreSQL execution checks pass against this corrected state. Publication scope and the pinned content manifest remain unchanged. The existing owner approval remains valid.
