-- Read-only after approved publication. Expect ten rows, all true.
select 'three_products_published' as check_name, count(*)=3 and bool_and(status='published') as passed
from software_discovery.products where slug in ('things','omnifocus','2do')
union all
select 'scoped_route_published_approved', count(*)=1 and bool_and(status='published' and editorially_approved and description like 'Personal task capture and project organization%')
from software_discovery.escape_routes where slug='todoist-alternatives-with-a-one-time-purchase'
union all
select 'three_exact_route_members',count(*)=3 and bool_and(p.slug in ('things','omnifocus','2do') and p.status='published' and m.novelty_score=0)
from software_discovery.escape_route_products m join software_discovery.products p on p.id=m.product_id join software_discovery.escape_routes r on r.id=m.escape_route_id where r.slug='todoist-alternatives-with-a-one-time-purchase'
union all
select 'three_verified_bounded_alternatives', count(*)=3 and bool_and(c.relationship_scope='personal-task-project-organization' and c.verification_status='verified' and c.confidence>=.8 and c.scope_description like '%No guarantee of team, platform or complete Todoist parity.%')
from software_discovery.product_anchors c join software_discovery.products p on p.id=c.product_id join software_discovery.anchors a on a.id=c.anchor_id where p.slug in ('things','omnifocus','2do') and a.slug='todoist' and c.relationship_type='alternative'
union all
select 'three_buy_once_flags', count(*)=3 and bool_and(c.value_boolean is true and c.verification_status='verified' and c.confidence>=.8)
from software_discovery.product_attributes c join software_discovery.products p on p.id=c.product_id join software_discovery.attributes a on a.id=c.attribute_id where p.slug in ('things','omnifocus','2do') and a.slug='one-time-purchase'
union all
select 'six_sourced_pricing_limit_claims', count(*)=6 and bool_and(c.verification_status='verified' and c.confidence>=.8 and length(btrim(c.value_text))>0 and exists(select 1 from software_discovery.product_attribute_evidence e where e.product_id=c.product_id and e.attribute_id=c.attribute_id))
from software_discovery.product_attributes c join software_discovery.products p on p.id=c.product_id join software_discovery.attributes a on a.id=c.attribute_id where p.slug in ('things','omnifocus','2do') and a.slug in ('pricing-model','trade-off-summary')
union all
select 'three_public_rpc_pages', bool_and(software_discovery.product_discovery_page(slug)->>'status'='published') from (values ('things'),('omnifocus'),('2do')) p(slug)
union all
select 'obsidian_still_published', count(*)=1 and bool_and(status='published') from software_discovery.products where slug='obsidian'
union all
select 'other_routes_unpublished', count(*)=0 from software_discovery.escape_routes where slug<>'todoist-alternatives-with-a-one-time-purchase' and (status='published' or editorially_approved)
union all
select 'anon_rpc_private_evidence_boundary', has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') and not has_table_privilege('anon','software_discovery.claim_evidence','SELECT');
