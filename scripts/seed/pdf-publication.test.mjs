import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {pdfPublicationInputs,buildPdfPublication,createPdfPublicationVerification} from './build-pdf-publication.mjs';
test('PDF publication proposal qualifies three scoped products while default SQL rolls back',()=>{
 const i=pdfPublicationInputs(),before=structuredClone(i),r=buildPdfPublication(i);
 assert.deepEqual(i,before);assert.equal(r.report.publicationDecision,'pending-owner-approval');assert.equal(r.report.qualified,3);assert.deepEqual(r.report.after,{products:15,routes:6});assert.ok(r.sql.includes("RAISE SQLSTATE 'ZSR01'"));assert.ok(!r.description.includes('publication is not approved'));
 assert.ok(!/\b(?:INSERT|DELETE)\s/i.test(r.sql));assert.equal((r.sql.match(/\n UPDATE /g)||[]).length,2);
});
test('PDF publication rejects source, scope, approval, membership and review drift',()=>{
 for(const change of [i=>i.snapshot.product_anchors[0].relationship_scope='wide',i=>i.snapshot.evidence_sources[0].url+='changed',i=>i.snapshot.route[0].editorially_approved=true,i=>i.snapshot.route_members[0].position=99,i=>i.snapshot.products[0].name+='changed',i=>i.importInput.review.publicationApproved=true]){const i=pdfPublicationInputs();change(i);assert.throws(()=>buildPdfPublication(i));}
});
test('PDF checkpoint guards cover identities, claims, evidence, taxonomy and all target route exposures',()=>{
 const r=buildPdfPublication(pdfPublicationInputs());const d=JSON.parse(r.sql.match(/\$pdf_data\$([\s\S]*?)\$pdf_data\$::jsonb/)[1]);
 for(const t of ['products','escape_routes','escape_route_products','product_attributes','product_anchors','product_problems','product_audiences','claim_evidence','evidence_sources','product_attribute_evidence','product_anchor_evidence','product_problem_evidence','product_audience_evidence','attributes','anchors'])assert.ok(d.guards.some(g=>g.table===t));
 assert.ok(d.guards.find(g=>g.table==='escape_route_products').where.includes(' OR product_id IN '));assert.ok(r.sql.includes('fresh preflight required'));assert.ok(r.sql.includes('anonymous evidence boundary drift'));
});
test('shipped PDF publication SQL and public verification are deterministic',()=>{
 const i=pdfPublicationInputs();for(const commit of [false,true]){const r=buildPdfPublication(i,{commit});assert.equal(r.sql,fs.readFileSync(new URL(`../../supabase/data/PR5.33_${commit?'APPLY_AFTER_APPROVAL':'REHEARSE'}.sql`,import.meta.url),'utf8').replace(/\r\n/g,'\n'));assert.equal(r.sql.includes("RAISE SQLSTATE 'ZSR01'"),!commit);}
 assert.equal(createPdfPublicationVerification(i),fs.readFileSync(new URL('../../supabase/verification/PR5.33_VERIFY.sql',import.meta.url),'utf8').replace(/\r\n/g,'\n'));
});
