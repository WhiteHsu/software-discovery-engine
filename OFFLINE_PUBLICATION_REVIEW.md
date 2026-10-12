# PR5.13 — Bounded offline publication review

Prepared 2026-10-12; owner publication decision pending. PR5.12 commit ab904d3 is pushed; owner supplied live rehearsal/apply success and 10/10 verification true. Production currently has four published products and one approved route.

## Proposed change

Publish AFFiNE, Anytype and AppFlowy, and approve exactly offline-notion-alternatives with those three members. Read OFFLINE_PUBLICATION_CONTENT.md before deciding. The proposed scope is personal offline notes and locally available organized content in installed native workspaces. This is no guarantee of full Notion replacement, offline cloud attachments, team collaboration or hosted imports. Notion itself has offline pages. Claim dates remain 2026-10-08.

## Guards

The generator reconstructs versioned PR5.11 research and validates the PR5.12 import review. A pinned manifest and complete three-product graph are required. SQL compares every claim, relationship and linked evidence row against the reviewed graph plus retained baseline pointers, including exact counts; unexpected manual linked evidence blocks publication. Existing product metadata must match. Other approved route exposure blocks the operation. The old offline draft route metadata and membership are checked before replacement. Already applied state is accepted idempotently. Existing four published products and Todoist approval must remain present. All changes are atomic and lock the shared importer tables and route tables. No schema migration or full seed import.

## Operator steps

1. Copy packet files, run node scripts/seed/build-offline-publication.mjs and the listed checks, then commit/push the packet.
2. In Supabase SQL Editor run the entire supabase/data/PR5.13_REHEARSE.sql. Success/no rows is expected; every change rolls back.
3. Review the content and send an explicit publication decision. Preparing or committing this packet does not approve publication.
4. Only after explicit owner approval, run the entire supabase/data/PR5.13_APPLY_AFTER_APPROVAL.sql.
5. Run supabase/verification/PR5.13_VERIFY.sql; expect ten true checks. Stop on any error or false result.
6. Open the production route and three product pages; check scoped comparison details, official CTA/source links and navigation. After acceptance, seven products and two of ten routes will be published. Issue #5 remains open.

## Validation

Generator drift/manifest and shipped SQL checks; isolated PostgreSQL-compatible tests for full rehearsal rollback, scope/product drift, unexpected manual evidence, atomic publication, repeat ID/timestamp preservation, unchanged claims and unrelated products, anonymous RPC qualification and private evidence denial, plus all ten shipped verification checks. Full repository test suite, lint, typecheck and production build are required before delivery.

Delivery validation: 71 tests passed (0 failures); lint, typecheck and production build passed. Seven isolated database scenario groups passed, including all ten verification checks. No remote writes performed.
