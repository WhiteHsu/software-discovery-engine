# PR5.59 — Meditation publication preflight

Actual clean HEADe005003 inspected. Owner screenshots show PR5.58 pushed, green Production #77, 29 Node tests passed, rehearsal and apply SQL Editor success. Complete returned verification CSV has 28/28 true. This supports imported claims, preserved historical data, three draft identities and an unapproved draft route; it is owner evidence, not an agent production query. Receipt saved separately with source attribution. Do not rerun PR5.58 APPLY or change its frozen pre-import baseline.

## Owner action and query scope

Run supabase/verification/PR5.59_PREFLIGHT.sql in the existing project's Supabase SQL Editor and return the complete single snapshot value. This is one WITH...SELECT statement, with no writes or publication approval. JSON export is preferable to a truncated screenshot or Markdown table; the full value is needed for future guards.

Capture actual target product rows/lifecycle; all claim collections and typed evidence links; linked and meditation-prefixed sources/fragments, including unlinked ones; all linked and required taxonomy; the entire meditation route and every member; all other route memberships of the three targets; exact published product/approved-route slug sets; scope storage columns; current product public-RPC projections; relevant public-read RLS flags/policies; and the anonymous RPC/private-evidence privilege boundary.

Expected current state is three draft products (medito, smiling-mind, healthy-minds-program), one draft and editorially unapproved meditation-apps-without-a-subscription route with exactly these members, qualified dated claims and scoped Calm relationships, null public product projections, public checkpoint15/7. Expectations are not asserted as fresh live state. Missing or unexpected rows/policies/claims and provenance drift require review before generating publication SQL.

## Publication boundary to review next

The bounded activity is personal adult guided meditation selection and playback. Review exact edition descriptions, no-subscription/pricing/trade-offs, source dates, route description, all member identities and scope before proposing publication. Calm itself provided sampled playback after Google login with a three-free-listens limit; its counter/reset remains unknown. App/Android versions, device/storefront and audio language remain unknown. No full catalog, therapeutic, privacy, offline or indefinite access equivalence is approved.

Unlike the earlier productivity route, all three meditation products are draft. A later concrete proposal must explicitly promote these three existing identities and the route, not silently make them public as a side effect of qualification. That proposal must retain IDs, claims, provenance, memberships and unrelated rows, ensure correct public projections and be tested before owner approval. If approved/applied/validated, the potential checkpoint is18 products/8 routes/2 remaining; this packet does not change or accept those future counts.

The new snapshot becomes a separate immutable post-import publication baseline. The existing currentRouteAudit still reconstructs the earlier accepted workflow stage and is not a live database query. Do not use its meditation zero as evidence that owner import failed. The separate PR5.56 builder supplies draft qualification; returned production data must be independently mapped and checked before publication.

No APPLY or REHEARSE script is included. The local checker pins the SELECT query and owner acceptance receipt and rechecks the static checkpoint. Local database checks, detailed in delivery VALIDATION.md, do not represent a new Supabase run. Next: receive full snapshot, prepare/test a concrete publication proposal, then request owner approval for the final publication action.
