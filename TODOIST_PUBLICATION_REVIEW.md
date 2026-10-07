# PR5.9 — Scoped Todoist publication review

**Owner publication decision: pending. No live publication performed.** PR5.8 commit 877744f is live and all eight import checks were confirmed true by the owner on 2026-10-07.

## Review exactly four public pages

- `/software/things`
- `/software/omnifocus`
- `/software/2do`
- `/escape/todoist-alternatives-with-a-one-time-purchase`

The exact route copy, product descriptions, all current claim values/states, scope limits and source links are in **TODOIST_PUBLICATION_CONTENT.md**. This reviews complete product pages, not only their buy-once attributes. Unknown offline/AI/open-source facts remain unknown; audience relationships remain likely. The comparison is an evidence-bounded editorial classification, not vendor endorsement or hands-on testing.

The route is restricted to **personal task capture and project organization** using Things 3 platform purchases, OmniFocus 4 native perpetual licenses and the 2Do Mac direct-purchase license. Team, platform and full Todoist replacement parity are not promised. Native edition boundaries, separately sold platforms/mobile apps, Web subscriptions and future update/major-version terms are explicit. No exact prices are frozen. All three candidates qualify at minimum confidence 0.85; novelty is zero for each, yielding deterministic slug order (2Do, OmniFocus, Things). Confidence is an evidence classification score, not a measured probability.

Official purchasing/workflow sources were rechecked on 2026-10-07; the accepted facts remain applicable. Sources: [Things purchasing](https://culturedcode.com/things/support/articles/2803552/), [Things workflow](https://culturedcode.com/things/), [OmniFocus purchasing](https://www.omnigroup.com/omnifocus/buy/), [OmniFocus workflow](https://www.omnigroup.com/omnifocus/features/), [2Do purchasing](https://www.2doapp.com/store/), [2Do workflow](https://www.2doapp.com/), [Todoist workflow](https://www.todoist.com/features).

## Publication mechanics

One atomic SQL statement checks the full reviewed product metadata, all claims and their exact retained old+new evidence sets, source/taxonomy metadata and references. It then publishes exactly the three products, creates one route with exactly three memberships and approves/publishes that route. All other records, including published Obsidian, remain unchanged. It does not rewrite claims, source pointers, confidence or audience classifications.

Missing/changed evidence, new or removed relationships, different lifecycle states, existing mismatched route metadata/memberships or another approved route exposing a target cause an atomic failure. Stop and review the named mismatch; do not remove guards. Additional manually added evidence requires a fresh review because this packet pins the complete public graph.

The route may be absent, an exactly matching empty draft, or an exactly matching complete draft/published route. Membership and novelty must match. Successful repeat apply reuses IDs and keeps unchanged timestamps. Publishing the pages makes them publicly accessible and allows their existing production metadata to enable indexing. Push/Vercel alone does not run SQL or publish data.

## Local preparation and checks

If the PR5.8 output is still present, generate publication artifacts directly. Otherwise regenerate the prior builders in order before this step; see TODOIST_DRAFT_IMPORT.md.

```powershell
node scripts/seed/build-todoist-publication.mjs

$taskTests = @(Get-ChildItem scripts/seed -Filter '*.test.mjs' | ForEach-Object FullName) + @(Get-ChildItem scripts -Filter '*.test.mjs' | ForEach-Object FullName)
node --test @taskTests
npm run lint
npm run typecheck
git diff --check
```

Expect 58 passing tests. Generated SQL under `.seed-output/todoist-publication/` is identical to the reviewed copies under `supabase/data/`. Exclude `.seed-output/` and `next-env.d.ts` from commit.

## SQL sequence

1. You may run the entire `supabase/data/PR5.9_REHEARSE.sql` now. It temporarily exercises publication inside one statement and rolls **everything** back before completing. Expect success; no live page is published.
2. Review TODOIST_PUBLICATION_CONTENT.md and give explicit approval to publish these **three products and one scoped route**. Starting PR5.9 or passing rehearsal does not constitute publication approval.
3. **Only after approval**, run the entire `supabase/data/PR5.9_APPLY_AFTER_APPROVAL.sql`.
4. Run `supabase/verification/PR5.9_VERIFY.sql`: expect ten rows, all `passed=true`.
5. Open the four production URLs listed above. Confirm the three comparison rows, edition/scope limits, dated official links and product-to-route navigation. Open `/software/obsidian` to confirm it remains available. Other unapproved escape routes should still return 404. Record this production acceptance separately.

Do not edit a rehearsal file to publish; use the separately named approved-apply file. No migration is required and no prior migration/import needs rerunning.

## Validation performed

58 repository tests, lint and typecheck passed. Against an isolated PostgreSQL-compatible instance with all migrations and the accepted PR5.8 graph, seven execution checks passed: full publication rehearsal rollback; atomic rejection of changed scope/missing evidence/extra relationship; all ten shipped verification checks; preservation of unrelated product/route/claim/source/evidence data and Obsidian; idempotent repeat with exact IDs/timestamps; anonymous route/member/public RPC access with private evidence denied and the real ranking/publication engine passing all three; atomic rejection of changed novelty/member data. No remote writes or production publication by the agent. Production HTTP/browser acceptance is pending owner approval and live apply.

## Commit commands

```powershell
git add STATUS.md TODOIST_PUBLICATION_REVIEW.md TODOIST_PUBLICATION_CONTENT.md scripts/seed/build-todoist-publication.mjs scripts/seed/todoist-publication.test.mjs seed/research/todoist-publication-review-2026-10-07.json supabase/data/PR5.9_REHEARSE.sql supabase/data/PR5.9_APPLY_AFTER_APPROVAL.sql supabase/verification/PR5.9_VERIFY.sql
git diff --cached --check
git diff --cached --stat
git commit -m "feat(discovery): prepare scoped Todoist publication review (#5 PR5.9)"
git push
```

Nine files are included. Commit/push may precede rehearsal and publication approval. Even after all four pages are accepted, this is only one of ten required published routes; Issue #5 remains open.
