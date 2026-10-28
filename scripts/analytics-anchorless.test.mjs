import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {escapeContextV2} from '../lib/analytics/escape-context-v2.ts';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
import {parseEventV2} from '../lib/analytics/events-v2.ts';
import {collectV2,collectorConfigV2} from '../lib/analytics/http-v2.ts';
// Exercise the actual publication validator with bounded synthetic data, without network or credentials.
const mocks={
 'server-only':'export {};',
 '@/lib/i18n/server':`export async function getChineseProduct(slug){return slug==='omnifocus'?{status:'published'}:null;}`,
 '@/lib/discovery/escapes':`export const escapePreview=()=>false;export async function getEscape(slug){return {published:true,candidates:[{eligible:true,product:{slug:'omnifocus',status:'published'}}]};}`,
 '@/lib/discovery/products':`export const localPreview=()=>false;export async function getProduct(){return {status:'published'};}`,
 '@/lib/discovery/hidden-gems-server':`export async function getHiddenGems(){return [];}`,
};
const hooks=registerHooks({resolve(specifier,context,next){if(Object.hasOwn(mocks,specifier))return {url:'data:text/javascript,'+encodeURIComponent(mocks[specifier]),shortCircuit:true};if(specifier==='@/lib/discovery/escape-model')return {url:new URL('../lib/discovery/escape-model.ts',import.meta.url).href,shortCircuit:true};return next(specifier,context);}});
const {publicationV2}=await import('../lib/analytics/publication-v2.ts');
hooks.deregister();
const def=escapeDefinitions.find(d=>d.slug==='productivity-apps-you-can-buy-once');
const now=new Date(),id=()=>crypto.randomUUID();
const base={version:2,eventId:id(),sessionId:id(),pageViewId:id(),occurredAt:now.toISOString(),name:'page_viewed',surface:'escape',...escapeContextV2(def)};
const config=collectorConfigV2({NEXT_PUBLIC_SITE_URL:'https://toolelse.com',ANALYTICS_ENABLED:'true',ANALYTICS_MAINTENANCE_READY:'true',ANALYTICS_V2_ENABLED:'true',ANALYTICS_RATE_SECRET:'a'.repeat(64),ANALYTICS_CONTEXT_SECRET:'b'.repeat(64),SUPABASE_SERVICE_ROLE_KEY:'synthetic-test-only',VERCEL:'1',VERCEL_ENV:'production'});
async function collect(events){let stored;const request=new Request('https://toolelse.com/api/events/v2',{method:'POST',headers:{origin:'https://toolelse.com','content-type':'application/json','x-vercel-forwarded-for':'203.0.113.8'},body:JSON.stringify({events})});const response=await collectV2(request,config,{now:()=>now,admit:()=>true,publication:publicationV2,store:async e=>{stored=e;return 'ok';}});return {status:response.status,stored};}
test('anchorless English and Chinese comparison batches pass contract and actual publication validation',async()=>{
 assert.equal(Object.hasOwn(escapeContextV2(def),'anchor'),false);
 for(const prefix of ['','/zh-hant']){
  const page={...base,path:prefix+'/escape/'+def.slug};
  const placement={...page,eventId:id(),name:'product_impression',productSlug:'omnifocus',position:1,exposureId:id()};
  const events=[page,{...page,eventId:id(),name:'escape_route_viewed'},placement,{...placement,eventId:id(),name:'product_clicked'}];
  const result=await collect(events);assert.equal(result.status,204);assert.deepEqual(result.stored,events);
  const product={...page,eventId:id(),pageViewId:id(),name:'page_viewed',surface:'product',path:'/software/omnifocus',productSlug:'omnifocus',routeSlug:undefined,constraints:undefined,originSurface:'escape',originRouteSlug:def.slug,originPageViewId:page.pageViewId,originExposureId:placement.exposureId,originPosition:1};
  for(const name of ['page_viewed','outbound_clicked'])assert.equal((await collect([{...product,eventId:id(),name}])).status,204);
 }
});
test('null, forged anchors, wrong constraints and wrong positions remain rejected',async()=>{
 const page={...base,path:'/zh-hant/escape/'+def.slug};
 for(const patch of [{anchor:null},{anchor:'notion'},{constraints:[]},{name:'product_clicked',productSlug:'omnifocus',position:2,exposureId:id()}])assert.equal((await collect([{...page,...patch}])).status,400);
});
test('anchored routes keep their required anchor and reject missing or altered context',async()=>{
 const anchored=escapeDefinitions.find(d=>d.slug==='offline-notion-alternatives');
 const page={...base,...escapeContextV2(anchored),path:'/zh-hant/escape/'+anchored.slug};
 assert.equal(parseEventV2(page).anchor,'notion');assert.equal((await collect([page])).status,204);
 for(const anchor of [undefined,'todoist',null])assert.equal((await collect([{...page,anchor}])).status,400);
});

test('Chinese product page and outbound events pass the real collector only when a localized product is available',async()=>{
 for(const name of ['page_viewed','outbound_clicked']){
  const e={version:2,eventId:id(),sessionId:id(),pageViewId:id(),occurredAt:now.toISOString(),name,surface:'product',path:'/zh-hant/software/omnifocus',productSlug:'omnifocus'};
  const r=await collect([e]);assert.equal(r.status,204);assert.equal(r.stored[0].path,e.path);
  assert.equal((await collect([{...e,eventId:id(),path:'/zh-hant/software/affine',productSlug:'affine'}])).status,400);
 }
});
