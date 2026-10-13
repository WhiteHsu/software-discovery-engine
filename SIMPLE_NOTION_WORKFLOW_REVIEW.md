# PR5.23 — Bounded basic-note draft workflow

Issue #5. Reviewed 2026-10-13. Three qualified **local drafts**, zero publication or remote writes. Production remains ten products and four approved routes. PR5.22 was pushed by the owner as 3516e52 after staged diff checks passed; deployment was not separately demonstrated in that screenshot batch.

## Selection and scope

Use Joplin, Obsidian and new draft Simplenote for `personal-basic-note-capture-edit-organization`. This compares native desktop personal note capture, editing and organization without custom databases or plugins. Notion already supports writing ordinary pages; the comparison is workflow fit, not measured speed, universal ease, migration fidelity or full feature parity. Fit, note-focus and minimal-setup classifications are editorial inferences from the documented core workflow, not hands-on tests.

Logseq leaves only this route's draft membership. Its product, claims, evidence and other memberships remain unchanged. The current [official overview](https://github.com/logseq/logseq) spans knowledge management, collaboration and tasks alongside distinct file/DB editions; edition-specific evidence does not yet resolve this strict note-focus review. No negative claim is inferred from SQLite or missing evidence. Simplenote supplies a documented text-note/tag flow instead of weakening a constraint to reach three candidates.

## Documentary basis

Eleven dated primary sources are pinned in `seed/research/simple-notion-workflow-2026-10-13.json`.

- [Notion pages](https://www.notion.com/help/create-your-first-page) establishes the basic page workflow on the anchor side of all three editorial alternative judgments.
- Joplin: [overview](https://joplinapp.org/help/), [notebook workflow](https://joplinapp.org/help/apps/), [installation](https://joplinapp.org/help/install/) and [Cloud plans](https://joplinapp.org/plans/). Local notebooks/Markdown notes qualify; sync, migration and paid Cloud services have separate setup or limits.
- Obsidian: [vault creation](https://obsidian.md/help/Files+and+folders/Manage+vaults), [first note](https://obsidian.md/help/Getting+started/Create+your+first+note) and [pricing](https://obsidian.md/pricing). Local vault/text-note workflow qualifies without extensions; vault/Markdown concepts need learning and optional Sync/Publish cost extra.
- Simplenote: [overview](https://simplenote.com/) and [help](https://simplenote.com/help/). Account/email verification is required; core editing and tags need no custom database or plugin. Service sync, lack of encryption at rest and unsupported attachments are disclosed. Offline editing requires prior sign-in/download. It does not qualify here as local-only or account-free.

The existing three attribute meanings remain intact. Internal storage is separate from user database configuration. Normal installation, vault/notebook choice and account signup can coexist with minimal-setup; no server/plugin/custom schema is needed for the stated path. All source review is documentary, not a signup, installed-application or import test.

## Implementation and preservation

The deterministic generator reconstructs PR5.18's reviewed graph, then adds one draft product, seventeen attribute claims/refreshes and three bounded alternative relationships. Sources and prior evidence pointers are retained. All taxonomy, unrelated products, audiences/problems, unrelated routes and lifecycle states remain unchanged. The fixture now has 35 drafts; this count is not the live ten published products.

Simple Notion qualification now requires the exact basic-note scope and a nonempty description. High confidence or novelty cannot compensate for missing scope, required facts or publication. Ranking uses zero novelty. The separate PR5.21 audit still reconstructs its own historical graph; use this increment's generated `simple-notion-review.json` for these three new local qualifications, not a live-publication inference.

No SQL, product publication or route approval is included. Never import the complete generated draft bundle into production. Any future selective import must preserve published Obsidian and its historical evidence, and review the new draft identities separately.

## Run and accept local preview

1. Copy packet files, run `node scripts/seed/build-simple-notion-workflow.mjs`.
2. Run all script tests, lint, typecheck, build and diff checks using the packet README.
3. Set both `PRODUCT_LOCAL_PREVIEW=true` and `ESCAPE_DRAFT_PREVIEW=true` for `npm run dev`. Keep these flags local; production ignores them.
4. Inspect `/escape/simple-notion-alternatives`, `/software/joplin`, `/software/obsidian` and `/software/simplenote`. All should show draft state. Confirm three comparison candidates, scope/limits, source and Visit links. Account creation is not needed for this review.
5. Stop dev and clear the two preview variables. Commit only the six packet files.

97 tests, lint/typecheck/build pass. Four local HTTP page checks return 200 with draft text, comparison candidates and Simplenote limitation present. This verifies server-rendered content; visual/CTA/source browser acceptance remains for the owner.
