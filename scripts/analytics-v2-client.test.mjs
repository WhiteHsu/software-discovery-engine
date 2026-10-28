import test from 'node:test';
import assert from 'node:assert/strict';
import {configureClientV2,makePageV2,setCurrentPageV2,emitV2,flushV2,beginSearchV2} from '../lib/analytics/client-v2.ts';
import {searchReceipt} from '../lib/analytics/search-receipt.ts';
import {readSearchContext} from '../lib/analytics/context-v2.ts';
const storage=new Map();const sent=[];
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{doNotTrack:'0',sendBeacon:()=>false}});
globalThis.window={};globalThis.document={referrer:'https://news.example/article?private=secret'};globalThis.location={hostname:'site.example'};
globalThis.sessionStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
globalThis.fetch=async(url,init)=>{sent.push({url,...JSON.parse(init.body)});return new Response(null,{status:204});};
test('shared anonymous identity and hostname-only referrer; no URL query leakage',()=>{
 const first=makePageV2('/','home');setCurrentPageV2(first);const second=makePageV2('/discover','search');
 assert.equal(first.sessionId,second.sessionId);assert.notEqual(first.pageViewId,second.pageViewId);assert.equal(first.referrerHost,'news.example');assert.equal(first.source,'external');assert.equal(second.referrerHost,'site.example');assert.equal(second.source,'internal');
});
test('transport is off by default and honours opt-outs again at flush time',()=>{
 const c=makePageV2('/','home');emitV2(c,'page_viewed');flushV2();assert.equal(sent.length,0);
 configureClientV2(true);emitV2(c,'page_viewed');navigator.globalPrivacyControl=true;flushV2();assert.equal(sent.length,0);navigator.globalPrivacyControl=false;
});
test('batches stay within page/surface/receipt and event count bounds',()=>{
 sent.length=0;const c=makePageV2('/','home');for(let i=0;i<21;i++)emitV2(c,'page_viewed');const other=makePageV2('/discover','search');emitV2(other,'page_viewed');flushV2();
 assert.deepEqual(sent.map(s=>s.events.length),[20,1,1]);assert.ok(sent.every(s=>s.events.every(e=>e.pageViewId===s.events[0].pageViewId&&e.surface===s.events[0].surface)));
});
test('search attempts get new IDs and redacted text without changing URLs',()=>{
 sent.length=0;const c=makePageV2('/discover','search');setCurrentPageV2(c);const a=beginSearchV2('Notion alice@example.com'),b=beginSearchV2('Notion offline');flushV2();
 assert.notEqual(a.searchId,b.searchId);assert.equal(JSON.parse(a.header).path,'/discover');assert.equal(sent[0].events[0].query,'Notion [email]');assert.equal(sent[0].events[0].searchId,a.searchId);
});
test('search receipt integration is opt-in, server-signed and disabled for privacy opt-out',()=>{
 const env={NEXT_PUBLIC_SITE_URL:'https://site.example',ANALYTICS_ENABLED:'true',ANALYTICS_MAINTENANCE_READY:'true',ANALYTICS_V2_ENABLED:'true',ANALYTICS_RATE_SECRET:'a'.repeat(64),ANALYTICS_CONTEXT_SECRET:'b'.repeat(64),SUPABASE_SERVICE_ROLE_KEY:'placeholder',VERCEL:'1',VERCEL_ENV:'production'};
 const a=beginSearchV2('Notion');const result={state:'no_results',intent:{status:'ready',anchor:'notion',problem:null,attributes:[],unresolved:false},matches:[],explanationMode:'verified-evidence'};
 const request=new Request('https://site.example/api/discover',{headers:{'x-discovery-context':a.header}});
 const metadata=searchReceipt(request,result,env,1000);assert.ok(metadata);assert.equal(readSearchContext(metadata.receipt,env.ANALYTICS_CONTEXT_SECRET,1000).searchId,a.searchId);
 assert.equal(searchReceipt(request,result,{...env,ANALYTICS_V2_ENABLED:'false'},1000),undefined);
 assert.equal(searchReceipt(new Request(request,{headers:{'x-discovery-context':a.header,dnt:'1'}}),result,env,1000),undefined);
 assert.equal(searchReceipt(new Request('https://site.example/api/discover',{headers:{'x-discovery-context':'malformed'}}),result,env,1000),undefined);
});

test('Chinese home and discover attempts preserve their paths and share redaction and opt-out behavior',()=>{
 for(const path of ['/zh-hant','/zh-hant/discover']){
  flushV2();sent.length=0;configureClientV2(true);setCurrentPageV2(makePageV2(path,path==='/zh-hant'?'home':'search'));
  const attempt=beginSearchV2('找 Notion alice@example.com');assert.ok(attempt);assert.equal(JSON.parse(attempt.header).path,path);flushV2();assert.equal(sent[0].events[0].path,path);assert.equal(sent[0].events[0].query,'找 Notion [email]');
  navigator.globalPrivacyControl=true;assert.equal(beginSearchV2('Notion'),undefined);navigator.globalPrivacyControl=false;
 }
 setCurrentPageV2(makePageV2('/zh-hant/hidden-gems','hidden_gems'));assert.equal(beginSearchV2('Notion'),undefined);
});
