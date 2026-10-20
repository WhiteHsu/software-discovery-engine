# Project Status

**Last Updated:** 2026-10-19

## Current Phase

**Phase 6 — Validation MVP Build**

## Current Work

**Issue #5 — Escape Route Engine: all 10 launch routes published and owner-accepted; GitHub issue closure not recorded.**

Current accepted checkpoint: **24 published products / 10 routes / 0 remaining routes**. PR5.104 publication22/22 and production UI/link acceptance completed. The 30-day experiment has not started; see POST_ESCAPE_VALIDATION_READINESS.md. Historical entries below describe their original stages.

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


## PR5.42 — Grammarly workflow research

Owner pushed PR5.41 as e12b08b with clean git status and green Production (60). PR5.42 records nine primary sources across four edition reviews for the two remaining Grammarly routes. Proposed English prose style scope remains unapproved; Hemingway continued-use terms, Antidote first-time purchase eligibility and edition-specific privacy criteria need further review. No claims, engine changes, SQL or publication. Public checkpoint remains 15 products/seven routes/three remaining. See GRAMMARLY_WORKFLOW_REVIEW.md.


## PR5.43 — Writing edition eligibility decisions

Owner pushed PR5.42 as f2271d4; clean git status and green Production61. PR5.43 distinguishes Antidote individual new subscriptions, conditional perpetual upgrades and organizational perpetual licenses. Hemingway indexed legacy FAQ supports historical one-time purchasing, but current direct terms remain pending; Editor Plus subscriptions excluded. Proposes LanguageTool Basic as a research replacement for the default first-time individual no-subscription shortlist. Privacy criteria separated by processing, retention/training, optional cloud and diagnostics. No claims/engine/membership changes, SQL or publication; checkpoint15/7. See GRAMMARLY_EDITION_DECISIONS.md.

## PR5.44 — Restricted English prose style review

Owner pushed PR5.43 plus checkpoint correction as 863b1d8; actual HEAD and clean status inspected on 2026-10-14. Owner reports green Production #62. PR5.44 selects Hemingway Classic, LanguageTool Basic and ProWritingAid Premium lifetime for a research-only short English prose review. Documents style operation overlap, exact-tier uncertainty, conflicting LanguageTool 2,000/10,000-character copy, and online lifetime/service/add-on restrictions. Current Hemingway paid terms and Basic rule entitlements remain gates. The manual workflow validation plan is prepared, not executed. No claims, engine, memberships, taxonomy, SQL or publication changes; zero newly qualified Grammarly candidates. Checkpoint remains 15 products/7 routes/3 remaining; Issue #5 stays open. See GRAMMARLY_STYLE_REVIEW.md.


## PR5.45 — LanguageTool Basic tier evidence

Owner pushed PR5.44 as 996951e; clean HEAD inspected, green Production #63 shown in owner screenshot. Two current official English comparison tables were parsed from source HTML and cross-checked against table-cell markers. The selected Wordiness row is Premium-only, so the proposed three-edition shared-wordiness review is held; Basic still documents other style checking. Official 2,000/10,000-character copy conflict and current Hemingway Classic paid terms remain unresolved. PR5.44 and all prior baseline evidence are preserved. No claims, engine, memberships, taxonomy, SQL or publication changes; zero new qualified Grammarly candidates. Checkpoint remains 15 products/7 routes/3 remaining, Issue #5 open. See GRAMMARLY_BASIC_TIER_REVIEW.md.


## PR5.46 — Anonymous style workflow validation

Owner pushed PR5.45 as f0105e0; actual clean HEAD inspected, owner screenshot shows green Production #64. Anonymous LanguageTool English (US) homepage checks with Picky Mode recorded Premium-locked wordiness feedback, no suggestions for the selected passive/complex samples and a usable grammar positive control. These are sample/surface-specific results, not universal Basic capability claims. Current three-edition style proposal cannot advance; no memberships changed. Direct Hemingway store terms HTTP 200 contains an empty policy body, so current paid rights remain unresolved. Six screenshot artifacts supplied outside repository payload. No claims, engine, taxonomy, SQL, checkpoint or publication changes; zero newly qualified candidates, 15 products/7 routes/3 remaining, Issue #5 open. See GRAMMARLY_WORKFLOW_VALIDATION.md.


## PR5.47 — Replacement edition research

Owner pushed PR5.46 as c711bcf; actual clean HEAD inspected, owner screenshot shows green Production #65. Grazie Free browser extension is a new documentary research lead with English passive/readability settings, free-plan/account/browser/region/usage restrictions separated. Hemingway anonymous free web edition explicitly differs from Classic: short prose flags observed and cleared after manual revision without Plus trial enrollment. Proposed research combination is free Hemingway web, Grazie Free extension and PWA Premium lifetime; no identity, claims, engine, memberships, taxonomy, SQL or publication changes. Grazie/PWA entitled-session tests and full common-operation/anchor evidence remain gates. Current Classic paid terms remain unresolved. Two unavailable leads not treated as product rejections. Checkpoint 15 products/7 routes/3 remaining, zero newly qualified Grammarly candidates, Issue #5 open. See GRAMMARLY_REPLACEMENT_RESEARCH.md.


## PR5.48 — Common-operation validation protocol prepared

Owner pushed PR5.47 as 5d46713; actual clean HEAD inspected, owner screenshot shows green Production #66. Five fixed short original cases and exact-edition/anchor result records prepared. Owner confirms no PWA Premium lifetime, selects Grammarly Free and Chrome for Grazie. PWA lifetime is documentation-only; three runnable session targets remain, with no paid purchase or silent tier substitution. Grammarly Free wordiness marketing is separated from Pro full-sentence rewrites and exploratory passive/complex checks. Grazie browser Free numerical cap/zero-metering remains unresolved; IDE evidence not transferred. No new product execution/results, claims, engine, memberships, taxonomy, SQL or publication. Prior research/checkpoint intact: 15 products/7 routes/3 remaining, zero new qualified candidates, Issue #5 open. See GRAMMARLY_VALIDATION_PROTOCOL.md.


## PR5.49 — Hemingway common corpus observed

Owner pushed PR5.48 as a8c8ad0; clean actual HEAD inspected, owner screenshot shows green Production #67. All five committed short cases executed in anonymous Hemingway free web Edit mode with exact manual reference rechecks; ten screenshot artifacts recorded. Passive, wordiness and complexity samples had flags that cleared after manual revision; redundancy/control had no related feedback. Observations are sample-specific, not five passed features or common candidate qualification. Ten Grazie/Grammarly Free cases remain not-run: no connected Chrome/extension and no logged-in Grammarly session accessible; login handoff prepared. PWA lifetime remains not-entitled. No claims, engine, memberships, taxonomy, SQL or publication changes; checkpoint 15/7/3, zero newly qualified candidates, Issue #5 open. See HEMINGWAY_CORPUS_RESULTS.md.


