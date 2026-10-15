import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {writingInputs,buildWritingWorkflow,writingScope} from './build-writing-passive-workflow.mjs';
import {escapeDefinitions,evaluateCandidate,publishable} from '../../lib/discovery/escape-model.ts';
import {historicalInputMatches} from './historical-review-input.mjs';
const def=escapeDefinitions.find(d=>d.slug==='grammarly-alternatives-without-a-subscription');
const privacy=escapeDefinitions.find(d=>d.slug==='privacy-friendly-grammarly-alternatives');
const build=()=>{const i=writingInputs();return {...buildWritingWorkflow(i.baseline,i.review),baseline:i.baseline,review:i.review};};

test('three distinct edition drafts qualify while Classic, old memberships and publication remain unchanged',()=>{
 const r=build();assert.equal(def.relationshipScope,writingScope);
 assert.equal(r.report.qualifiedDraftCandidates,3);assert.equal(r.report.qualifiedPublishedCandidates,0);assert.equal(r.report.publishable,false);
 assert.equal(r.bundle.products.length,r.baseline.products.length+3);
 for(const p of r.baseline.products)assert.deepEqual(r.bundle.products.find(x=>x.slug===p.slug),p);
 for(const k of ['attributes','anchors','problems','audiences'])assert.deepEqual(r.bundle[k],r.baseline[k]);
 for(const route of r.baseline.escapeRoutes){const actual=r.bundle.escapeRoutes.find(x=>x.slug===route.slug);assert.equal(actual.status,'draft');assert.equal(actual.editoriallyApproved,false);
  if(route.slug===def.slug)assert.deepEqual(actual.products.slice(0,route.products.length),route.products);else assert.deepEqual(actual,route);
 }
 for(const c of r.review.candidates){const p=r.pages.find(p=>p.slug===c.slug);assert.equal(evaluateCandidate(def,{product:p}).eligible,true);assert.equal(evaluateCandidate(privacy,{product:p}).eligible,false);assert.equal(publishable({published:true,candidates:[evaluateCandidate(def,{product:p})]}),false);}
 assert.equal('relationshipScope' in privacy,false);
});

test('generic, wrong or missing scope and blank reviewed-edition descriptions fail despite novelty',()=>{
 const r=build();for(const c of r.review.candidates){const p=r.pages.find(p=>p.slug===c.slug);
  for(const scope of [undefined,null,'full-grammar-replacement','spelling-only']){const x=structuredClone(p);x.anchors[0].scope=scope;assert.equal(evaluateCandidate(def,{product:x,noveltyScore:1}).eligible,false);}
  for(const description of [undefined,null,'','   ']){const x=structuredClone(p);x.anchors[0].description=description;assert.equal(evaluateCandidate(def,{product:x}).eligible,false);}
 }
});

test('relationship, payment, pricing and trade-offs each require dated reliable evidence',()=>{
 const r=build();for(const selected of r.review.candidates){const p=r.pages.find(p=>p.slug===selected.slug);
  for(const field of ['anchor','no-subscription','pricing-model','trade-off-summary'])for(const change of [c=>c.sources=[],c=>c.verificationStatus='likely',c=>c.lastVerifiedAt='invalid',c=>c.confidence=.79]){
   const x=structuredClone(p),claim=field==='anchor'?x.anchors[0]:x.attributes.find(c=>c.slug===field);change(claim);assert.equal(evaluateCandidate(def,{product:x,noveltyScore:1}).eligible,false);
  }
  const x=structuredClone(p);x.attributes.find(c=>c.slug==='no-subscription').value=false;assert.equal(evaluateCandidate(def,{product:x}).eligible,false);
 }
});

test('review, source, identity, approval and baseline mutations cannot manufacture qualification',()=>{
 const i=writingInputs();for(const change of [r=>r.publicationApproved=true,r=>r.candidates[0].slug='hemingway-classic',r=>r.candidates[2].pricingModel='Unlimited everything',r=>r.sources[0].url='https://example.com',r=>r.candidates[0].confidence=1]){const r=structuredClone(i.review);change(r);assert.throws(()=>buildWritingWorkflow(i.baseline,r));}
 const b=structuredClone(i.baseline);b.products[0].status='published';assert.throws(()=>buildWritingWorkflow(b,i.review));
});

test('explicit engine compatibility is line-ending portable and rejects unknown engine or record bytes',()=>{
 const r=build().review,temp=fs.mkdtempSync(path.join(os.tmpdir(),'writing-input-'));
 try{const target=path.join(temp,r.engineTransition.path);fs.mkdirSync(path.dirname(target),{recursive:true});const current=fs.readFileSync(new URL('../../lib/discovery/escape-model.ts',import.meta.url),'utf8');
  for(const text of [current.replace(/\r\n/g,'\n'),current.replace(/\r?\n/g,'\r\n')]){fs.writeFileSync(target,text);for(const expected of [r.engineTransition.oldNormalizedSha256,r.engineTransition.newNormalizedSha256,'61829cd748ca679821ab6371d108d9e614fa31980fc333eeceaa390ee1eaee0e'])assert.equal(historicalInputMatches(temp,r.engineTransition.path,expected),true);}
  fs.writeFileSync(target,current+'\nDRIFT');assert.equal(historicalInputMatches(temp,r.engineTransition.path,r.engineTransition.oldNormalizedSha256),false);
  fs.writeFileSync(path.join(temp,'record.txt'),'unchanged');assert.equal(historicalInputMatches(temp,'record.txt',r.engineTransition.oldNormalizedSha256),false);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
