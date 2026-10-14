# Project Status

**Last Updated:** 2026-10-13

## Current Phase

**Phase 6 — Validation MVP Build**

## Current Work

**Issue #5 — Escape Route Engine: in progress (PR5.26 accepted; PR5.29 accepted; PR5.30 accepted; PR5.31 accepted; PR5.32 post-import snapshot received; PR5.33 production publication accepted; PR5.34 acceptance/checkpoint prepared)**

Issue #4 was closed by the owner on 2026-10-07 after production acceptance. Application/publication commits b7568d1 and c9dad66; acceptance commits 80a8828 and 80e537e. The owner confirmed official CTA and pricing-source clicks in Chrome. At that acceptance milestone only Obsidian was published. PR5.9 subsequently published three additional products and one route, as recorded below.

PR5.1 implements ten validation intent definitions, structured evidence qualification, bounded novelty ranking, route comparison pages and canonical product navigation. Local previews expose explicit qualification blockers. No database writes or publication are included. See ESCAPE_ROUTES.md and the generated readiness report.

Owner pushed PR5.1 as 814a126 on 2026-10-07 after local browser checks, including AFFiNE/AppFlowy candidate links. PR5.2 adds proposed taxonomy rubrics, ten research shortlists, seven pending official-source observations and a read-only report generator. It applies no observations or memberships and changes no website previews or published records. Eleven tests and lint passed. See ESCAPE_CONTENT_REVIEW.md.

Owner pushed PR5.2 as 7ab09a4. PR5.3 adds 2Do, GIMP, Krita and Paint.NET research dossiers with eighteen pending claim proposals and explicit edition/workflow caveats. All ten research-name shortlists reach three, but launch qualification is unchanged. Fourteen tests and lint passed; report generation leaves accepted seed fixtures/previews unchanged. See ESCAPE_CANDIDATE_REVIEW.md. No SQL, graph import or publication is included.

Owner pushed PR5.3 as 1181e3f. PR5.4 adds an explicit dated source review and separate draft graph/preview generator for four new products. Seventeen documentary claims are verified; five editorial claims remain likely. Both opt-in development readers select the same fixed 34-product preview files; production ignores preview flags. Eighteen tests, lint, typecheck, build and local browser navigation passed. Baseline claim values are preserved; no SQL, database writes or publication. See ESCAPE_DRAFT_REVIEW.md.

Owner pushed PR5.4 as fdda4e6. PR5.5 adds eight official purchasing/edition facts for Things and OmniFocus to the separate local draft graph. Native perpetual licenses are distinguished from optional Web/subscription offers and future major upgrades. Alternative and audience judgments are unchanged; qualification counts do not increase. Twenty-one tests, lint and two local HTTP page checks passed. No SQL or publication. See ESCAPE_BUY_ONCE_REVIEW.md.

Owner pushed PR5.5 as 077cd9c. After confirming the personal task/project scope, PR5.6 records dated two-sided official workflow evidence for Things, OmniFocus and 2Do. Exactly three bounded draft alternatives qualify; zero are published and the route is not approved. The engine rejects missing/widened scope, and the preview publication block remains visible with three drafts. Twenty-five tests, lint, typecheck, build and four local HTTP page checks passed. Scope persistence/public RPC projection must be handled before any future database/publication packet; no SQL or writes are included. See TODOIST_WORKFLOW_REVIEW.md.

Owner pushed PR5.6 as 1e1632c and PR5.7 as f4702be. PR5.7 adds paired relationship scope columns, seed validation/import projection and the published-product RPC projection. Existing unscoped data uses nulls and the prior description fallback. All 52 tests, lint/typecheck and isolated PostgreSQL-compatible migration/import/RPC checks passed. The owner applied the live Supabase migration on 2026-10-07 and supplied screenshots showing success and all seven PR5.7 read-only checks true. No graph import or publication occurred in PR5.7. See ANCHOR_SCOPE_STORAGE.md.

Owner pushed PR5.8 as 877744f. The selective import applies eight purchase/limit attribute claims and two scoped Todoist anchors for Things/OmniFocus, plus new draft 2Do with seven claims. No routes were imported. Omitted relationships, prior evidence links, existing IDs and published Obsidian are preserved. Database guards reject baseline drift and refuse to reset a later published product to draft. All 55 tests, lint/typecheck and isolated PostgreSQL-compatible checks passed. On 2026-10-07 the owner supplied live rehearsal/apply success screenshots and confirmed all eight PR5.8 verification checks true. The three products remain draft and all routes remain unpublished. See TODOIST_DRAFT_IMPORT.md.

