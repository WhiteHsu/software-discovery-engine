import {signSearchContext,readSearchContext,validateSearchContext} from '../lib/analytics/context-v2.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSearchIntent,applyQueryContext,searchIntentSchema} from '../lib/discovery/search-intent.ts';
import {searchGraph} from '../lib/discovery/search-graph.ts';
import {discover} from '../lib/discovery/search-service.ts';
import {buildAccountFreePreview} from './seed/build-account-free-preview.mjs';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
import {rankEscapeCandidates} from '../lib/discovery/privacy-route.ts';
import {products,routes,membership} from './locale-products-fixtures.mjs';
import {parseEventV2} from '../lib/analytics/events-v2.ts';
const plain={status:'ready',anchor:null,problem:null,attributes:['no-account-required'],unresolved:false};
const notes={...plain,workflow:'personal-notes'};
const pages=()=>{
 const page=buildAccountFreePreview().page;page.published=true;for(const c of page.candidates)c.product.status='published';
 const r=routes.find(r=>r.slug==='meditation-apps-without-a-subscription'),def=escapeDefinitions.find(d=>d.slug===r.slug);
 const meditation={slug:r.slug,name:r.name,description:r.description,published:true,lastVerifiedAt:r.last_verified_at,candidates:rankEscapeCandidates(def,membership.get(r.slug).map(slug=>({product:structuredClone(products.find(p=>p.slug===slug)),noveltyScore:0})))};
 return [page,meditation];
};
test('note context excludes an otherwise eligible meditation app without relaxing evidence',()=>{
 const input=pages();assert.ok(searchGraph(plain,input).some(p=>p.slug==='medito'));
 assert.deepEqual(searchGraph(notes,input).map(p=>p.slug),['affine','obsidian','standard-notes']);
 input[0].candidates.find(c=>c.product.slug==='standard-notes').product.attributes.find(c=>c.slug==='no-account-required').verificationStatus='unknown';
 assert.deepEqual(searchGraph(notes,input),[]); // two candidates cannot publish a route
});
test('the observed English/Chinese requests cannot acquire invented simplicity preferences',async()=>{
 for(const query of ['不用註冊帳號的筆記工具','note-taking apps without an account']){
  let received;
  const result=await discover(query,{parse:async()=>({...plain,attributes:['no-account-required','focused-note-taking','minimal-setup']}),retrieve:async intent=>{received=intent;return pages();},explain:async()=>{throw Error('Use evidence fallback');}});
  assert.deepEqual(received,notes);assert.deepEqual(result.intent,notes);assert.equal(result.state,'results');assert.deepEqual(result.matches.map(m=>m.slug),['affine','obsidian','standard-notes']);
 }
});
test('extra requirements, negations and unsupported details never match the bounded rewrite',()=>{
 for(const query of ['simple note-taking apps without an account','note-taking apps without an account offline','note-taking apps without an account on Android under $10','不用註冊帳號的筆記工具，但要能離線','不用註冊帳號的簡單筆記工具','not note-taking apps without an account']){
  const intent={...plain,status:'clarify',unresolved:true,attributes:['no-account-required','works-offline']};assert.deepEqual(applyQueryContext(query,intent),intent);
 }
});
test('legacy signed-intent payloads stay valid; workflow is bounded and cannot contradict an anchor',()=>{
 assert.deepEqual(parseSearchIntent(plain),plain);assert.deepEqual(parseSearchIntent({...plain,workflow:null}),plain);assert.deepEqual(parseSearchIntent(notes),notes);
 assert.throws(()=>parseSearchIntent({...plain,workflow:'any-app'}));assert.throws(()=>parseSearchIntent({...notes,anchor:'calm'}));assert.ok(searchIntentSchema.required.includes('workflow'));
 const e={version:2,eventId:crypto.randomUUID(),sessionId:crypto.randomUUID(),pageViewId:crypto.randomUUID(),occurredAt:new Date().toISOString(),name:'search_results_viewed',surface:'search',path:'/zh-hant/discover',searchId:crypto.randomUUID(),resultSetId:crypto.randomUUID(),outcome:'results',resultCount:3,intent:notes};
 assert.deepEqual(parseEventV2(e).intent,notes);
});
test('workflow filtering is independent of result availability and retains explicit additional constraints',()=>{
 const input=pages();assert.deepEqual(searchGraph({...notes,attributes:['no-account-required','works-offline']},input),[]);
 assert.deepEqual(searchGraph({...notes,attributes:['no-account-required','minimal-setup']},input),[]);
 assert.deepEqual(searchGraph({...notes,status:'clarify',unresolved:true},input),[]);
});

test('new workflow and legacy intents retain signed search receipt integrity',()=>{
 const now=Date.now(),secret='a'.repeat(64);
 for(const intent of [plain,notes]){
  const c={version:1,path:'/zh-hant/discover',sessionId:crypto.randomUUID(),pageViewId:crypto.randomUUID(),searchId:crypto.randomUUID(),resultSetId:crypto.randomUUID(),issuedAt:now,expiresAt:now+1800000,intent,outcome:'results',products:['affine','obsidian','standard-notes']};
  const signed=readSearchContext(signSearchContext(c,secret),secret,now+1);assert.deepEqual(signed.intent,intent);
  const event={version:2,eventId:crypto.randomUUID(),sessionId:c.sessionId,pageViewId:c.pageViewId,occurredAt:new Date(now).toISOString(),name:'search_results_viewed',surface:'search',path:c.path,searchId:c.searchId,resultSetId:c.resultSetId,outcome:'results',resultCount:3,intent,constraints:['no-account-required']};
  validateSearchContext(parseEventV2(event),signed);
  assert.throws(()=>validateSearchContext({...event,intent:intent.workflow?plain:notes},signed),/Wrong search outcome/);
 }
});
