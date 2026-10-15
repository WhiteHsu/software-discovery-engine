# PR5.60 — Concrete meditation publication proposal

Actual clean baseline f5efa00 inspected. Owner screenshot shows green Production #78, not independently live queried. This is a tested proposal; owner publication approval is pending. No production write or publication has been performed by the agent.

## Owner-returned publication baseline

The complete PR5.59 snapshot was captured 2026-10-15T02:50:41.384836Z. Three existing products are draft. The meditation route is draft and editorially unapproved with exactly these three members and no other target exposures. The nine selected attributes, three scoped Calm relationships and all new import provenance/member metadata exactly match PR5.58's reviewed plan. All public product projections are null. Three public-read tables have RLS enabled and the recorded policies restrict access to published/approved data. Anonymous RPC execute/private-fragment boundary passes. Published sets remain15 products/7 routes.

The Markdown table doubled JSON backslashes; decode that representation once before parsing. Original attachment byte SHA-256: a7493ea28abada7f7fb92ce5fb7ccefb499004a58bcf2dbe01a8281db24ed5f0. Parsed semantic baseline SHA-256:10d79cdbde6a06a3c9f4887a5924802da2c8f52ad34bbf4cd24bed829347abbc. Original attachment unchanged; the new immutable post-import baseline is separate from PR5.58's pre-import baseline.

## Exact public action proposed

Set status=published on the existing Medito, Smiling Mind and Healthy Minds Program product IDs. Set status=published and editorially_approved=true on the existing meditation-apps-without-a-subscription route ID. Keep descriptions, scope/date/confidence, membership positions/notes, all other product fields, claims, sources, evidence, taxonomy, policies and unrelated data unchanged. The membership note records draft-review provenance and is not rendered by the comparison page. No new product identities are created and no source fetch is implied.

Existing scope: personal adult guided meditation selection and playback. The returned stored claims themselves are projected into the actual qualification engine, hypothetically setting only product lifecycle to published; all three pass at0.85. This is not acceptance of therapeutic, full catalog, offline/privacy or indefinite-service equivalence. Accounts remain relevant; Calm's sampled three-free-listens limit and unknown reset behavior remain. Android/app versions, device/storefront and audio language are still unknown; no fabricated environment details.

If approved, applied and verified, the resulting production set is18 products/8 approved routes/2 remaining. Before that, accepted checkpoint remains15/7/3. This packet does not edit the historical checkpoint or redirect the earlier reconstructed route audit. A later acceptance packet must record the actual owner results and reconcile the current audit explicitly.

## Guards, rehearsal and verification

Both SQL variants are atomic single DO statements with advisory serialization and table locks. Seventeen guards compare complete captured target product/claim/evidence/taxonomy/route/member sets after typed timestamp normalization (excluding created_at/updated_at from drift matching). New meditation-source/fragment additions, member exposures, edited claims, publication-set drift, changed public RLS/policies or private-fragment privileges cause rejection. All public product projections must remain hidden before the state transition. After the two UPDATE statements, counts and public scope/no-subscription projections are checked inside the transaction; failure rolls everything back.

REHEARSE ends with a caught rollback sentinel, leaving all rows/timestamps unchanged. APPLY_AFTER_APPROVAL omits that sentinel and must only be run after explicit owner publication approval. Generated APPLY SQL existing on disk is not approval. Repeated apply or rehearsal after apply is rejected; obtain fresh preflight instead of bypassing guards.

VERIFY is one SELECT returning21 booleans: exact full captured rows with only the approved status/approval differences, precise published slug sets, public product qualification fields and route links, unchanged RLS/policies and anonymous/private-evidence boundary. Every passed value must be true. Verification does not itself roll back a previously committed apply.

## Validation and practical limits

33 focused Node tests pass, including proposal purity, mutation rejection, payload guards, deterministic SQL and existing workflow/engine regressions. Nine PGlite PostgreSQL-compatible scenarios pass using current migrations plus actual captured target/source/evidence/taxonomy/route rows. Non-target published rows are skeletal identities matching captured slug sets; this is not a full production clone. Tests verify complete rollback, source/scope/member/lifecycle/manual-evidence/policy/privilege drift rejection, a failing public function causing atomic rollback, exact-only state changes, all21 SELECT checks, actual anonymous route/member/product visibility, actual engine qualification, denied private fragment access, timezone independence and repeat rejection. Missing evidence/null confidence causes verification failure. Existing module-type warning retained.

No application code, engine, schema or dependencies changed, so application build/lint is not repeated. After owner-approved publication, also inspect the live /escape/meditation-apps-without-a-subscription comparison and all three /software/ pages. SQL/engine verification is not a live visual check. Return all21 verification rows and page observations for publication acceptance.