PR5.9 prepares publication review for Things, OmniFocus, 2Do and exactly one Todoist buy-once route, bounded to personal task capture/project organization. Official purchasing and workflow sources were rechecked on 2026-10-07. The complete product graph and retained historical evidence sets are guarded; lifecycle, relationship/evidence drift and unrelated approved-route exposure abort atomically. Ranking uses zero novelty boost. All 58 tests, lint/typecheck and seven isolated PostgreSQL-compatible checks passed, including ten shipped verification checks and anonymous route/RPC/engine qualification. Owner pushed f222131, explicitly approved publication, and executed rehearsal/apply on 2026-10-07. All ten live verification checks passed. On 2026-10-08 the owner confirmed all four product/route pages open; CTA/source clicks and bidirectional navigation for these new pages have not been separately confirmed. See TODOIST_PUBLICATION_REVIEW.md and TODOIST_PUBLICATION_CONTENT.md. Production now has four published products and one of ten required published routes; #5 stays open.

Owner pushed PR5.12 as ab904d3 on 2026-10-12 and supplied live rehearsal/apply success screenshots and all ten verification checks true. AFFiNE, AppFlowy and Anytype remain draft, with nine reviewed attributes and three bounded Notion anchors imported. Existing four published products and the Todoist route remain intact; anonymous drafts/private evidence remain hidden.

PR5.13 adds complete graph/evidence and baseline route membership guards for publication of these three products and one offline route. All 71 tests, lint/typecheck/build and seven isolated database scenario groups passed. Owner pushed 43f8929 on 2026-10-12, completed rehearsal, explicitly approved publication, and ran apply plus verification: all ten checks true. Incognito production screenshots confirm the route and all three product pages, comparison navigation, all three official Visit destinations, and one source-link sample per product. These samples confirm link access, not exhaustive source-content validation. Production now has seven published products and two of ten required published routes; Issue #5 stays open. See OFFLINE_PUBLICATION_REVIEW.md and OFFLINE_PUBLICATION_CONTENT.md.

## Next Work

PR5.10 adds five dated primary sources, three Anytype attribute updates and one bounded Notion alternative claim to the separate local draft graph. Offline Notion reaches three qualified draft candidates; no SQL or publication is included. Notion itself supports offline pages, so the comparison describes workflow and feature limits. All 61 tests, lint and typecheck passed. See ANYTYPE_OFFLINE_REVIEW.md.

Owner pushed PR5.10 as 0cb6c33 on 2026-10-08 after 61 tests, lint/typecheck and diff checks passed. Production deployment was green. Owner supplied local route and Anytype page screenshots with draft banners; source/CTA click acceptance is not separately recorded.

PR5.11 refreshes six AFFiNE/AppFlowy attributes and two bounded Notion alternative claims with eight primary sources, preserving historical evidence and all other products/memberships. The offline engine now requires the exact personal offline note/object scope and a description. Three local offline drafts qualify; no route/product publication or SQL. A single deterministic workflow command rebuilds from versioned research and can be safely repeated. All 65 tests, lint/typecheck, build and four local HTTP preview checks passed. See OFFLINE_WORKFLOW_REVIEW.md.

Owner pushed PR5.11 as a7d04cc on 2026-10-12 after 65 tests, lint/typecheck, build and diff checks passed. The owner supplied screenshots of the route and three native offline product pages with draft banners; production deployment was green.

PR5.12 prepares an atomic selective import of nine attributes and three bounded Notion relationships for existing draft AFFiNE/AppFlowy/Anytype. No new products, routes, publication or evidence deletion. Exact before/after guards refuse baseline drift and later published targets; four published products and the Todoist route are preserved. Evidence remains dated 2026-10-08; packet preparation is 2026-10-12. All 68 tests, lint/typecheck, build and nine isolated PostgreSQL-compatible test groups passed, including ten shipped read-only checks. Owner completed live rehearsal/apply/verification on 2026-10-12, as recorded above. See OFFLINE_DRAFT_IMPORT.md.

