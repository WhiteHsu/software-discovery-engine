import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {rasterWorkflowBaseline,buildRasterWorkflow} from './seed/build-raster-workflow.mjs';
import {escapeDefinitions,evaluateCandidate,rankCandidates,publishable} from '../lib/discovery/escape-model.ts';
const review=()=>JSON.parse(fs.readFileSync(new URL('../seed/research/raster-workflow-review-2026-10-12.json',import.meta.url),'utf8'));
const result=()=>buildRasterWorkflow(rasterWorkflowBaseline().bundle,review());

test('three scoped raster drafts qualify while unrelated products, routes and prior evidence remain intact',()=>{
 const input=rasterWorkflowBaseline().bundle,before=structuredClone(input),r=buildRasterWorkflow(input,review());assert.deepEqual(input,before);
 assert.equal(r.pages.length,34);assert.equal(r.report.qualifiedDraftCandidates,3);assert.equal(r.report.attributeUpdates,12);assert.equal(r.report.relationshipUpdates,3);
 assert.deepEqual(r.report.candidates.map(c=>c.slug),['gimp','krita','paint-net']);
 for(const old of input.products){const p=r.bundle.products.find(p=>p.slug===old.slug);if(!['gimp','krita','paint-net'].includes(p.slug)){assert.deepEqual(p,old);continue;}
  assert.equal(p.status,'draft');assert.deepEqual(p.problems,old.problems);assert.deepEqual(p.audiences,old.audiences);
  for(const a of old.attributes){const updated=p.attributes.find(c=>c.slug===a.slug);if(!['no-subscription','pricing-model','trade-off-summary','supported-platforms'].includes(a.slug))assert.deepEqual(updated,a);else for(const key of a.evidence)assert.ok(updated.evidence.includes(key));}
  for(const a of old.anchors){const updated=p.anchors.find(c=>c.slug===a.slug);if(a.slug!=='photoshop')assert.deepEqual(updated,a);else{assert.equal(updated.scope,review().scope);for(const key of a.evidence)assert.ok(updated.evidence.includes(key));}}
 }
 for(const old of input.escapeRoutes){const r2=r.bundle.escapeRoutes.find(r=>r.slug===old.slug);if(old.slug!==escapeDefinitions[6].slug)assert.deepEqual(r2,old);else{assert.equal(r2.editoriallyApproved,false);assert.deepEqual(r2.products.map(p=>p.productSlug),old.products.map(p=>p.productSlug));assert.ok(r2.products.every(p=>p.noveltyScore===0));}}
});
test('missing, widened or undescribed raster scope and unsupported constraints cannot qualify',()=>{
 const r=result();for(const slug of ['gimp','krita','paint-net']){
  for(const patch of [{scope:null},{scope:'all-photoshop-features'},{description:''},{description:null}]){const p=structuredClone(r.pages.find(p=>p.slug===slug));Object.assign(p.anchors.find(a=>a.slug==='photoshop'),patch,{confidence:1});assert.equal(evaluateCandidate(escapeDefinitions[6],{product:p,noveltyScore:1}).eligible,false);}
  for(const patch of [{value:false},{verificationStatus:'likely'},{sources:[{title:'unsafe',url:'javascript:alert(1)',retrievedAt:review().date}]}]){const p=structuredClone(r.pages.find(p=>p.slug===slug));Object.assign(p.attributes.find(a=>a.slug==='no-subscription'),patch);assert.equal(evaluateCandidate(escapeDefinitions[6],{product:p,noveltyScore:1}).eligible,false);}
 }
});
test('manifest, target baseline, route and published graph drift abort without mutation',()=>{
 for(const mutate of [r=>r.publicationApproved=true,r=>r.scope='all-photoshop-features',r=>r.sources[0].url='https://example.com',r=>r.candidates[0].pricing='Lifetime paid license']){const v=review();mutate(v);assert.throws(()=>buildRasterWorkflow(rasterWorkflowBaseline().bundle,v),/review drift/);}
 for(const mutate of [b=>b.products.find(p=>p.slug==='gimp').attributes[0].confidence=.9,b=>b.escapeRoutes.find(r=>r.slug===escapeDefinitions[6].slug).description='Changed',b=>b.products.find(p=>p.slug==='obsidian').status='published']){const b=rasterWorkflowBaseline().bundle;mutate(b);const snapshot=structuredClone(b);assert.throws(()=>buildRasterWorkflow(b,review()));assert.deepEqual(b,snapshot);}
 assert.throws(()=>buildRasterWorkflow(result().bundle,review()),/baseline drift/);
});
test('fresh reconstruction is deterministic, preserves earlier qualification and cannot publish drafts',()=>{
 const r=result();assert.deepEqual(result(),r);assert.equal(r.report.publishable,false);assert.equal(r.report.qualifiedPublishedCandidates,0);assert.ok(r.bundle.products.every(p=>p.status==='draft'));
 for(const index of [0,3,6]){const route=r.bundle.escapeRoutes.find(route=>route.slug===escapeDefinitions[index].slug);const candidates=rankCandidates(escapeDefinitions[index],route.products.map(m=>({product:r.pages.find(p=>p.slug===m.productSlug)})));assert.equal(candidates.filter(c=>c.eligible).length,3);assert.equal(publishable({published:true,candidates}),false);}
});
