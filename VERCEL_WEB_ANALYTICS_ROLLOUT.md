# Supplementary Vercel Web Analytics — Issue12

Implementation prepared2026-10-25. SDK@vercel/analytics2.0.1. Not yet activated or verified in Vercel. Day0 remains2026-10-25 00:00 Taipei, end2026-11-24 00:00 exclusive. Supabase remains the conversion source; do not combine visitor totals across systems.

Independent server-only VERCEL_WEB_ANALYTICS_ENABLED defaultsfalse and requires VERCEL=1 plus VERCEL_ENV=production. Preview/local do not mount the component. Known six QA session IDs (sd-session-v1) are excluded before script mounting and before pageviews. Local opt-out and DNT/GPC respected; storage failure prevents tracking. QA not marked before the first page load cannot be retroactively removed. Browser privacy controls can undercount visits.

beforeSend permits pageviews only, exact toolelse.com origin and an explicit public-path allowlist; strips all query/hash information. Unknown/internal paths are dropped. New public products/routes require allowlist review. SDK beforeSend cannot rewrite referrer. Sensitive referrers (query/hash/credentials, unknown internal path or non-root external path) cause tracking to be skipped; this intentionally reduces referral coverage. Eligible script fetches still reach Vercel; this is not a claim of zero network transfer. Verify actual SDK request payloads on production before Issue12 closure.

/privacy contains visitor disclosure and supplementary browser opt-out, linked from footer; noindex/follow and omitted from sitemap. No broad legal-compliance guarantee. Existing Supabase collection and secrets unchanged.

Plan check2026-10-25: official Hobby analytics pricing lists50,000 included monthly events and1month reporting; dashboard/account terms prevail. No paid plan or add-on authorized. Record activation time, deployment commit, usage counter and test receipt after deployment. Sources: https://vercel.com/docs/analytics/limits-and-pricing ; https://vercel.com/docs/analytics/package ; https://vercel.com/docs/analytics/privacy-policy .

Disable: set VERCEL_WEB_ANALYTICS_ENABLED=false for Production and redeploy; optionally disable dashboard Web Analytics. Removing the SDK/component can be a later reviewed cleanup. No database rollback needed. Existing Supabase flags must stay unchanged.
