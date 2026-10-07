# PR5.8 — Selective Todoist candidate draft import

Issue #5 remains open. PR5.7 schema/RPC migration is live: the owner confirmed success and seven verification checks true on 2026-10-07. This packet prepares data SQL; it has not been run against live Supabase.

## Exact scope

- Things and OmniFocus: apply four reviewed attributes each (`one-time-purchase`, `no-subscription`, `pricing-model`, `trade-off-summary`); replace their existing Todoist alternative metadata with the reviewed personal task/project scope. Four attributes are new relationships; four replace prior pricing/limit claims.
- 2Do: insert one draft product, five verified attributes, one verified scoped Todoist alternative and one likely productivity audience relationship. The audience is not promoted.
- Include only referenced taxonomy and official source pointers. All three products stay draft. Import zero routes, memberships or publication approvals.

Existing product metadata must match the accepted baseline. Omitted claims remain untouched, including Things/OmniFocus platforms, unknown attributes and personal-task audience relationships. All prior evidence links and manual links are retained; new reviewed pointers are added. Historical pointers may therefore remain alongside the new dated review. No raw source excerpts are created.

## Guards and atomic behavior

The review manifest pins the selected graph and accepted baseline SHA-256. SQL checks targeted product/claim rows while holding the same transaction lock as the existing compact importer. An existing row must match its accepted prior state or the exact reviewed result. Previously absent claims may be absent or already match the result. Missing required baseline rows or unexpected changes abort the entire statement. A later published target also aborts, rather than resetting its status.

Unowned existing taxonomy/source records must match. No broad ownership of routes, taxonomy or sources is granted. Product ownership is restricted to the three selected records and included claims. IDs are resolved from existing unique keys; unchanged rows keep their timestamps. Repeating a successful apply is idempotent. Omitted data is not reconciled or deleted.

If a drift/ownership error appears, stop and inspect that named row. Do not broaden ownership, remove guards or run a full 34-product import to bypass the error. The full local preview marks Obsidian draft and is unsuitable for production import.

## Regenerate locally

Run from the repository root with Node 24, in this order:

```powershell
node scripts/seed/build-editorial-fit.mjs
node scripts/seed/build-product-preview.mjs
node scripts/seed/build-escape-draft.mjs
node scripts/seed/build-buy-once-draft.mjs
node scripts/seed/build-todoist-workflow.mjs
node scripts/seed/build-todoist-draft-import.mjs

$taskTests = @(Get-ChildItem scripts/seed -Filter '*.test.mjs' | ForEach-Object FullName) + @(Get-ChildItem scripts -Filter '*.test.mjs' | ForEach-Object FullName)
node --test @taskTests
npm run lint
npm run typecheck
git diff --check
```

Outputs are under `.seed-output/todoist-draft-import/`. The reviewed SQL copies under `supabase/data/` have the same contents as the generated files; compare hashes if regenerating. Do not commit `.seed-output/` or `next-env.d.ts`.

## Supabase SQL Editor sequence

Use the existing production project and the `software_discovery` schema. PR5.7 must already be applied; do not rerun its migration.

1. Paste the **entire** `supabase/data/PR5.8_REHEARSE.sql` into a fresh query and run it. This exercises the import and intentionally rolls all changes back. Expect success and, where notices are shown, `Rehearsal rolled back; no seed changes persisted`. Do not select/run only part of the statement.
2. After successful rehearsal, paste the **entire** `supabase/data/PR5.8_APPLY.sql` into another query and run it. This persists the reviewed drafts atomically. Expect success. It does not publish pages.
3. Run `supabase/verification/PR5.8_VERIFY.sql`. Expect eight rows with `passed=true`. Preserve the results for acceptance.

Public Things/OmniFocus/2Do URLs still return no public product data while their status is draft. The public Todoist escape route is still gated; this packet does not create or publish it. Only Obsidian remains published.

## Validation performed

55 repository tests, lint and typecheck passed. Isolated PostgreSQL-compatible execution against all migrations and the accepted 30-product baseline verified: complete rehearsal rollback, atomic rejection of edited pricing, all eight shipped verification checks, preservation of unrelated records/routes/evidence and published Obsidian, repeat apply with identical IDs/timestamps, anonymous RPC draft hiding/raw evidence denial, and rejection after later publication. No remote database writes were performed by the agent.

## Commit after local checks

```powershell
git add STATUS.md TODOIST_DRAFT_IMPORT.md seed/research/todoist-draft-import-2026-10-07.json scripts/seed/build-todoist-draft-import.mjs scripts/seed/todoist-draft-import.test.mjs supabase/data/PR5.8_REHEARSE.sql supabase/data/PR5.8_APPLY.sql supabase/verification/PR5.8_VERIFY.sql
git diff --cached --check
git commit -m "feat(discovery): prepare selective Todoist draft import (#5 PR5.8)"
git push
```

Git push/Vercel deployment do not execute these data SQL files. Live import acceptance and later route/product publication are separate steps. #5 cannot close until all ten routes meet their published-candidate and editorial gates.
