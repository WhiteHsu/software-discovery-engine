# PR5.38 — Selective task workflow import

Prepared 2026-10-14. Owner pushed PR5.37 as b15be86; clean git status and green Production (56) confirmed. Snapshot PR5.37 captured at 2026-10-14T01:31:57.155726+00:00: three published targets, 21 attributes, three Todoist anchors, three editorial audience claims, 30 fragments, 16 sources, 15 published products and six approved routes. Productivity route absent.

## Changes

Exactly 12 reviewed attribute claims for Things/OmniFocus/2Do: exact personal-task-workflow-scope, one-time-purchase, pricing-model and trade-off-summary. Adds one text taxonomy definition, seven dated sources and their claim associations, and a draft/unapproved productivity route with exactly three members. No product-row operation is included; existing IDs, names, descriptions and published status are preserved. Audience judgments, anchors, problems, unrelated attributes and Todoist memberships are untouched. Historical evidence links are retained; no evidence or route-membership replacement operation is included.

Review facts come from the pinned PR5.36 documentary review. 2Do purchasing refers to direct-store Mac perpetual licensing; 18 months of updates and optional renewal are distinct from continued use, and Mac App Store/Setapp subscriptions are excluded. No new publication approval or lifecycle change is encoded. The route remains non-public, but reviewed pricing and workflow facts on the already-published product pages will update after apply.

## Baseline and guards

The full received snapshot is pinned by SHA-256 in build-productivity-import.mjs. Markdown table framing and doubled quote escapes in embedded evidence notes were decoded into valid JSON; fact fields were not edited. Guards use PostgreSQL typed record normalization, including timestamps, and ignore only created_at/updated_at. Compare all target claim and provenance rows, linked taxonomies, exact publication slug sets, all prior target memberships, anonymous evidence boundary and the absent target route. New taxonomy or reviewed provenance collisions, changed product lifecycle/identity, evidence or memberships abort atomically. Table locks and an advisory lock cover the operation. Repeat apply is refused; obtain a fresh snapshot rather than overwriting later state.

## Validation

124 tests passed; lint and typecheck passed. Isolated PostgreSQL-compatible database tests reconstructed the received snapshot, confirmed rehearsal rollback of all tables, rejected five live drift scenarios, applied once, rejected repeat apply, preserved published product rows and unrelated claims/links, and returned all 23 verification checks true. No remote execution was performed.

## Owner execution

Run PR5.38_REHEARSE.sql first. Only after success run PR5.38_APPLY_UNAPPROVED_ROUTE.sql, then PR5.38_VERIFY.sql: all 23 checks must be true. If a drift exception appears, stop and return its full message; do not bypass the guard or rerun old SQL. The accepted public checkpoint remains 15 products and six approved routes. A later route publication needs a fresh post-import snapshot and explicit owner approval of the concrete publication proposal.
