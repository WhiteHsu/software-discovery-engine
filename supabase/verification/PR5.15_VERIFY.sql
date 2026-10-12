-- Read-only after PR5.15_APPLY.sql. All ten checks should be true.
select 'three_raster_targets_draft' as check_name, count(*)=3 and bool_and(status='draft') as passed from software_discovery.products where slug in ('gimp','krita','paint-net')
union all
select 'three_bounded_photoshop_alternatives',count(*)=3 and bool_and(c.verification_status='verified' and c.relationship_scope='desktop-raster-layers-painting-basic-adjustment' and length(btrim(c.scope_description))>0 and c.last_verified_at='2026-10-12T00:00:00Z')
from software_discovery.product_anchors c join software_discovery.products p on p.id=c.product_id join software_discovery.anchors a on a.id=c.anchor_id where p.slug in ('gimp','krita','paint-net') and a.slug='photoshop' and c.relationship_type='alternative'
union all
select 'twelve_reviewed_raster_attributes',count(*)=12 and bool_and(c.verification_status='verified' and c.last_verified_at='2026-10-12T00:00:00Z')
from software_discovery.product_attributes c join software_discovery.products p on p.id=c.product_id join software_discovery.attributes a on a.id=c.attribute_id where p.slug in ('gimp','krita','paint-net') and a.slug in ('no-subscription','pricing-model','trade-off-summary','supported-platforms')
union all
select 'three_raster_flags_true',count(*)=3 and bool_and(c.value_boolean is true) from software_discovery.product_attributes c join software_discovery.products p on p.id=c.product_id join software_discovery.attributes a on a.id=c.attribute_id where p.slug in ('gimp','krita','paint-net') and a.slug='no-subscription'
union all
select 'fifteen_claims_have_dated_sources',count(*)=15 and bool_and(sourced) from (
 select exists(select 1 from software_discovery.product_attribute_evidence l join software_discovery.claim_evidence f on f.id=l.claim_evidence_id join software_discovery.evidence_sources s on s.id=f.evidence_source_id where l.product_id=c.product_id and l.attribute_id=c.attribute_id and s.retrieved_at='2026-10-12T00:00:00Z' and s.url like 'https://%') sourced from software_discovery.product_attributes c join software_discovery.products p on p.id=c.product_id join software_discovery.attributes a on a.id=c.attribute_id where p.slug in ('gimp','krita','paint-net') and a.slug in ('no-subscription','pricing-model','trade-off-summary','supported-platforms')
 union all
 select exists(select 1 from software_discovery.product_anchor_evidence l join software_discovery.claim_evidence f on f.id=l.claim_evidence_id join software_discovery.evidence_sources s on s.id=f.evidence_source_id where l.product_id=c.product_id and l.anchor_id=c.anchor_id and l.relationship_type=c.relationship_type and s.retrieved_at='2026-10-12T00:00:00Z' and s.url like 'https://%') from software_discovery.product_anchors c join software_discovery.products p on p.id=c.product_id join software_discovery.anchors a on a.id=c.anchor_id where p.slug in ('gimp','krita','paint-net') and a.slug='photoshop' and c.relationship_type='alternative'
) checks
union all
select 'seven_existing_products_published',count(*)=7 and bool_and(status='published') from software_discovery.products where slug in ('obsidian','things','omnifocus','2do','affine','appflowy','anytype')
union all
select 'two_existing_routes_published_approved',count(*)=2 and bool_and(status='published' and editorially_approved) from software_discovery.escape_routes where slug in ('todoist-alternatives-with-a-one-time-purchase','offline-notion-alternatives')
union all
select 'three_raster_drafts_hidden_by_rpc',bool_and(software_discovery.product_discovery_page(slug) is null) from (values ('gimp'),('krita'),('paint-net')) p(slug)
union all
select 'raster_route_unpublished',count(*)=0 from software_discovery.escape_routes where slug='photoshop-alternatives-without-a-subscription' and (status='published' or editorially_approved)
union all
select 'anon_rpc_private_evidence_boundary',has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') and not has_table_privilege('anon','software_discovery.claim_evidence','SELECT');
