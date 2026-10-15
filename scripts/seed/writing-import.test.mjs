import test from 'node:test';
import assert from 'node:assert/strict';
import {writingImportInputs,buildWritingImport,writingImportVerification} from './build-writing-import.mjs';
test('selective import contains only three new drafts and reviewed provenance with no taxonomy or replacement writes',()=>{
 const r=buildWritingImport(writingImportInputs());
 assert.equal(r.report.newProducts,3);assert.equal(r.report.attributeClaims,9);assert.equal(r.report.scopedAnchors,3);assert.equal(r.report.newSources,18);assert.equal(r.report.newEvidenceFragments,104);assert.equal(r.report.publicationApproved,false);
 assert.equal(r.plan.tables.length,9);assert.ok(r.plan.tables.every(t=>!['attributes','anchors','problems','audiences','product_problems','product_audiences'].includes(t.table)));
 assert.ok(r.bundle.products.every(p=>p.status==='draft'&&p.slug!=='hemingway-classic'));assert.equal(r.bundle.escapeRoutes[0].editoriallyApproved,false);
 assert.match(r.sql,/'evidenceReplacements'|"evidenceReplacements":\[\]/);assert.match(r.sql,/"routeMembershipReplacements":\[\]/);
 assert.deepEqual(r.guards.find(g=>g.table==='products').rows.map(p=>p.slug),['hemingway-classic']);
});
test('returned snapshot mutation or review drift cannot produce an import',()=>{
 for(const change of [i=>i.snapshot.products[0].status='published',i=>i.snapshot.route.push({slug:'unexpected'}),i=>i.snapshot.published_products.pop(),i=>i.snapshot.anon_private_evidence_boundary=false,i=>i.review.publicationApproved=true,i=>i.review.candidates[0].confidence=1,i=>i.baseline.products[0].name='drift']){const i=structuredClone(writingImportInputs());change(i);assert.throws(()=>buildWritingImport(i));}
});
test('rehearsal and apply share exact reviewed payload and collision guards, differing only rollback mode',()=>{
 const i=writingImportInputs(),a=buildWritingImport(i),b=buildWritingImport(i,{commit:true});assert.deepEqual(a.plan,b.plan);assert.deepEqual(a.guards,b.guards);
 for(const sql of [a.sql,b.sql]){assert.match(sql,/retained baseline drift/);assert.match(sql,/route collision or repeated apply/);assert.match(sql,/provenance collision/);assert.match(sql,/publication drift/);assert.match(sql,/private evidence boundary drift/);assert.ok(Buffer.byteLength(sql)<200000);}
 assert.match(a.sql,/RAISE SQLSTATE 'ZSR01'/);assert.doesNotMatch(b.sql,/RAISE SQLSTATE 'ZSR01'/);
});
test('verification covers exact imported rows, all retained tables and public/private lifecycle boundaries',()=>{
 const sql=writingImportVerification(buildWritingImport(writingImportInputs()));
 assert.equal(sql.split('\nUNION ALL\n').length,29);
 for(const marker of ['exact_products','exact_claim_evidence','retained_products','retained_product_anchor_evidence','published_slug_sets_preserved','draft_lifecycle_and_public_boundary','no_privacy_or_extra_claims','anon_private_evidence_boundary'])assert.ok(sql.includes(marker));
 assert.match(sql,/evidence_source_id IN/);assert.ok(Buffer.byteLength(sql)<200000);
});
