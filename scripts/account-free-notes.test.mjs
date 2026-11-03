import {localizedProductReady,translateProduct} from '../lib/i18n/product-localized.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {escapeDefinitions,evaluateCandidate,publishable} from '../lib/discovery/escape-model.ts';
import {searchGraph} from '../lib/discovery/search-graph.ts';
import {localizedReady} from '../lib/i18n/localized.ts';
import {localizeSearchResult} from '../lib/i18n/search-localized.ts';
import {accountFreeReview} from '../lib/discovery/account-free-review.ts';
import {buildAccountFreePreview,renderAccountFreePreview} from './seed/build-account-free-preview.mjs';
const def=accountFreeReview.definition;
const fresh=()=>buildAccountFreePreview();
test('draft proposal has three scoped candidates but cannot publish or enter search',()=>{
 const p=fresh();assert.equal(p.products.length,3);assert.ok(p.page.candidates.every(c=>c.eligible));assert.equal(p.publicationApproved,false);assert.equal(p.handsOnTested,false);assert.equal(publishable(p.page),false);assert.equal(localizedReady(p.page),false);assert.deepEqual(searchGraph({status:'ready',anchor:null,problem:null,attributes:['no-account-required'],unresolved:false},[p.page]),[]);
});
test('account-free claim cannot qualify an unrelated app or substitute task scope',()=>{
 for(const value of [null,'personal-task-capture-project-organization-and-scheduling','generic-account-free']){
  const p=fresh().products[0];p.attributes.find(c=>c.slug==='account-free-note-workflow-scope').value=value;assert.equal(evaluateCandidate(def,{product:p}).eligible,false);
 }
 const p=fresh().products[0];p.attributes=p.attributes.filter(c=>c.slug!=='account-free-note-workflow-scope');assert.equal(evaluateCandidate(def,{product:p}).eligible,false);
});
test('missing, negative, undated, weak or unsourced account and scope evidence cannot qualify',()=>{
 for(const slug of ['no-account-required','account-free-note-workflow-scope'])for(const mutate of [c=>c.verificationStatus='unknown',c=>c.verificationStatus='likely',c=>c.value=false,c=>c.lastVerifiedAt=null,c=>c.sources=[],c=>c.confidence=.79]){
  const p=fresh().products[0];mutate(p.attributes.find(c=>c.slug===slug));assert.equal(evaluateCandidate(def,{product:p}).eligible,false);
 }
});
test('synthetic published-state check preserves minimum three and translations without claiming real publication',()=>{
 const draft=fresh(),page=structuredClone(draft.page);page.published=true;for(const c of page.candidates)c.product.status='published';
 assert.equal(publishable(page),true);assert.equal(publishable({...page,candidates:page.candidates.slice(0,2)}),false);assert.equal(localizedReady(page),true);
 const intent={status:'ready',anchor:null,problem:null,attributes:['no-account-required'],unresolved:false};
 const matches=searchGraph(intent,[page]);assert.equal(matches.length,3);const zh=localizeSearchResult({state:'results',intent,matches,explanationMode:'verified-evidence'});assert.deepEqual(zh.matches.map(m=>m.slug),matches.map(m=>m.slug));assert.ok(matches.every(m=>m.facts.some(f=>f.id==='workflow-scope')));
 assert.deepEqual(searchGraph({...intent,anchor:'notion'},[page]),[]);
});
test('both previews label research status and preserve critical Standard Notes limits',()=>{
 const p=fresh(),en=renderAccountFreePreview(p),zh=renderAccountFreePreview(p,true);assert.match(en,/noindex,nofollow/);assert.match(en,/not hands-on/);assert.match(en,/Application Passcode/);assert.match(zh,/未發布研究預覽/);assert.match(zh,/不會同步/);assert.match(zh,/Passcode/);assert.match(zh,/並非實機測試/);
 for(const item of accountFreeReview.products)for(const key of ['description','pricing','tradeOff'])assert.ok(accountFreeReview.translations[item[key]]);
 assert.equal(escapeDefinitions.filter(d=>d.slug===def.slug).length,1);
});

test('Standard Notes translation covers real taxonomy descriptions without changing sources or dates',()=>{
 const p=fresh().products.find(p=>p.slug==='standard-notes');p.status='published';
 p.attributes.find(c=>c.slug==='no-account-required').description='A meaningful local/core workflow can be started without creating a vendor account.';
 p.attributes.find(c=>c.slug==='account-free-note-workflow-scope').description='Documented local creation, editing and retention of personal notes in an installed desktop app without an app account. Sync, paid activation and external services are separate.';
 assert.equal(localizedProductReady(p),true);const zh=translateProduct(p);assert.match(zh.description,/純文字/);assert.deepEqual(zh.attributes.map(c=>c.sources),p.attributes.map(c=>c.sources));assert.deepEqual(zh.attributes.map(c=>c.lastVerifiedAt),p.attributes.map(c=>c.lastVerifiedAt));
});
