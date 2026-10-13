# PR5.22 — Simple Notion documentary review

Reviewed 2026-10-13. Issue #5 remains open. Research only: no claim, engine, preview, SQL or publication changes. Production remains ten products and four approved routes. PR5.21 owner commit 0ef8b2b passed 93 tests, lint/typecheck and staged diff checks; Production green.

## Proposed comparison scope

Personal basic note capture, editing and organization in a native desktop application. Proposed relationship scope: `personal-basic-note-capture-edit-organization`. This is an editorial proposal, not an applied relationship or publication approval. Exclude team databases, automation, complete Notion parity and migration fidelity. No hands-on usability or comparative speed tests were performed.

Notion itself supports creating a titled page and writing immediately. Tables and templates are optional starting choices. Do not claim ordinary Notion notes require a database. [Notion page guide](https://www.notion.com/help/create-your-first-page).

## Keep existing taxonomy meanings

- `focused-note-taking`: primary workflow centers on notes, rather than an all-in-one workspace. A product merely offering notes is insufficient.
- `no-database-required`: users can work with core notes without configuring a structured database, schema or views. Internal storage technology and optional features are separate.
- `minimal-setup`: documented first-use core notes require no server deployment, integration, plugin or custom database configuration. Normal installation and a local notebook/vault choice are allowed. This does not mean zero setup or easier than Notion for everyone.

These meanings come from the existing taxonomy in `seed/data/notion-vertical-slice.json`; no taxonomy change is proposed.

## Joplin — documentary support proposed

The native desktop notebook/note workflow supports proposed positive classifications for all three constraints. This is an editorial inference from the official overview and first-use documentation, pending a pinned draft graph review.

Sources checked 2026-10-13:

- [Overview](https://joplinapp.org/help/): note/to-do application with notebook organization and Markdown.
- [Using Joplin](https://joplinapp.org/help/apps/): create topic notebooks and notes locally; multi-device sync has additional provider setup.
- [Installation](https://joplinapp.org/help/install/): native desktop installers; terminal/server modes are outside scope.
- [Cloud plans](https://joplinapp.org/plans/): paid recurring synchronization/sharing services remain separate from local notes.

Personal note organization overlaps Notion pages; this does not cover relational databases, team workspaces or a tested Notion import. No claim of an AI-free interface is made.

## Obsidian — documentary support proposed

The native desktop vault/text-note workflow supports proposed positive classifications for all three constraints. Note focus is an editorial interpretation of the core documented workflow, not absence of other work modes. Keep the published Obsidian record and existing relationships intact in any future selective change.

Sources checked 2026-10-13:

- [Manage vaults](https://obsidian.md/help/Files+and+folders/Manage+vaults): choose a named local filesystem vault.
- [First note](https://obsidian.md/help/Getting+started/Create+your+first+note): create/edit plain-text notes using Markdown.
- [Pricing](https://obsidian.md/pricing): core use needs no sign-up; Sync and Publish are optional paid services.

Vault and Markdown concepts require learning; extensions/sync can add complexity. This proposal excludes community plugins, structured database setup and a promise of complete Notion feature parity.

## Logseq — hold edition and fit review

Do not promote the existing generic Logseq candidate yet. Current DB and file versions require separate evaluation. Internal SQLite does not itself fail the user-workflow database rubric. The broad knowledge-management, collaboration and task positioning also needs explicit consideration under the strict note-focus rubric.

Sources checked 2026-10-13:

- [Current repository](https://github.com/logseq/logseq): DB beta and mobile/RTC alpha, with backup guidance and a dedicated test graph recommendation.
- [DB documentation](https://github.com/logseq/docs/blob/master/db-version.md): structured properties/tags and export options; Markdown does not capture all graph data.
- [File-version repository](https://github.com/logseq/og): official separate repository; its README also mixes DB guidance and file-graph backup caveats, so repository identity alone does not resolve a supported binary workflow.
- [Journal guide](https://raw.githubusercontent.com/logseq/docs/master/pages/Getting%20started%20with%20the%20Journals%20page.md): journal documentation is available, but must be aligned to the selected release.

Open work: pin an edition/release and first-use path; resolve note-focus classification, pricing/limits and backup burden. Unknown stays unknown. Any replacement needs its own documented selection rationale and full evidence review.

## Next implementation boundary

Resolve the third candidate before a three-candidate draft qualification packet. Pair Notion and candidate workflow sources for each editorial alternative relationship. Require the exact proposed scope in the qualifier; preserve accepted offline anchors, historic evidence and published Obsidian. Use zero novelty boost. This research does not increase qualification counts: Simple Notion remains 0/3 and six routes remain unpublished.

## Validation and owner steps

Documentation-only increment. All twelve links were opened for documentary review; content access is not installed-app, migration or user-experience testing. Existing 93-test application baseline passed in PR5.21. Copy the two packet files, run `git diff --check`, stage only those files and review the staged diff before commit/push. No SQL or browser acceptance is needed for this increment.