PR5.14 reviews GIMP, Krita and Paint.NET for desktop raster layers, painting and basic image adjustment, using twelve dated primary sources. Twelve attributes and three bounded Photoshop alternative judgments are updated in a separate local draft graph; historical evidence and other products/routes are preserved. Alternative fit is an editorial inference, not a hands-on compatibility test. Exactly three drafts qualify with zero novelty boost; none is published. All 75 tests, lint/typecheck/build and four local HTTP draft-preview checks passed. The generator reconstructs versioned research and is safe to rerun. The extra EOF blank line reported in the owner's PR5.13 staged diff is removed. No SQL or remote writes. See RASTER_WORKFLOW_REVIEW.md.

Owner pushed PR5.14 as 189bef9 on 2026-10-12 after 75 tests, lint/typecheck/build and diff checks passed. Screenshots confirm the local route and three draft product pages, comparison candidates, three official Visit destinations, and one source-link sample per product (GIMP official homepage, Krita download, Paint.NET requirements). Vercel Ready/Production and GitHub Production now were confirmed. These samples validate access, not exhaustive source content.

PR5.15 prepares a guarded selective import of three new draft products (GIMP, Krita, Paint.NET), twelve reviewed attributes and three bounded Photoshop anchors. No routes, publication, audience/problem claims or evidence deletion. Unexpected existing identities, changed scoped claims and later published targets abort atomically. Seven published products and both accepted routes are prerequisites and preserved. All 78 tests, lint/typecheck/build and seven isolated database scenario groups passed, including all ten shipped verification checks. Owner pushed ee1c621 and completed live rehearsal/apply/verification on 2026-10-12: all ten checks true. Three raster products remain draft; prior seven published products and two approved routes are intact. See RASTER_DRAFT_IMPORT.md.

PR5.16 prepares a pinned complete graph/evidence publication review for GIMP, Krita, Paint.NET and exactly one bounded Photoshop route, with zero novelty boost. 81 tests, lint/typecheck/build and seven isolated database scenario groups passed, including ten publication verification checks. Owner pushed b658009, completed live rehearsal and personally executed apply on 2026-10-12; all ten live verification checks true. No separate textual approval message is recorded. Incognito screenshots confirm route/comparison, three product pages without draft banners and three Visit official destinations; this batch does not demonstrate separate source-link clicks. Production now has ten published products and three of ten approved routes. See RASTER_PUBLICATION_REVIEW.md. Issue #5 remains open.

PR5.17 records this owner-evidence checkpoint separately from reconstructed draft-graph qualification and audits seven remaining routes. No claims, previews, SQL or publication changes. All 84 tests, lint and typecheck passed. Next review the Notion no-forced-AI route: AFFiNE/AppFlowy currently qualify, Anytype ai-optional remains unknown, and offline relationship scope cannot be silently widened or overwritten. See ESCAPE_REMAINING_REVIEW.md. Owner pushed c3389a3 after 84 tests/lint/typecheck/diff checks passed; Production green.

PR5.18 reviews six dated primary sources for installed native personal note/object organization without activating optional AI. Exactly three ai-optional attributes are refreshed in a separate draft graph; Anytype now has positive policy/setup evidence rather than an inference from missing AI mentions. All existing anchors, lifecycle, pricing/trade-off values and other routes are preserved. The no-AI route requires the accepted exact personal offline scope and description, with zero novelty boost. Three drafts qualify; publishable=false. All 87 tests, lint/typecheck/build and four local HTTP draft-page checks passed. Owner pushed 261e131 with green Production. Local route/three product pages and Visit destinations were shown; owner subsequently reports the prescribed production/source-link regression normal, without individual source-click screenshots. No SQL or live publication changes. See NOTION_AI_WORKFLOW_REVIEW.md.

PR5.19 prepares an atomic selective update of exactly three AI Optional attributes on already-published AFFiNE/AppFlowy/Anytype, adding six dated sources and six evidence pointers while retaining all historical evidence, including pointers retained by PR5.12 beyond the reconstructed fixture lists. Complete target metadata/claim/evidence guards reject baseline drift, unknown evidence identities, lifecycle changes and unexpected published route exposure. No product/taxonomy/anchor/route writes or route approval. 90 tests, lint/typecheck/build and six isolated database scenario groups passed, including all ten read-only verification checks, complete rehearsal rollback, seven drift cases, record preservation, repeat-apply stability and anonymous RPC qualification/evidence boundaries. The PR5.18 generator EOF blank line is fixed. Owner pushed 6769f2c with green Production and passed 90 tests/lint/typecheck/build/diff checks. Live rehearsal/apply succeeded; all ten verification checks true. Incognito screenshots confirm three dated verified AI Optional cards, the retained offline comparison and unavailable no-AI route. One source-link sample per product reached AppFlowy welcome docs, Anytype welcome docs and AFFiNE getting-started guide; link access is confirmed, not exhaustive content validation. Production remains ten products and three routes. See NOTION_AI_IMPORT.md.

