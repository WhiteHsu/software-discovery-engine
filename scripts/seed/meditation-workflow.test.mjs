import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {meditationInputs,buildMeditationWorkflow,meditationScope} from './build-meditation-workflow.mjs';
import {escapeDefinitions,evaluateCandidate,publishable} from '../../lib/discovery/escape-model.ts';
import {historicalInputMatches} from './historical-review-input.mjs';
const def=escapeDefinitions.find(d=>d.slug==='meditation-apps-without-a-subscription');
const build=()=>{const i=meditationInputs();return {...buildMeditationWorkflow(i.baseline,i.review),baseline:i.baseline,review:i.review};};
const selected=['medito','smiling-mind','healthy-minds-program'];
test('three scoped Android workflow drafts qualify without publication or membership changes',()=>{
 const r=build();assert.equal(def.relationshipScope,meditationScope);assert.equal(r.report.qualifiedDraftCandidates,3);assert.equal(r.report.qualifiedPublishedCandidates,0);assert.equal(r.report.publishable,false);
 assert.deepEqual(r.bundle.attributes,r.baseline.attributes);assert.equal(r.bundle.products.length,r.baseline.products.length);
 for(const p of r.baseline.products){const actual=r.bundle.products.find(x=>x.slug===p.slug);assert.equal(actual.status,'draft');assert.deepEqual(actual.audiences,p.audiences);assert.deepEqual(actual.problems,p.problems);
  if(!selected.includes(p.slug))assert.deepEqual(actual,p);else{for(const c of p.attributes)assert.ok(c.evidence.every(e=>actual.attributes.find(x=>x.slug===c.slug).evidence.includes(e)));for(const c of p.anchors)if(c.slug!=='calm')assert.ok(actual.anchors.some(x=>JSON.stringify(x)===JSON.stringify(c)));}
 }
 for(const route of r.baseline.escapeRoutes){const actual=r.bundle.escapeRoutes.find(x=>x.slug===route.slug);assert.deepEqual(actual.products,route.products);assert.equal(actual.status,'draft');assert.equal(actual.editoriallyApproved,false);if(route.slug!==def.slug)assert.deepEqual(actual,route);}
 assert.equal(publishable({published:true,candidates:r.pages.filter(p=>selected.includes(p.slug)).map(product=>evaluateCandidate(def,{product}))}),false);
});
test('generic, missing or wrong meditation scopes and empty descriptions fail closed',()=>{
 const p=build().pages.find(x=>x.slug==='medito');for(const scope of [undefined,null,'all-meditation','sleep-stories']){const x=structuredClone(p);x.anchors.find(a=>a.slug==='calm').scope=scope;assert.equal(evaluateCandidate(def,{product:x,noveltyScore:1}).eligible,false);}
 for(const description of [undefined,null,'','   ']){const x=structuredClone(p);x.anchors.find(a=>a.slug==='calm').description=description;assert.equal(evaluateCandidate(def,{product:x}).eligible,false);}
});
test('each required relationship and payment/trade-off claim independently needs dated reliable evidence',()=>{
 for(const slug of selected){const p=build().pages.find(x=>x.slug===slug);for(const field of ['anchor','no-subscription','pricing-model','trade-off-summary'])for(const mutate of [c=>c.sources=[],c=>c.verificationStatus='likely',c=>c.lastVerifiedAt='invalid',c=>c.confidence=.79]){const x=structuredClone(p),c=field==='anchor'?x.anchors.find(a=>a.slug==='calm'):x.attributes.find(a=>a.slug===field);mutate(c);assert.equal(evaluateCandidate(def,{product:x,noveltyScore:1}).eligible,false);}
 const x=structuredClone(p);x.attributes.find(a=>a.slug==='no-subscription').value=false;assert.equal(evaluateCandidate(def,{product:x}).eligible,false);}
});
test('review and baseline mutation cannot manufacture qualification or approval',()=>{
 const i=meditationInputs();for(const change of [r=>r.publicationApproved=true,r=>r.scope='all-content',r=>r.candidates[0].confidence=1,r=>r.sources[0].url='https://example.com']){const r=structuredClone(i.review);change(r);assert.throws(()=>buildMeditationWorkflow(i.baseline,r));}
 const b=structuredClone(i.baseline);b.products[0].status='published';assert.throws(()=>buildMeditationWorkflow(b,i.review));
});
test('historical engine transition accepts only two exact versions, keeps LF/CRLF portable and rejects content drift',()=>{
 const r=build().review,t=r.engineTransition,temp=fs.mkdtempSync(path.join(os.tmpdir(),'meditation-input-'));
 try{const target=path.join(temp,t.path);fs.mkdirSync(path.dirname(target),{recursive:true});const current=fs.readFileSync(new URL('../../lib/discovery/escape-model.ts',import.meta.url),'utf8');
 for(const text of [current.replace(/\r\n/g,'\n'),current.replace(/\r?\n/g,'\r\n')]){fs.writeFileSync(target,text);assert.equal(historicalInputMatches(temp,t.path,t.oldNormalizedSha256),true);}
 fs.writeFileSync(target,current+'\nCONTENT_DRIFT');assert.equal(historicalInputMatches(temp,t.path,t.oldNormalizedSha256),false);
 fs.writeFileSync(path.join(temp,'record.txt'),'evidence');assert.equal(historicalInputMatches(temp,'record.txt',t.oldNormalizedSha256),false);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
