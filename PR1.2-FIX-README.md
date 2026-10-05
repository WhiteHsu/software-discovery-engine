# PR1.2 Health Check Fix

Replace `app/api/health/route.ts` with the file in this package.

Why:
- PR1.2 has no application tables yet.
- The previous probe called the Data API root, which is not an appropriate
  publishable-key connectivity probe.
- Database query verification is intentionally deferred until Issue #2,
  when the first real table, grants, and RLS policy exist.

Expected response:

```json
{
  "status": "ok",
  "configuration": "valid",
  "supabaseHost": "<project>.supabase.co",
  "schema": "software_discovery",
  "databaseProbe": "deferred-until-issue-2"
}
```
