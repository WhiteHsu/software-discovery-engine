import test from 'node:test';
import assert from 'node:assert/strict';
import {claimValue} from '../lib/discovery/model.ts';
import {zhValue} from '../lib/i18n/localized.ts';
import {buildAccountFreePreview} from './seed/build-account-free-preview.mjs';
import {searchGraph} from '../lib/discovery/search-graph.ts';
import {localizeSearchResult} from '../lib/i18n/search-localized.ts';
test('account-free scope is readable in English and Chinese while unsupported evidence stays unknown',()=>{
 const p=buildAccountFreePreview().products[0],c=p.attributes.find(c=>c.slug==='account-free-note-workflow-scope');
 assert.equal(claimValue(c),'Local desktop personal note creation, editing and retention without an app account.');assert.match(zhValue(c),/個人桌面本機筆記/);
 assert.equal(claimValue({...c,verificationStatus:'unknown'}),'Unknown');assert.equal(claimValue({...c,sources:[]}),'Unknown');
});
test('search workflow evidence uses readable text without changing qualification or identity',()=>{
 const page=buildAccountFreePreview().page;page.published=true;for(const c of page.candidates)c.product.status='published';
 const intent={status:'ready',anchor:null,problem:null,attributes:['no-account-required'],unresolved:false},matches=searchGraph(intent,[page]);assert.equal(matches.length,3);
 for(const m of matches){const scope=m.facts.find(f=>f.id==='workflow-scope');assert.ok(scope);assert.equal(scope.value,'Local desktop personal note creation, editing and retention without an app account.');assert.ok(scope.sources.length);}
 const zh=localizeSearchResult({state:'results',intent,matches,explanationMode:'verified-evidence'});assert.deepEqual(zh.matches.map(m=>m.slug),matches.map(m=>m.slug));assert.ok(zh.matches.every(m=>m.facts.find(f=>f.id==='workflow-scope').value.includes('個人桌面本機筆記')));
});