PR5.20 prepares publication of one bounded no-required-AI Notion route using three already-published products, with exact personal note/object scope and zero novelty. Pinned complete product/claim/evidence and baseline route/member guards reject drift; missing reviewed memberships also abort on repeated apply. Zero product/claim/evidence writes. 93 tests, lint/typecheck/build and seven isolated database scenario groups passed, including all ten shipped verification checks, rollback, record preservation and anonymous route/RPC/engine checks. Owner pushed ff03b19 with green Production, completed rehearsal, explicitly approved publication and supplied approved apply success plus all ten verification checks true on 2026-10-12. Incognito screenshots confirm the public route title, bounded description and three-product AI Optional comparison. Production now has ten products and four approved routes. See NOTION_AI_PUBLICATION_REVIEW.md and NOTION_AI_PUBLICATION_CONTENT.md.

PR5.21 refreshes the owner-evidence checkpoint and remaining-route audit using the latest reviewed AI graph. Six routes remain; all currently have zero qualified curated draft candidates. No claims, ranking, preview, SQL or publication changes. Issue #5 remains open. See ESCAPE_REMAINING_REVIEW.md.

Owner pushed PR5.21 as 0ef8b2b on 2026-10-13 after 93 tests, lint/typecheck and staged diff checks passed; Production green. PR5.22 records twelve primary-source observations and proposes a bounded basic personal note workflow while preserving the existing taxonomy meanings. Joplin/Obsidian have documentary support proposals; Logseq remains held for edition and strict note-focus review. No claims, preview, engine, SQL or publication changes; qualification remains zero and production remains ten products/four routes. See SIMPLE_NOTION_REVIEW.md.

Owner pushed PR5.22 as 3516e52 after staged diff checks passed on 2026-10-13. PR5.23 selects Joplin, Obsidian and new draft Simplenote for basic personal note capture/editing/organization; Logseq stays unchanged outside this route's draft membership. Eleven primary sources, seventeen attribute updates and three bounded relationships produce three qualified local drafts with zero novelty. Exact scope/description is required by the engine. All historical evidence, unrelated graph and lifecycle states remain intact. 97 tests, lint/typecheck/build and four local HTTP draft-page checks pass. Browser acceptance is pending; no SQL or remote publication. Production remains ten products/four routes. See SIMPLE_NOTION_WORKFLOW_REVIEW.md.

Owner accepted PR5.23 local browser checks on 2026-10-13: route comparison, three product pages, official Visit destinations and one source link per product. Staged six-file diff passed; owner pushed 89f10f8. No deployment acceptance was supplied. PR5.24 prepares an atomic selective import: one new draft Simplenote identity, seventeen attribute claims and three basic-note Notion anchors. Existing Obsidian stays published; Joplin stays draft. No route, membership, taxonomy or existing product metadata writes; evidence pointers are additive. 101 tests, lint/typecheck/build pass. Local PGlite PostgreSQL execution confirms full rehearsal rollback, preservation of unrelated rows and historical evidence, repeat-apply UUID/timestamp stability, atomic rejection of claim/scope/publication/evidence drift and all ten read-only verification checks. These are local fixture checks; owner Supabase rehearsal/apply/verification is pending. Production remains ten products/four routes. See SIMPLE_NOTION_IMPORT_REVIEW.md.

