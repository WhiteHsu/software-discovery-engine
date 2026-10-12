import fs from 'node:fs';import test from 'node:test';import assert from 'node:assert/strict';
import {rasterWorkflowBaseline,buildRasterWorkflow} from './build-raster-workflow.mjs';
import {buildRasterDraftImport} from './build-raster-draft-import.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8'));
const inputs=()=>{const {baseline,bundle}=rasterWorkflowBaseline();return [baseline,buildRasterWorkflow(bundle,read('seed/research/raster-workflow-review-2026-10-12.json')).bundle,read('seed/research/raster-draft-import-2026-10-12.json')];};
test('raster selective import includes only fifteen claims and three new draft identities',()=>{
 const args=inputs(),before=JSON.stringify(args),r=buildRasterDraftImport(...args);assert.equal(JSON.stringify(args),before);assert.deepEqual(r.bundle.products.map(p=>p.slug),['gimp','krita','paint-net']);assert.deepEqual(r.bundle.escapeRoutes,[]);
 for(const p of r.bundle.products){assert.equal(p.status,'draft');assert.equal(p.attributes.length,4);assert.equal(p.anchors.length,1);assert.deepEqual(p.audiences,[]);assert.deepEqual(p.problems,[]);}
 assert.ok(r.sql.includes('PR5.15 unexpected existing row'));assert.ok(r.sql.includes('"evidenceReplacements":[]'));assert.ok(r.sql.includes('"routeMembershipReplacements":[]'));
});
test('raster import aborts baseline, source, claim, scope and publication drift',()=>{
 for(const mutate of [a=>a[0].products.push(structuredClone(a[1].products.find(p=>p.slug==='gimp'))),a=>a[1].products.find(p=>p.slug==='gimp').anchors[0].scope='full-replacement',a=>a[1].products.find(p=>p.slug==='krita').status='published',a=>a[1].sources.find(s=>s.key.startsWith('raster-workflow')).url='https://example.com',a=>a[2].publicationApproved=true]){const a=inputs();mutate(a);assert.throws(()=>buildRasterDraftImport(...a));}
});
test('shipped rehearsal and apply SQL are deterministic generated outputs and keep rollback explicit',()=>{
 const a=inputs(),rehearse=buildRasterDraftImport(...a),apply=buildRasterDraftImport(...a,{commit:true});assert.deepEqual(apply.bundle,rehearse.bundle);assert.equal(rehearse.sql,fs.readFileSync(new URL('../../supabase/data/PR5.15_REHEARSE.sql',import.meta.url),'utf8').replace(/\r\n/g,'\n'));assert.equal(apply.sql,fs.readFileSync(new URL('../../supabase/data/PR5.15_APPLY.sql',import.meta.url),'utf8').replace(/\r\n/g,'\n'));
 assert.ok(rehearse.sql.includes("RAISE SQLSTATE 'ZSR01'"));assert.ok(!apply.sql.includes("RAISE SQLSTATE 'ZSR01'"));assert.equal(apply.report.routes,0);assert.equal(apply.report.newProducts,3);
});
