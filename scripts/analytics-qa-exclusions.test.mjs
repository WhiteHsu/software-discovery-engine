import test from 'node:test';
import assert from 'node:assert/strict';
import {knownQaSessionIds} from '../lib/analytics/qa-exclusions.ts';
import {discoveryMetrics} from '../lib/analytics/metrics.ts';
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
function journey(sessionId,offset=0){
 const common={version:1,sessionId,occurredAt:'2026-10-19T04:18:02.619Z',productSlug:'affine'};
 const exposure={...common,eventId:id(offset+1),pageViewId:id(offset+20),name:'product_impression',surface:'escape',routeSlug:'offline-notion-alternatives',path:'/escape/offline-notion-alternatives',exposureId:id(offset+30),position:1};
 const view={...common,eventId:id(offset+3),pageViewId:id(offset+21),name:'product_view',surface:'product',path:'/software/affine'};
 return [exposure,{...exposure,eventId:id(offset+2),name:'product_click'},view,{...view,eventId:id(offset+4),name:'outbound_click'}];
}
test('known QA sessions cannot produce demand denominators, actions or unmatched diagnostics',()=>{
 const data=knownQaSessionIds.flatMap((s,i)=>journey(s,i*100));const r=discoveryMetrics(data);
 assert.equal(r.excludedQaEvents,knownQaSessionIds.length*4);assert.equal(r.productImpressions,0);assert.equal(r.productViews,0);
 assert.equal(r.clickedExposures,0);assert.equal(r.outboundProductViews,0);assert.equal(r.routeProductCtr,null);assert.equal(r.productOutboundCtr,null);
 assert.equal(r.unmatchedClicks,0);assert.equal(r.unmatchedOutbound,0);
});
test('ordinary journeys remain measurable alongside QA; matching stays within session',()=>{
 const ordinary=journey(id(900),400),qa=journey(knownQaSessionIds[1],500);
 const r=discoveryMetrics([...ordinary,...qa,qa[0]]);
 assert.equal(r.productImpressions,1);assert.equal(r.clickedExposures,1);assert.equal(r.productViews,1);assert.equal(r.outboundProductViews,1);
 assert.equal(r.excludedQaEvents,4);assert.equal(r.duplicateEvents,1);
 const unmatched=discoveryMetrics([qa[0],{...ordinary[1],exposureId:qa[0].exposureId,pageViewId:qa[0].pageViewId}]);
 assert.equal(unmatched.productImpressions,0);assert.equal(unmatched.unmatchedClicks,1);assert.equal(unmatched.routeProductCtr,null);
});
test('accepted probe event excluded even without session match; UUID case normalized',()=>{
 const e=journey(id(901),600)[2];e.eventId='97F18F34-5FC4-4F44-9912-11EDDE1D1DA7';
 const r=discoveryMetrics([e,...journey(knownQaSessionIds[1].toUpperCase(),700)]);
 assert.equal(r.excludedQaEvents,5);assert.equal(r.productViews,0);assert.equal(r.productImpressions,0);
});
test('QA exclusion never bypasses payload validation or conflicting ID detection',()=>{
 const e=journey(knownQaSessionIds[1],800)[0];
 assert.throws(()=>discoveryMetrics([{...e,email:'not-an-allowed-field'}]));
 assert.throws(()=>discoveryMetrics([e,{...e,position:2}]));
});

test('accepted Hidden Gems QA journey is excluded while an ordinary editorial journey remains measurable',()=>{
 const qaId='7f244ce2-4ebe-497c-bc8c-4a4c8b015529';
 const editorial=(session,offset)=>journey(session,offset).map(e=>e.surface==='escape'?{...e,productSlug:'joplin',surface:'hidden_gems',path:'/hidden-gems',routeSlug:undefined}: {...e,productSlug:'joplin',path:'/software/joplin'}).map(e=>{const clean={...e};delete clean.routeSlug;return clean;});
 const qa=editorial(qaId.toUpperCase(),1000),ordinary=editorial(id(9900),1200);
 const only=discoveryMetrics(qa);assert.equal(only.excludedQaEvents,4);assert.equal(only.hiddenGems.productCtr,null);assert.equal(only.productViews,0);assert.equal(only.productOutboundCtr,null);
 const mixed=discoveryMetrics([...qa,...ordinary,qa[0]]);
 assert.equal(mixed.excludedQaEvents,4);assert.equal(mixed.duplicateEvents,1);assert.equal(mixed.hiddenGems.productImpressions,1);assert.equal(mixed.hiddenGems.clickedExposures,1);assert.equal(mixed.hiddenGems.productCtr,1);assert.equal(mixed.productViews,1);assert.equal(mixed.productOutboundCtr,1);assert.equal(mixed.routeProductCtr,null);
 assert.throws(()=>discoveryMetrics([qa[0],{...qa[0],position:2}]));
});
