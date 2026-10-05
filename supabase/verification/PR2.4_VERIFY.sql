-- PR2.4 verification — read-only introspection.
-- Run after 202610050004_security_data_api_boundary.sql.
-- This file creates/modifies no data.

-- 1) RLS must be enabled on all 13 software_discovery tables.
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'software_discovery'
  and c.relkind = 'r'
order by c.relname;

-- 2) Expected public SELECT policies. Evidence tables should NOT appear here.
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual
from pg_policies
where schemaname = 'software_discovery'
order by tablename, policyname;

-- 3) Table privileges for anon/authenticated.
-- Expected: SELECT=true only for the 11 public-surface tables;
-- INSERT/UPDATE/DELETE=false everywhere; evidence SELECT=false.
select
  t.table_name,
  r.role_name,
  has_table_privilege(r.role_name, format('%I.%I', 'software_discovery', t.table_name), 'SELECT') as can_select,
  has_table_privilege(r.role_name, format('%I.%I', 'software_discovery', t.table_name), 'INSERT') as can_insert,
  has_table_privilege(r.role_name, format('%I.%I', 'software_discovery', t.table_name), 'UPDATE') as can_update,
  has_table_privilege(r.role_name, format('%I.%I', 'software_discovery', t.table_name), 'DELETE') as can_delete
from information_schema.tables t
cross join (values ('anon'), ('authenticated')) as r(role_name)
where t.table_schema = 'software_discovery'
  and t.table_type = 'BASE TABLE'
order by t.table_name, r.role_name;

-- 4) Schema boundary.
-- Expected: USAGE=true, CREATE=false for anon/authenticated.
select
  r.role_name,
  has_schema_privilege(r.role_name, 'software_discovery', 'USAGE') as can_use_schema,
  has_schema_privilege(r.role_name, 'software_discovery', 'CREATE') as can_create_in_schema
from (values ('anon'), ('authenticated')) as r(role_name)
order by r.role_name;

-- 5) Compact policy count sanity check.
-- Expected total = 10 policies:
-- 4 taxonomy + 1 products + 4 product relationships + 1 escape_routes + 1 escape_route_products = 11.
-- The query below should therefore return policy_count = 11.
select count(*) as policy_count
from pg_policies
where schemaname = 'software_discovery';
