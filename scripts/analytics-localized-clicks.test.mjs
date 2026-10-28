import test from 'node:test';
import assert from 'node:assert/strict';
import {configureClientV2,setCurrentPageV2,observePlacementsV2,originV2,emitV2,flushV2} from '../lib/analytics/client-v2.ts';

test('real placement click handler preserves English and Chinese product attribution and refuses invalid targets',()=>{
 const storage=new Map(),batches=[];
 class ElementStub {closest(){return this;}}
 const listeners=new Map();
 const noop=()=>{};
 const globals={Element:ElementStub,navigator:{},location:new URL('https://toolelse.com'),window:{addEventListener:noop,removeEventListener:noop},document:{visibilityState:'visible',addEventListener:noop,removeEventListener:noop},sessionStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},fetch:async(url,options)=>{batches.push(JSON.parse(options.body));}};
 const descriptors=new Map(Object.keys(globals).map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{value,configurable:true});
 const slug='vale-local-passive-3-24-0';
 const c={sessionId:crypto.randomUUID(),pageViewId:crypto.randomUUID(),path:'/zh-hant/escape/privacy-friendly-grammarly-alternatives',surface:'escape',routeSlug:'privacy-friendly-grammarly-alternatives'};
 const root={querySelectorAll:()=>[],contains:()=>true,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
 configureClientV2(true);setCurrentPageV2(c);
 const dispose=observePlacementsV2(root,c,[{slug,position:2}],'test-receipt');
 try{
  for(const path of ['/software/'+slug,'/zh-hant/software/'+slug]){
   storage.clear();batches.length=0;
   const a=Object.assign(new ElementStub(),{dataset:{discoveryProduct:slug,discoveryPosition:'2'},origin:location.origin,pathname:path});
   listeners.get('click')({type:'click',button:0,target:a});
   const clicked=batches[0].events[0];assert.equal(clicked.name,'product_clicked');assert.equal(clicked.productSlug,slug);
   setCurrentPageV2({...c,pageViewId:crypto.randomUUID(),surface:'product',path,productSlug:slug});
   const origin=originV2(slug);assert.equal(origin.fields.originRouteSlug,c.routeSlug);assert.equal(origin.fields.originPageViewId,c.pageViewId);assert.equal(origin.fields.originExposureId,clicked.exposureId);assert.equal(origin.fields.originPosition,2);assert.equal(origin.receipt,'test-receipt');
   for(const name of ['page_viewed','outbound_clicked'])emitV2({...c,surface:'product',path,productSlug:slug},name,origin.fields,origin.receipt);
   flushV2();assert.deepEqual(batches[1].events.map(e=>e.name),['page_viewed','outbound_clicked']);
   for(const e of batches[1].events){assert.equal(e.originPageViewId,c.pageViewId);assert.equal(e.originRouteSlug,c.routeSlug);assert.equal(e.path,path);}
  }
  for(const [pathname,origin,product] of [['/zh-hant/software/joplin',location.origin,slug],['/zh-hant/software/'+slug,'https://example.com',slug],['/zh-hant/software/unregistered',location.origin,'unregistered'],['/zh-hant/software/'+slug+'/',location.origin,slug]]){
   storage.clear();batches.length=0;
   listeners.get('click')({type:'click',button:0,target:Object.assign(new ElementStub(),{pathname,origin,dataset:{discoveryProduct:product}})});
   assert.equal(batches.length,0);assert.equal(storage.size,0);
  }
  storage.clear();batches.length=0;
  const hidden={...c,surface:'hidden_gems',path:'/zh-hant/hidden-gems',routeSlug:undefined};setCurrentPageV2(hidden);
  const stopHidden=observePlacementsV2(root,hidden,[{slug:'joplin',position:1}]);
  try{
   listeners.get('click')({type:'click',button:0,target:Object.assign(new ElementStub(),{pathname:'/zh-hant/software/joplin',origin:location.origin,dataset:{discoveryProduct:'joplin',discoveryPosition:'1'}})});
   assert.equal(batches[0].events[0].name,'product_clicked');assert.equal(batches[0].events[0].path,hidden.path);
   const origin=originV2('joplin');assert.equal(origin.fields.originSurface,'hidden_gems');assert.equal(origin.fields.originPageViewId,hidden.pageViewId);assert.equal(Object.hasOwn(origin.fields,'originRouteSlug'),false);
   for(const name of ['page_viewed','outbound_clicked'])emitV2({...hidden,surface:'product',path:'/zh-hant/software/joplin',productSlug:'joplin'},name,origin.fields);
   flushV2();for(const event of batches[1].events){assert.equal(event.originSurface,'hidden_gems');assert.equal(event.originPageViewId,hidden.pageViewId);}
  }finally{stopHidden();}
 }finally{
  dispose();configureClientV2(false);
  for(const [key,descriptor] of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
 }
});
