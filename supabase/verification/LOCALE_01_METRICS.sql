-- Read-only v2 activity counts. Set the actual pilot activation and end timestamps.
-- Null boundaries intentionally return no results until edited. No visitor or sales claims.
WITH bounds AS (
 SELECT NULL::timestamptz AS start_at, NULL::timestamptz AS end_at
), eligible AS (
 SELECT payload AS e FROM software_discovery.discovery_events_v2, bounds
 WHERE received_at >= start_at AND received_at < end_at
 AND lower(payload->>'sessionId') NOT IN ('e20a7cc5-b115-46bc-bd7a-1e25f645bf20','dd469548-acd9-4fa9-8cec-124353f237f1','7f244ce2-4ebe-497c-bc8c-4a4c8b015529','61baa262-19fc-44b9-8053-3c080498ea85','c52c9eed-061e-4618-bf9f-5dc2f44a85b3','0033efa0-5a71-48af-9a56-291a6b7f81b0','b4e6515b-b308-4905-869f-323da4139ab1','c59194d0-2f93-4e79-b489-e001273abc29','b14b674e-bcba-4458-b15f-b7cf0ca57341','4cc150fb-9cc8-4c66-baf1-aaf81ee23b07','78cca68c-f935-4468-889b-efac3996b62d','f062fe13-899b-436e-bb41-8e2e89446a6b','9fe51376-c388-4bb3-8300-a6881d112ff0')
 AND lower(payload->>'eventId') <> '97f18f34-5fc4-4f44-9912-11edde1d1da7'
 -- Add newly accepted pilot QA identifiers before interpreting results.
), origins AS (
 SELECT DISTINCT lower(e->>'sessionId') session_id, lower(e->>'pageViewId') page_id, e->>'path' path
 FROM eligible WHERE e->>'name'='page_viewed' AND e->>'surface'='escape'
), activity AS (
 SELECT e, CASE WHEN e->>'path'='/zh-hant' OR e->>'path' LIKE '/zh-hant/%' THEN 'zh-Hant'
 WHEN e->>'originSurface'='escape' AND o.path LIKE '/zh-hant/%' THEN 'en-product-from-zh-Hant'
 ELSE 'en-or-unresolved-origin' END AS segment
 FROM eligible LEFT JOIN origins o ON lower(e->>'sessionId')=o.session_id AND lower(e->>'originPageViewId')=o.page_id
)
SELECT segment,e->>'surface' AS surface,e->>'name' AS event_name,count(*) AS events
FROM activity GROUP BY 1,2,3 ORDER BY 1,2,3;
-- Counts are event activity, not exposure-matched CTR. Missing within-window origin
-- pages remain unresolved. Existing English reports must be kept separate from
-- this pilot-wide inventory. Retain receipt/exposure checks for any funnel rates.
