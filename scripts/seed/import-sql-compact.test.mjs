import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import { createCompactImportSql } from "./import-sql-compact.mjs";
const read=(name)=>JSON.parse(fs.readFileSync(new URL(`../../seed/${name}`,import.meta.url),'utf8'));
const bundle=read('data/notion-vertical-slice.json');
const owner=read('import-ownership.example.json');
test('compact Notion SQL stays below 200 KB and preserves atomic outcome',()=>{
 const sql=createCompactImportSql(bundle,owner,{commit:true});
 assert(Buffer.byteLength(sql)<200000);assert.match(sql,/APPLY: changes persist/);
 assert.match(createCompactImportSql(bundle,owner),/RAISE SQLSTATE 'ZSR01'/);
 assert.doesNotMatch(sql,/pg_temp|CREATE TEMP|CREATE OR REPLACE FUNCTION|COMMIT;|ROLLBACK;/);
 assert.doesNotMatch(sql,/CREATE TABLE software_discovery|DROP SCHEMA|TRUNCATE/);
});
test('compact emitter rejects invalid ownership and isolates dollar delimiters',()=>{
 assert.throws(()=>createCompactImportSql(bundle,{}),/Ownership/);
 assert.throws(()=>createCompactImportSql(bundle,{...owner,products:['unknown']}),/Invalid ownership/);
 const changed=structuredClone(bundle);changed.sources[0].title='$import$ $payload$';
 const sql=createCompactImportSql(changed,owner);assert.match(sql,/DO \$import_x\$/);assert.match(sql,/\$payload_x\$/);
});
