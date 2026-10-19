-- Owner-only read-only aggregate/status. No other job commands or event payloads returned.
SELECT j.jobname,j.schedule,j.active,
 r.status AS last_run_status,r.start_time AS last_started_at,r.end_time AS last_finished_at,
 CASE WHEN r.status='succeeded' AND r.end_time IS NOT NULL AND r.end_time IS NOT NULL THEN true ELSE false END AS latest_run_succeeded,
 (SELECT count(*) FROM software_discovery.discovery_events WHERE received_at < now()-interval '90 days') AS expired_events_remaining,
 (SELECT count(*) FROM software_discovery.discovery_event_limits WHERE minute_start < now()-interval '24 hours') AS expired_limits_remaining
FROM cron.job j LEFT JOIN LATERAL (
 SELECT status,start_time,end_time FROM cron.job_run_details WHERE jobid=j.jobid ORDER BY runid DESC LIMIT 1
) r ON true WHERE j.jobname='software_discovery_analytics_purge_v1';
