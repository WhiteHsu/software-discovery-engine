import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {meditationImportInputs,buildMeditationImport,meditationImportVerification} from './build-meditation-import.mjs';
const payload=r=>JSON.parse(r.sql.match(/data jsonb=\$payload\$([\s\S]*?)\$payload\$::jsonb/)[1]);
test('import plan restricts writes to reviewed claims, additive evidence and an unapproved route',()=>{
 const i=meditationImportInputs(),before=structuredClone(i),r=buildMeditationImport(i),d=payload(r);assert.deepEqual(i,before);
 assert.deepEqual(d.tables.map(t=>t.table).sort(),['evidence_sources','claim_evidence','product_attributes','product_anchors','product_attribute_evidence','product_anchor_evidence','escape_routes','escape_route_products'].sort());
 assert.equal(d.tables.find(t=>t.table==='product_attributes').rows.length,9);assert.equal(d.tables.find(t=>t.table==='product_anchors').rows.length,3);
 assert.equal(d.tables.find(t=>t.table==='escape_routes').rows[0].status,'draft');assert.equal(d.tables.find(t=>t.table==='escape_routes').rows[0].editorially_approved,false);
 assert.deepEqual(d.evidenceReplacements,[]);assert.deepEqual(d.routeMembershipReplacements,[]);assert.equal(r.report.newProducts,0);assert.equal(r.report.newTaxonomy,0);assert.equal(r.report.publicationApproved,false);
 for(const p of r.bundle.products){assert.equal(p.status,'draft');assert.equal(p.attributes.length,3);assert.equal(p.anchors.length,1);assert.deepEqual(p.audiences,[]);assert.deepEqual(p.problems,[]);}
});
test('snapshot, qualified-review and input changes cannot generate an apply script',()=>{
 for(const change of [i=>i.snapshot.products[0].status='published',i=>i.snapshot.product_anchors[0].relationship_scope='all-content',i=>i.snapshot.route.push({slug:'unexpected'}),i=>i.snapshot.claim_evidence[0].notes='edited',i=>i.snapshot.published_products.pop(),i=>i.review.publicationApproved=true,i=>i.baseline.products[0].name='drift']){const i=meditationImportInputs();change(i);assert.throws(()=>buildMeditationImport(i));}
});
test('all captured relationship/evidence/taxonomy sets are guarded and rehearsal payload equals apply',()=>{
 const i=meditationImportInputs(),r=buildMeditationImport(i),a=buildMeditationImport(i,{commit:true});assert.deepEqual(payload(r),payload(a));assert.equal(r.guards.length,16);
 for(const name of ['products','product_attributes','product_anchors','product_problems','product_audiences','product_attribute_evidence','product_anchor_evidence','product_problem_evidence','product_audience_evidence','claim_evidence','evidence_sources','attributes','anchors','problems','audiences','escape_route_products'])assert.ok(r.guards.some(g=>g.table===name));
 assert.ok(r.sql.includes("RAISE SQLSTATE 'ZSR01'"));assert.ok(!a.sql.includes("RAISE SQLSTATE 'ZSR01'"));assert.ok(a.sql.includes('fresh preflight required'));assert.ok(a.sql.includes('publication drift'));assert.ok(a.sql.includes('private evidence boundary drift'));
});
test('shipped SQL is reproducible and generated verification is SELECT-only',()=>{
 const i=meditationImportInputs(),r=buildMeditationImport(i);for(const commit of [false,true])assert.equal(buildMeditationImport(i,{commit}).sql,fs.readFileSync(new URL(`../../supabase/data/PR5.58_${commit?'APPLY_DRAFTS':'REHEARSE'}.sql`,import.meta.url),'utf8').replace(/\r\n/g,'\n'));
 const verify=meditationImportVerification(r);assert.equal(verify,fs.readFileSync(new URL('../../supabase/verification/PR5.58_VERIFY.sql',import.meta.url),'utf8').replace(/\r\n/g,'\n'));assert.ok(verify.trimStart().startsWith('-- PR5.58: single SELECT only.'));assert.ok(verify.includes('drafts_hidden_from_public_rpc'));assert.ok(verify.includes('reviewed_fragment_rows_exact'));
});