## PR5.50 — Owner Grazie and Grammarly corpus observations

Owner pushed PR5.49 as a50ec99; actual clean HEAD inspected, owner screenshot shows green Production #68. Ten owner-run Chrome cases now observed: Grazie Free 1.15.1 in Gmail flags passive/wordiness/redundancy and no-notes after manual reference revision; complexity/control no-notes. Grammarly Free session shows Pro free samples, then daily exhausted masked suggestions; not stable Free entitlement. Historical Hemingway retained; 15/15 runnable cases observed is not candidate qualification. Initial Grazie loading later recovered in Gmail, cause unknown; quota/privacy restrictions unresolved. PWA lifetime remains not-entitled. No public claims, engine, graph, memberships, taxonomy, SQL or publication changes. Checkpoint 15/7/3, zero new qualified candidates, Issue #5 baseline open. See WRITING_OWNER_CORPUS_RESULTS.md.


## PR5.51 — Restricted writing workflow review held

Owner pushed PR5.50 as 797d985; actual clean HEAD inspected, owner screenshot shows green Production #69. Existing 15/15 runnable observations reviewed, not replayed or treated as passed features. Closest passive/local-wordiness overlap in Hemingway/Grazie cannot approve a common alternative relationship: selected Grammarly Free feedback is Pro sample/locked and PWA lifetime execution remains unavailable. Engine dated relationship/constraint/pricing/trade-off/confidence gates and three-product publication threshold retained. No-subscription and privacy qualifications not inferred from free access, lifetime labels or UI feedback. No claims, engine, graph, identities, memberships, taxonomy, SQL or publication changes. Checkpoint 15/7/3, zero newly qualified candidates, Issue #5 baseline open. See RESTRICTED_WRITING_WORKFLOW_REVIEW.md.


## PR5.52 — Free anchor entitlement supplement

Owner pushed PR5.51 as 9b3e756; clean actual HEAD inspected, owner screenshot shows green Production #70. Current official pages retain a Free conciseness category while advanced/full-sentence suggestions remain separately described. One owner-run Coda Docs filler probe (Needless to say) returned no suggestions; no exact ordinary Free style rule established or universal lack inferred. Original 15/15 observations preserved, plus one separately counted probe; Pro daily preview exhaustion cause/cap not inferred. PR5.51 qualification/publication hold retained, PWA lifetime not-entitled. No claims, engine, graph, identities, memberships, taxonomy, SQL or publishing changes. Checkpoint 15/7/3, zero new qualified candidates, Issue #5 baseline open. See GRAMMARLY_FREE_ANCHOR_SUPPLEMENT.md.


## PR5.53 — Meditation workflow documentary review

Owner pushed PR5.52 repair as 4223977; actual clean HEAD inspected, owner screenshot shows green Production #71. Owner selects other unfinished routes. Medito, Smiling Mind and Healthy Minds public free editions reviewed for adult guided-session selection/playback with account, platform, content-license and source-age limits. Calm own free content retained; Healthy Minds free Public Subscription not mistaken for mandatory recurring payment. OS-source discrepancy preserved. No installed app execution or clinical efficacy claims; concrete access/playback verification plan prepared. Existing three curated meditation candidates remain zero qualified; no graph, claims, engine, identities, memberships, taxonomy, SQL or publishing changes. Grammarly research preserved. Checkpoint15/7/3, Issue #5 baseline open. See MEDITATION_WORKFLOW_REVIEW.md.


## PR5.54 — Owner Android meditation playback evidence

Clean HEAD 2681754 inspected. Owner Android samples cover Medito, Healthy Minds Program, Smiling Mind and Calm guided playback with pause/resume. Three candidate flows showed no payment requirement; Calm Google login enabled sampled playback with explicit 3-free-listens limit and no confirmed trial/subscription. Smiling Mind web result remains supplemental. App/OS versions, storefront and audio language unknown. Single sessions only; no clinical, offline, privacy or ongoing-free-Calm claims. Four research/status/checker payloads; no graph/import/publication changes. Zero newly qualified; checkpoint15/7/3. See MEDITATION_OWNER_RESULTS.md.


## PR5.55 — Scoped meditation claim drafts

Owner pushed PR5.54 as f98de5b; clean actual HEAD inspected. Owner screenshot shows green Production #73, not independently live queried. Three exact-edition relationship/no-subscription/pricing/trade-off draft proposals combine preserved PR5.53 official sources and PR5.54 Android observations. Calm three-free-listens limit and unknown environment versions retained. Confidence0.85 proposed only. Existing meditation route lacks relationshipScope; scope representation/enforcement review required before draft qualification. Four research/status/checker files; no graph, engine, taxonomy, SQL, membership/import/publication edits. Zero newly qualified; checkpoint15/7/3. See MEDITATION_CLAIM_DRAFTS.md.


## PR5.56 — Bounded meditation draft qualification

Clean actual HEAD40eb5ca inspected; owner screenshot green Production #74. Exact adult guided selection/playback scope and nonempty description enforced for Calm alternative relationships. Separate cloned draft builder applies 9 attribute/3 anchor updates to Medito, Smiling Mind and Healthy Minds public editions; 3 drafts qualify at0.85, zero published/publishable. Memberships, identities, taxonomy, source research and accepted checkpoint unchanged. Calm three-free-listens and unknown environment limits retained. Historical input checks allow only exact reviewed engine transition; evidence remains pinned. 25 focused tests, five historical checks and strict scoped TypeScript check pass. No SQL/database/import/publication writes; accepted15/7/3. See MEDITATION_WORKFLOW_DRAFTS.md.


## PR5.57 — Meditation selective import preflight

Owner pushed PR5.56 as453ad34; clean actual HEAD inspected, owner screenshot green Production #75. Single-statement SELECT preflight captures three meditation identities/lifecycles, all claims/evidence/taxonomy, target/all related memberships, scope storage, provenance collisions and published slug sets/private boundary. No live database query executed by agent; production state unknown until owner returns full snapshot. Local draft qualification3, published0; accepted checkpoint15/7/3. No apply SQL, importer, graph, engine, publication or lifecycle changes. See MEDITATION_IMPORT_PREFLIGHT_REVIEW.md.


## PR5.58 — Guarded meditation draft import

Clean actual HEADff5adde inspected; owner screenshot green Production #76. Full PR5.57 snapshot captured2026-10-15T02:16:36Z parsed from Markdown-escaped JSON and pinned: three draft identities, route absent, no target memberships, checkpoint15/7, scope storage/private boundary intact. Guarded rehearsal/apply/SELECT verification prepared for nine attributes/three scoped anchors, additive14 sources/64 fragments, one unapproved draft route with3 members. Product lifecycle/identity/taxonomy/unrelated graph and old evidence preserved; no publication or agent remote writes.29 focused tests/11 local database scenarios pass, including28 verification booleans across3 timezones. Await owner SQL execution/results. Accepted checkpoint15/7/3. See MEDITATION_DRAFT_IMPORT_REVIEW.md.


