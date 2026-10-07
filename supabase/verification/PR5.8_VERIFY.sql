-- Read-only; run after PR5.8_APPLY.sql. All eight checks should be true.
select 'three_targets_draft' as check_name, count(*)=3 and bool_and(status='draft') as passed
from software_discovery.products where slug in ('things','omnifocus','2do')
union all
select 'three_scoped_alternatives', count(*)=3 and bool_and(c.verification_status='verified' and c.relationship_scope='personal-task-project-organization' and c.scope_description like '%No guarantee of team, platform or complete Todoist parity.%')
from software_discovery.product_anchors c join software_discovery.products p on p.id=c.product_id join software_discovery.anchors a on a.id=c.anchor_id
where p.slug in ('things','omnifocus','2do') and a.slug='todoist' and c.relationship_type='alternative'
union all
select 'twelve_reviewed_purchase_claims', count(*)=12 and bool_and(c.verification_status='verified')
from software_discovery.product_attributes c join software_discovery.products p on p.id=c.product_id join software_discovery.attributes a on a.id=c.attribute_id
where p.slug in ('things','omnifocus','2do') and a.slug in ('one-time-purchase','no-subscription','pricing-model','trade-off-summary')
union all
select 'six_purchase_flags_true', count(*)=6 and bool_and(c.value_boolean is true)
from software_discovery.product_attributes c join software_discovery.products p on p.id=c.product_id join software_discovery.attributes a on a.id=c.attribute_id
where p.slug in ('things','omnifocus','2do') and a.slug in ('one-time-purchase','no-subscription')
union all
select '2do_audience_remains_likely', count(*)=1 and bool_and(c.verification_status='likely')
from software_discovery.product_audiences c join software_discovery.products p on p.id=c.product_id join software_discovery.audiences a on a.id=c.audience_id
where p.slug='2do' and a.slug='productivity-users'
union all
select 'obsidian_still_published', count(*)=1 and bool_and(status='published') from software_discovery.products where slug='obsidian'
union all
select 'three_drafts_hidden_by_public_rpc', bool_and(software_discovery.product_discovery_page(slug) is null) from (values ('things'),('omnifocus'),('2do')) p(slug)
union all
select 'routes_remain_unpublished', count(*)=0 from software_discovery.escape_routes where status='published' or editorially_approved;
