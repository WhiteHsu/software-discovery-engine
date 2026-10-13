# PR5.30 — PDF database preflight

PR5.29 owner commit 4b5f9bd accepted: 109 tests, lint/typecheck/build, local route and three product pages, official Visit destinations. Production green. Owner restored generated next-env.d.ts and confirmed clean working tree. PDF qualification is 3/3 in the versioned draft graph; live publication remains 12 products / 5 routes.

This increment trims the generator's trailing blank line and supplies SELECT-only preflight. It does not apply claims, import draft records, approve publication or alter route membership. Run supabase/verification/PR5.30_PREFLIGHT.sql and export the one-row snapshot result. It captures target identities, all prior relationships and four evidence-link kinds, used source rows, taxonomy, route lifecycle/membership and accepted publication slugs. Empty arrays are observations, never proof that an unknown claim passes.

The result is necessary to pin a selective import against actual stored state. The earlier Simple Notion production checkpoint differed from seed values, so neither route dates/descriptions nor claim baselines should be assumed from a local fixture. Any missing identity, existing scoped relationship, published target, unexpected membership or evidence drift needs review before write SQL is produced. Native tests remain not performed.

Expected publication slugs are the twelve previously accepted products and five accepted routes. The three PDF products and PDF route are expected to remain unapproved drafts; if the query shows otherwise, preserve that result and review it. Do not modify SQL values to force a match. A later importer should preserve unrelated taxonomy/claims/evidence, allow only nine reviewed attributes plus three reviewed anchors, and retain draft lifecycle. Publication needs a separate review.

SQL was inspected against repository table/column usage but has not been run on the remote database. Local PDF generator and its four tests pass after whitespace cleanup. This packet contains no APPLY or REHEARSE SQL; those follow the actual baseline snapshot.
