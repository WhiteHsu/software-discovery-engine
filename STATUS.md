# Project Status

**Last Updated:** 2026-10-08

## Current Phase

**Phase 6 — Validation MVP Build**

## Current Work

**Issue #5 — Escape Route Engine: in progress (PR5.9 live; PR5.10 Anytype offline draft review prepared)**

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

## Next Work

PR5.10 adds five dated primary sources, three Anytype attribute updates and one bounded Notion alternative claim to the separate local draft graph. Offline Notion reaches three qualified draft candidates; no SQL or publication is included. Notion itself supports offline pages, so the comparison describes workflow and feature limits. All 61 tests, lint and typecheck passed. See ANYTYPE_OFFLINE_REVIEW.md.

Refresh AFFiNE/AppFlowy edition-specific evidence and align all three offline comparison scopes before preparing a selective import/publication packet. Preserve the four live products and the approved Todoist route. One published route does not complete Issue #5.

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
