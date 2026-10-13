import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {simpleNotionPublicationInputs,buildSimpleNotionPublication,createSimpleNotionPublicationVerification} from './build-simple-notion-publication.mjs';
const inputs=()=>{const a=simpleNotionPublicationInputs();return [a.baseline,a.reviewed,a.review,a.publicationReview];};
test('basic-note publication promotes two products and one reviewed three-member route',()=>{
 const a=inputs(),old=JSON.stringify(a),r=buildSimpleNotionPublication(...a);
 assert.equal(JSON.stringify(a),old);assert.equal(r.report.productWrites,2);assert.equal(r.report.publicationDecision,'pending');
 assert.deepEqual(r.report.candidateSlugs,['joplin','obsidian','simplenote']);assert.ok(r.bundle.products.every(p=>p.status==='published'));
 assert.ok(r.sql.includes("WHERE slug IN ('joplin','simplenote') AND status='draft'"));
 assert.ok(!r.sql.includes('INSERT INTO software_discovery.products'));
 assert.ok(!r.sql.includes('UPDATE software_discovery.product_attributes'));
 assert.ok(!a[3].route.description.includes('Draft review'));assert.ok(a[3].route.description.includes('Notion itself also supports ordinary pages'));
});
test('publication refuses scope, source, lifecycle, candidate and approval drift',()=>{
 for(const mutate of [a=>a[3].publicationDecision='approved',a=>a[3].route.products[0].noveltyScore=1,a=>a[3].route.products[2].productSlug='logseq',a=>a[3].route.description='All Notion features, easier and faster',a=>a[1].products.find(p=>p.slug==='simplenote').attributes.find(c=>c.slug==='minimal-setup').verificationStatus='unknown',a=>a[2].sources[0].url='https://example.com',a=>a[0].products.find(p=>p.slug==='obsidian').status='published']){const a=inputs();mutate(a);assert.throws(()=>buildSimpleNotionPublication(...a));}
});
test('publication guards all imported claims, evidence and original route members',()=>{
 const r=buildSimpleNotionPublication(...inputs());
 const payload=JSON.parse(r.sql.match(/payload jsonb=\$pr525_data\$([\s\S]*?)\$pr525_data\$::jsonb/)[1]);
 assert.deepEqual(payload.priorMembers.map(m=>m.product_id.$ref.where.slug).sort(),['joplin','logseq','obsidian']);
 assert.ok(payload.tables.some(t=>t.table==='product_audiences'&&t.rows.length));
 assert.ok(payload.tables.some(t=>t.table==='product_attribute_evidence'&&t.rows.length));
 assert.ok(r.sql.includes('PR5.25 baseline member drift'));assert.ok(r.sql.includes('PR5.25 relationship/evidence set changed'));
 assert.ok(r.sql.includes('PR5.25 repeat publication state mismatch'));
});
test('publication ships pinned rehearsal, approval-labelled apply and read-only verification',()=>{
 const a=inputs();for(const commit of [false,true]){const r=buildSimpleNotionPublication(...a,{commit});assert.equal(r.sql,fs.readFileSync(new URL('../../supabase/data/'+(commit?'PR5.25_APPLY_AFTER_APPROVAL.sql':'PR5.25_REHEARSE.sql'),import.meta.url),'utf8').replace(/\r\n/g,'\n'));assert.equal(r.sql.includes("RAISE SQLSTATE 'ZP525'"),!commit);}
 assert.equal(createSimpleNotionPublicationVerification(buildSimpleNotionPublication(...a).bundle,a[3]),fs.readFileSync(new URL('../../supabase/verification/PR5.25_VERIFY.sql',import.meta.url),'utf8').replace(/\r\n/g,'\n'));
});
