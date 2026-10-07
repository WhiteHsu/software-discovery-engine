import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildEscapeDraft} from './seed/build-escape-draft.mjs';
import {previewFiles} from '../lib/discovery/preview-files.ts';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,`seed/research/${name}-2026-10-07.json`),'utf8'));
const plan=read('escape-content'),proposal=read('escape-candidates'),audit=read('escape-draft-review');
const newTaxonomy=new Set(plan.taxonomyProposals.filter(t=>t.kind==='attributes').map(t=>t.slug));
const attributes=[...new Set([...escapeDefinitions.flatMap(d=>d.constraints),'pricing-model','trade-off-summary','supported-platforms'])].filter(slug=>!newTaxonomy.has(slug)).map(slug=>({slug,name:slug,category:"workflow",valueType:['pricing-model','trade-off-summary','supported-platforms'].includes(slug)?'text':'boolean'}));
const baseline={version:1,sources:[],attributes,anchors:[...new Set(escapeDefinitions.map(d=>d.anchor).filter(slug=>slug&&slug!=='photoshop'))].map(slug=>({slug,name:slug})),audiences:[],problems:[],escapeRoutes:[],products:[...new Set(plan.routes.flatMap(r=>r.candidates))].map(slug=>({slug,name:slug,shortDescription:slug,websiteUrl:'https://example.com/',status:'draft',attributes:[],anchors:[],audiences:[],problems:[]}))};
test('draft delta adds only four products, preserves baseline and separates source facts from inference',()=>{
  const before=JSON.stringify({baseline,plan,proposal,audit});const result=buildEscapeDraft(baseline,plan,proposal,audit);
  assert.equal(JSON.stringify({baseline,plan,proposal,audit}),before);
  assert.deepEqual(result.reviewed.products.slice(0,baseline.products.length),baseline.products);
  assert.equal(result.delta.products.length,4);assert.equal(result.report.verified,17);assert.equal(result.report.likely,5);
  assert.equal(result.delta.escapeRoutes.length,0);
  assert.ok(result.delta.products.every(p=>p.status==='draft'&&p.anchors.every(c=>c.verificationStatus==='likely')));
  assert.ok(result.reviewed.escapeRoutes.every(r=>r.status==='draft'&&!r.editoriallyApproved));
  assert.ok(result.report.routes.every(r=>r.qualified===0));
});
test('rejects proposal drift, inference promotion, publication approval and published baseline',()=>{
  const changed=structuredClone(proposal);changed.products[0].scope+=' changed';assert.throws(()=>buildEscapeDraft(baseline,plan,changed,audit));
  const promoted=structuredClone(audit);promoted.decisions.find(d=>d.kind==='anchors').status='verified';assert.throws(()=>buildEscapeDraft(baseline,plan,proposal,promoted));
  const approved=structuredClone(audit);approved.humanPublicationApproval=true;assert.throws(()=>buildEscapeDraft(baseline,plan,proposal,approved));
  const published=structuredClone(baseline);published.products[0].status='published';assert.throws(()=>buildEscapeDraft(published,plan,proposal,audit));
});
test('rejects missing decisions, unsafe evidence, unused identities and collisions',()=>{
  for(const mutate of [a=>a.decisions.pop(),a=>a.decisions[0].urls=['javascript:alert(1)'],a=>a.platformClaims[0].product='invented',a=>a.decisions.push(a.decisions[0])]){
    const copy=structuredClone(audit);mutate(copy);assert.throws(()=>buildEscapeDraft(baseline,plan,proposal,copy));
  }
  const collision=structuredClone(baseline);collision.products.push({...collision.products[0],slug:'2do'});assert.throws(()=>buildEscapeDraft(collision,plan,proposal,audit));
  assert.equal(createHash('sha256').update(JSON.stringify(proposal)).digest('hex'),audit.proposalSha256);
});
test('preview fixture selection is fixed-path and impossible in production or test',()=>{
  for(const NODE_ENV of ['production','test',undefined])assert.equal(previewFiles({NODE_ENV,PRODUCT_LOCAL_PREVIEW:'true',ESCAPE_DRAFT_PREVIEW:'true'}),null);
  assert.equal(previewFiles({NODE_ENV:'development',ESCAPE_DRAFT_PREVIEW:'true'}),null);
  assert.equal(previewFiles({NODE_ENV:'development',PRODUCT_LOCAL_PREVIEW:'true',ESCAPE_DRAFT_PREVIEW:'true'}).products,'.seed-output/escape-draft/product-preview.json');
  assert.equal(previewFiles({NODE_ENV:'development',PRODUCT_LOCAL_PREVIEW:'true',ESCAPE_DRAFT_PREVIEW:'../../private'}).products,'.seed-output/product-preview.json');
});