## PR5.59 — Meditation publication preflight

Clean actual HEADe005003 inspected; owner screenshots Production #77 green,29 Node tests pass, rehearsal/apply success, returned28/28 verificationtrue. Imported meditation products/route remain draft/unapproved; owner acceptance receipt recorded. New single-statement SELECT publication preflight captures full post-import target graph/memberships/provenance/taxonomy, published sets, scope storage, public RPC projections and relevant RLS/policies/private boundary. Agent has not queried production. No publication approval, new apply SQL or lifecycle/checkpoint changes. Accepted15/7/3; potential18/8/2 requires later concrete proposal/owner approval/validation. See MEDITATION_PUBLICATION_PREFLIGHT_REVIEW.md.


## PR5.60 — Meditation publication proposal, approval pending

Clean actual HEADf5efa00 inspected; owner screenshot Production #78 green. Owner-returned PR5.59 snapshot captured2026-10-15T02:50:41Z pinned and checked against prior import. Three actual stored scoped candidates qualify at0.85. Atomic rehearsal/approval-gated apply/21-check SELECT proposal changes only3 existing product statuses and one existing route status/approval. No claims, evidence, descriptions, memberships, identities, taxonomy, policy or engine changes.33 focused tests/9 local database scenarios pass including actual anon engine/RLS/private-boundary checks. No owner publication approval or remote apply yet. Current accepted15/7/3; proposed18/8/2 only after approval/apply/verification. See MEDITATION_PUBLICATION_REVIEW.md.


## PR5.61 — Meditation publication accepted; current checkpoint18/8/2

Actual clean HEAD935dd8c inspected. Owner explicitly approved public release and returned PR5.60 apply success/all21 verificationtrue. Public comparison,3 product pages and3 official Visit destination screenshots supplied. New immutable dated checkpoint accepts18 products/8 routes/2 remaining, while old15/7/3 checkpoint stays unchanged. CLI/currentPublicationAudit use meditation-stage reconstruction and pinned new checkpoint; historicalRouteAudit plus legacy currentRouteAudit preserve older review scripts. No graph/engine/SQL/import/publication changes in this packet. Both Grammarly routes stay zero-qualified; next no-subscription gap triage documents two independent gates: ordinary Free anchor operation and a third accessible exact edition. No fresh sources or product tests in this packet. See MEDITATION_PUBLICATION_ACCEPTANCE.md and GRAMMARLY_NEXT_GAP_REVIEW.md.


## PR5.62 — Writing gap recheck

Clean actual HEADc8f66a5 inspected. New official Free/Docs/Paraphraser/dedicated passive-page review keeps exact ordinary-Free anchor entitlement unresolved. Anonymous IAB public checker accepted text but no readable passive feedback; independent spelling control did not establish liveness (disabled1 indicator). Slick Write indexed lead blocked by local certificate error; no bypass. New Real Write dedicated passive detector highlights2 constructions and clears on existing manual active revision, but200%/Mostly Active metric inconsistency retained. One pair only; original15/15 unchanged. No graph/engine/SQL/publication changes, zero new qualified; checkpoint18/8/2. Targeted owner Chrome public-page check prepared instead of full corpus repetition. See WRITING_GAP_RECHECK.md.


## PR5.63 — Owner Chrome checker follow-up

Owner public-page spelling control returned readable sentnce-to-sentence feedback despite introductory right panel; prior passive input had no visible readable suggestion. Header is authenticated-looking, exact tier/provider not isolated. Separate Editor shows readable passive rewrite explicitly labeled Pro suggestion with 3 free samples left today; no ordinary-Free entitlement, reset or accepted edit inferred. Close owner probe; preserve prior research/corpus and hold both writing routes at zero qualified. Real Write remains research-only. No graph/engine/SQL/publication changes; accepted18/8/2. See WRITING_OWNER_CHECKER_FOLLOWUP.md.


## PR5.64 — Owner-selected passive review scope

Owner approved investigating Grammarly Pro capability as baseline for passive feedback/manual revision/recheck against no-subscription editions. Official documentation rechecked; prior sample access stays limited, Free history frozen. Hemingway free web/Grazie Free evidence reusable; Real Write remains research-only with metric/terms limitations. Exact identity mapping, scoped claim drafts and later no-subscription scope enforcement required; privacy unchanged. No graph/engine/SQL/publication edits, zero newly qualified;18/8/2. See WRITING_PASSIVE_SCOPE_REVIEW.md.


## PR5.65 — Writing exact-edition claim drafts

Reconstructed local baseline confirms existing Hemingway identity is paid Classic; preserve it and propose separate free-web identity plus Grazie Free and Real Write dedicated detector. Twelve structured unknown-status/null-confidence claims and route copy prepared, not an importable bundle. Fresh Real Write pricing text includes daily credits across all21 tools; detector exemption unresolved despite prior unchanged counter. Terms unreadable. Scope enforcement and live identity collision check required later. No graph/engine/SQL/publication changes, zero newly qualified;18/8/2. See WRITING_PASSIVE_CLAIM_DRAFTS.md.


## PR5.66 — Rendered detector access reviewed

Rendered Real Write detector FAQ explicitly gives signup-free/no-daily-cap access; rendered pricing separates local analysis from AI credits. Prior extracted all-tools wording preserved with method/date limits. Terms now readable, feature/limit-change rights retained; mobile/web billing differences not transferred. Three separate edition proposals/twelve claims editorially reviewed with evidence references, still unknown graph status/null confidence. Scope enforcement and isolated bundle next; no repeated input, purchase or SQL. Public18/8/2 unchanged; zero newly qualified. See WRITING_PASSIVE_ACCESS_REVIEW.md.


## PR5.67 — Scoped writing drafts implemented

No-subscription writing now requires exact passive-review scope and meaningful edition description. Separate local builder adds three new draft editions, nine attribute claims, three scoped anchors and three memberships;35 baseline products/Classic/taxonomy/old memberships preserved. Three local drafts qualify; zero published. Historical engine compatibility explicitly pins three versions; frozen JSON unchanged. Current accepted audit remains18/8/2. Read-only PR5.67_PREFLIGHT.sql captures live identity/source collisions and writing route baseline before any import proposal. See WRITING_PASSIVE_WORKFLOW_REVIEW.md.


## PR5.68 — Guarded writing draft import

