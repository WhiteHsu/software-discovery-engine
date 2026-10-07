import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCandidateResearch} from './escape-candidate-research.mjs';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const plan=JSON.parse(fs.readFileSync(path.join(root,'seed/research/escape-content-2026-10-07.json'),'utf8'));
const supplement=JSON.parse(fs.readFileSync(path.join(root,'seed/research/escape-candidates-2026-10-07.json'),'utf8'));
const pages=[...new Set(plan.routes.flatMap(r=>r.candidates))].map(slug=>({slug,name:slug,status:'draft',websiteUrl:'https://example.com/',attributes:[],anchors:[],audiences:[],problems:[],routes:[]}));
const bundle={attributes:[...new Set([...escapeDefinitions.flatMap(d=>d.constraints),'pricing-model','trade-off-summary'])].map(slug=>({slug})),anchors:escapeDefinitions.filter(d=>d.anchor).map(d=>({slug:d.anchor})),audiences:[{slug:'productivity-users'}]};
test('four research identities fill name shortlists without promoting proposed evidence',()=>{
  const before=JSON.stringify({supplement,plan,bundle,pages});
  const report=buildCandidateResearch(supplement,plan,bundle,pages);
  assert.equal(report.newResearchProducts,4);assert.equal(report.pendingClaimProposals,18);
  assert.equal(report.observationsApplied,0);assert.equal(report.publicationApproved,false);
  assert.ok(report.routes.every(r=>r.researchCandidates>=3));
  assert.ok(report.routes.every(r=>r.qualifiedWithExistingEvidence===0));
  assert.equal(JSON.stringify({supplement,plan,bundle,pages}),before);
});
test('rejects published products, duplicate identities and fabricated route memberships',()=>{
  for(const mutate of [s=>s.products[0].status='published',s=>s.products[0].slug=pages[0].slug,s=>s.products[1].slug=s.products[0].slug,s=>s.products[0].routeSlugs=['invented-route'],s=>s.publicationApproved=true]){
    const copy=structuredClone(supplement);mutate(copy);assert.throws(()=>buildCandidateResearch(copy,plan,bundle,pages));
  }
});
test('rejects unsupported taxonomy, duplicate claims and unsafe source URLs',()=>{
  for(const mutate of [s=>s.products[0].claims[0].slug='invented-claim',s=>s.products[0].claims.push(s.products[0].claims[0]),s=>s.products[0].claims[0].sourceUrl='javascript:alert(1)',s=>s.products[0].claims[0].reviewStatus='verified',s=>s.products[0].claims[0].basis='AI-confidence']){
    const copy=structuredClone(supplement);mutate(copy);assert.throws(()=>buildCandidateResearch(copy,plan,bundle,pages));
  }
});
