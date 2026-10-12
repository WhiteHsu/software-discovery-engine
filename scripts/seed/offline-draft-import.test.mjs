import fs from 'node:fs';import test from 'node:test';import assert from 'node:assert/strict';
import {offlineWorkflowBaseline,buildOfflineWorkflow} from './build-offline-workflow.mjs';
import {buildOfflineDraftImport} from './build-offline-draft-import.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8'));
const inputs=()=>{const {baseline,bundle}=offlineWorkflowBaseline();return [baseline,buildOfflineWorkflow(bundle,read('seed/research/offline-workflow-review-2026-10-08.json')).bundle,read('seed/research/offline-draft-import-2026-10-12.json')];};
test('offline selective import includes only twelve claims and three existing draft identities',()=>{
 const args=inputs(),before=JSON.stringify(args),r=buildOfflineDraftImport(...args);assert.equal(JSON.stringify(args),before);assert.deepEqual(r.bundle.products.map(p=>p.slug),['affine','appflowy','anytype']);assert.deepEqual(r.bundle.escapeRoutes,[]);
 for(const p of r.bundle.products){assert.equal(p.status,'draft');assert.equal(p.attributes.length,3);assert.equal(p.anchors.length,1);assert.deepEqual(p.audiences,[]);assert.deepEqual(p.problems,[]);}
 assert.ok(r.sql.includes('PR5.12 baseline drift'));assert.ok(r.sql.includes('"evidenceReplacements":[]'));assert.ok(r.sql.includes('"routeMembershipReplacements":[]'));
});
test('offline import aborts baseline, source, claim, scope and publication drift',()=>{
 for(const mutate of [a=>a[0].products.find(p=>p.slug==='anytype').attributes[0].confidence=.6,a=>a[1].products.find(p=>p.slug==='affine').anchors[0].scope='full-replacement',a=>a[1].products.find(p=>p.slug==='appflowy').status='published',a=>a[1].sources.find(s=>s.key.startsWith('offline-workflow')).url='https://example.com',a=>a[2].publicationApproved=true]){const a=inputs();mutate(a);assert.throws(()=>buildOfflineDraftImport(...a));}
});
test('shipped rehearsal and apply SQL are deterministic generated outputs and keep rollback explicit',()=>{
 const a=inputs(),rehearse=buildOfflineDraftImport(...a),apply=buildOfflineDraftImport(...a,{commit:true});assert.deepEqual(apply.bundle,rehearse.bundle);assert.equal(rehearse.sql,fs.readFileSync(new URL('../../supabase/data/PR5.12_REHEARSE.sql',import.meta.url),'utf8').replace(/\r\n/g,'\n'));assert.equal(apply.sql,fs.readFileSync(new URL('../../supabase/data/PR5.12_APPLY.sql',import.meta.url),'utf8').replace(/\r\n/g,'\n'));
 assert.ok(rehearse.sql.includes("RAISE SQLSTATE 'ZSR01'"));assert.ok(!apply.sql.includes("RAISE SQLSTATE 'ZSR01'"));assert.equal(apply.report.routes,0);assert.equal(apply.report.newProducts,0);
});
