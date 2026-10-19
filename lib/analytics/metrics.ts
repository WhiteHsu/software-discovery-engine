import {parseDiscoveryEvent,type DiscoveryEvent} from './events.ts';
import {isKnownQaEvent} from './qa-exclusions.ts';

// One impression per placement exposure, one action per matching denominator.
// Null rate means there is no measured denominator, not zero interest.
export function discoveryMetrics(input:unknown[]){
 const ids=new Map<string,DiscoveryEvent>();let duplicateEvents=0;
 for(const raw of input){const e=parseDiscoveryEvent(raw),prior=ids.get(e.eventId);
  if(prior){if(JSON.stringify(Object.entries(prior).sort())!==JSON.stringify(Object.entries(e).sort()))throw Error('Event ID reused with different payload');duplicateEvents++;}else ids.set(e.eventId,e);
 }
 const events=[...ids.values()].filter(e=>!isKnownQaEvent(e));
 const excludedQaEvents=ids.size-events.length;
 const placement=(e:DiscoveryEvent)=>JSON.stringify([e.sessionId,e.pageViewId,e.routeSlug,e.productSlug,e.exposureId,e.position]);
 const page=(e:DiscoveryEvent)=>JSON.stringify([e.sessionId,e.pageViewId,e.productSlug]);
 const impressions=new Set(events.filter(e=>e.name==='product_impression').map(placement));
 const views=new Set(events.filter(e=>e.name==='product_view').map(page));
 const clicked=new Set<string>(),outbound=new Set<string>();let unmatchedClicks=0,unmatchedOutbound=0;
 for(const e of events){if(e.name==='product_click'){const key=placement(e);if(impressions.has(key))clicked.add(key);else unmatchedClicks++;}
  if(e.name==='outbound_click'){const key=page(e);if(views.has(key))outbound.add(key);else unmatchedOutbound++;}}
 return {productImpressions:impressions.size,clickedExposures:clicked.size,routeProductCtr:impressions.size?clicked.size/impressions.size:null,productViews:views.size,outboundProductViews:outbound.size,productOutboundCtr:views.size?outbound.size/views.size:null,duplicateEvents,unmatchedClicks,unmatchedOutbound,excludedQaEvents};
}
