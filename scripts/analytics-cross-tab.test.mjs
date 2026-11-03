import test from 'node:test';
import assert from 'node:assert/strict';
import {storeOriginHandoff,readOriginHandoff} from '../lib/analytics/origin-handoff.ts';
import {configureClientV2,setCurrentPageV2,makePageV2,observePlacementsV2,originV2,emitV2,flushV2} from '../lib/analytics/client-v2.ts';
import {signSearchContext,readSearchContext,validateSearchContext} from '../lib/analytics/context-v2.ts';
import {parseEventV2} from '../lib/analytics/events-v2.ts';
class MemoryStorage {data=new Map();get length(){return this.data.size;}key(i){return [...this.data.keys()][i]??null;}getItem(k){return this.data.get(k)??null;}setItem(k,v){this.data.set(k,String(v));}removeItem(k){this.data.delete(k);}}
const now=Date.now(),id=()=>crypto.randomUUID();
const source={sessionId:id(),pageViewId:id(),path:'/zh-hant/discover',surface:'search'};
const search={searchId:id(),resultSetId:id()},secret='b'.repeat(64);
const receipt=signSearchContext({version:1,path:source.path,sessionId:source.sessionId,pageViewId:source.pageViewId,...search,issuedAt:now,expiresAt:now+1800000,intent:{status:'ready',anchor:null,problem:null,attributes:['no-account-required'],unresolved:false,workflow:'personal-notes'},outcome:'results',products:['affine']},secret);
const value={sessionId:source.sessionId,productSlug:'affine',expiresAt:now+1800000,receipt,fields:{originSurface:'search',originPageViewId:source.pageViewId,originSearchId:search.searchId,originExposureId:id(),originPosition:1}};
test('handoff is destination-specific, bounded, expires, and storage failures degrade safely',()=>{
 const storage=new MemoryStorage(),key=storeOriginHandoff(storage,value,now);assert.ok(key);
 assert.deepEqual(readOriginHandoff(storage,'#sd-origin='+key,'/zh-hant/software/affine',now),value);
 assert.equal(readOriginHandoff(storage,'#sd-origin='+key,'/software/obsidian',now),undefined);
 assert.equal(readOriginHandoff(storage,'#sd-origin='+key,'/software/affine/',now),undefined);
 assert.equal(readOriginHandoff(storage,'#other='+key,'/software/affine',now),undefined);
 assert.equal(readOriginHandoff(storage,'#sd-origin='+key,'/software/affine',now+1800000),undefined);assert.equal(storage.length,0);
 for(const patch of [{expiresAt:now+1800001},{sessionId:'bad'},{fields:{...value.fields,originPosition:7}},{receipt:'x'.repeat(6001)}])assert.equal(storeOriginHandoff(storage,{...value,...patch},now),undefined);
 const blocked={get length(){throw Error('blocked');},getItem(){throw Error('blocked');}};
 assert.equal(storeOriginHandoff(blocked,value,now),undefined);assert.equal(readOriginHandoff(blocked,'#sd-origin='+key,'/software/affine',now),undefined);
 for(let i=0;i<64;i++)assert.ok(storeOriginHandoff(storage,value,now));assert.equal(storeOriginHandoff(storage,value,now),undefined);
 assert.ok(storeOriginHandoff(storage,{...value,expiresAt:now+1800001},now+1800000));assert.equal(storage.length,1);
});
test('native new-tab link carries source before a click, joins signed anonymous session and retains rank validation',()=>{
 const shared=new MemoryStorage(),sourceStorage=new MemoryStorage(),batches=[],listeners=new Map();const noop=()=>{};
 class ElementStub {closest(){return this;}}
 const link=new ElementStub();Object.assign(link,{dataset:{searchProduct:'affine',discoveryPosition:'1'},origin:'https://toolelse.com',pathname:'/zh-hant/software/affine',hash:'',attrs:{href:'/zh-hant/software/affine'},getAttribute(k){return this.attrs[k]??null;},setAttribute(k,v){this.attrs[k]=v;}});
 const globals={Element:ElementStub,navigator:{doNotTrack:'0'},location:new URL('https://toolelse.com/zh-hant/discover'),window:{addEventListener:noop,removeEventListener:noop},document:{referrer:'',visibilityState:'visible',addEventListener:noop,removeEventListener:noop},localStorage:shared,sessionStorage:sourceStorage,history:{state:null,replaceState(_s,_t,url){globals.location=new URL(url,'https://toolelse.com');globalThis.location=globals.location;}},fetch:async(_url,init)=>{batches.push(JSON.parse(init.body));}};
 const descriptors=new Map(Object.keys(globals).map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));for(const [k,v]of Object.entries(globals))Object.defineProperty(globalThis,k,{value:v,writable:true,configurable:true});
 const root={querySelectorAll:()=>[link],contains:()=>true,addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n)};
 let dispose;
 try{
  configureClientV2(true);setCurrentPageV2(source);dispose=observePlacementsV2(root,source,[{slug:'affine',position:1}],receipt,search);
  const tracked=link.getAttribute('href');assert.match(tracked,/#sd-origin=[a-f0-9-]{36}$/);assert.equal(tracked.includes(receipt),false);assert.equal(tracked.includes(source.sessionId),false);assert.equal(batches.length,0);
  // A native context-menu open does not dispatch a click to the originating document.
  globalThis.sessionStorage=new MemoryStorage();globalThis.location=new URL(tracked,'https://toolelse.com');
  const destination=makePageV2(location.pathname,'product');destination.productSlug='affine';setCurrentPageV2(destination);
  assert.equal(destination.sessionId,source.sessionId);assert.notEqual(destination.pageViewId,source.pageViewId);assert.equal(location.hash,'');
  const origin=originV2('affine');assert.ok(origin);assert.equal(origin.fields.originSearchId,search.searchId);assert.equal(origin.receipt,receipt);
  for(const name of ['page_viewed','outbound_clicked'])emitV2(destination,name,origin.fields,origin.receipt);flushV2();
  const context=readSearchContext(receipt,secret,now+1);assert.equal(batches.length,1);
  for(const event of batches[0].events){parseEventV2(event);validateSearchContext(event,context);assert.throws(()=>validateSearchContext({...event,sessionId:id()},context));assert.throws(()=>validateSearchContext({...event,productSlug:'obsidian'},context));}
  assert.equal(batches[0].events.some(e=>e.name==='product_clicked'),false);
  // Existing click handler still records ordinary, Ctrl/Meta and middle-button actions.
  globalThis.location=new URL('https://toolelse.com/zh-hant/discover');setCurrentPageV2(source);
  for(const event of [{type:'click',button:0},{type:'click',button:0,ctrlKey:true},{type:'click',button:0,metaKey:true},{type:'auxclick',button:1}])listeners.get(event.type)({...event,target:link});
  assert.equal(batches.slice(1).flatMap(b=>b.events).filter(e=>e.name==='product_clicked').length,4);
  dispose();dispose=undefined;assert.equal(link.getAttribute('href'),'/zh-hant/software/affine');
  navigator.globalPrivacyControl=true;const count=shared.length;dispose=observePlacementsV2(root,source,[{slug:'affine',position:1}],receipt,search);assert.equal(shared.length,count);assert.equal(link.getAttribute('href'),'/zh-hant/software/affine');
 }finally{dispose?.();configureClientV2(false);for(const[k,d]of descriptors){if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];}}
});
