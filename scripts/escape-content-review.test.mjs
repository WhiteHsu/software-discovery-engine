import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildContentReview} from './escape-content-review.mjs';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const plan=JSON.parse(fs.readFileSync(path.join(root,'seed/research/escape-content-2026-10-07.json'),'utf8'));
const slugs=[...new Set(plan.routes.flatMap(r=>r.candidates))];
const pages=slugs.map(slug=>({slug,name:slug,status:'draft',websiteUrl:'https://example.com/',attributes:[],anchors:[],audiences:[],problems:[],routes:[]}));
const bundle={attributes:[...new Set(escapeDefinitions.flatMap(d=>d.constraints))].map(slug=>({slug})),anchors:escapeDefinitions.filter(d=>d.anchor).map(d=>({slug:d.anchor})),audiences:[{slug:'productivity-users'}]};
test('pending observations never create evidence, memberships or publication approval',()=>{
  const before=JSON.stringify({plan,bundle,pages});
  const report=buildContentReview(plan,bundle,pages);
  assert.equal(report.routes.length,10);assert.equal(report.observationsApplied,0);assert.equal(report.publicationApproved,false);
  assert.ok(report.routes.every(r=>r.qualifiedWithExistingEvidence===0));
  assert.equal(JSON.stringify({plan,bundle,pages}),before);
});
test('rejects publication flags, promoted observations and unsafe sources',()=>{
  for(const mutate of [p=>p.publicationApproved=true,p=>p.observations[0].reviewStatus='verified',p=>p.observations[0].sourceUrl='javascript:alert(1)',p=>p.observations[0].sourceUrl='https://user:secret@example.com/',p=>p.observations[0].checkedAt='2026-10-08']){
    const copy=structuredClone(plan);mutate(copy);assert.throws(()=>buildContentReview(copy,bundle,pages));
  }
});
test('rejects omitted routes, duplicate membership, unknown identities and missing rubrics',()=>{
  for(const mutate of [p=>p.routes.pop(),p=>p.routes[1].slug=p.routes[0].slug,p=>p.routes[0].candidates.push(p.routes[0].candidates[0]),p=>p.routes[0].candidates.push('invented-product'),p=>p.taxonomyProposals=[]]){
    const copy=structuredClone(plan);mutate(copy);
    const fixture=structuredClone(bundle);
    if(copy.taxonomyProposals.length===0)fixture.attributes=fixture.attributes.filter(t=>t.slug!=='one-time-purchase');
    assert.throws(()=>buildContentReview(copy,fixture,pages));
  }
});
