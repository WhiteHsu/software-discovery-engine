-- Analytics-01: rollback-only storage design rehearsal, NOT an apply migration.
-- No production collector, grants to service_role, purge or cron changes.
BEGIN;
SET LOCAL lock_timeout='5s';
DO $guard$
BEGIN
 IF current_user <> 'postgres' THEN RAISE EXCEPTION 'Run as postgres'; END IF;
 IF to_regclass('software_discovery.discovery_events_v2') IS NOT NULL THEN
  RAISE EXCEPTION 'V2 object already exists; inspect schema before continuing';
 END IF;
END $guard$;
CREATE TABLE software_discovery.discovery_events_v2 (
 event_id uuid PRIMARY KEY,
 payload jsonb NOT NULL CHECK (COALESCE((
  jsonb_typeof(payload)='object' AND payload->'version'='2'::jsonb
  AND payload->>'name' IN ('page_viewed','search_performed','search_results_viewed','escape_route_viewed','product_impression','product_clicked','outbound_clicked','constraint_selected','anchor_selected')
  AND payload->>'eventId'=event_id::text
 ),false)),
 received_at timestamptz NOT NULL DEFAULT statement_timestamp(),
 diagnostic_expires_at timestamptz
);
CREATE INDEX discovery_events_v2_received_at_idx ON software_discovery.discovery_events_v2(received_at);
CREATE INDEX discovery_events_v2_name_idx ON software_discovery.discovery_events_v2((payload->>'name'),received_at);
ALTER TABLE software_discovery.discovery_events_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_discovery.discovery_events_v2 FORCE ROW LEVEL SECURITY;
REVOKE ALL ON software_discovery.discovery_events_v2 FROM PUBLIC,anon,authenticated,service_role;
DO $assert$
BEGIN
 IF has_table_privilege('anon','software_discovery.discovery_events_v2','SELECT')
 OR has_table_privilege('authenticated','software_discovery.discovery_events_v2','SELECT')
 OR has_table_privilege('service_role','software_discovery.discovery_events_v2','INSERT') THEN
  RAISE EXCEPTION 'Private boundary failed';
 END IF;
END $assert$;
-- The diagnostic text retention column is only a design placeholder. No raw
-- query collection is enabled. A future apply migration MUST provide deletion
-- coverage and a service-only, validated, idempotent, rate-limited RPC first.
ROLLBACK;
