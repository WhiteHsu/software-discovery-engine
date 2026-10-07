import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildEscapeDraft} from './seed/build-escape-draft.mjs';
import {buildBuyOnceDraft} from './seed/build-buy-once-draft.mjs';
import {buildTodoistWorkflow} from './seed/build-todoist-workflow.mjs';
import {escapeDefinitions,evaluateCandidate,publishable} from '../lib/discovery/escape-model.ts';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const review=()=>read('seed/research/todoist-workflow-review-2026-10-07.json');
const baseline=()=>buildBuyOnceDraft(buildEscapeDraft(read('.seed-output/editorial-fit/reviewed-five-ecosystems.json'),read('seed/research/escape-content-2026-10-07.json'),read('seed/research/escape-candidates-2026-10-07.json'),read('seed/research/escape-draft-review-2026-10-07.json')).reviewed,read('seed/research/escape-buy-once-review-2026-10-07.json')).bundle;
test('three bounded draft alternatives qualify without publication or audience promotion',()=>{
 const input=baseline(),before=JSON.stringify(input),result=buildTodoistWorkflow(input,review());assert.equal(JSON.stringify(input),before);
 assert.equal(result.report.qualifiedDraftCandidates,3);assert.equal(result.report.qualifiedPublishedCandidates,0);assert.equal(result.report.publishable,false);
 for(const p of input.products){const after=result.bundle.products.find(x=>x.slug===p.slug);if(!['things','omnifocus','2do'].includes(p.slug))assert.deepEqual(after,p);else {assert.deepEqual(after.attributes,p.attributes);assert.deepEqual(after.audiences,p.audiences);assert.equal(after.status,'draft');}}
 for(const r of result.bundle.escapeRoutes){assert.equal(r.editoriallyApproved,false);assert.equal(r.status,'draft');}
 assert.ok(result.pages.filter(p=>['things','omnifocus','2do'].includes(p.slug)).every(p=>p.anchors.find(a=>a.slug==='todoist').description.includes('No guarantee')));
});
test('scope cannot be missing or widened even with high confidence and novelty',()=>{
 const result=buildTodoistWorkflow(baseline(),review()),def=escapeDefinitions[3];
 for(const value of [undefined,'full-replacement','team-collaboration']){const p=structuredClone(result.pages.find(p=>p.slug==='2do'));p.anchors[0].scope=value;p.anchors[0].confidence=1;assert.equal(evaluateCandidate(def,{product:p,noveltyScore:1}).eligible,false);}
});
test('review rejects scope, evidence, approval, identity and prior-claim drift',()=>{
 for(const mutate of [r=>r.scope='team-collaboration',r=>r.publicationApproved=true,r=>r.anchorSource.url='https://example.com/',r=>r.candidates[0].url='javascript:bad',r=>r.candidates[0].limits='',r=>r.candidates[0].beforeSha256='bad',r=>r.candidates.push(r.candidates[0]),r=>r.candidates.pop()]){const r=review();mutate(r);assert.throws(()=>buildTodoistWorkflow(baseline(),r));}
 const input=baseline();input.products[0].status='published';assert.throws(()=>buildTodoistWorkflow(input,review()));
});
test('three qualified drafts still cannot pass the public publication gate',()=>{
 const r=buildTodoistWorkflow(baseline(),review());const candidates=r.pages.filter(p=>['things','omnifocus','2do'].includes(p.slug)).map(product=>evaluateCandidate(escapeDefinitions[3],{product}));
 assert.equal(publishable({published:true,candidates}),false);assert.equal(publishable({published:false,candidates}),false);
});
