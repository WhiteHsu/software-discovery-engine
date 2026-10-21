# Search-01 — Issue6 main input / Issue7 bounded natural-language discovery

Baseline441f736 / owner Production142. Owner accepted Launch03 needs/featured entries with supplied desktop evidence: counts4/1/1/1/2/1, Local First AFFiNE, editorial four-route selection. New input on homepage and dedicated /discover, POST /api/discover. Issue6 main search entry and Issue7 behavior remain pending actual model configuration and owner live QA; neither issue is closed. Owner confirms no existing OpenAI setup. This packet is OFF by default and does not create credentials, provision a service or call a live model.

## Requirement-to-code mapping

| Issue7 requirement | Implementation |
| --- | --- |
| Natural-language input | DiscoverySearch input on homepage and /discover;1–500 characters, POST body only |
| Anchor extraction | search-intent.ts six registered anchor IDs, nullable |
| Problem extraction | Five existing graph problem IDs, nullable; exact required problem evidence matched |
| Constraint extraction |13 known attributes, at most5; all are required, no silent OR relaxation |
| Structured schema | Strict JSON schema, required fields, no extra keys, runtime validation |
| Graph retrieval | After valid intent, read only anchor-relevant registered getEscape routes, batches of2; existing public RLS/RPC; no fixtures or service-role search access |
| Database-only products | Source routes must be published/approved and runtime qualified; minimum3 source candidates; recompute ranking; only published eligible products |
| Independent ranking | Minimum verified confidence .80, source/claim/scope gates first; bounded novelty at most .05; deterministic slug tie-break, dedup and top6; AI sees only final candidates after ranking |
| AI explanation | Second bounded model call selects known fact IDs per returned product. Validate ownership/completeness; application renders exact evidence labels/values/sources. No invented prose, changed facts or reordered products. On explanation failure, explicitly show verified-evidence fallback |
| Unsupported requirements | Clarify/unsupported states skip graph reads; ambiguous/no-AI-absolute/platform/budget/full-parity constraints cannot be silently mapped to different semantics |
| No results | No products meeting every interpreted requirement produces explicit no_results; no broadened fallback |
| No invented/unverified products | Runtime schema refuses product fields; rank outside model; explanation whitelist; source/extra required evidence independently verified |
| Search noindex | /discover metadata noindex/nofollow, canonical/discover; API noindex/no-store; no search URL generation or sitemap addition. Homepage initial SEO retained; client POST results are transient |

The retrieval universe is bounded to candidates on the ten reviewed launch routes, not every identity in the database. This preserves scope/evidence gates; it may exclude published products not qualified on these routes. Unknown or additional requirements return clarification, not approximate recommendations. The example requiring simpler+offline+AI-optional can legitimately return no results with current evidence. Problem extraction is separately shown and queried; do not assume product problem claims are verified merely because attribute claims are verified.

AI meaning: optional/non-required AI is ai-optional, not zero AI features. Simpler/minimalist requires all three basic-note workflow attributes. privacy-friendly qualifies only through the reviewed local writing route and its evaluator; broad privacy guarantees require clarification. This packet does not extend pricing or product evidence, publish routes, or change escape-model.ts.

## API/configuration boundaries

OpenAI Responses REST API, fixed api.openai.com destination, text.format strict schema, store=false, no tools or retries,1600 output tokens per call, at most2 calls/search,24KiB model-input and64KiB response bounds. Output must be completed; refusal/incomplete/schema drift fails. Explanation failure preserves already-qualified results with labeled fallback. No API key/model is built into code. Owner must select an available Responses/Structured-Outputs-compatible model after setup; no obsolete or unverified default is chosen.

DISCOVERY_SEARCH_ENABLED must be true, Vercel production/canonical HTTPS origin and all three server config values must be valid. Otherwise503 and zero graph/model calls. Origin/fetch-site/trusted Vercel IP/media/3KiB body/2second read-time guards precede search.18second overall deadline; model fetches are aborted. Supabase reads already issued may finish after deadline, but later batches check abort before starting. A one-minute per-instance admission cap allows3 requests per opaque client key /20 total. Raw IP is only used transiently for HMAC admission, not stored by this code. This is NOT a durable cross-instance quota or global spending cap. Before public traffic, configure provider-side project limits and/or platform abuse controls; remain OFF until controlled QA. No guarantee those external limits are hard spending stops.

Queries are not put in URLs or explicitly written to analytics/DB/application logs. Input is sent to OpenAI for parsing; explanation sends returned evidence only. UI discloses this. store=false is a request parameter, not a claim of zero provider/platform retention. Deployment/request logging and provider retention require their own configuration. No query tracking is sent into the existing four-event collector. Issue8 search/result exposure/source metrics remain separate work; experiment not started.

## Author validation and remaining acceptance

75 Node tests pass (prior65 +10 search scenarios), standalone TypeScript and targeted ESLint pass, webpack production build passes. Mocks test AND matching, problems, scope/publication, unsafe/unknown claims, bounded novelty, dedup/order, injected product/SQL fields, invented explanations, refusal/incomplete model output, default-off, origin/IP/body guards, admission and timeout. No paid API calls and no live production DB audit. Local browser /discover input/submit/default-off message verified; HTTP confirms noindex/canonical and disabled API503/no-store. Live result UI/mobile/actual model semantic extraction and complete source-data behavior still need owner acceptance. Existing15 home/entry tests remain passing in the75.

Official references checked2026-10-21:
- https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses
- https://developers.openai.com/api/reference/resources/responses/methods/create

No new dependencies, SQL migrations, RLS/grants, cron, publication, analytics activation or experiment start. Keep ANALYTICS_PRODUCER_ENABLED=false and ANALYTICS_PURGE_ENABLED=false.