Actual clean HEAD7dfe4de inspected. Returned PR5.67 snapshot at2026-10-15T06:50:49.805493+00:00 pins only retained draft Classic, no new edition collisions or writing routes, public18/8 and private boundary intact. Selective atomic proposal adds3 draft products,9 attributes,3 scoped anchors,18 sources/104 fragments and1 unapproved route with3 members; no taxonomy/Classic/privacy/publication writes. Rehearsal/apply/29-row verify generated with identity/provenance/baseline/public-set/privilege guards and repeat rejection.25 focused tests and14 database runtime checks pass. See WRITING_DRAFT_IMPORT_REVIEW.md.


## PR5.69 — Writing draft import accepted; publication preflight

Owner PR5.68 verification29/29 true recorded with rehearsal/apply screenshots. Clean actual HEAD51b0732 inspected; owner Production87 screenshot green. Three imported editions and route remain draft/unapproved, Classic and private evidence preserved, public18/8/2. SELECT-only PR5.69_PREFLIGHT.sql adds actual stored claims/IDs/provenance plus RPC/RLS/policy metadata for publication review. No graph, claim, engine or publication writes; do not replay draft apply. See WRITING_PUBLICATION_PREFLIGHT_REVIEW.md.


## PR5.70 — Writing publication proposal, owner approval pending

Clean actual HEAD0e167d8 inspected. Actual PR5.69 stored snapshot matches all reviewed draft import rows; real engine qualifies the three scoped new editions. Concrete proposal updates only three product statuses and one route status/approval, retaining Classic, claims/evidence/memberships/policies and privacy hold. Public18/8/2 would become21/9/1 only after explicit owner writing-publication approval and apply.19 focused tests,9 database runtime groups and21 verification checks pass locally; no production execution. See WRITING_PUBLICATION_REVIEW.md.


## PR5.71 — Writing publication accepted

Owner explicit writing-publication approval, successful apply,21/21 true SQL checks and eight incognito route/product/official-link screenshots recorded. Latest accepted21 products/9 completed routes/1 remaining. CLI/latestPublicationAudit uses reviewed writing-stage reconstruction and immutable new checkpoint; historical meditation18/8/2 and productivity15/7/3 entry points retained. Classic excluded; privacy remains zero-qualified/unapproved. No new SQL/graph/publication changes. See WRITING_PUBLICATION_ACCEPTANCE.md.


## PR5.72 — Privacy writing evidence review

Clean actual HEADfb919be and owner Production90 acceptance recorded. Three original privacy candidates reviewed by exact edition across six proposed evidence axes; separate local-LanguageTool and free-web-Hemingway leads retained without graph promotion. Thirteen official sources distinguish installed/cloud operations, retention, training and rights. Classic is excluded from the current web privacy policy; installed Antidote subscription Correction is a separate research path from conditional perpetual upgrades. Zero new qualified candidates; accepted21/9/1 unchanged. No SQL, engine, graph, installation or publication changes. See PRIVACY_WRITING_REVIEW.md.


## PR5.73 — Privacy writing control boundaries

Clean actual HEAD8841aa9 inspected; owner Production91 green. Antidote12 official docs confirm passive-voice review and automatic Reformulation triggers within Correction, requiring exact control verification rather than mode-name inference. Hemingway synthetic UI run retained text after reload; manual active revision cleared weakeners, and editor was cleared/reloaded before closing. No network payload or storage inspection available; no privacy qualification inferred. Five official documents and bounded observations recorded with next network-evidence procedure. Accepted21/9/1, zero privacy-qualified candidates unchanged. No native install, SQL, graph or engine changes. See PRIVACY_WRITING_CONTROLS.md.


## PR5.74 — Anonymous Hemingway network receipt

Clean actual HEAD1ec712c inspected; owner Production92 green. Three returned analytics bodies decoded without submitted prose; selected engagement screenshot fields also show no test text. Anonymous free events include device-associated analytics identifiers. Partial capture, unknown consent state and uninspected requests prevent any no-transmission or privacy qualification claim. Sanitized receipt omits raw payloads, identifiers and tokens. Owner per-request capture round closed; consent/data-path research remains. Accepted21/9/1 and zero privacy qualifications unchanged. No SQL, graph, engine or publication changes. See HEMINGWAY_NETWORK_OBSERVATION.md.


## PR5.75 — Anonymous privacy choices boundary

Clean actual HEADd03db87 and owner Production93 recorded. Anonymous free-web Privacy choices exposes independent product analytics/affiliate options; both displayed unchecked after save/reload in existing agent browser profile. Necessary operation and aggregate measurement remain always-active per UI. No network enforcement, storage or GPC test; separate owner capture had unknown consent, so no violation/compliance inference. Hemingway privacy qualification paused at explicit evidence boundary; next distinct lead is local LanguageTool source/configuration review. Accepted21/9/1, zero new qualifications unchanged. No SQL/graph/engine changes. See HEMINGWAY_PRIVACY_CHOICES.md.


## PR5.76 — Local LanguageTool feasibility

Clean actual HEAD118445a and owner Production94 recorded. Official local-server guide, default-off PASSIVE_VOICE rule page and partial moving-master server configuration reviewed. Fixed artifact/commit not obtained; public-index download approval timed out without execution. Local server remains a distinct research edition, not hosted Basic/Premium. Version/rule enablement, outbound behavior, all logging and cleanup gates remain before execution or qualification. No install, port exposure, SQL, graph or engine changes. Accepted21/9/1, zero new qualifications unchanged. See LANGUAGETOOL_LOCAL_FEASIBILITY.md.


## PR5.77 — Named LanguageTool artifact pinned

Clean actual HEAD83f150c and owner Production95 recorded. Official named6.6 ZIP downloaded and SHA256/size/English module version inspected without execution. Actual style.xml contains three passive-related rule groups, with PASSIVE_VOICE explicitly off. Source tag6.6 commit recorded separately from newer6.8; binary reproducible-build equivalence and dependency safety not claimed. Read-only artifact inspector accepts matching bytes and rejects mismatch. Runtime/rule enablement/outbound/logging gates remain; no installation, SQL, graph or engine changes. Accepted21/9/1, zero new privacy qualifications unchanged. See LANGUAGETOOL_ARTIFACT_PIN.md.


## PR5.78 — Local LanguageTool runtime evidence

Clean actual HEAD13c0552 and owner Production96 recorded. Authorized portable Temurin17 digest verified before executing pinned LanguageTool6.6 CLI. Twelve synthetic matrix runs succeeded. Explicit passive rules alone returned zero; PICKY plus explicit rules found two target passives, with zero active/adjectival matches. Positive grammar control confirmed processing. Manual hints only; no replacements. No server or system setup. Outbound and full retention unverified; privacy remains on hold. Accepted21/9/1 and zero new qualifications unchanged. See LANGUAGETOOL_LOCAL_RUNTIME_REVIEW.md.


