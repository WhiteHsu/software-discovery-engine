import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDiscoveryEvent,referrerHost} from '../lib/analytics/events.ts';
import {discoveryMetrics} from '../lib/analytics/metrics.ts';
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const exposure={version:1,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:'2026-10-19T01:00:00.000Z',name:'product_impression',surface:'escape',routeSlug:'privacy-friendly-grammarly-alternatives',path:'/escape/privacy-friendly-grammarly-alternatives',productSlug:'vale-local-passive-3-24-0',exposureId:id(4),position:1};
const view={version:1,eventId:id(10),sessionId:id(2),pageViewId:id(11),occurredAt:exposure.occurredAt,name:'product_view',surface:'product',path:'/software/vale-local-passive-3-24-0',productSlug:exposure.productSlug};
test('valid route placements and product-page events keep bounded anonymous context',()=>{
 assert.equal(parseDiscoveryEvent(exposure).position,1);assert.equal(parseDiscoveryEvent(view).surface,'product');
 assert.equal(referrerHost('https://example.org/private?q=secret#fragment'),'example.org');assert.equal(referrerHost('javascript:alert(1)'),undefined);assert.equal(referrerHost('https://user:pass@example.org'),undefined);
});
test('invalid context, free-text fields, URLs and malformed timestamps fail closed',()=>{
 for(const patch of [{rawQuery:'private text'},{email:'x@y.com'},{referrerHost:'example.org/private?q=x'},{referrerHost:'example.org:443'},{position:0},{position:1.5},{routeSlug:'unknown'},{path:exposure.path+'?q=secret'},{occurredAt:'2026-02-30T00:00:00.000Z'},{eventId:'bad'},{name:'page_view'}])assert.throws(()=>parseDiscoveryEvent({...exposure,...patch}));
 assert.throws(()=>parseDiscoveryEvent({...view,exposureId:id(4)}));assert.throws(()=>parseDiscoveryEvent({...view,path:'/software/other'}));
});
test('CTR counts unique measured exposures and product views despite retries and repeated actions',()=>{
 const click={...exposure,name:'product_click',eventId:id(5)},out={...view,name:'outbound_click',eventId:id(12)};
 const r=discoveryMetrics([click,exposure,exposure,{...exposure,eventId:id(6)}, {...click,eventId:id(7)},view,out,{...out,eventId:id(13)}]);
 assert.equal(r.productImpressions,1);assert.equal(r.clickedExposures,1);assert.equal(r.routeProductCtr,1);assert.equal(r.productOutboundCtr,1);assert.equal(r.duplicateEvents,1);
});
test('unmatched clicks never create denominators or leak attribution across sessions, pages or positions',()=>{
 const click={...exposure,name:'product_click',eventId:id(5),position:2};const out={...view,name:'outbound_click',eventId:id(12),sessionId:id(99)};
 const r=discoveryMetrics([exposure,click,view,out]);assert.equal(r.routeProductCtr,0);assert.equal(r.productOutboundCtr,0);assert.equal(r.unmatchedClicks,1);assert.equal(r.unmatchedOutbound,1);
 assert.equal(discoveryMetrics([click]).routeProductCtr,null);assert.equal(discoveryMetrics([]).productOutboundCtr,null);
 assert.throws(()=>discoveryMetrics([exposure,{...exposure,position:2}]));
});
