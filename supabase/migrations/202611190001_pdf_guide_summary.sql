-- Refresh the shared summary shown on the PDF guide and related product pages.
update software_discovery.escape_routes
set description = 'Compare six Windows PDF tools for reordering, permanently rotating, removing and extracting pages. Check free-use limits and processing modes for PDF24 Creator, PDFgear, Sejda and Stirling PDF, and perpetual-license terms for Foxit PDF Editor and PDF-XChange Editor. The comparison covers page organization and PDF output.',
    updated_at = now()
where slug = 'pdf-editors-without-a-subscription'
  and status = 'published'
  and editorially_approved
  and description = 'Compare Windows personal PDF page reordering, permanent rotation, removal and extraction, with PDF output, in licensed PDF-XChange Editor, PDF24 Creator and the current free PDFgear offer. This covers page organization, not complete Acrobat text editing, signatures or secure redaction. Edition, maintenance and AI/cloud limits differ.';
