import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDiscoveryEvent} from '../lib/analytics/events.ts';
import {prepareEventBatch} from '../lib/analytics/ingestion.ts';
import {discoveryMetrics} from '../lib/analytics/metrics.ts';
import {collectEvents} from '../lib/analytics/http.ts';
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const event={version:1,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:'2026-10-19T09:30:00.000Z',name:'product_impression',surface:'hidden_gems',path:'/hidden-gems',productSlug:'joplin',position:1,exposureId:id(4)};
const context={products:new Set(['joplin','krita']),placements:[],gems:[{productSlug:'joplin',position:1},{productSlug:'krita',position:2}]};
test('editorial placements have an independent bounded context and never a fabricated comparison route',()=>{
 assert.deepEqual(parseDiscoveryEvent(event),event);
 for(const patch of [{routeSlug:'simple-notion-alternatives'},{position:0},{position:4},{position:1.5},{path:'/hidden-gems?email=private'},{exposureId:undefined},{name:'product_view'},{name:'outbound_click'}])assert.throws(()=>parseDiscoveryEvent({...event,...patch}));
 assert.equal(parseDiscoveryEvent({...event,name:'product_click'}).surface,'hidden_gems');
});
test('authoritative current editorial positions are mandatory even for otherwise published products',()=>{
 assert.equal(prepareEventBatch(JSON.stringify([event]),context,new Date(event.occurredAt)).events.length,1);
 for(const ctx of [{...context,gems:[]},{...context,gems:undefined},{...context,gems:[{productSlug:'joplin',position:2}]},{...context,products:new Set()}])assert.throws(()=>prepareEventBatch(JSON.stringify([event]),ctx,new Date(event.occurredAt)));
 assert.throws(()=>prepareEventBatch(JSON.stringify([{...event,productSlug:'krita',position:1}]),context,new Date(event.occurredAt)));
});
test('editorial and comparison CTR denominators cannot pair or contaminate one another',()=>{
 const click={...event,eventId:id(5),name:'product_click'};
 const route={...event,eventId:id(6),surface:'escape',routeSlug:'simple-notion-alternatives',path:'/escape/simple-notion-alternatives'};
 const result=discoveryMetrics([event,click,click,route,{...route,eventId:id(7),name:'product_click'}]);
 assert.equal(result.duplicateEvents,1);assert.equal(result.productImpressions,1);assert.equal(result.clickedExposures,1);assert.equal(result.routeProductCtr,1);
 assert.deepEqual(result.hiddenGems,{productImpressions:1,clickedExposures:1,productCtr:1,unmatchedClicks:0});
 const unmatched=discoveryMetrics([event,{...route,eventId:id(8),name:'product_click'},{...click,eventId:id(9),exposureId:id(10)}]);
 assert.equal(unmatched.routeProductCtr,null);assert.equal(unmatched.unmatchedClicks,1);assert.equal(unmatched.hiddenGems.productCtr,0);assert.equal(unmatched.hiddenGems.unmatchedClicks,1);
 assert.equal(discoveryMetrics([]).hiddenGems.productCtr,null);
});
test('known QA sessions are excluded from both editorial denominator and numerator',()=>{
 const qa={...event,sessionId:'dd469548-acd9-4fa9-8cec-124353f237f1'};
 const m=discoveryMetrics([qa,{...qa,eventId:id(11),name:'product_click'}]);
 assert.equal(m.excludedQaEvents,2);assert.equal(m.hiddenGems.productCtr,null);
});
test('HTTP admits only current editorial positions and preserves opt-out and disabled gates',async()=>{
 let writes=0,lookups=0;
 const config={enabled:true,origin:'https://example.org',rateSecret:'c'.repeat(64),trustedVercel:true};
 const request=(events=[event],headers={})=>new Request(config.origin+'/api/events',{method:'POST',headers:{origin:config.origin,'content-type':'application/json','x-vercel-forwarded-for':'203.0.113.1',...headers},body:JSON.stringify(events)});
 const deps={now:()=>new Date(event.occurredAt),admit:()=>true,publication:async()=>{lookups++;return context;},store:async()=>{writes++;return 'ok';}};
 assert.equal((await collectEvents(request(),config,deps)).status,204);
 assert.equal((await collectEvents(request([{...event,position:2}]),config,deps)).status,400);
 assert.equal((await collectEvents(request([event],{'sec-gpc':'1'}),config,deps)).status,204);
 assert.equal((await collectEvents(request(),{...config,enabled:false},deps)).status,404);
 assert.equal(writes,1);assert.equal(lookups,2);
});
