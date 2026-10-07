import fs from 'node:fs';import test from 'node:test';import assert from 'node:assert/strict';
import {buildTodoistDraftImport} from './build-todoist-draft-import.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8'));
const inputs=()=>[read('.seed-output/editorial-fit/reviewed-five-ecosystems.json'),read('.seed-output/escape-draft/bundle.json'),read('seed/research/todoist-draft-import-2026-10-07.json')];
test('selective packet omits unrelated claims/products/routes and retains draft status',()=>{
 const args=inputs(),before=JSON.stringify(args),result=buildTodoistDraftImport(...args);
 assert.equal(JSON.stringify(args),before);assert.deepEqual(result.bundle.products.map(p=>p.slug),['things','omnifocus','2do']);assert.deepEqual(result.bundle.escapeRoutes,[]);
 for(const p of result.bundle.products){assert.equal(p.status,'draft');if(p.slug!=='2do'){assert.equal(p.attributes.length,4);assert.equal(p.anchors.length,1);assert.deepEqual(p.audiences,[]);assert.deepEqual(p.problems,[]);}}
 assert.ok(result.sql.includes('PR5.8 baseline drift'));assert.ok(result.sql.includes('Rehearsal rolled back'));assert.ok(result.sql.includes('"evidenceReplacements":[]'));assert.ok(result.sql.includes('"routeMembershipReplacements":[]'));
});
test('reviewed content, baseline and publication drift reject SQL generation',()=>{
 for(const mutate of [a=>a[0].products.find(p=>p.slug==='things').attributes[0].value='changed',a=>a[1].products.find(p=>p.slug==='things').anchors[0].scope='team-parity',a=>a[1].products.find(p=>p.slug==='2do').status='published',a=>a[2].humanPublicationApproval=true,a=>a[1].products.find(p=>p.slug==='omnifocus').attributes.find(c=>c.slug==='pricing-model').value='changed']){const args=inputs();mutate(args);assert.throws(()=>buildTodoistDraftImport(...args));}
});
test('apply uses the same reviewed selection while rehearsal retains rollback sentinel',()=>{
 const args=inputs(),rehearse=buildTodoistDraftImport(...args),apply=buildTodoistDraftImport(...args,{commit:true});assert.deepEqual(apply.bundle,rehearse.bundle);assert.equal(apply.report.mode,'apply');assert.equal(rehearse.report.mode,'rollback-rehearsal');assert.ok(!apply.sql.includes("RAISE SQLSTATE 'ZSR01'"));assert.ok(rehearse.sql.includes("RAISE SQLSTATE 'ZSR01'"));assert.notEqual(apply.report.sqlSha256,rehearse.report.sqlSha256);
});