## PR5.79 — Bounded LanguageTool Java I/O observation

Clean actual HEAD7c1e814 and owner Production97 recorded. Four PICKY/explicit-passive CLI cases repeated under zero-threshold JFR socket/file-write observation; target hints preserved. Each run recorded three null-path writes, zero socket read/write and zero reported DataLoss events. Local synthetic keystore positive control confirmed FileWrite capture. No network positive control or OS-wide coverage; no no-transmission claim. Dedicated home/tmp empty after exit, while deliberate experiment files retained. Privacy stays on hold; accepted21/9/1 and zero qualifications unchanged. See LANGUAGETOOL_IO_OBSERVATION.md.


## PR5.80 — Java socket observer positive control

Clean actual HEAD1150dae and owner Production98 recorded. Same pinned Temurin/JFR settings observed 13 SocketRead and 5 SocketWrite events in a separate synthetic loopback TLS control, zero reported DataLoss. Listener bound only127.0.0.1 and closed after run; no external destination or trust-store modification. This confirms one Java observer path, not complete DNS/native/OS coverage or no transmission. PR5.79 observations remain immutable. Repeated Java-event-only testing closed at this boundary; independent process/OS coverage and retention evidence required before qualification. Accepted21/9/1, zero privacy qualifications unchanged. See LANGUAGETOOL_SOCKET_CONTROL.md.


## PR5.81 — Bounded owner-operated OS observation

Clean baseline HEADeb96a76 and owner Production99 recorded. Initial Level5 capture lacked TCP control; local provider metadata exposed TcpSummary16. Corrected Level16/nonpaged/strict control verified loopback transfer. Same-window 20-second TCPIP observation then completed and stopped: control287 header events/two bidirectional loopback summaries; LanguageTool108 header events, normal exit and two passive hints. Header PID is execution context, not causal ownership. Selected lifecycle IDs have no explicit LanguageTool owner match; no no-transmission finding. DNS/UDP/retention/complete coverage unresolved. Owner capture round closed; sanitized evidence only, raw ETL stays local. Accepted21/9/1 and zero privacy qualifications unchanged. See LANGUAGETOOL_OS_OBSERVATION.md.


## PR5.82 — Privacy writing readiness inventory

Clean actual HEAD6bf8e2c and owner Production100 recorded. Six editions/operations separated across six research axes with ten prior receipts pinned; direct6.6 CLI evidence cannot fill HTTP-server or hosted gaps. All remain on hold, unknown is not negative privacy evidence. Material selected-operation data paths, not an impossible universal no-packet proof, determine research blockers. Next bounded investigation is pinned CLI startup/config/logging source review; cache-miss source lookup did not close that gate. Owner captures closed; no purchase or new runtime requested. Accepted21/9/1 and zero new qualifications unchanged. See PRIVACY_WRITING_READINESS.md.


## PR5.83 — Pinned CLI source path review

Clean actual HEAD7b9d29f and owner Production101 recorded. Ten source files downloaded from fixed6.6 commit; selected CLI entry/options/remote-config/output/error/cleanup/telemetry paths reviewed. Absent remote config passes empty list but downstream factories remain unreviewed. JSON output carries sentence/context; error branches can carry abbreviated sentence text. Cleanup covers registered temporary files at normal end, not every caller copy or crash. Global telemetry hookup is not exporter verification. Source/binary equivalence not claimed. Privacy stays on hold; accepted21/9/1, zero new qualifications. No execution, owner capture, SQL/graph/engine changes. See LANGUAGETOOL_CLI_SOURCE_REVIEW.md.


## PR5.84 — Empty-config factories and bundled defaults

Clean actual HEADc4610dd and owner Production102 recorded. Fixed6.6 GRPCRule/GRPCPostProcessing factories create nothing through their config iteration when supplied an empty list. Actual CLI logback.xml declares INFO ConsoleAppender, no file/network appender. Bundled OTel API1.42.1 source has conditional no-op fallback;139 JAR scan found no SDK/exporter package or OTel service descriptors. External globals/agents/config and effective runtime remain unverified; no broad no-transmission/telemetry claim. Root classpath/unpacked language resources and33 absent language-JAR references noted. Prior text-bearing output/retention limits remain. Research hold, accepted21/9/1, zero new qualifications unchanged. No execution/SQL/graph changes. See LANGUAGETOOL_CLI_DEFAULTS.md.


## PR5.85 — Synthetic CLI summary boundary

Clean actual HEAD5a5612d and owner Production103 recorded. Added research-only fixed-synthetic stdin probe; two executable identities pinned, injected JVM option variables rejected, raw stdout/stderr not printed or persisted by wrapper. Four actual cases returned2/0/0/2 and owned temp cleanup succeeded. Four meaningful output/error/option/cleanup-boundary tests pass. Node/JVM memory, external writes, complete distribution, network/exporter and retention remain outside guarantee; not a real-document product or privacy qualification. Source pins normalize CRLF only. Accepted21/9/1, zero new qualifications unchanged. No owner capture/SQL/graph/engine changes. See LANGUAGETOOL_SYNTHETIC_PROFILE.md.


## PR5.86 — Full distribution file snapshot identity

Clean actual HEADece2cb4 and owner Production104 recorded. Matched both fixed official ZIP hashes before per-file inventory; Java316 and LanguageTool1789 file paths/lengths/content hashes match extracted trees. Added a separate verified probe without changing frozen PR5.85 helper/pins. Dependency mutation, unexpected/missing file and junction tests reject altered trees. Four actual verified synthetic cases returned2/0/0/2; owned temp removed. Snapshot check is not atomic containment, loader/global-state coverage, rights or privacy certification. Accepted21/9/1 and zero qualifications unchanged. No owner capture/SQL/graph/engine changes. See LANGUAGETOOL_DISTRIBUTION_PROFILE.md.


## PR5.87 — Antidote installed control boundary

Clean actual HEADd66d397 and owner Production105 recorded. Seven current official documents reviewed for installed12 English Correction. Global rewrite-disable switch located; requires administrator panel unlock and differs from automatic suggestions or per-document disable. Correction-state memory is default-on with broader clear action; sync categories/onboarding choices separate. Nothing applied or installed, entitlement unconfirmed; no purchase requested. Proposed manual passive workflow still unobserved in selected configuration. Privacy hold, accepted21/9/1 and zero qualifications unchanged. No further CLI probe expansion/owner capture/SQL/graph changes. See ANTIDOTE_LOCAL_CONTROLS_REVIEW.md.


## PR5.88 — Open writing candidate source leads

