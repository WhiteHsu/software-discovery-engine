-- Correct two displayed source titles for Insight Timer's Calm comparison.
update software_discovery.evidence_sources as source
set title = correction.new_title,
    updated_at = now()
from (values
  ('Insight Timer �X account-based browser selection and playback', 'Insight Timer — account-based browser selection and playback',
   'https://help.insighttimer.com/support/solutions/articles/67000664998-can-guided-meditations-be-played-from-a-desktop-or-laptop-'),
  ('Calm �X guided meditation discovery baseline', 'Calm — guided meditation discovery baseline',
   'https://support.calm.com/hc/en-us/articles/115002474567-Getting-Started-With-Calm-A-Beginner-s-Guide-to-Meditation-Sleep')
) as correction(old_title, new_title, url)
where source.title = correction.old_title
  and source.url = correction.url
  and exists (
    select 1
    from software_discovery.claim_evidence as evidence
    join software_discovery.product_anchor_evidence as link on link.claim_evidence_id = evidence.id
    join software_discovery.products as product on product.id = link.product_id
    join software_discovery.anchors as anchor on anchor.id = link.anchor_id
    where evidence.evidence_source_id = source.id
      and product.slug = 'insight-timer'
      and anchor.slug = 'calm'
      and link.relationship_type = 'alternative'
  );
