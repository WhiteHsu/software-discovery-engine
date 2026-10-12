import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {notionAiPublicationInputs,buildNotionAiPublication} from './build-notion-ai-publication.mjs';
const inputs=()=>{const a=notionAiPublicationInputs();return [a.baseline,a.reviewed,a.review,a.publicationReview];};
test('no-required-AI publication requires three published candidates and writes only one route',()=>{
 const a=inputs(),old=JSON.stringify(a),r=buildNotionAiPublication(...a);assert.equal(JSON.stringify(a),old);
 assert.equal(r.report.qualifiedPublishedCandidates,3);assert.equal(r.report.productWrites,0);assert.equal(r.report.publicationDecision,'pending');
 assert.ok(r.bundle.products.every(p=>p.status==='published'));assert.ok(!r.sql.includes('UPDATE software_discovery.products'));
 assert.ok(r.sql.includes('PR5.20 reviewed membership missing'));assert.ok(r.sql.includes('PR5.20 baseline member drift'));
 const review=a[3];assert.ok(review.route.description.includes('AI-free interface promise'));assert.ok(review.route.products.every(m=>m.noveltyScore===0));
});
test('publication rejects approval, scope, source, identity and prior-claim drift',()=>{
 for(const mutate of [a=>a[3].publicationDecision='approved',a=>a[3].route.products[0].noveltyScore=1,a=>a[3].route.description='All features without AI',a=>a[1].products.find(p=>p.slug==='anytype').attributes.find(c=>c.slug==='ai-optional').verificationStatus='unknown',a=>a[2].sources[0].url='https://example.com',a=>a[0].products[0].name='drift']){const a=inputs();mutate(a);assert.throws(()=>buildNotionAiPublication(...a));}
});
test('publication ships deterministic guarded rehearsal and apply-after-approval SQL',()=>{
 const a=inputs();for(const commit of [false,true]){const r=buildNotionAiPublication(...a,{commit});assert.equal(r.sql,fs.readFileSync(new URL('../../supabase/data/'+(commit?'PR5.20_APPLY_AFTER_APPROVAL.sql':'PR5.20_REHEARSE.sql'),import.meta.url),'utf8').replace(/\r\n/g,'\n'));assert.equal(r.sql.includes("RAISE SQLSTATE 'ZP520'"),!commit);}
});
