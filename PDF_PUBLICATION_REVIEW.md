# PR5.33 — bounded PDF publication proposal

## Reviewed checkpoint

Owner accepted PR5.31 as 7f6f158 with 113 tests, lint/typecheck, rehearsal rollback, unchanged baseline, production draft apply, ten live checks true, clean checkout and green Production. The PR5.32 post-import snapshot captured 2026-10-13T08:44:19.631898+00:00 is pinned separately in pdf-publication-baseline-2026-10-13.json; the historical PR5.31 import baseline is untouched. JSON.stringify SHA-256: 076f5d014ceabe194ac1d8e7bce502cbc73159e49e6aa0792fcce330f4cbd211. PR5.32 push has not yet been reported.

## Proposed public behavior

Publish PDF-XChange Editor, PDF24 Creator and PDFgear, and approve/publish pdf-editors-without-a-subscription. Only three product status fields and the route's status, editorially_approved and description change. Remove the final draft-only sentence from the route description; retain Windows personal page organization, licensed edition, current free offer, optional maintenance, Plus/demo, AI/cloud and parity/fidelity limitations. Keep all identities, pricing/trade-off claims, scoped relationships, evidence, dates, route members, member notes and ranking scores unchanged. Public totals would become 15 products/six approved routes; accepted totals remain 12/5 until approval and remote application.

The reviewed scope is Windows personal PDF page reordering, permanent rotation, removal and extraction with PDF output. This documentary qualification does not assert tested export fidelity or full Acrobat text editing, signatures or secure redaction. No popularity boost, audience promotion or additional graph candidates are introduced.

## Protection and validation

The generator pins both the post-import snapshot and prior reviewed workflow, and requires three eligible published candidates. SQL locks every guarded table under the existing advisory lock and compares complete stored target identities, claims, evidence, sources, used taxonomy, route metadata and all target memberships. Snapshot records are converted to typed PostgreSQL rows before comparison so timestamp formats/timezones normalize without losing precision. Creation/update timestamps alone are excluded from comparison. Unexpected target exposure, publication/source/scope/member/identity/route drift, anonymous evidence access or repeated apply fails closed. Update only existing rows; no inserts/deletes or evidence rewrite.

117 Node tests, lint and typecheck passed. Isolated PGlite PostgreSQL loaded the supplied snapshot using the repository schema (UUID extension adaptation and initial replica fixture loading only). It validated full rehearsal rollback, six live drift refusal cases, successful proposed publication, repeat refusal, exact preservation of all evidence/relationships/members, and all eleven verification checks. Existing offline relations were loaded as a test fixture for the unrelated preservation check. These are local SQL tests, not a production publication or browser acceptance.

## Owner sequence

Run REHEARSE, then PR5.32_PREFLIGHT and compare the post-rehearsal snapshot (only capture time may change). Obtain explicit owner approval for public exposure of these three products and this route. Only then run APPLY_AFTER_APPROVAL once, followed by VERIFY with eleven true results. Any error/false result requires diagnosis and a fresh preflight; do not rerun apply or relax guards. Finally accept the public route, three product pages, price/source links and official Visit destinations, then record the actual publication checkpoint in a subsequent acceptance packet. The site consumes database publication status; no UI deployment is required to make the database publication visible.

Issue #5 remains open. Issue #11 Day 0 is not started. No remote SQL or approval decision has been executed by Codex.
