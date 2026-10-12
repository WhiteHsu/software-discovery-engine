# PR5.17 — Remaining route review

Issue #5 remains open. Owner-confirmed production: ten published products and three approved routes. PR5.16 commit b658009 deployed, rehearsal/apply succeeded, all ten live verification checks true. Incognito screenshots on 2026-10-12 demonstrate the Photoshop route, comparison, three product pages without draft banners and three Visit destinations. Source-link clicks were not separately demonstrated in this batch. Owner performed apply; no separate textual approval message is recorded.

This packet records acceptance and audits the seven remaining intents. It does not change claims, ranking, preview fixtures, database records or publication. The publication checkpoint is owner evidence, not a live database query. Historical research shortlists are leads, not current verified recommendations.

Run `node scripts/escape-remaining-routes.mjs` to reconstruct the versioned draft graph and write `.seed-output/escape/remaining-routes.json`. This uses the latest raster workflow directly rather than the original readiness script's older fixture paths. Do not import this report as seed data.

| Remaining route | Qualified / curated draft graph candidates | Next evidence work |
|---|---:|---|
| Notion Alternatives Without AI | 2 / 3 | Anytype ai-optional unknown; refresh all three AI behaviors and relationship scope |
| Simple Notion Alternatives | 0 / 3 | Note focus, database-free workflow and minimum setup each require evidence |
| Privacy-Friendly Grammarly Alternatives | 0 / 3 | Edition-specific local/cloud text processing, retention and AI handling |
| Grammarly Alternatives Without a Subscription | 0 / 3 | Current edition/license offers, writing overlap and limits |
| PDF Editors Without a Subscription | 0 / 3 | Separate page operations, annotation and existing-text editing |
| Meditation Apps Without a Subscription | 0 / 3 | Free core content, account/platform requirements; avoid medical efficacy claims |
| Productivity Apps You Can Buy Once | 0 / 4 | Verified audience workflow, paid perpetual edition and version/upgrade limits |

## Next scoped work

Prioritize Notion Alternatives Without AI because three products are already published and two ai-optional claims currently qualify. However, the qualifier currently accepts the existing offline-scoped Notion alternative anchors. That is an engine result, not a new editorial approval for an unbounded Notion replacement. A future packet must review the intended personal note/organization workflow and preserve the accepted offline anchors; do not overwrite their scope to make another route qualify.

AFFiNE's official [AI page](https://affine.pro/ai) describes AI activation and Cloud sign-in requirements; its [getting-started guide](https://affine.pro/blog/getting-started-with-affine) separates local editing and optional AI. AppFlowy's official [pricing](https://appflowy.com/pricing) and [local AI article](https://appflowy.com/blog/A-Simple-Way-to-Build-a-Workspace-Powered-by-Local-AI) are review leads. These search/open observations on 2026-10-12 have not updated stored claims. Anytype ai-optional remains unknown: lack of an AI mention does not prove optionality or absence of AI. All three need current edition/workflow evidence before publication preparation. Avoid claiming AI-free, no AI interface, or no third-party processing from ai-optional.

If Anytype lacks sufficient positive evidence, evaluate another versioned candidate rather than filling the unknown with an inferred true value. Document the exact reason for any selection change. No new publication approval is requested by this packet.

## Validation

84 tests pass, including rejection of unknown/duplicate checkpoint publications and separation of research leads from qualification. Lint and typecheck pass. No UI or SQL changes; production build was last verified in PR5.16.
