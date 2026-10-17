# PR5.102 — Selective privacy draft import

Baseline: owner pushed 35b520e; Production119. Privileged PR5.101 snapshot captured 2026-10-17T08:08:32.319575+00:00 confirms 21 published products / 9 approved published routes. Only generic LanguageTool draft collides by family; retain it and all its captured claims/evidence. The three proposed editions, privacy route and two required taxons are absent. Existing subscription-free Grammarly route and its three memberships are retained. Anonymous private evidence boundary is true.

The pasted Markdown table escaped backslashes in JSON note strings. Extracted the single snapshot cell and decoded the Markdown backslash escaping once, then parsed and saved JSON. Semantic snapshot SHA256 is 019f012b228503eae4d355129727cfb049f0e7cd31a96a19ab7adfc828b3192a. All values are data, not execution instructions. SQL guards compare database-typed records against this frozen snapshot before writes; mismatches abort rather than overwrite.

New rows: 3 draft products, 2 attribute taxons, 12 attribute claims, 3 scoped anchors, 1 unapproved draft route, 3 memberships, 6 source pointers and 30 claim evidence fragments. Shared pricing/trade-off taxons and Grammarly anchor are reference-only. No historical full-bundle import, claim replacement or route-member replacement. Source pointers are not independently verified quotations. Reviewed conditions remain stored in the operation text and scoped anchor.

## Owner execution

1. Run `node scripts/seed/build-privacy-import.mjs` and the tests listed in README. This generates local files only; it does not contact a database.
2. Run only `supabase/data/PR5.102_REHEARSE.sql` in the existing privileged SQL Editor. Expected final notice: `Rehearsal rolled back; no seed changes persisted`. Review notices or return the error. Empty result rows alone do not prove the rehearsal reached its final notice. All changes roll back.
3. After successful rehearsal, `PR5.102_APPLY_DRAFTS.sql` is the separate persistent draft import. It does not publish products or approve the route. Do not run both files as one pasted batch. If guards reject changed state, stop and obtain a fresh PR5.101 snapshot; do not weaken guards.
4. After a successful apply, run `supabase/verification/PR5.102_VERIFY.sql`. Every `passed` cell must be true, including exact new rows, retained data, unchanged published slug sets, draft lifecycle and private evidence boundary. Return the full result before any publication step.

The apply is deliberately one-shot: a repeated run rejects the new taxonomy/route collision. The files use the existing compact atomic import template with restricted tables, empty replacement lists and snapshot guards. The template locks discovery tables briefly; lock timeout is 10 seconds. Failed statements roll back atomically. No migration or application runtime change is included.

Validation: 20 Node tests passed (new selective import + existing privacy runtime/proposal/preview/route suites). Generated SQL was inspected and reproduced byte-for-byte. No local PostgreSQL execution or remote import has been performed by the assistant. Owner SQL rehearsal is the pending database validation; no build is needed for this packet. Generated next-env.d.ts remains outside this payload. STATUS EOF blank line from PR5.101 corrected.
