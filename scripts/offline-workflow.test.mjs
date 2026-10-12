import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {offlineWorkflowBaseline,buildOfflineWorkflow} from './seed/build-offline-workflow.mjs';
import {escapeDefinitions,evaluateCandidate,publishable,rankCandidates} from '../lib/discovery/escape-model.ts';
const review=()=>JSON.parse(fs.readFileSync(new URL('../seed/research/offline-workflow-review-2026-10-08.json',import.meta.url),'utf8'));
const result=()=>buildOfflineWorkflow(offlineWorkflowBaseline().bundle,review());

test('offline review preserves other products, claims, memberships and lifecycle while three scoped drafts qualify',()=>{
 const b=offlineWorkflowBaseline().bundle,before=JSON.stringify(b),r=buildOfflineWorkflow(b,review());
 assert.equal(JSON.stringify(b),before);assert.equal(r.report.qualifiedDraftCandidates,3);assert.equal(r.report.publishable,false);
 assert.deepEqual(r.report.candidates.filter(c=>c.eligible).map(c=>c.slug),['affine','anytype','appflowy']);
 for(const p of b.products){const after=r.bundle.products.find(q=>q.slug===p.slug);if(!['affine','appflowy'].includes(p.slug)){assert.deepEqual(after,p);continue;}
  assert.deepEqual(after.audiences,p.audiences);assert.deepEqual(after.problems,p.problems);assert.equal(after.status,'draft');
  for(const old of p.attributes){const updated=after.attributes.find(a=>a.slug===old.slug);if(!['works-offline','pricing-model','trade-off-summary'].includes(old.slug))assert.deepEqual(updated,old);else for(const key of old.evidence)assert.ok(updated.evidence.includes(key));}
  const anchor=after.anchors.find(a=>a.slug==='notion');assert.equal(anchor.scope,review().scope);for(const key of p.anchors.find(a=>a.slug==='notion').evidence)assert.ok(anchor.evidence.includes(key));
 }
 for(const route of b.escapeRoutes){const after=r.bundle.escapeRoutes.find(a=>a.slug===route.slug);assert.equal(after.status,'draft');assert.equal(after.editoriallyApproved,false);if(route.slug!=='offline-notion-alternatives')assert.deepEqual(after,route);else assert.deepEqual(after.products.map(m=>m.productSlug),route.products.map(m=>m.productSlug));}
});
test('missing, broadened or undescribed offline scope is rejected despite high confidence and novelty',()=>{
 const r=result();for(const slug of ['affine','appflowy','anytype'])for(const patch of [{scope:null},{scope:'all-notion-features'},{description:''},{description:null}]){
  const p=structuredClone(r.pages.find(p=>p.slug===slug)),a=p.anchors.find(a=>a.slug==='notion');Object.assign(a,patch,{confidence:1});assert.equal(evaluateCandidate(escapeDefinitions[0],{product:p,noveltyScore:1}).eligible,false);
 }
 const candidates=rankCandidates(escapeDefinitions[0],r.pages.filter(p=>['affine','appflowy','anytype'].includes(p.slug)).map(product=>({product})));assert.equal(publishable({published:true,candidates}),false);
});
test('review, source, target, route and published graph drift abort rather than overwrite',()=>{
 for(const mutate of [r=>r.publicationApproved=true,r=>r.candidates[0].scopeDescription='Everything',r=>r.sources[0].url='https://example.com/',r=>r.candidates[1].tradeoff='All Cloud content is offline']){const v=review();mutate(v);assert.throws(()=>buildOfflineWorkflow(offlineWorkflowBaseline().bundle,v),/review drift/);}
 for(const mutate of [b=>b.products.find(p=>p.slug==='affine').attributes[0].confidence=.8,b=>b.products.find(p=>p.slug==='anytype').description='Changed',b=>b.escapeRoutes[0].description='Changed',b=>b.products.find(p=>p.slug==='obsidian').status='published']){const b=offlineWorkflowBaseline().bundle;mutate(b);assert.throws(()=>buildOfflineWorkflow(b,review()));}
 assert.throws(()=>buildOfflineWorkflow(result().bundle,review()),/baseline drift/);
});
test('reconstructing the workflow twice is deterministic and leaves Todoist eligibility intact',()=>{
 const a=result(),b=result();assert.deepEqual(a,b);
 const tasks=rankCandidates(escapeDefinitions[3],a.pages.filter(p=>['things','omnifocus','2do'].includes(p.slug)).map(product=>({product})));assert.equal(tasks.filter(c=>c.eligible).length,3);
 assert.equal(evaluateCandidate(escapeDefinitions[1],{product:a.pages.find(p=>p.slug==='anytype')}).eligible,false);
 assert.equal(evaluateCandidate(escapeDefinitions[2],{product:a.pages.find(p=>p.slug==='anytype')}).eligible,false);
});
