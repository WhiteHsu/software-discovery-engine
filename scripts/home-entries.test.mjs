import test from 'node:test';
import assert from 'node:assert/strict';
import {featuredRoutes,needEntries,localFirstEntry} from '../lib/discovery/home-entries.ts';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
import {navigationSelection,filterRouteCards} from '../lib/discovery/navigation.ts';
const cards=escapeDefinitions.map(d=>({slug:d.slug,name:d.name,description:'Reviewed scope.'}));
const claim=(slug,value)=>({slug,name:slug,description:'Reviewed operation.',value,verificationStatus:'verified',confidence:.9,lastVerifiedAt:'2026-10-21',sources:[{title:'Source',url:'https://example.org/evidence',retrievedAt:'2026-10-21'}]});
function page(){return {slug:'offline-notion-alternatives',published:true,candidates:['one','two','three'].map(slug=>({eligible:true,product:{slug,name:slug,status:'published',websiteUrl:'https://example.org',description:'Reviewed workflow.',attributes:[claim('works-offline',true),claim('pricing-model','Reviewed price'),claim('trade-off-summary','Setup and sync limits'),claim('local-first',true)],anchors:[{...claim('notion',undefined),relationshipType:'alternative',scope:'personal-offline-note-object-organization'}],audiences:[],problems:[],routes:[]}}))};}
test('featured links use only current directory entries and a stable editorial order',()=>{
 assert.equal(featuredRoutes(cards).length,4);assert.deepEqual(featuredRoutes([]),[]);
 const missing=cards.filter(c=>c.slug!=='offline-notion-alternatives');assert.equal(featuredRoutes(missing).length,3);
 assert.deepEqual(featuredRoutes([...cards].reverse()),featuredRoutes(cards));
});
test('six explicit need entries lead to existing filters with reviewed comparisons',()=>{
 const entries=needEntries(cards);assert.deepEqual(entries.map(n=>n.label),['No Subscription','No AI','Privacy','Offline','Buy Once','Minimalist']);
 for(const e of entries){const u=new URL(e.href,'https://example.org');assert.ok(filterRouteCards(cards,navigationSelection({constraint:u.searchParams.get('constraint')})).length);}
 assert.ok(entries.find(e=>e.label==='No AI').description.includes('optional'));
 assert.deepEqual(needEntries([]),[]);
});
test('local-first needs its own positive evidence and a qualified published source route',()=>{
 assert.ok(localFirstEntry(page()).href.startsWith('/software/'));assert.equal(localFirstEntry(null),null);
 const draft=page();draft.published=false;assert.equal(localFirstEntry(draft),null);
 const thin=page();thin.candidates.pop();assert.equal(localFirstEntry(thin),null);
 const bad=page();for(const c of bad.candidates)c.product.attributes.find(a=>a.slug==='works-offline').value=false;assert.equal(localFirstEntry(bad),null);
});
test('offline alone, low confidence, unsafe sources or missing dates never establish local-first',()=>{
 for(const patch of [{value:false},{verificationStatus:'likely'},{confidence:.79},{confidence:2},{lastVerifiedAt:null},{sources:[]},{sources:[{url:'javascript:alert(1)'}]}]){
  const p=page();for(const c of p.candidates)Object.assign(c.product.attributes.find(a=>a.slug==='local-first'),patch);
  assert.equal(localFirstEntry(p),null);
 }
});