Owner reports no/uncertain Antidote12 access; defer without purchase or negative privacy inference. write-good fixed main/CLI source reviewed: passive check, eager dependency imports and text-bearing output identified; dependency graph and synthetic behavior pending. Vale CLI offline claim separated from hosted CMS; local passive rule unverified. Two leads, zero qualifications;21/9/1 unchanged. No candidate execution, graph/SQL changes or further owner capture. See OPEN_WRITING_CANDIDATE_REVIEW.md.


## PR5.89 — write-good passive dependency controls

Actual clean HEADdb9a12c and owner Production106. Registry integrity verified passive-voice0.1.0; inspected dependency module has no imports/direct I/O. Eight synthetic controls demonstrate simple passive/manual-active behavior, missed adverb/get constructions and adjectival ambiguity. Dependency only, not full write-good or network/retention proof. No npm installation or real text. Other eager dependencies/end-to-end profile pending;21/9/1 and zero qualifications unchanged. See WRITE_GOOD_PASSIVE_REVIEW.md.


## PR5.90 — write-good local library workflow

Clean actual HEADc539f01 and owner Production107. npm1.0.8 plus seven dependencies locked/downloaded with scripts disabled in separate research folder. Full direct library loaded14 files across7 packages; commander excluded. Eight synthetic inputs in default/passive-only modes confirm manual active revision and detector limitations; adverb warning is not passive success. Selected loaded source has no direct I/O calls; text-bearing returns and runtime memory/caller retention remain explicit limits. No OS capture, CLI/editor evidence or source-release equivalence claim. Close bounded probe round, next consolidate rubric/Vale. Research only;21/9/1, zero qualifications unchanged. See WRITE_GOOD_LIBRARY_REVIEW.md.


## PR5.91 — Vale local passive rule workflow

Clean actual HEAD8f6ea43 and owner Production108. Official portable3.24.0 archive digest matched; fixed Microsoft.Passive local rule with explicit config/no-global/plain stdin. Eight synthetic runs plus warning-threshold control show manual revision, adverb/get misses, adjectival ambiguity and indeed false positive. Suggestion-level rule requires suggestion threshold; exit0 is not alert absence. Same heuristic family as write-good, not CMS sequence rule or evidence of independent accuracy. JSON holds matched prose; CLI data-path/retention review pending. No system install/sync/account or owner capture.21/9/1, zero qualifications unchanged. See VALE_LOCAL_RULE_REVIEW.md.


## PR5.92 — Vale selected text data paths

Actual clean HEAD7c4fc6f and owner Production109. Fixed source sections traced stdin/config/existence/JSON plus optional remote NLP and environment profiling. NLP may send text in URL query; profiling starts before flags and can write files. New child-only VALE_* removal, empty effective endpoint and explicit local profile confirmed; passive1/manual-active0. Does not retroactively attest prior inherited environment or all network/write paths.13 source files indexed, not full dependency audit. Research only;21/9/1, zero qualifications unchanged. Next consolidate evidence/gates without default capture expansion. See VALE_DATA_PATH_REVIEW.md.


## PR5.93 — Privacy evidence decisions and publication gates

Clean actual HEADc5160f2 and owner Production110. Ten frozen receipts consolidated across8 edition profiles. Graph-qualified0 distinguished from research readiness: prioritize LT CLI/write-good scoped draft wording; one bounded Vale config/rule-load gate remains. Privacy engine still has no relationshipScope; proposed passive workflow/rubric not applied. Do not invent universal no-packets/secure-erasure tests or count modes as products. Next concrete dossiers/config decision before selective graph proposal; no default further capture. No graph/engine/SQL changes;21/9/1, zero applied qualifications unchanged. See PRIVACY_EVIDENCE_DECISIONS.md.


## PR5.94 — Concrete scoped writing candidate dossiers

Clean HEADacb316d and owner Production111. LT CLI/write-good/Vale relationship, privacy, workflow, commercial-boundary and tradeoff drafts written explicitly. Vale pipeline .vale-config source identified; absent in selected tree, one explicit config and counts only Microsoft.Passive observed. Selected config gate resolved, not full linked-code audit. Seven receipts pinned, no old evidence edits. Dossiers are not graph qualification; next selective scope/claim/pricing review and draft preview. No engine/graph/SQL changes;21/9/1, zero applied qualifications unchanged. See SCOPED_WRITING_CANDIDATE_DRAFTS.md.


## PR5.95 — Executable scoped privacy proposal

Clean HEAD436fb79 and owner Production112. Three dossiers converted to standalone candidate preview using current evaluator plus scope/profile/six-axis proposal guards; actual privacy remains likely, retained unresolved axis decisions block all3. Local license/pricing wording reviewed separately from hosted services. Regression fixtures reject cross-edition/scope leakage, unverified/material-unknown claims and duplicate modes/minimum shortfalls. Production evaluator/graph/seed unchanged;21/9/1, zero qualifications. Next explicit retention/operational-text claim decisions before scoped implementation. See SCOPED_PRIVACY_PREVIEW.md.


## PR5.96 — Explicit scoped privacy claim decisions

Clean HEAD809c64e and owner Production113. Existing evidence supports write-good exact local-function claim across six explicit axes, with caller memory/output and host exclusions disclosed. New proposal-only verified claim yields research1/3, while actual graph0 and21/9/1 remain. LT/Vale broader process-level clauses held for narrower wrapper/init/diagnostic wording; no new capture or blanket erasure/reproducibility gate. Frozen PR5.95 remains0. New clear success output, no engine/graph/SQL changes. See PRIVACY_CLAIM_DECISIONS.md.


## PR5.97 — Conditional CLI privacy wording

Clean HEADd942194 and owner Production114. LT broad process wording replaced only in new proposal by explicit fixed local CLI/boot/config/output conditions. Six axes support bounded statement with JSON/error/caller retention disclosed; no universal no-I/O/deletion guarantee. Synthetic harness not counted as daily writing product or generic privacy application. Research2/3 with write-good retained; Vale held. Prior snapshots unchanged, graph0/public21/9/1 unchanged. No new runtime/capture/engine/SQL changes. See CLI_CLAIM_BOUNDARY.md.


## PR5.98 — Vale conditional claim and three research dossiers

Clean HEAD4e7f9f6 and owner Production115. Fixed source default-style/config/manager/extension/linter initialization sections reviewed. Selected local Vale profile supported with explicit pipeline/endpoint/profiling/no-script/output conditions and retained caller/OS limits. New research3/3, actual graph0/public21/9/1 unchanged; old0/1/2 snapshots immutable. No new binary run/download/capture or production engine/graph/SQL change. Next actual seed-contract draft and scoped production guards, not further default probes. See VALE_CLAIM_DECISION.md.


## PR5.99 — Contract-valid privacy draft graph

