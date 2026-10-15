import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {meditationPublicationInputs,buildMeditationPublication,meditationPublicationVerification} from './build-meditation-publication.mjs';
test('actual stored claims qualify a publication proposal with only two lifecycle UPDATE statements',()=>{
 const i=meditationPublicationInputs(),before=structuredClone(i),r=buildMeditationPublication(i);assert.deepEqual(i,before);assert.equal(r.report.publicationDecision,'pending-owner-approval');assert.equal(r.report.qualified,3);assert.deepEqual(r.report.after,{products:18,routes:8,remaining:2});assert.equal(r.report.claimsChanged,0);assert.equal(r.report.evidenceChanged,0);assert.equal(r.report.membershipsChanged,0);assert.equal(r.report.routeCopyChanged,false);assert.equal((r.sql.match(/\n UPDATE /g)||[]).length,2);assert.ok(!/\b(?:INSERT|DELETE)\s/i.test(r.sql));assert.ok(!r.sql.includes('SET status=\'published\',editorially_approved=true,description='));assert.ok(r.sql.includes("RAISE SQLSTATE 'ZSR01'"));assert.ok(r.candidates.every(c=>c.eligible&&c.quality===.85));
});
test('publication proposal rejects snapshot scope/source/member/state/security and qualified-input drift',()=>{
 for(const change of [i=>i.snapshot.product_anchors[0].relationship_scope='all-calm',i=>i.snapshot.evidence_sources[0].url+='changed',i=>i.snapshot.route_members[0].position=99,i=>i.snapshot.products[0].status='published',i=>i.snapshot.route[0].editorially_approved=true,i=>i.snapshot.public_read_rls[0].rls_enabled=false,i=>i.snapshot.public_read_policies[0].qual='true',i=>i.importInput.review.publicationApproved=true]){const i=meditationPublicationInputs();change(i);assert.throws(()=>buildMeditationPublication(i));}
});
test('publication guards preserve all complete claim/evidence/taxonomy/member rows and fail closed on policy drift',()=>{
 const r=buildMeditationPublication(meditationPublicationInputs());assert.equal(r.guards.length,17);for(const table of ['products','product_attributes','product_anchors','product_problems','product_audiences','product_attribute_evidence','product_anchor_evidence','product_problem_evidence','product_audience_evidence','claim_evidence','evidence_sources','attributes','anchors','problems','audiences','escape_routes','escape_route_products'])assert.ok(r.guards.some(g=>g.table===table));assert.ok(r.sql.includes('public read policy drift'));assert.ok(r.sql.includes('public qualified projection missing'));assert.ok(r.guards.find(g=>g.table==='escape_route_products').where.includes(' OR product_id IN '));
});
test('shipped rehearsal, approval-gated apply and SELECT verification are deterministic',()=>{
 const i=meditationPublicationInputs();for(const commit of [false,true]){const r=buildMeditationPublication(i,{commit});assert.equal(r.sql,fs.readFileSync(new URL(`../../supabase/data/PR5.60_${commit?'APPLY_AFTER_APPROVAL':'REHEARSE'}.sql`,import.meta.url),'utf8').replace(/\r\n/g,'\n'));assert.equal(r.sql.includes("RAISE SQLSTATE 'ZSR01'"),!commit);}
 assert.equal(meditationPublicationVerification(i),fs.readFileSync(new URL('../../supabase/verification/PR5.60_VERIFY.sql',import.meta.url),'utf8').replace(/\r\n/g,'\n'));
});
