-- PR5.7 read-only verification, after the scope migration is applied.
select 'scope_columns' as check_name, count(*) = 2 as passed
from information_schema.columns
where table_schema='software_discovery' and table_name='product_anchors'
  and column_name in ('relationship_scope','scope_description')
union all
select 'scope_pair_constraint', exists(select 1 from pg_catalog.pg_constraint
where conrelid='software_discovery.product_anchors'::regclass and conname='product_anchors_scope_pair_chk')
union all
select 'rpc_scope_projection', position('c.relationship_scope' in pg_get_functiondef('software_discovery.product_discovery_page(text)'::regprocedure)) > 0
union all
select 'rpc_scope_description', position('c.scope_description' in pg_get_functiondef('software_discovery.product_discovery_page(text)'::regprocedure)) > 0
union all
select 'anon_rpc_access', has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE')
union all
select 'raw_evidence_denied', not has_table_privilege('anon','software_discovery.claim_evidence','SELECT')
union all
select 'draft_product_hidden', software_discovery.product_discovery_page('2do') is null;
