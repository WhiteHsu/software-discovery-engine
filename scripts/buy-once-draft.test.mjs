import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildEscapeDraft} from './seed/build-escape-draft.mjs';
import {buildBuyOnceDraft} from './seed/build-buy-once-draft.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const baseline=()=>buildEscapeDraft(read('.seed-output/editorial-fit/reviewed-five-ecosystems.json'),read('seed/research/escape-content-2026-10-07.json'),read('seed/research/escape-candidates-2026-10-07.json'),read('seed/research/escape-draft-review-2026-10-07.json')).reviewed;
const review=()=>read('seed/research/escape-buy-once-review-2026-10-07.json');
test('eight scoped facts change only two draft products and never promote editorial relationships',()=>{
 const input=baseline(),before=JSON.stringify(input),result=buildBuyOnceDraft(input,review());
 assert.equal(JSON.stringify(input),before);assert.equal(result.pages.length,34);assert.equal(result.report.changes.length,8);
 for(const p of input.products){const after=result.bundle.products.find(x=>x.slug===p.slug);if(!['things','omnifocus'].includes(p.slug))assert.deepEqual(after,p);else {assert.deepEqual(after.anchors,p.anchors);assert.deepEqual(after.audiences,p.audiences);assert.equal(after.status,'draft');}}
 assert.deepEqual(result.bundle.escapeRoutes,input.escapeRoutes);
 assert.equal(result.report.routes.find(r=>r.slug==='todoist-alternatives-with-a-one-time-purchase').qualified,0);
 assert.equal(result.report.routes.find(r=>r.slug==='productivity-apps-you-can-buy-once').qualified,0);
});
test('source, scope, claim identity, values and baseline drift are rejected',()=>{
 for(const mutate of [r=>r.claims[0].url='https://example.com/',r=>r.claims[0].scope='',r=>r.claims[0].slug='ai-optional',r=>r.claims[0].value=false,r=>r.claims[0].before={value:true,verificationStatus:'verified'},r=>r.claims.push(r.claims[0]),r=>r.claims.pop()]){const r=review();mutate(r);assert.throws(()=>buildBuyOnceDraft(baseline(),r));}
});
test('publication approval and published input are rejected',()=>{
 const r=review();r.humanPublicationApproval=true;assert.throws(()=>buildBuyOnceDraft(baseline(),r));
 const b=baseline();b.products[0].status='published';assert.throws(()=>buildBuyOnceDraft(b,review()));
 const routes=baseline();routes.escapeRoutes[0].editoriallyApproved=true;assert.throws(()=>buildBuyOnceDraft(routes,review()));
});
