# PR3.2A.2 — Notion qualification semantics

Reviewed 2026-10-06 against the uploaded PR3.1/PR3.2A bundle. This is a seed/editorial update: version 1, database schema, executable validator, compiler, application code, and publication gates stay unchanged. The compiler preserves the bundle; it does not execute a recommendation engine. Route descriptions and curated memberships are the current contract for qualification. All three routes remain draft and editorially unapproved.

## Taxonomy

- `ai-optional`: core workflows remain usable without enabling, buying, or depending on AI. AI availability is compatible with this attribute. Silence about AI does not establish it.
- `focused-note-taking`: the primary workflow is note capture, editing, and organization rather than a broad workspace spanning databases, projects, and multiple work modes. Having a note editor alone is insufficient.
- `no-database-required`: a user can complete core note workflows without creating/configuring a structured database, schema, or database views. This says nothing about the application's internal storage or optional database features.
- `minimal-setup`: a documented first-use path reaches note capture/editing without mandatory server deployment, integrations, plugins, or custom workspace/database configuration. Offline or account-free use alone is insufficient.

Unknown claims use `value: null`, `verificationStatus: unknown`, null confidence/time, and empty evidence. Evidence-backed false means the defined signal fails, not that the product is bad or cannot write notes.

## Route rubric

Every route needs an evidence-backed `notion` relationship of type `alternative`. A verified relationship permits qualification; a likely relationship permits only a provisional draft candidate. A missing relationship is unknown.

1. **Offline**: also requires `works-offline=true`, verified. A local-first claim or likely offline claim cannot substitute for verified offline support.
2. **Without AI**: also requires `ai-optional=true`, verified. Do not test for absence of integrated AI or optional ecosystem plugins.
3. **Simple**: derived/editorial, never `simple=true`. Requires verified true `focused-note-taking` and `no-database-required`. Verified true `minimal-setup` permits qualification; likely true permits a provisional editorial candidate; unknown leaves the result unknown. A supported false signal fails this rubric. Unknown never counts as passing `minimal-setup != false`. Editorial approval remains a separate publication requirement.

## Qualification matrix

`V+` = verified true; `V-` = verified false; `L+` = likely true; `U` = unknown. Qualification considers both product signals and the Notion relationship.

| Product | Notion alternative | Offline signal | AI optional | Focused notes | No database required | Minimal setup | Offline route | Without AI route | Simple route |
|---|---|---|---|---|---|---|---|---|---|
| Obsidian | likely | V+ | U | U | U | U | provisional | unknown | unknown |
| Anytype | missing / U | V+ | U | U | U | U | unknown | unknown | unknown |
| AppFlowy | verified | V+ | V+ | V- | U | U | qualify | qualify | does not qualify |
| AFFiNE | verified | V+ | V+ | V- | U | U | qualify | qualify | does not qualify |
| Joplin | missing / U | V+ | U | V+ | V+ | U | unknown | unknown | unknown |
| Logseq | missing / U | L+ | U | U | U | U | unknown | unknown | unknown |

Offline draft membership is now Obsidian (explicitly provisional), AFFiNE, AppFlowy. The unsupported Anytype/Joplin/Logseq memberships were removed without changing their existing offline claims. Without AI contains AppFlowy and AFFiNE. Simple remains empty.

## Evidence audit

Only source keys already present in the uploaded bundle were used; no new research sources or product relationships were invented. Existing source retrieval timestamps remain intact. Newly reviewed asserted claims use 2026-10-06.

- **Obsidian**: existing security/license/sync materials support local/offline use but do not directly establish the new AI or setup rubric. Its existing Notion relationship is likely and stays likely. The third-party comparison supports that existing relationship, but was not used to promote new product signals to verified.
- **Anytype**: the [existing networked-era article](https://blog.anytype.io/a-new-networked-era-for-anytype/) supports offline collaboration and local storage. It does not establish optional AI, first-use setup, or a Notion alternative relationship. New signals remain unknown; the home page did not expose usable text during this audit.
- **AppFlowy**: [existing welcome docs](https://docs.appflowy.io/docs/appflowy/readme/welcome-to-appflowy) explicitly describe opt-in AI. Retain verified AI optional. The documented docs/wikis, task/project databases, Kanban, and calendar modes support a verified false focused-note-taking signal under the defined primary-workflow rubric. Their existence does not imply a database is mandatory; that signal remains unknown.
- **AFFiNE**: [existing pricing evidence](https://affine.pro/pricing?type=cloud) separates unrestricted core document/whiteboard editing from an AI add-on, supporting promotion of AI optional from likely to verified. The [existing homepage](https://affine.pro/) explicitly positions a merged docs/whiteboard/database workspace, supporting false focused-note-taking. No inference was made that database configuration is mandatory.
- **Joplin**: [existing help](https://joplinapp.org/help/) directly describes notes, notebooks, and editing notes in the application or a text editor. This supports focused-note-taking and a core workflow without configuring a user database. It does not document AI optionality or the complete first-use setup path; these stay unknown. No Notion relationship is present in the bundle.
- **Logseq**: the existing local-first and likely offline claims were preserved. The existing homepage could not be fetched after two attempts, so no new signal was asserted. There is no Notion relationship in the bundle.

Previous conversation conclusions are not evidence: in particular, six offline qualifiers, universal AI optionality, and likely Joplin simplicity are not imported as verified facts.

## Validation scope

The existing validator checks references, values, statuses, and evidence presence; it does not verify the contents of referenced webpages or enforce editorial qualification. The existing compiler emits a local import plan, performs no database writes, and preserves unknown and false as distinct values. PR3.2A.2 does not add a runtime qualification engine.
