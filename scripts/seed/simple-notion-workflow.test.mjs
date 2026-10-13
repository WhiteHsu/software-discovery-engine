import test from 'node:test';
import assert from 'node:assert/strict';
import {simpleNotionInputs,buildSimpleNotionWorkflow} from './build-simple-notion-workflow.mjs';
import {escapeDefinitions,evaluateCandidate,publishable} from '../../lib/discovery/escape-model.ts';
const targets=['joplin','obsidian','simplenote'];
test('three scoped drafts qualify and remain behind publication gate',()=>{
 const {baseline,review}=simpleNotionInputs(),copy=structuredClone(baseline),r=buildSimpleNotionWorkflow(baseline,review);
 assert.deepEqual(baseline,copy);assert.equal(r.bundle.products.length,35);assert.equal(r.report.attributeUpdates,17);assert.equal(r.report.qualifiedDraftCandidates,3);assert.equal(r.report.publishable,false);
 const route=r.bundle.escapeRoutes.find(r=>r.slug==='simple-notion-alternatives');assert.deepEqual(route.products.map(m=>m.productSlug),targets);assert.ok(route.products.every(m=>m.noveltyScore===0));assert.equal(route.editoriallyApproved,false);
 const candidates=targets.map(slug=>evaluateCandidate(escapeDefinitions[2],{product:r.pages.find(p=>p.slug===slug)}));assert.ok(candidates.every(c=>c.eligible));assert.equal(publishable({published:true,candidates}),false);
 const simplenote=r.pages.find(p=>p.slug==='simplenote');assert.equal(simplenote.attributes.find(a=>a.slug==='no-account-required').value,false);assert.match(simplenote.attributes.find(a=>a.slug==='trade-off-summary').value,/not encrypted at rest/);
});
test('selection change preserves Logseq, unrelated graph and historical evidence',()=>{
 const {baseline,review}=simpleNotionInputs(),r=buildSimpleNotionWorkflow(baseline,review);
 for(const p of baseline.products){const next=r.bundle.products.find(x=>x.slug===p.slug);if(!targets.includes(p.slug)){assert.deepEqual(next,p);continue;}
  for(const kind of ['problems','audiences'])assert.deepEqual(next[kind],p[kind]);
  for(const a of p.attributes){const n=next.attributes.find(x=>x.slug===a.slug);if(!review.candidates.find(c=>c.slug===p.slug).attributes.some(x=>x.slug===a.slug))assert.deepEqual(n,a);else for(const key of a.evidence)assert.ok(n.evidence.includes(key));}
  for(const a of p.anchors)for(const key of a.evidence)assert.ok(next.anchors.find(x=>x.slug===a.slug&&x.relationshipType===a.relationshipType).evidence.includes(key));
 }
 for(const route of baseline.escapeRoutes.filter(r=>r.slug!=='simple-notion-alternatives'))assert.deepEqual(r.bundle.escapeRoutes.find(x=>x.slug===route.slug),route);
 for(const source of baseline.sources)assert.deepEqual(r.bundle.sources.find(s=>s.key===source.key),source);
 for(const kind of ['attributes','anchors','problems','audiences'])assert.deepEqual(r.bundle[kind],baseline[kind]);
});
test('scope and required facts cannot be rescued by publication or novelty',()=>{
 const {baseline,review}=simpleNotionInputs(),r=buildSimpleNotionWorkflow(baseline,review),p=r.pages.find(p=>p.slug==='simplenote');
 for(const mutate of [p=>delete p.anchors[0].scope,p=>p.anchors[0].scope='personal-offline-note-object-organization',p=>p.anchors[0].description='',p=>p.attributes.find(a=>a.slug==='minimal-setup').value=null,p=>p.attributes.find(a=>a.slug==='focused-note-taking').verificationStatus='unknown']){
  const bad=structuredClone(p);mutate(bad);bad.status='published';assert.equal(evaluateCandidate(escapeDefinitions[2],{product:bad,noveltyScore:1}).eligible,false);
 }
});
test('pinned review and input reject scope, identity, selection, approval and prior-claim drift',()=>{
 const {baseline,review}=simpleNotionInputs();
 for(const mutate of [r=>r.scope='full-notion-replacement',r=>r.publicationApproved=true,r=>r.candidates[2].slug='logseq',r=>r.sources[0].url='https://example.com/',r=>r.candidates[2].attributes[2].value=false]){const bad=structuredClone(review);mutate(bad);assert.throws(()=>buildSimpleNotionWorkflow(baseline,bad));}
 const bad=structuredClone(baseline);bad.products[0].status='published';assert.throws(()=>buildSimpleNotionWorkflow(bad,review));
 assert.throws(()=>buildSimpleNotionWorkflow(buildSimpleNotionWorkflow(baseline,review).bundle,review));
});