Clean HEADa28a62c and owner Production116. Three scoped dossiers converted through actual seed semantic validator into offline draft graph,12 attrs/3 anchors/3 memberships. Persisted Reviewed Local Operation text carries edition/conditions. New reusable helper checks exact profile/operation/six axes but is proposal-only, not wired into production. Existing products/unrelated routes and historical engine/pins unchanged. Draft3, published0, not publishable; public21/9/1 and actual privacy graph0 unchanged. Next production projection/display integration review and selective import proposal, no SQL now. See PRIVACY_GRAPH_PROPOSAL.md.


## PR5.100 — Runtime scoped privacy and display integration

Clean HEAD18e8f9b and owner Production117. Registered reviewed profiles match frozen PR5.99 drafts. getEscape preview/live paths now enforce scoped profile evaluation; unreviewed/altered/missing-evidence pages fail closed. Other routes unchanged, historical evaluator/source pins untouched. Route/product displays include complete reviewed local operation; invalid scope privacy badge becomes unknown, no standalone positive privacy highlight. Privacy draft file selection development-only.17 tests, full typecheck, webpack production build and two local SSR pages passed; server stopped. No SQL/import/publication or graph changes;21/9/1, actual privacy0 unchanged. See PRIVACY_RUNTIME_INTEGRATION.md.

## PR5.101 — Read-only privacy import preflight

Owner accepted PR5.100 local UI and links at HEAD ca9f971. Added single-SELECT privileged collision snapshot for three scoped editions, existing families, routes, claims/evidence, taxonomy and public sets. No live query executed or import/publication approved. Pending returned snapshot before selective draft SQL; public checkpoint21/9/1 unchanged. See PRIVACY_IMPORT_PREFLIGHT.md.

## PR5.102 — Selective privacy draft import

Owner pushed35b520e and returned privileged PR5.101 snapshot:21 published products/9 approved routes, generic LanguageTool draft retained, proposed identities/route/taxons absent. Frozen snapshot guards protect retained claims, memberships, taxonomy and public/private boundary. Selective3 drafts/12 attributes/3 scoped anchors/3 memberships with2 new taxons,6 sources/30 evidence fragments.20 local tests passed; generated rehearsal/apply/verification SQL, no remote execution or publication. Await owner rollback rehearsal, then separate draft apply and full verification. See PRIVACY_SELECTIVE_IMPORT.md.

## PR5.103 — Privacy draft acceptance and publication preflight

Owner returned PR5.102 verification32/32 true after apply;3 scoped drafts imported, generic LanguageTool/old route retained, public21/9/1 and private evidence boundary preserved. Frozen owner receipt plus SELECT-only post-import snapshot capture actual IDs, RLS/policies and public projections before guarded publication proposal. No apply replay or publication approval/execution. Await snapshot; see PRIVACY_PUBLICATION_PREFLIGHT.md.

## PR5.104 — Guarded scoped privacy publication proposal

Owner pushed94cafe4 and returned actual PR5.103 snapshot. Stored import rows match;3 actual scoped editions qualify via runtime, generic draft and published route retained. Concrete rollback rehearsal/pending-approved apply/22-check verification prepared. Only3 product statuses and1 route status/approval would change; expected24/10/0 after acceptance, current accepted21/9/1 unchanged.23 local tests passed; no remote publication or approval. See PRIVACY_PUBLICATION_PROPOSAL.md.

## PR5.105 — Privacy publication acceptance and ten-route milestone

Owner applied publication, returned22/22 true and nine incognito production screenshots confirming route/three product pages/official destinations. Accepted24/10/0 checkpoint recorded; default route audit now reflects it while historical15/7/3,18/8/2,21/9/1 functions remain frozen for pinned research. No SQL or runtime change. Ten-route scope complete, broader Validation MVP gates and Issue11 remain unverified; experiment not started. See PRIVACY_PUBLICATION_ACCEPTANCE.md and POST_ESCAPE_VALIDATION_READINESS.md.

## PR5.106 — Homepage discovery entry and implementation inventory

Owner pushedaf554e6 / Production123. Homepage placeholder replaced with live approved-route navigation, scoped descriptions, responsive cards and safe empty/error states. Public24/10/0 unchanged; no SQL or fixture fallback. App/lib inventory records missing search/parser, events, Hidden Gems and sitemap/robots; existing page metadata retained.4 tests, typecheck and webpack build passed. Local HTTP QA blocked by socket permissions; owner visual check pending. Experiment not started. See HOME_DISCOVERY_ENTRY.md.

## PR5.107 — Anonymous event and CTR contract

Owner pushedb741dd2 / Production124 and accepted homepage tests/build/navigation. Added strict versioned payloads for route product exposure/click and product view/outbound plus executable CTR aggregation. Anonymous UUID context, query-free paths/hostname-only source, duplicate action/event handling and unmatched-action diagnostics tested.8 tests/typecheck passed. No endpoint, producer, storage, migration or live collection; current24/10/0 and experiment-not-started preserved. Next collector/storage boundary then browser visibility producers. See DISCOVERY_EVENT_CONTRACT.md.

## PR5.108 — Ingestion boundary and analytics schema preflight

Owner pushed3b69985 / Production125. Added strict batch validation (16KiB/20 events, timestamp window, trusted public products/qualified positions, retry deduplication) plus one SELECT-only analytics metadata/privilege/collision snapshot.11 tests/typecheck passed; no endpoint, storage, migration, credentials or live collection enabled. Await owner snapshot before concrete storage/collector proposal. Public24/10/0 and experiment-not-started unchanged. See ANALYTICS_INGESTION_PREFLIGHT.md.

## PR5.109 — Private analytics storage migration proposal

Owner pushed86dc09f / Production126; PR5.108 metadata confirms absent analytics objects, service_role schema usage false, public24/10 and private boundary intact. Prepared two private RLS tables, service-only atomic ingest/purge RPCs, bounded batch/public-membership checks, durable quota/dedup, explicit service USAGE grant and retention function.9 isolated PostgreSQL-compatible scenario groups passed including all10 shipped verification checks; SQL pins verified. Owner rollback rehearsal pending. No HTTP collector, producers, secrets, scheduled purge or collection enabled; no experiment start. See ANALYTICS_STORAGE_REVIEW.md.

## PR5.110 — Disabled-by-default HTTP collector and maintenance endpoints

Owner PR5.109 storage10/10 accepted atd1a38d8 / Production127. Added bounded same-origin JSON collector, trusted production platform IP→daily HMAC key, local load shedding plus durable quota handoff, authoritative eligible placement lookup, stateless server-only RPC client, and separately authenticated POST purge endpoint. Default flags off; no browser producers/job/secrets/collection enabled.21 tests, typecheck/build,10 isolated SQL scenario groups passed including HTTP→RPC persistence bridge. No new migration; public24/10/0 and experiment-not-started preserved. Owner disabled-state POST check pending. See ANALYTICS_COLLECTOR_REVIEW.md.

