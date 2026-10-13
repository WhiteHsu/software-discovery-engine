# PR5.28 — native PDF page evidence

Reviewed 2026-10-13. Research only. No graph, preview, SQL, applied claims or publication changes. Owner PR5.27 commit 8854c88 accepted. Production checkpoint remains 12 products / 5 routes; this is an owner record, not a live query.

The operation matrix is seed/research/pdf-page-operations-2026-10-13.json. Supported means documentary support for the selected desktop edition, not an application test or engine qualification. Pending never passes. The read-only checker validates source references and these boundaries; it cannot validate remote page contents or installed software.

| Edition | Documentary operations | Remaining review |
| --- | --- | --- |
| Licensed PDF-XChange standard Editor V11 | Move, delete, extract and save extracted PDFs: 4/5 | Pin permanent rotation and combined save/reopen; exact selected-license entitlement remains pending. |
| PDF24 Creator for Windows | Reorder, rotate, remove, extract and save: 5/5 | Prepare pinned editorial relationship and pricing/trade-off claims. |
| Current PDFgear for Windows | Reorder, rotate, remove, extract and save extracted PDFs: 5/5 | Prepare pinned claims; combined save/reopen remains untested. |

Standard Editor evidence now replaces the earlier reliance on a Plus extraction example: [move](https://help.pdf-xchange.com/pdfxe11/moving-pages_ed.html), [delete](https://help.pdf-xchange.com/pdfxe11/deleting-pages.html), [extract/output](https://help.pdf-xchange.com/pdfxe11/extracting-pages.html). The manual documents operations; it does not establish that unlicensed/free output has the same entitlement. Retain the perpetual-license/optional-maintenance and installer-version caveats from PR5.27.

[Creator](https://tools.pdf24.org/en/creator) lists page operations and Save/Save As for its Windows desktop edition. This does not verify full existing-text editing or every export layout.

PDFgear's Windows guides independently document [reordering](https://www.pdfgear.com/windows-user-guide/reorder-pdf-pages.htm), [extraction to PDFs](https://www.pdfgear.com/windows-user-guide/extract-pages-from-pdf.htm) and [rotate/delete controls](https://www.pdfgear.com/windows-user-guide/introduction-pdfgear.htm). Reordering is documented as not undoable. Current free availability is not a lifetime promise; AI privacy and online editions remain separate.

## Optional native smoke test for a later review

Use a disposable, unsigned four-page PDF with large labels A/B/C/D and no sensitive data. Record app version and edition/license. Keep the original. In each desktop app, move D before A, rotate B permanently 90 degrees, remove C, save as a new PDF, close and reopen it. Expected result: D/A/B, three pages, B still rotated. Separately extract original A/C into another PDF and reopen it: exactly two pages, A/C. Record any watermark, upgrade prompt, account requirement or error. A passed smoke test supports this sample only, not general font/layout or signature fidelity. No installs, purchases or native tests were performed by this packet.

## Checks

Run `node scripts/check-pdf-page-research.mjs`, then `node scripts/escape-remaining-routes.mjs`. Expected: 4/5, 5/5, 5/5 documentary operations; all held; applied=false, publicationApproved=false, added=0. Remaining-route audit stays 12 products, 5/10 routes, PDF 0/3. No Supabase execution or new live Visit check is required. Issue #5 stays open.
