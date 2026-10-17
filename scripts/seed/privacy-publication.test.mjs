import test from 'node:test';
import assert from 'node:assert/strict';
import {privacyPublicationInputs,buildPrivacyPublication,privacyPublicationVerification} from './build-privacy-publication.mjs';
test('stored scoped claims qualify with actual runtime and publication changes only three products and one route',()=>{
 const r=buildPrivacyPublication(privacyPublicationInputs());
 assert.equal(r.candidates.length,3);assert.ok(r.candidates.every(x=>x.eligible));
 assert.deepEqual(r.report.before,{products:21,routes:9,remaining:1});assert.deepEqual(r.report.after,{products:24,routes:10,remaining:0});
 assert.equal(r.report.claimsChanged,0);assert.equal(r.report.evidenceChanged,0);assert.equal(r.report.membershipsChanged,0);
 assert.equal(r.guards.find(g=>g.table==='escape_routes').rows.length,2);
 assert.equal(r.guards.find(g=>g.table==='escape_route_products').rows.length,6);
 assert.match(r.sql,/UPDATE software_discovery.products SET status='published'/);
 assert.match(r.sql,/UPDATE software_discovery.escape_routes SET status='published',editorially_approved=true/);
 assert.doesNotMatch(r.sql,/\b(INSERT INTO|DELETE FROM|ALTER TABLE|CREATE POLICY)\b/);
 assert.equal((r.sql.match(/UPDATE software_discovery\./g)||[]).length,2);
 assert.match(r.sql,/public operation statement missing/);
});
test('any stored snapshot drift refuses publication proposal',()=>{
 for(const change of [s=>s.product_attributes[0].confidence=0,s=>s.public_product_projections[0].page={},s=>s.public_read_rls[0].rls_enabled=false,s=>s.route_members.pop(),s=>s.anon_private_evidence_boundary=false,s=>s.published_products.pop()]){
  const i=structuredClone(privacyPublicationInputs());change(i.snapshot);assert.throws(()=>buildPrivacyPublication(i));
 }
});
test('rehearsal and pending apply have same guards; verification preserves existing route and generic draft',()=>{
 const i=privacyPublicationInputs(),a=buildPrivacyPublication(i),b=buildPrivacyPublication(i,{commit:true});
 assert.deepEqual(a.guards,b.guards);assert.deepEqual(a.pages,b.pages);
 assert.match(a.sql,/RAISE SQLSTATE 'ZSR01'/);assert.doesNotMatch(b.sql,/RAISE SQLSTATE 'ZSR01'/);
 for(const text of ['public read policy drift','stored baseline drift','publication state drift','private evidence boundary drift','public qualified projection missing'])assert.ok(b.sql.includes(text));
 const verify=privacyPublicationVerification(i);
 for(const check of ['public_operation_statement','published_slug_sets','public_product_qualification_fields','public_read_rls_and_policies','anon_private_evidence_boundary'])assert.ok(verify.includes(check));
 assert.ok(verify.includes('"slug":"languagetool","status":"draft"')||verify.includes('"slug":"languagetool"'));
 assert.ok(!verify.includes('undefined'));
});