## PR5.111 — Disabled-by-default browser producer and maintenance capability preflight

Owner pushedd4ecd5b / Production128;21 tests/build and disabled POST404 accepted. Wired published route/product exposure/view/click/outbound with server-only enable decision, tab/session/page/exposure UUIDs, continuous visible product-entry threshold, shared-placement dedup, bounded best-effort transport and cleanup. Gates remain off; no actual visitor collection or daily job enabled.25 tests, typecheck/targeted lint/build and11 isolated SQL scenario groups passed. Read-only maintenance capability snapshot pending before daily purge configuration. Public24/10/0, experiment-not-started preserved. See DISCOVERY_PRODUCER_REVIEW.md.

## PR5.112 — Daily purge installation and scheduling proposal

Owner PR5.111 snapshot confirms pg_cron absent/available1.6.4, empty events and preserved24/10/private boundary. Prepared guarded shared-extension install plus one daily scoped purge job, rollback rehearsal, read-only configuration/run evidence and exact-job removal. Collection flags remain false; actual Supabase rehearsal/apply and successful scheduled run pending. No experiment start. See ANALYTICS_MAINTENANCE_REVIEW.md.

## PR5.112 — Daily purge installation and scheduling proposal

Owner PR5.111 snapshot confirms pg_cron absent/available1.6.4, empty events and preserved24/10/private boundary. Prepared guarded shared-extension install plus one daily scoped purge job, rollback rehearsal, read-only configuration/run evidence and exact-job removal. Collection flags remain false; actual Supabase rehearsal/apply and successful scheduled run pending. No experiment start. See ANALYTICS_MAINTENANCE_REVIEW.md.

## PR5.112A — Installed-scheduler recovery proposal

Owner rehearsal true; first-install migration refused existing cron state. New03:19:59Z owner snapshot confirms installedpg_cron1.6.4, emptyevents, unchangedpurge/public24/10/privateboundary; job state unknown. Recovery validates existing extension, creates only absent scoped job, retains an exact existing one and rejects drift. No extension/grant/other-job changes. Owner recovery rehearsal/apply/configuration+actual-run evidence pending. Collection OFF; experiment not started. See ANALYTICS_MAINTENANCE_RECOVERY.md.

## PR5.113 — Maintenance accepted; isolated collector activation QA prepared

Owner accepted configuration8/8 + storage10/10 and actual2026-10-19 Taipei11:17 scheduled success, expiredcounts0. Frozen receipt records evidence without claiming installation cause. Added independent default-OFF browser producer gate and explicit synthetic collector probe/ID-scoped SQL receipt to validate cloud persistence/dedup/privacy with browser producers still off. No credentials configured or real HTTP/DB commands run by this packet. Controlled cloud QA pending; experiment not started. See ANALYTICS_CONTROLLED_ACTIVATION.md.

## PR5.114 — Cloud QA receipts and metric QA exclusion

Owner b6bd041 collector HTTP4/4 + SQL3/3 accepted; enabled browser route→AFFiNE→official journey HTTP4/4 + SQL6/6 accepted. Producer restoredfalse and Ready/Current deployment observed; fresh disabled-context network check pending. Recorded2knownQA sessions and1event fallback; discoveryMetrics now excludes them after validation/dedup and reports excludedQaEvents. No DB changes/secrets accessed, no demand inference. Browser privacy/mobile/edge QA and broader launch requirements remain pending; experiment not started. See ANALYTICS_CLOUD_ACCEPTANCE.md.

## PR5.115 — Live public sitemap and canonical-host indexing policy

Owner f701679 / Production132;31 tests/typecheck/build accepted. Added dynamic live sitemap from public published product RPCs and runtime-qualified registered routes, no private/fixture fallback or inventeddates;503 on read failure. Added robots and shared canonical-production index policy across root/product/route metadata, preview/alias noindex. No DB/grant/secret/analytics flag changes. Owner deployed output QA pending; product count/search/HiddenGems/otherlaunchgates remain; experiment not started. See DISCOVERY_SEO_REVIEW.md.

## PR5.116 — Editorial Hidden Gems surface with live evidence guards

Owner e9d4383 / Production133,38 tests/build and canonical sitemap35/metadata+alias noindex evidence accepted. Added homepage links and /hidden-gems with3 existing accepted scoped products (Joplin/Krita/PDF24 Creator); live source route qualification and evidence re-evaluation, exact scope/pricing/tradeoffs/source links, conditional index/sitemap36. No DB/grant/secret/publication/analytics activation changes. Dedicated collection telemetry, search and other launch gates remain; experiment not started. Owner UI/live QA pending. See HIDDEN_GEMS_REVIEW.md.


## PR5.117 — Hidden Gems analytics proposal
- Owner accepted PR5.116 UI/mobile/keyboard/links/sitemap/production and alias SEO; 24 products, 10 routes, 36 sitemap URLs.
- Owner 2026-10-19 09:28:44 UTC database preflight: all nine checks true, captured ingest/purge hashes unchanged.
- Added distinct hidden_gems impression/click surface, current editorial placement receiver checks and separate CTR metrics; prepared guarded SQL extension preserving existing events/quotas/ACL/purge job.
- Author: 49 Node tests, TypeScript, targeted lint, webpack production build and seven synthetic PGlite scenario groups pass. Owner SQL/deployment/enabled browser acceptance pending; producer remains false, experiment not started.


## PR5.118 — Hidden Gems cloud QA receipt and exclusion
- Owner committed PR5.117 SQL: eleven checks true; enabled Joplin journey: four HTTP 204 responses and seven scoped SQL checks true.
- Owner reports producer=false, Ready redeployment and disabled repeat journey completed. Added accepted QA session exclusion and frozen receipt; experiment not started.
- Author validation: 50 Node tests, TypeScript, targeted lint and production build pass. No new SQL or environment changes; public 24/10 unchanged. Enabled privacy/visibility/mobile/middle-click edge acceptance remains pending.


## PR5.119 — browser privacy/input receipt and QA exclusion
- Owner Chrome DNT=1 and Firefox GPC=true/DNT=unspecified journeys showed no event requests under the controlled activation workflow; owner reports disabled redeployment after each.
- Repeated keyboard/middle-click test with DNT=null passed six scoped Joplin/Krita event presence and exposure-linkage checks. Added session 61baa262-19fc-44b9-8053-3c080498ea85 to metric QA exclusions; input modality is owner-reported, not encoded in events.
- Owner confirms producer=false and Ready. Author: 51 Node tests, typecheck, targeted lint and production build pass. No SQL/environment changes; public24/10 unchanged; experiment not started. Quick-click, visibility-reset and enabled-mobile acceptance pending.
