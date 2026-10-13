# PR5.29 — bounded Windows PDF draft qualification

Reviewed 2026-10-13. PR5.28 owner commit 66a276a pushed with clean working tree and green Production. This packet creates only separate local draft fixtures. Existing publication checkpoint remains 12 products / 5 accepted routes. No SQL, live imports or publication approval.

Scope: `windows-personal-pdf-page-organization`. Compare Windows personal page reordering, permanent rotation, removal, extraction and PDF output. This is an editorial inference from overlapping documented operations and the reviewed offer, not native testing or a complete Acrobat replacement. Text editing, signatures, secure redaction and export fidelity are excluded.

## Evidence and edition decisions

[Standard Editor V11 rotation](https://help.pdf-xchange.com/pdfxe11/rotate-move-copy-delete-and-renumber-pdf-pages.html) distinguishes permanent Organize rotation from temporary Home viewing rotation, and documents thumbnail reordering. [Extraction](https://help.pdf-xchange.com/pdfxe11/extracting-pages.html) documents output filenames and folders. The selected edition is licensed standard Editor V11. The [product page](https://www.pdf-xchange.com/product/pdf-xchange-editor) distinguishes Plus-only features and describes covered-version perpetual use with optional maintenance and limited older-installer access after maintenance expiry. No free/unlicensed output guarantee is inferred. Exact dollar pricing is omitted because edition and checkout terms vary.

[PDF24 Creator](https://tools.pdf24.org/en/creator) supports the reviewed Windows desktop page operations and Save/Save As, with free private/commercial use. Existing-text editing parity remains unverified.

PDFgear's current Windows offer and native guides support page reordering, rotation, deletion and extraction to PDF. Current free availability is not a lifetime pricing guarantee. Reordering is documented as not undoable; AI/cloud privacy remains separate. Combined save/reopen and native application behavior have not been tested.

The JSON manifest pins source URLs, dated claims and baseline hash. The builder additionally pins the complete review hash. It updates nine attributes and three bounded Adobe PDF relationships on existing products, preserves historical evidence and unrelated graph records, and writes all products/routes as separate unapproved draft fixtures. No identities are added. Engine qualification requires the exact scope plus a nonempty description. Three draft candidates qualify; zero published candidates; publishable=false.

## Verification

109 tests, lint, typecheck and production build passed locally. Tests cover scope/constraint failure, publication isolation, input/review drift, deterministic generation and preservation of unrelated graph/history. Local native apps and browser rendering were not tested. README contains owner preview acceptance steps. PR5.28 research stays historical/unapplied; its checker still validates that original 0-added packet. Current audit now includes PR5.29 draft review and reports PDF 3/3 while published routes remain 5/10. Issue #5 remains open.
