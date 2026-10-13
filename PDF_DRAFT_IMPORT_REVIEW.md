# PR5.31 — selective PDF draft import

Owner's PR5.30 snapshot (commit 9ba9773) is pinned in seed/research/pdf-import-baseline-2026-10-13.json. Capture: 2026-10-13T06:50:34.127211+00:00. SHA-256 of JSON.stringify(snapshot): 44eb96c162875137af773c2831ff13eb2c7659e5204b961a77c13063d47e30b8.

## Result

Update only no-subscription, pricing-model and trade-off-summary for the three existing draft products PDF-XChange Editor, PDF24 Creator and PDFgear. Update their Adobe alternative relationships to the reviewed windows-personal-pdf-page-organization scope. Add documentary sources and claim evidence without deleting existing evidence or links. Create pdf-editors-without-a-subscription as an editorially unapproved draft with exactly those three members. No product identities, taxonomy, problem/audience claims or public statuses are written. Twelve published products and five approved published routes remain.

The scope covers Windows page reordering, permanent rotation, removal, extraction and PDF output. It is documentary comparison, with no native export-fidelity or full Acrobat parity claim. Existing licensing, maintenance, Plus-only, demo-output and PDFgear future-pricing limitations remain explicit.

## Safeguards and execution

The generator checks the pinned snapshot and reviewed workflow. SQL locks the graph tables, compares stored target identities, prior claims/evidence and taxonomy against the baseline, rejects publication drift, source collisions, an existing PDF route or unexpected memberships, and checks each written row. Dates use UTC in the transaction and explicit UTC in verification.

Run PR5.31_REHEARSE.sql first. Its deliberate rollback sentinel is caught; success leaves the database unchanged. Any other error aborts. Run the prior PR5.30_PREFLIGHT.sql after rehearsal to confirm the baseline is unchanged. Then run PR5.31_APPLY_DRAFTS.sql once, followed by PR5.31_VERIFY.sql: all ten checks must be true. The same apply refuses repetition; if any error or false check appears, obtain a fresh snapshot rather than changing a guard or retrying apply.

## Validation

113 Node tests, ESLint and TypeScript checks passed locally. Generated apply/rehearsal files are deterministic. An isolated PGlite PostgreSQL database using the repository schema and supplied target snapshot validated rehearsal rollback, stored-claim drift refusal, successful draft apply, repeat refusal, preservation of historical claim evidence and all four evidence-link sets, plus nine target/publication/evidence verification checks. The prior offline-relationship check requires existing production relationships absent from that isolated fixture. The fixture adapts UUID generation and initial loading only; it is not a remote Supabase test.

No production SQL was executed by Codex. Issue #5 stays open; Issue #11 Day 0 has not started. Publication remains unapproved. No new browser/Visit check is needed for this database draft packet; owner's PR5.29 local preview acceptance remains the UI evidence.
