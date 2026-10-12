# PR5.12 — selective offline draft import

Prepared 2026-10-12 from the documentary evidence reviewed on 2026-10-08. This preparation date does not claim the official sources were rechecked on 2026-10-12. Publication approval remains false.

Exactly three existing draft identities are selected: AFFiNE, AppFlowy and Anytype. Import nine attributes (`works-offline`, `pricing-model`, `trade-off-summary` per product) and three Notion alternative relationships bounded to `personal-offline-note-object-organization`. There are no new products, routes or route members. Product metadata must match the accepted baseline and remains draft. Other attributes, problems, audiences and anchors are omitted and preserved.

The reviewed input fingerprints are stored in `seed/research/offline-draft-import-2026-10-12.json`. The builder reconstructs PR5.11 from versioned research and selects only these claims; it does not trust stale patched output. The SQL is confined to `software_discovery` and uses the existing scope migration/RPC from PR5.7; no new schema migration is required.

Inside one locked atomic DO statement, each selected product/claim must match its exact baseline or reviewed after-state. Missing baseline rows, changed metadata/values/status/scope abort. A later published target is refused rather than reset. Source/taxonomy conflicts use the existing importer ownership checks. Historical and manual evidence pointers are retained, including pointers omitted from this small packet. No evidence or route membership replacement is authorized.

Accepted PR5.9 prerequisites are four published products (Obsidian, Things, OmniFocus, 2Do) and the published approved Todoist buy-once route. This packet never updates their rows or route data. Full local graph import and rerunning old publication SQL are not part of PR5.12.

## Operator sequence

1. Copy the eight packet files, run checks, commit and push the reviewed packet.
2. In the existing Supabase project SQL Editor, paste the complete `supabase/data/PR5.12_REHEARSE.sql` into a new query and Run. The statement rolls back its changes internally. Expected: `Success. No rows returned`.
3. If rehearsal succeeds, paste the complete `supabase/data/PR5.12_APPLY.sql` into another new query and Run. This persists the twelve draft claims. Expected: `Success. No rows returned`.
4. Run the complete `supabase/verification/PR5.12_VERIFY.sql`. All ten `passed` values should be true.

Stop on any actual SQL error or false verification; retain the result for diagnosis. Do not edit guard logic or run a full seed import to bypass drift. Verification is intended after APPLY, not as proof that rehearsal persisted data.

Rehearsal/apply are generated locally using `node scripts/seed/build-offline-draft-import.mjs`. Generated SQL lives under ignored `.seed-output/offline-draft-import/`; the shipped copies under `supabase/` are checked for equality in tests. Nothing in the generator connects to a database.

## Validation and resulting state

All 68 repository tests, lint/typecheck and production build passed. Nine isolated PostgreSQL-compatible test groups covered full rollback, baseline/lifecycle drift, unchanged published/product/route data, omitted claims, retained historical/manual evidence, all ten shipped verification checks, idempotence, protection of later publication, and anonymous RPC/private-evidence boundaries. No live Supabase execution has been performed by the agent.

After a successful live apply, these three offline candidates remain draft and hidden by the public product RPC. The offline route remains unpublished; the production route count stays at 1/10. The next publication review must verify the actual imported graph and separately request approval for the three products and scoped offline route. Owner approval for PR5.9 applied only to the Todoist publication.