Owner pushed PR5.24 as 0716823 on 2026-10-13: 101 tests, lint/typecheck/build and staged seven-file diff passed; Production green. Supabase rehearsal and apply succeeded; ten verification checks were true. Production Obsidian retained publication and displayed the exact dated basic-note Notion scope with historical and new source pointers; a historical source opened successfully. PR5.24 is accepted. PR5.25 prepares publication of Joplin and Simplenote plus the three-member Simple Notion route (Joplin, Obsidian, Simplenote), replacing Logseq only in this route's membership. Complete imported claims/evidence, lifecycle and original route/member guards prevent drift. Six local PostgreSQL checks confirm atomic rollback, limited mutation/preservation, repeat stability, drift rejection and ten verification checks true after simulated publication. 105 tests, lint/typecheck/build pass. Owner rehearsal and explicit approval of this publication remain pending; no remote writes performed. Production remains ten products/four routes, prospectively twelve/five only after approved apply. See SIMPLE_NOTION_PUBLICATION_REVIEW.md and SIMPLE_NOTION_PUBLICATION_CONTENT.md.

PR5.25 accepted on 2026-10-13. Owner approved publication, then diagnosed the initial rehearsal mismatch: production held the October 6 rubric draft with zero members, unlike the seed fixture. Corrected rehearsal/apply succeeded; ten verification checks were true. Production screenshots confirm the route, Joplin/Obsidian/Simplenote order, all three product pages, official Visit destinations and source-link samples. Production now has twelve published products/five approved routes. Correction commit is not supplied. PR5.26 updates the owner-evidence checkpoint and audits the latest reviewed basic-note graph: five routes remain, all with zero qualified curated candidates. No new claims, database writes or publication. Issue #5 remains open.

Owner pushed PR5.26 as 6dcd2b4 with 105 tests, lint/typecheck and staged checks passed; Production green. Owner also committed/pushed the five PR5.25 checkpoint correction files as 4242515; working tree clean and Production green. PR5.27 reviews thirteen primary-source observations for Windows PDF page organization. PDF24 text conversion/overlay limits, PDF-XChange edition/maintenance/installer limits and PDFgear current-free/AI processing limits remain explicit. All proposed claims are pending and unapplied; qualification remains PDF 0/3 and production remains twelve products/five routes. No SQL or publication. See PDF_NO_SUBSCRIPTION_REVIEW.md.

## Completed Issues

- [x] #4 Product Discovery Pages — owner closed; production accepted

- [x] #1 Foundation & Core Infrastructure

- [x] #2 Discovery Graph Data Model
- [x] #3 Seed Data & Evidence Pipeline — draft dataset accepted; GitHub closed

## Open Roadmap

- [x] #1 Foundation & Core Infrastructure
- [x] #2 Discovery Graph Data Model
- [x] #3 Seed Data & Evidence Pipeline — draft dataset accepted; GitHub closed
- [x] #4 Product Discovery Pages
- [ ] #5 Escape Route Engine
- [ ] #6 Homepage & Discovery Navigation
- [ ] #7 Natural-Language Discovery
- [ ] #8 Discovery Analytics
- [ ] #9 SEO & GEO Infrastructure
- [ ] #10 Evidence & Quality Audit
- [ ] #11 Production Validation Launch

## Foundation State

- **Application:** Next.js 16.3.8 / React 19.3.0 / TypeScript
- **Runtime:** Node.js 24
- **Database:** shared Supabase project with isolated `software_discovery` schema
- **Supabase clients:** browser and server clients scoped to `software_discovery`
- **CI:** GitHub Actions runs install, lint, typecheck, and production build
- **Deployment:** Vercel production deployment passing
- **Production health:** configuration valid; initial graph imports and counts verified by the operator
- **Environment:** Supabase public URL and publishable key configured in Vercel Production and Preview
- **Security audit:** five high-severity findings currently originate from the ESLint development-tooling transitive dependency chain (`eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch`). No forced breaking remediation was applied; revisit when a non-breaking upstream remediation is available.

## Product Thesis

> **Find software the algorithms missed.**

## Validation Wedge

**Escape Routes from Big Software**

```text
Big Software
     |
     v
Dissatisfaction
     |
     v
Constraint
     |
     v
Escape Route
     |
     v
Lesser-known Software
```

## Initial Scope

- 5 anchor ecosystems
- 30–40 verified products
- evidence-backed core attributes
- 10 launch Escape Routes
- natural-language discovery
- discovery analytics
- SEO/GEO foundation
- 30-day production validation

## Validation Status

**Not started**

**Validation Start Date:** N/A

Issue #11 marks Day 0 of the validation window. Foundation deployment does not start validation.

## Growth Diagnostic Status

**Deferred / Gate not reached**

Growth Diagnostic Engine is not part of the Validation MVP.

