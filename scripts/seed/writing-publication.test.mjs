import test from 'node:test';
import assert from 'node:assert/strict';
import {writingPublicationInputs,buildWritingPublication,writingPublicationVerification} from './build-writing-publication.mjs';
test('actual stored claims qualify exactly three published projections while Classic is retained as draft',()=>{
 const r=buildWritingPublication(writingPublicationInputs());assert.equal(r.pages.length,3);assert.ok(r.candidates.every(c=>c.eligible&&c.quality>=.8));assert.equal(r.report.qualified,3);
 assert.deepEqual(r.report.before,{products:18,routes:8,remaining:2});assert.deepEqual(r.report.after,{products:21,routes:9,remaining:1});assert.equal(r.report.publicationDecision,'pending-owner-approval');
 assert.equal(r.report.claimsChanged,0);assert.equal(r.report.membershipsChanged,0);assert.equal(r.report.routeCopyChanged,false);
 assert.equal(r.guards.find(g=>g.table==='products').rows.find(p=>p.slug==='hemingway-classic').status,'draft');
});
test('snapshot mutations of source, scope, lifecycle, Classic and public policies are rejected',()=>{
 for(const change of [s=>s.products[0].status='published',s=>s.product_anchors[0].scope_description='drift',s=>s.claim_evidence[0].notes='drift',s=>s.public_read_rls[0].rls_enabled=false,s=>s.route[0].editorially_approved=true,s=>s.route_members[0].position=99,s=>s.evidence_sources[0].url='https://example.com']){const i=structuredClone(writingPublicationInputs());change(i.snapshot);assert.throws(()=>buildWritingPublication(i));}
});
test('proposal contains only two state updates and exact guards; rehearsal cannot persist',()=>{
 const i=writingPublicationInputs(),a=buildWritingPublication(i),b=buildWritingPublication(i,{commit:true});assert.deepEqual(a.guards,b.guards);assert.deepEqual(a.pages,b.pages);
 for(const sql of [a.sql,b.sql]){assert.equal((sql.match(/^ UPDATE /gm)||[]).length,2);assert.doesNotMatch(sql,/^ (INSERT|DELETE|ALTER|CREATE) /m);assert.match(sql,/public read policy drift/);assert.match(sql,/private evidence boundary drift/);assert.match(sql,/public qualified projection missing/);assert.ok(Buffer.byteLength(sql)<200000);}
 assert.match(a.sql,/RAISE SQLSTATE 'ZSR01'/);assert.doesNotMatch(b.sql,/RAISE SQLSTATE 'ZSR01'/);
});
test('publication verify preserves Classic and exact stored claims while expecting only selected lifecycle changes',()=>{
 const sql=writingPublicationVerification(writingPublicationInputs());assert.equal(sql.split('\nUNION ALL\n').length,21);assert.ok(sql.includes('public_product_qualification_fields'));assert.ok(sql.includes('public_read_rls_and_policies'));assert.ok(sql.includes('anon_private_evidence_boundary'));assert.ok(sql.includes('hemingway-classic'));assert.ok(sql.includes('personal-english-passive-construction-review'));assert.ok(Buffer.byteLength(sql)<200000);
});
