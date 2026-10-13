import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {simpleNotionImportInputs,buildSimpleNotionImport,createSimpleNotionVerification} from './build-simple-notion-import.mjs';
const inputs=()=>{const {baseline,reviewed,review}=simpleNotionImportInputs();return [baseline,reviewed,review];};
const payload=r=>JSON.parse(r.sql.match(/data jsonb=\$payload\$([\s\S]*?)\$payload\$::jsonb/)[1]);
test('basic-note import writes only new draft identity, reviewed claims and additive evidence',()=>{
 const a=inputs(),old=JSON.stringify(a),r=buildSimpleNotionImport(...a),d=payload(r);
 assert.equal(JSON.stringify(a),old);assert.equal(r.report.attributeClaims,17);assert.equal(r.report.scopedAnchors,3);
 assert.deepEqual(d.tables.find(t=>t.table==='products').rows.map(p=>[p.slug,p.status]),[['simplenote','draft']]);
 assert.equal(d.tables.find(t=>t.table==='product_attributes').rows.length,17);
 assert.equal(d.tables.find(t=>t.table==='product_anchors').rows.length,3);
 assert.ok(d.tables.every(t=>!['anchors','attributes','problems','audiences','escape_routes','escape_route_products'].includes(t.table)));
 assert.deepEqual(d.evidenceReplacements,[]);assert.deepEqual(d.routeMembershipReplacements,[]);
 assert.equal(r.bundle.products.find(p=>p.slug==='obsidian').status,'published');
});
test('basic-note import guards complete prior target claims and evidence sets',()=>{
 const d=payload(buildSimpleNotionImport(...inputs()));
 for(const t of ['products','product_attributes','product_anchors','product_problems','product_audiences','claim_evidence','product_attribute_evidence','product_anchor_evidence'])assert.ok(d.guardRows.some(r=>r.table===t),t);
 for(const s of ['joplin','obsidian','simplenote'])assert.ok(d.guardCounts.some(r=>r.slug===s&&r.table==='product_attribute_evidence'));
 assert.ok(d.guardRows.some(r=>r.table==='products'&&r.after.slug==='obsidian'&&r.before.status==='published'&&r.after.status==='published'));
 assert.ok(d.guardRows.some(r=>r.table==='products'&&r.after.slug==='simplenote'&&r.before===null));
});
test('basic-note import rejects metadata, scope, source, evidence and approval drift',()=>{
 for(const change of [a=>a[0].products.find(p=>p.slug==='obsidian').status='published',a=>a[1].products.find(p=>p.slug==='joplin').anchors[0].scope='wide',a=>a[1].products.find(p=>p.slug==='simplenote').attributes[0].evidence.pop(),a=>a[2].publicationApproved=true,a=>a[2].sources[0].url='https://example.com']){const a=inputs();change(a);assert.throws(()=>buildSimpleNotionImport(...a));}
});
test('shipped basic-note SQL is deterministic and rehearsal rolls back',()=>{
 assert.equal(createSimpleNotionVerification(buildSimpleNotionImport(...inputs()).bundle),fs.readFileSync(new URL('../../supabase/verification/PR5.24_VERIFY.sql',import.meta.url),'utf8').replace(/\r\n/g,'\n'));
 for(const commit of [false,true]){const r=buildSimpleNotionImport(...inputs(),{commit});assert.equal(r.sql,fs.readFileSync(new URL(`../../supabase/data/PR5.24_${commit?'APPLY':'REHEARSE'}.sql`,import.meta.url),'utf8').replace(/\r\n/g,'\n'));assert.equal(r.sql.includes("RAISE SQLSTATE 'ZSR01'"),!commit);assert.ok(r.sql.includes('PR5.24 unexpected approved target route exposure'));assert.ok(r.sql.includes('PR5.24 unreviewed relationship/evidence identity'));assert.ok(r.sql.includes("slug='simple-notion-alternatives'"));}
});
