-- Read-only checks. All matches should be true after the PR4.1 migration.
begin;
select 'function_available' as check_name,
  to_regprocedure('software_discovery.product_discovery_page(text)') is not null as matches;
set local role anon;
select 'drafts_hidden' as check_name,
  software_discovery.product_discovery_page('obsidian') is null as matches;
select 'missing_hidden' as check_name,
  software_discovery.product_discovery_page('product-that-does-not-exist') is null as matches;
select 'raw_evidence_private' as check_name,
  not has_table_privilege(current_user, 'software_discovery.evidence_sources', 'SELECT')
  and not has_table_privilege(current_user, 'software_discovery.claim_evidence', 'SELECT') as matches;
rollback;
-- drafts_hidden uses the currently draft Obsidian seed; after intentional publication,
-- test a different draft slug instead. This verification never publishes products.
