import test from 'node:test';
import assert from 'node:assert/strict';
import {parseEventV2,redactSearchQuery,historicalEvent,eventNamesV2} from '../lib/analytics/events-v2.ts';
import {metricsV2} from '../lib/analytics/metrics-v2.ts';
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const base={version:2,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:'2026-10-22T00:00:00.000Z',name:'page_viewed',surface:'home',path:'/'};
const intent={status:'ready',anchor:'notion',problem:null,attributes:['works-offline'],unresolved:false};
const imp={...base,name:'product_impression',surface:'search',path:'/discover',searchId:id(4),resultSetId:id(5),productSlug:'joplin',position:1,exposureId:id(6)};
test('all nine canonical events validate with their required context',()=>{
 const samples=[base,{...base,name:'search_performed',surface:'search',path:'/discover',searchId:id(4),query:'Notion offline'},{...base,name:'search_results_viewed',surface:'search',path:'/discover',searchId:id(4),resultSetId:id(5),intent,outcome:'results',resultCount:1},{...base,name:'escape_route_viewed',surface:'escape',path:'/escape/offline-notion-alternatives',routeSlug:'offline-notion-alternatives',anchor:'notion'},imp,{...imp,name:'product_clicked'},{...base,name:'outbound_clicked',surface:'product',path:'/software/joplin',productSlug:'joplin'},{...base,name:'constraint_selected',selection:'offline'},{...base,name:'anchor_selected',selection:null}];
 assert.deepEqual(samples.map(e=>parseEventV2(e).name),eventNamesV2);
});
test('rejects extra fields, URL query leakage, fake enums and unrelated context',()=>{
 for(const patch of [{email:'x'},{path:'/?q=secret'},{sessionId:'person@example.com'},{anchor:'made-up'},{constraints:['secret']},{referrerHost:'example.com/path'},{position:1},{query:'secret'},{selection:'notion'},{productSlug:'joplin'}])assert.throws(()=>parseEventV2({...base,...patch}));
 for(const patch of [{searchId:undefined},{resultSetId:undefined},{position:7},{surface:'home'},{intent},{outcome:'results'}])assert.throws(()=>parseEventV2({...imp,...patch}));
});
test('query diagnostic text is optional and common identifiers are redacted',()=>{
 const e={...base,name:'search_performed',surface:'search',path:'/discover',searchId:id(4)};
 assert.ok(parseEventV2(e));
 assert.throws(()=>parseEventV2({...e,query:'email me alice@example.com'}));
 assert.equal(redactSearchQuery('Notion alice@example.com https://example.com/private +886 912 345 678'),'Notion [email] [url] [number]');
 assert.ok(parseEventV2({...e,query:'Notion [email]'}));
});
test('result counts and states cannot contradict intent or invent a denominator',()=>{
 const e={...base,name:'search_results_viewed',surface:'search',path:'/discover',searchId:id(4),resultSetId:id(5),intent,outcome:'no_results',resultCount:0};
 assert.ok(parseEventV2(e));
 for(const patch of [{resultCount:1},{intent:{...intent,status:'clarify',unresolved:true}},{outcome:'results'},{resultCount:7},{query:'Notion'}])assert.throws(()=>parseEventV2({...e,...patch}));
});
test('CTR is matched by result set/rank/exposure and excludes clicks before exposure',()=>{
 const click={...imp,eventId:id(7),name:'product_clicked',occurredAt:'2026-10-22T00:00:01.000Z'};
 const m=metricsV2([imp,click,{...click,eventId:id(8)},{...click,eventId:id(9),resultSetId:id(10)},{...click,eventId:id(11),occurredAt:'2026-10-21T23:59:59.000Z'}]);
 assert.deepEqual(m.surfaces.search,{impressions:1,clickedExposures:1,ctr:1,unmatchedClicks:2});
 assert.equal(m.surfaces.escape.ctr,null);assert.equal(metricsV2([]).product.ctr,null);
});
test('dedup detects conflicting IDs before QA exclusion and excludes known QA',()=>{
 assert.equal(metricsV2([imp,imp]).duplicates,1);
 assert.throws(()=>metricsV2([imp,{...imp,position:2}]));
 const qa={...imp,sessionId:'e20a7cc5-b115-46bc-bd7a-1e25f645bf20'};
 assert.equal(metricsV2([qa]).excludedQa,1);assert.equal(metricsV2([qa]).surfaces.search.impressions,0);
 assert.throws(()=>metricsV2([qa,{...qa,position:2}]));
});
test('historical v1 events remain readable without modifying or duplicating stored data',()=>{
 const old={...base,version:1,name:'product_view',surface:'product',path:'/software/joplin',productSlug:'joplin'};
 assert.equal(historicalEvent(old).name,'page_viewed');assert.equal(old.version,1);
 const out={...old,eventId:id(12),name:'outbound_click',occurredAt:'2026-10-22T00:00:01.000Z'};
 assert.equal(metricsV2([old,out]).product.ctr,1);
});
test('attribution requires complete, surface-specific context',()=>{
 const e={...base,surface:'product',path:'/software/joplin',productSlug:'joplin',originSurface:'search',originPageViewId:id(3),originExposureId:id(6),originSearchId:id(4),originPosition:1};
 assert.ok(parseEventV2(e));assert.throws(()=>parseEventV2({...e,originSearchId:undefined}));
 assert.throws(()=>parseEventV2({...e,originRouteSlug:'offline-notion-alternatives'}));
});
