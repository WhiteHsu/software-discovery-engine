import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {pdfWorkflowInputs,buildPdfWorkflow} from './seed/build-pdf-workflow.mjs';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
import {rankEscapeCandidates} from '../lib/discovery/privacy-route.ts';
import {gemSelections,selectedGemCards,indexableGemCollection} from '../lib/discovery/hidden-gems.ts';
import {sitemapXml} from '../lib/discovery/seo.ts';
const receipt=JSON.parse(fs.readFileSync(new URL('../seed/research/privacy-publication-checkpoint-2026-10-17.json',import.meta.url),'utf8'));
const input=pdfWorkflowInputs(),historical=buildPdfWorkflow(input.baseline,input.review);
function pages(){
 const products=structuredClone(historical.pages).map(p=>({...p,status:receipt.publishedProducts.includes(p.slug)?'published':'draft'}));
 return gemSelections.map(pick=>{
  const def=escapeDefinitions.find(d=>d.slug===pick.routeSlug),r=historical.bundle.escapeRoutes.find(r=>r.slug===pick.routeSlug);
  const candidates=r.products.map(m=>({product:products.find(p=>p.slug===m.productSlug),noveltyScore:m.noveltyScore??0}));
  return {slug:def.slug,name:def.name,description:r.description,lastVerifiedAt:r.lastVerifiedAt??null,published:receipt.publishedRoutes.includes(def.slug),candidates:rankEscapeCandidates(def,candidates)};
 });
}
test('three editorial picks qualify against historical sourced graph and owner-accepted publication identities',()=>{
 const source=pages(),before=structuredClone(source),cards=selectedGemCards(source);
 assert.deepEqual(cards.map(c=>c.slug),['joplin','krita','pdf24-creator']);assert.equal(indexableGemCollection(cards),true);assert.deepEqual(source,before);
 assert.equal(indexableGemCollection([cards[0],cards[0],cards[0]]),false);
 for(const card of cards){const p=source.find(r=>r.slug===card.routeSlug).candidates.find(c=>c.product.slug===card.slug).product;
  assert.equal(card.scope,p.anchors.find(a=>a.relationshipType==='alternative'&&a.scope).description);
  assert.equal(card.pricing,p.attributes.find(a=>a.slug==='pricing-model').value);
  assert.equal(card.tradeOff,p.attributes.find(a=>a.slug==='trade-off-summary').value);
  assert.ok(card.sources.length>0);assert.ok(Number.isFinite(Date.parse(card.checkedAt)));
 }
});
test('withheld routes and unpublished products cannot appear; no fallback picks',()=>{
 assert.deepEqual(selectedGemCards([]),[]);assert.equal(indexableGemCollection([]),false);
 const source=pages();source[0].published=false;source[1].candidates.find(c=>c.product.slug==='krita').product.status='draft';
 const cards=selectedGemCards(source);assert.deepEqual(cards.map(c=>c.slug),['pdf24-creator']);assert.equal(indexableGemCollection(cards),false);
});
test('stale eligibility never overrides removed pricing evidence or widened relationship scope',()=>{
 const source=pages();const j=source[0].candidates.find(c=>c.product.slug==='joplin');j.eligible=true;j.product.attributes.find(c=>c.slug==='pricing-model').verificationStatus='unknown';
 const k=source[1].candidates.find(c=>c.product.slug==='krita');k.product.anchors.find(c=>c.relationshipType==='alternative'&&c.slug==='photoshop').scope='unreviewed-full-parity';
 assert.deepEqual(selectedGemCards(source).map(c=>c.slug),['pdf24-creator']);
});
test('a pick needs a publishable source route, not only one qualifying candidate',()=>{
 const source=pages();source[0].candidates=source[0].candidates.filter(c=>c.product.slug==='joplin');
 const cards=selectedGemCards(source);assert.deepEqual(cards.map(c=>c.slug),['krita','pdf24-creator']);assert.equal(indexableGemCollection(cards),false);
});
test('required evidence date uses the oldest check and deduplicates source links',()=>{
 const source=pages(),j=source[0].candidates.find(c=>c.product.slug==='joplin');j.product.attributes.find(c=>c.slug==='pricing-model').lastVerifiedAt='2026-01-01';
 const card=selectedGemCards(source)[0];assert.equal(card.checkedAt,'2026-01-01');assert.equal(new Set(card.sources.map(s=>s.url)).size,card.sources.length);
});
test('complete collection is a valid dedicated sitemap URL; arbitrary collection URLs remain refused',()=>{
 assert.match(sitemapXml('https://software-discovery-engine.vercel.app',['/hidden-gems']),/\/hidden-gems<\/loc>/);
 assert.throws(()=>sitemapXml('https://software-discovery-engine.vercel.app',['/unreviewed-collection']));
});