Evaluation gate:

> At least 10 products must have sufficient product-level impressions and comparative CTR/intent data to support meaningful creator insights.

PR5.27 was pushed by the owner as 8854c88 with a clean working tree and green Production. PR5.28 adds an edition-specific documentary operation matrix and a read-only checker. No draft qualification, graph, SQL or publication changes; twelve accepted products/five routes remain. See PDF_PAGE_OPERATIONS_REVIEW.md.

PR5.28 owner commit 66a276a was pushed with clean working tree and green Production. PR5.29 pins nine documentary attributes and three Windows page-organization relationships in separate draft fixtures; PDF qualification is 3/3, publication remains unapproved. 109 tests, lint/typecheck/build passed locally. No native or browser test performed. See PDF_WORKFLOW_REVIEW.md.

PR5.29 owner commit 4b5f9bd accepted with local route/product/Visit checks, 109 tests and lint/typecheck/build. Owner restored next-env.d.ts and confirmed clean working tree. PR5.30 supplies a SELECT-only production baseline snapshot before selective PDF draft import; no database writes or publication. See PDF_IMPORT_PREFLIGHT_REVIEW.md.

PR5.30 owner commit 9ba9773 accepted with clean working tree and green Production. Owner supplied the complete production snapshot captured 2026-10-13T06:50:34.127211+00:00: three draft PDF products, 21 attributes, three likely unscoped Adobe alternatives, no PDF route or memberships, and twelve published products/five approved published routes. PR5.31 pins this snapshot for a guarded selective import of nine attributes, three scoped anchors and one unapproved draft route with three members. 113 tests, lint/typecheck passed. Isolated PostgreSQL rehearsal rollback, claim-drift refusal, draft application, repeat refusal and historical evidence retention passed; nine target verification checks passed (prior offline relationships were not loaded in that isolated fixture). Owner executed rehearsal, confirmed unchanged complete baseline, applied drafts and returned all ten live verification checks true. See PDF_DRAFT_IMPORT_REVIEW.md.

PR5.31 owner commit 7f6f158 pushed with clean working tree and green Production. PDF draft import accepted: three draft products, nine reviewed claims, three scoped Adobe alternatives and one unapproved draft route with three members; public remains twelve products/five routes. PR5.32 adds a SELECT-only post-import snapshot for exact publication guards; no new writes or approval. Publication preparation must use this fresh database checkpoint rather than the pre-import PR5.30 snapshot. See PDF_PUBLICATION_PREFLIGHT_REVIEW.md.

Owner supplied the complete PR5.32 post-import snapshot captured 2026-10-13T08:44:19.631898+00:00. Three target products remain draft; nine reviewed attributes and three scoped alternatives are verified; the draft unapproved PDF route has exactly three members and no other target route exposures. Public lists remain 12/5 and anonymous evidence boundary is true. PR5.32 commit/push has not yet been reported. PR5.33 pins this checkpoint and prepares publication rehearsal/apply-after-approval/verification. 117 tests and lint/typecheck passed. Isolated PostgreSQL tested rollback, scope/source/member/identity/route/publication drift refusal, repeat refusal, unchanged evidence/relationships/members and all eleven post-publication checks. Owner approval is pending; no remote publication and no change to the accepted publication checkpoint. See PDF_PUBLICATION_REVIEW.md.

Owner explicitly approved PR5.33 publication, executed approved APPLY, and returned all eleven live checks true. Owner Chrome incognito screenshots accepted the public PDF route, three member product pages without draft banners, Windows scope/pricing/trade-offs and official Visit/pricing-source destinations. Published checkpoint is now fifteen products/six of ten routes; four routes remain. PR5.32/PR5.33 commit/push and corresponding deployment have not yet been reported. PR5.34 records acceptance and updates the local audit checkpoint only; no SQL writes, re-import or new approval. Issue #5 remains open; Issue #11 Day 0 has not started. See PDF_PUBLICATION_ACCEPTANCE.md.

## Current Blockers

None.

## Resume Instructions

When resuming development:

1. Read `STATUS.md`.
2. Read `PRODUCT_SPEC.md`.
3. Read `ARCHITECTURE.md`.
4. Read `ARCHITECTURE_GUARDRAILS.md`.
5. Confirm the active GitHub Issue.
6. Inspect current code before changing architecture.
7. Keep implementation scoped to the active Issue.
8. Update this file when an Issue closes or validation state changes.


