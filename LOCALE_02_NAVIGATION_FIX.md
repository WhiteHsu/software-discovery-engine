# #19 language-navigation fix

Baseline: cb1dbaa. Prepared 2026-10-27. Production deployment pending.

## Problem and fix

Next App Router preserves the root layout across client navigation. The original server-only header and footer used the first request's language and path. Clicking English could replace the main content while leaving the header saying English, its link pointing at the same English page, the footer in Chinese, and the document language stale.

Move the shared header and footer into a client component driven by usePathname. Preserve the server-rendered document language for first loads; update it after client language transitions. Recalculate brand, privacy and equivalent-page links for the current route. The server supplies only the published, translation-ready comparison slugs; unavailable equivalents are not advertised on fresh requests. No database, environment, evidence, ranking, canonical or analytics configuration changes.

## Verification

- 13 localization/navigation/Vercel policy tests passed.
- 9 real Next HTTP integration checks passed against synthetic database fixtures.
- Typecheck and production build passed. Lint: zero errors, the same three existing warnings.
- Browser click validation (no manual refresh between steps): Chinese home → English home → Chinese home; Chinese home → Chinese comparison → English comparison → Chinese comparison. Verified current URL, alternate link, header text and document language in the live DOM. Both home and comparison return trips passed.

The prior HTTP checks covered fresh requests and missed persistent-layout browser navigation. The browser round-trip validation addresses that gap. The screenshot is from the isolated fixture preview, not production.

## Owner production acceptance

Apply the hotfix, run checks and push; SQL must not be rerun. After Ready, open a fresh tab and repeat the home and comparison round trips without manually refreshing between clicks. Confirm the footer language follows the page. Keep #19 open for the remaining analytics and mobile acceptance work and follow-up observation.
