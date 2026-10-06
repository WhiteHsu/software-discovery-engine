-- Read-only checks. All matches should be true after the PR4.1 migration.
begin;
set local role anon;
select 'function_available' as check_name,
  to_regprocedure('software_discovery.product_discovery_page(text)') is not null as matches
union all
select 'drafts_hidden',
  software_discovery.product_discovery_page('logseq') is null
union all
select 'missing_hidden',
  software_discovery.product_discovery_page('product-that-does-not-exist') is null
union all
select 'raw_evidence_private',
  not has_table_privilege(current_user, 'software_discovery.evidence_sources', 'SELECT')
  and not has_table_privilege(current_user, 'software_discovery.claim_evidence', 'SELECT') as matches;
rollback;
-- drafts_hidden uses the currently draft Logseq seed; after intentional publication,
-- test a different draft slug instead. This verification never publishes products.