## PR5.35 — Productivity task-planning research

Owner reports all prior packets pushed; PR5.34 acceptance/checkpoint commit d158bd4 is on main, with clean git status and green Production deployment (53). PR5.35 prepares a read-only official-source review of Things, OmniFocus and 2Do under a proposed personal task-planning scope. Current 2Do license/upgrade terms remain pending; audience fit remains an editorial judgment. No SQL, graph/gate changes or publication. Accepted checkpoint stays 15 products, six routes and four remaining. See PRODUCTIVITY_WORKFLOW_REVIEW.md.


## PR5.36 — Bounded personal task planning drafts

Owner pushed PR5.35 as 279b649; clean git status and green Production (54) confirmed. PR5.36 confirms direct-store 2Do Mac perpetual licensing with 18 months of updates and optional renewal, separately from Mac App Store/Setapp subscriptions. A sourced exact task-workflow attribute replaces the editorial-audience qualification gate for the productivity route. Three separate local draft candidates qualify; audience judgments and other routes remain unchanged. Twelve attribute updates, one draft taxonomy definition; no new products, SQL or publication. 121 tests, lint/typecheck/build and four local HTTP content checks passed. Production remains 15 products, six published routes, four remaining. See PRODUCTIVITY_TASK_WORKFLOW_REVIEW.md.


## PR5.37 — Task workflow import preflight

Owner pushed PR5.36 as e05972b; green Production (55) and four local draft pages confirmed. After restoring generated next-env.d.ts, git status was clean. PR5.37 prepares a single-statement SELECT snapshot of the three existing published task products, complete claims/provenance/taxonomy, route memberships and publication checkpoint. No writes or new publication. Await the full live snapshot before selective import design. See PRODUCTIVITY_IMPORT_PREFLIGHT_REVIEW.md.


## PR5.38 — Selective task workflow import prepared

Owner pushed PR5.37 as b15be86; clean git status and green Production (56). Full live snapshot captured 2026-10-14 confirms three published task products, 15/6 public checkpoint, absent productivity route and retained Todoist memberships. PR5.38 prepares pinned, guarded rehearsal/apply SQL for 12 task workflow/purchase/price/trade-off attributes, one new workflow taxonomy and one unapproved draft route. Product lifecycle, historical provenance and unrelated claims/memberships are preserved. 124 tests, lint/typecheck and isolated database rollback/drift/apply/repeat checks passed; 23 verification checks true locally. No remote execution or route publication. See PRODUCTIVITY_TASK_IMPORT_REVIEW.md.


## PR5.39 — Productivity publication preflight

Owner pushed PR5.38 as 100e7c2 with clean git status, then supplied live rehearsal/apply success and all 23 checks true. The three task products remain published; productivity route is draft/unapproved with three members. Public checkpoint stays 15 products/six routes. PR5.39 prepares a post-import SELECT-only snapshot for a later guarded route-only publication proposal. Await complete JSON; no publication approval or remote write. See PRODUCTIVITY_PUBLICATION_PREFLIGHT_REVIEW.md.


## PR5.40 — Productivity route publication proposal

Owner pushed PR5.39 as 9b2b93e; clean git status and green Production (58). Complete PR5.39 snapshot confirms three published products and one draft/unapproved productivity route with three members, 24 attributes, 58 fragments and 23 sources. PR5.40 prepares route-only publication with full stored-state guards and explicit approval pending. Products/claims/evidence/memberships remain unchanged. 128 tests, lint/typecheck and isolated database rollback/drift/apply/repeat scenarios passed; all20 checks true locally. Public checkpoint stays15/6 until owner-approved live apply; proposed result15/7. See PRODUCTIVITY_PUBLICATION_REVIEW.md.


## PR5.41 — Task publication accepted

Owner pushed PR5.40 as 403381e with clean git status, explicitly approved publication and supplied live rehearsal/apply success plus all 20 checks true. Production Chrome incognito route/product pages and all three Visit/source-link samples accepted. Checkpoint now15 products/seven approved routes, three remaining. Current audit uses the task workflow graph and a dated 2026-10-14 checkpoint; PR5.35 historical research checker keeps its original baseline. No SQL/writes. Issue #5 stays open. See PRODUCTIVITY_PUBLICATION_ACCEPTANCE.md.
