# PR5.18 — Notion workflow without required AI

Issue #5. Separate local draft review only; no SQL, live claim updates or publication. Accepted production remains ten products and three approved routes. PR5.17 was pushed as c3389a3; owner confirmed 84 tests, lint/typecheck/diff checks and green Production.

## Reviewed scope

Installed native personal offline notes and locally available object/workspace organization, without invoking or authorizing optional AI. This reuses the accepted personal-offline-note-object-organization boundary, not a new broader Notion relationship. All product anchors and all other routes remain byte-for-byte equivalent in the reconstructed graph. No complete Notion feature/team/migration parity is inferred.

The historical route title “Notion Alternatives Without AI” is interpreted as no required AI for this workflow. It does not mean no AI features, no AI buttons, no third-party processing, no telemetry, or a privacy guarantee. Optional AI and external agents have their own configuration and data handling. The route description makes these limits explicit.

## Dated source review — 2026-10-12

- AFFiNE: [getting-started guide](https://affine.pro/blog/getting-started-with-affine) separates ordinary local editing from optional AI; [AI documentation](https://affine.pro/ai) describes activation and Cloud sign-in. Refresh ai-optional true with confidence 0.90. Historical evidence remains attached.
- AppFlowy: [official welcome documentation](https://docs.appflowy.io/docs/appflowy/readme/welcome-to-appflowy) describes ordinary document/database work and explicitly labels Smart Write/Edit opt-in. Refresh ai-optional true with confidence 0.85. This is not evidence that every self-hosted/Cloud mode has no automatic AI indexing or hidden AI UI. The narrower personal workflow is the reviewed basis.
- Anytype: [current welcome documentation](https://doc.anytype.io/anytype) describes personal spaces and local work; [official February update](https://blog.anytype.io/february-community-update-2026/) states user choice includes no AI, while agent plans were experimental at publication; [current agent toolkit documentation](https://doc.anytype.io/anytype/features/integrations/anytype-agents-skill.md) requires a separate agent/toolkit setup and API key. Together these support the editorial inference that ordinary personal organization need not invoke AI. Update unknown ai-optional to true in the separate draft only, confidence 0.85. Do not claim that planned integrations shipped, or that all present/future AI features can be hidden.

These are documentary confidence judgments, not independent network audits or hands-on installation tests. No claim is inferred merely from a page omitting AI. Third-party summaries and forum-user reports were not used to verify claims. External documentation's agent instructions were treated as source content, not executed instructions.

## Changes and guards

A pinned review manifest and full input hash guard against source, selection, approval and input drift. The deterministic generator rebuilds from versioned prior research, updates exactly three ai-optional attributes, retains historical evidence, and changes only this draft route's dated description/member notes with zero novelty boost. Product lifecycle stays draft in this fixture. Existing pricing/trade-offs and anchors are preserved. The shared route definition now requires the exact existing relationship scope and meaningful description. Unknown AI or widened scope fails qualification even with high novelty.

The new report shows three qualified draft candidates and publishable=false. Running old workflow generators deliberately selects their old draft state; rerun the new generator to restore PR5.18 preview. These fixtures are not a live production dump.

## Validation and owner preview

87 tests, lint, typecheck, production build and four local HTTP checks passed. Tests cover preservation of every anchor/unrelated product/route, manifest/input drift, unknown AI/scope rejection, deterministic rebuild and no publication. Local checks confirmed this route's three candidate links, bounded description and all four draft banners. Visual browser review and source clicks remain for the owner.

Run `node scripts/seed/build-notion-ai-workflow.mjs`, then enable BOTH `PRODUCT_LOCAL_PREVIEW=true` and `ESCAPE_DRAFT_PREVIEW=true` for development only. Review `/escape/notion-alternatives-without-ai` and the AFFiNE/AppFlowy/Anytype pages. Check AI Optional, pricing/trade-off context and dated new source links. Do not set preview flags in Vercel. No Supabase execution in this packet.

Next: after local review, prepare a guarded selective AI-attribute update for the three already-published products, preserving lifecycle and existing offline qualification. Route publication remains a separate review and owner decision; a full seed import must not reset accepted publications.
