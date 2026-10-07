import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createDatabasePlan} from './database-plan.mjs';
import {validateSeedBundle} from './validate.mjs';
const base=()=>JSON.parse(fs.readFileSync(new URL('../../seed/data/notion-vertical-slice.json',import.meta.url),'utf8'));
test('scope survives plan projection without changing relationship identity or product status',()=>{
 const b=base(),p=b.products.find(p=>p.anchors.length),c=p.anchors[0];c.scope='personal-task-project-organization';c.scopeDescription='Personal tasks only; native purchased edition.';
 const op=createDatabasePlan(b).tables.find(t=>t.table==='product_anchors');
 const row=op.rows.find(r=>r.product_id.$ref.where.slug===p.slug&&r.anchor_id.$ref.where.slug===c.slug);
 assert.equal(row.relationship_scope,c.scope);assert.equal(row.scope_description,c.scopeDescription);
 assert.deepEqual(op.conflictColumns,['product_id','anchor_id','relationship_type']);assert.ok(b.products.every(p=>p.status==='draft'));
});
test('legacy unscoped relationships project paired nulls',()=>{
 const rows=createDatabasePlan(base()).tables.find(t=>t.table==='product_anchors').rows;
 assert.ok(rows.every(r=>r.relationship_scope===null&&r.scope_description===null));
});
test('incomplete or malformed scope cannot compile an import plan',()=>{
 for(const patch of [{scope:'personal-task-project-organization'},{scopeDescription:'limits only'},{scope:'Bad scope',scopeDescription:'limits'},{scope:'personal-task-project-organization',scopeDescription:'  '}]){const b=base();Object.assign(b.products.find(p=>p.anchors.length).anchors[0],patch);assert.ok(validateSeedBundle(b).length);assert.throws(()=>createDatabasePlan(b));}
});
