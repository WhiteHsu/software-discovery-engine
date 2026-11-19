-- Align the shared guide title and summary with the reviewed task-planning scope.
update software_discovery.escape_routes
set name = 'Personal Task Apps You Can Buy Once',
    description = 'Compare how to buy 2Do for Mac, OmniFocus 4, and Things 3 for personal task planning. Check which devices each purchase covers, how syncing works, and which updates or upgrades may cost extra.',
    updated_at = now()
where slug = 'productivity-apps-you-can-buy-once'
  and status = 'published'
  and editorially_approved
  and name = 'Productivity Apps You Can Buy Once'
  and description = 'Compare personal task capture, project organization and scheduling in Things 3, native OmniFocus 4 perpetual editions and direct-purchase 2Do Mac. Apple platforms and purchase channels differ; optional Web access, future upgrades and update eligibility have separate costs.';
