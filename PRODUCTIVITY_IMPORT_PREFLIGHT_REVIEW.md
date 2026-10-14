# PR5.37 — Task workflow import preflight

SELECT only. Run supabase/verification/PR5.37_PREFLIGHT.sql in Supabase SQL Editor and return the complete single snapshot value. Do not run previous apply scripts.

PR5.36 was pushed as e05972b; owner screenshots show green Production (55), the local draft route and three product pages. The owner restored the generated next-env.d.ts change and supplied an empty git status. Local browser screenshots confirm the three-candidate comparison and publication block; Visit/source destination checks were not separately provided.

The production checkpoint remains 15 products and six approved published routes. Things, OmniFocus and 2Do already have published identities from the earlier Todoist route; this preflight must capture their actual lifecycle and complete claims rather than reuse a draft-product baseline.

The snapshot includes full product rows, all four claim collections and typed evidence links, evidence fragments and sources, linked taxonomy definitions, the target route including every member, all other route memberships of these targets, exact published product/approved-route slug sets and the anonymous/private evidence boundary. It also captures any existing new workflow taxonomy or productivity seed-key collisions, including unattached fragments. Missing routes or claims return empty arrays; these are observed state, not fabricated identities.

Expected checkpoint is 15/6. The target route may be absent or an unapproved draft; the actual snapshot determines the next packet. Do not infer absence from a screenshot. Any unexpected approved/published route or new workflow claims require review before import. No route creation, publication, approval, claim replacement or lifecycle change occurs here.

Next: retain the full returned JSON as an immutable baseline, inspect drift and design a selective import of the reviewed 12 attributes with historical evidence retained. Preserve existing published product states, audience judgments, anchors and unrelated route memberships. Route publication remains a later explicit owner decision.
