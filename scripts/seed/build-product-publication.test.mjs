import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {buildExpansion} from "./build-expansion.mjs";
import {buildSourceReview} from "./build-source-review.mjs";
import {buildEditorialFit} from "./build-editorial-fit.mjs";
import {publicationBundle,createPublicationSql} from "./build-product-publication.mjs";
const read=f=>JSON.parse(fs.readFileSync(new URL('../../'+f,import.meta.url),'utf8'));
const data=buildEditorialFit(buildSourceReview(buildExpansion(read('seed/data/notion-vertical-slice.json'),read('seed/research/expansion-2026-10-06.json')),read('seed/research/source-review-2026-10-06.json')).reviewed).reviewed;
test('publication slice contains only the requested product and referenced facts; no route approval',()=>{
  const b=publicationBundle(data,'obsidian');assert.equal(b.products.length,1);assert.equal(b.escapeRoutes.length,0);
  const keys=new Set(['attributes','anchors','problems','audiences'].flatMap(k=>b.products[0][k].flatMap(c=>c.evidence)));
  assert.deepEqual(new Set(b.sources.map(s=>s.key)),keys);assert.throws(()=>publicationBundle(data,'missing'));
});
test('publication defaults to atomic rollback and guards exact rows and relationship sets',()=>{
  const b=publicationBundle(data,'obsidian'),rehearsal=createPublicationSql(b),apply=createPublicationSql(b,{commit:true});
  assert.ok(rehearsal.includes("RAISE SQLSTATE 'ZP401'"));assert.ok(!apply.includes("RAISE SQLSTATE 'ZP401'"));
  assert.ok(apply.includes('Publication review mismatch'));assert.ok(apply.includes('Publication relationship set changed'));
  assert.ok(!apply.includes('SET editorially_approved'));assert.ok(Buffer.byteLength(apply)<200000);
  assert.throws(()=>createPublicationSql({...b,products:data.products}));
});
