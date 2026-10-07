import fs from 'node:fs';import test from 'node:test';import assert from 'node:assert/strict';import {buildTodoistPublication} from './build-todoist-publication.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8'));
const inputs=()=>[read('.seed-output/editorial-fit/reviewed-five-ecosystems.json'),read('.seed-output/escape-draft/bundle.json'),read('seed/research/todoist-draft-import-2026-10-07.json'),read('seed/research/todoist-publication-review-2026-10-07.json')];
test('publication packet includes exactly three qualified products, one route and a rollback default',()=>{
 const args=inputs(),before=JSON.stringify(args),r=buildTodoistPublication(...args);assert.equal(JSON.stringify(args),before);assert.deepEqual(r.report.candidateSlugs,['2do','omnifocus','things']);assert.equal(r.report.qualifiedCandidates,3);assert.equal(r.report.publicationDecision,'pending');assert.equal(r.report.noveltyScore,0);assert.ok(r.sql.includes("RAISE SQLSTATE 'ZP509'"));assert.ok(r.sql.includes('PR5.9 relationship/evidence set changed'));assert.equal(r.bundle.products.length,3);assert.deepEqual(r.bundle.escapeRoutes,[]);
});
test('product, source, scope, route membership and approval drift reject generation',()=>{
 for(const mutate of [a=>a[1].products.find(p=>p.slug==='2do').anchors[0].scope='team',a=>a[3].bundleSha256='bad',a=>a[3].publicationDecision='approved',a=>a[3].route.products.pop(),a=>a[3].route.products[0].noveltyScore=1,a=>a[3].route.editoriallyApproved=true,a=>a[3].route.products[0].editorialNote='all tasks anywhere',a=>a[3].route.description='All Todoist use cases']){const args=inputs();mutate(args);assert.throws(()=>buildTodoistPublication(...args));}
});
test('apply remains explicitly named after approval and uses the same pinned candidate selection',()=>{
 const args=inputs(),r=buildTodoistPublication(...args),a=buildTodoistPublication(...args,{commit:true});assert.deepEqual(a.bundle,r.bundle);assert.ok(a.sql.includes('APPLY ONLY AFTER EXPLICIT OWNER PUBLICATION APPROVAL'));assert.ok(!a.sql.includes("RAISE SQLSTATE 'ZP509'"));assert.notEqual(a.report.sqlSha256,r.report.sqlSha256);
});
