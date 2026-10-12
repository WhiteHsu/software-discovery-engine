import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {notionAiImportInputs,buildNotionAiImport} from './build-notion-ai-import.mjs';
const inputs=()=>{const {baseline,reviewed,review}=notionAiImportInputs();return [baseline,reviewed,review];};
test('AI import limits executable writes to three claims and additive evidence',()=>{
 const a=inputs(),old=JSON.stringify(a),r=buildNotionAiImport(...a);
 assert.equal(JSON.stringify(a),old);assert.equal(r.report.productWrites,0);assert.equal(r.report.anchorUpdates,0);assert.equal(r.report.routes,0);
 for(const p of r.bundle.products){assert.equal(p.status,'published');assert.equal(p.attributes.length,1);assert.equal(p.attributes[0].slug,'ai-optional');assert.deepEqual(p.anchors,[]);}
 const data=JSON.parse(r.sql.match(/data jsonb=\$payload\$([\s\S]*?)\$payload\$::jsonb/)[1]);
 assert.deepEqual(data.tables.map(t=>t.table),['evidence_sources','product_attributes','claim_evidence','product_attribute_evidence']);
 assert.deepEqual(data.evidenceReplacements,[]);assert.deepEqual(data.routeMembershipReplacements,[]);
});
test('AI import rejects source, evidence, scope, unrelated metadata and approval drift',()=>{
 for(const change of [a=>a[0].products[0].name='drift',a=>a[1].products.find(p=>p.slug==='anytype').attributes.find(c=>c.slug==='ai-optional').evidence.pop(),a=>a[1].products.find(p=>p.slug==='affine').anchors[0].scope='wide',a=>a[2].publicationApproved=true,a=>a[2].sources[0].url='https://example.com']){const a=inputs();change(a);assert.throws(()=>buildNotionAiImport(...a));}
});
test('AI import shipped SQL is deterministic, guarded and rehearses with rollback',()=>{
 const a=inputs();for(const commit of [false,true]){const r=buildNotionAiImport(...a,{commit});assert.equal(r.sql,fs.readFileSync(new URL(`../../supabase/data/PR5.19_${commit?'APPLY':'REHEARSE'}.sql`,import.meta.url),'utf8').replace(/\r\n/g,'\n'));assert.equal(r.sql.includes("RAISE SQLSTATE 'ZSR01'"),!commit);assert.ok(r.sql.includes('PR5.19 relationship/evidence set drift'));assert.ok(r.sql.includes('PR5.19 no-AI route already exposed'));}
});
