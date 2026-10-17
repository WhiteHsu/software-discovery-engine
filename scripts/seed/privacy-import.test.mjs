import test from 'node:test';
import assert from 'node:assert/strict';
import {privacyImportInputs,buildPrivacyImport,privacyImportVerification} from './build-privacy-import.mjs';
test('selective draft import adds scoped editions and two missing taxons while retaining generic and public route',()=>{
 const r=buildPrivacyImport(privacyImportInputs());
 const rows=t=>r.plan.tables.find(x=>x.table===t).rows;
 assert.equal(rows('products').length,3);assert.ok(rows('products').every(p=>p.status==='draft'&&p.slug!=='languagetool'));
 assert.equal(rows('product_attributes').length,12);assert.equal(rows('product_anchors').length,3);
 assert.deepEqual(rows('attributes').map(x=>x.slug).sort(),['privacy-friendly','reviewed-local-operation']);
 assert.equal(rows('evidence_sources').length,6);assert.equal(rows('claim_evidence').length,30);
 assert.ok(rows('product_anchors').every(x=>x.relationship_scope==='personal-english-passive-construction-review'&&x.scope_description));
 assert.equal(rows('escape_routes')[0].editorially_approved,false);assert.equal(rows('escape_routes')[0].status,'draft');
 assert.equal(rows('escape_route_products').length,3);
 assert.equal(r.guards.find(g=>g.table==='products').rows[0].slug,'languagetool');
 assert.equal(r.guards.find(g=>g.table==='escape_routes').rows[0].status,'published');
 assert.equal(r.guards.filter(g=>g.table==='escape_route_products')[0].rows.length,3);
 assert.match(r.sql,/"evidenceReplacements":\[\]/);assert.match(r.sql,/"routeMembershipReplacements":\[\]/);
});
test('changed snapshot, provenance or scope cannot generate import',()=>{
 for(const change of [i=>i.snapshot.products[0].status='published',i=>i.snapshot.taxonomy_attributes.push({slug:'privacy-friendly'}),i=>i.snapshot.route_members.pop(),i=>i.snapshot.published_products.pop(),i=>i.snapshot.anon_private_evidence_boundary=false,i=>i.decision.publicationApproved=true,i=>i.review.publicationApproved=true]){
  const i=structuredClone(privacyImportInputs());change(i);assert.throws(()=>buildPrivacyImport(i));
 }
});
test('rehearsal/apply share guards and exact payload; verification includes new taxonomy and preserved public sets',()=>{
 const i=privacyImportInputs(),a=buildPrivacyImport(i),b=buildPrivacyImport(i,{commit:true});
 assert.deepEqual(a.plan,b.plan);assert.deepEqual(a.guards,b.guards);
 assert.match(a.sql,/RAISE SQLSTATE 'ZSR01'/);assert.doesNotMatch(b.sql,/RAISE SQLSTATE 'ZSR01'/);
 for(const sql of [a.sql,b.sql])for(const guard of ['new taxonomy collision','route collision or repeated apply','provenance collision','publication drift','private evidence boundary drift','retained baseline drift'])assert.ok(sql.includes(guard));
 const verify=privacyImportVerification(a);for(const check of ['exact_attributes','exact_products','retained_escape_routes','published_slug_sets_preserved','draft_lifecycle_and_public_boundary','anon_private_evidence_boundary'])assert.ok(verify.includes(check));
 assert.ok(!verify.includes('undefined'));
});
