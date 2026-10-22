import {parseEventV2,historicalEvent,type EventV2} from './events-v2.ts';
import {isKnownQaEvent} from './qa-exclusions.ts';
const stable=(v:unknown):string=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>JSON.stringify(k)+':'+stable(x)).join(',')+'}':JSON.stringify(v);
export function metricsV2(input:unknown[]){
 const ids=new Map<string,{raw:string;event:EventV2}>();let duplicates=0,excludedQa=0;
 for(const raw of input){
  const version=(raw as {version?:unknown})?.version;
  const e=version===1?historicalEvent(raw):parseEventV2(raw);
  // PostgreSQL UUIDs are case-insensitive; normalize keys for exported JSON too.
  const id=e.eventId.toLowerCase(),prior=ids.get(id),encoded=stable(raw);
  if(prior){if(prior.raw!==encoded)throw Error('Conflicting event ID');duplicates++;continue;}
  ids.set(id,{raw:encoded,event:e});
 }
 const events=[...ids.values()].map(v=>v.event).filter(e=>{if(isKnownQaEvent(e)){excludedQa++;return false;}return true;});
 const lower=(v:string|undefined)=>v?.toLowerCase();
 const placement=(e:EventV2)=>JSON.stringify([e.surface,lower(e.sessionId),lower(e.pageViewId),e.routeSlug,lower(e.searchId),lower(e.resultSetId),e.productSlug,lower(e.exposureId),e.position]);
 const page=(e:EventV2)=>JSON.stringify([lower(e.sessionId),lower(e.pageViewId),e.productSlug]);
 const surfaces=Object.fromEntries((['search','escape','hidden_gems'] as const).map(surface=>{
  const impressions=new Map<string,number>();const clicked=new Set<string>();let unmatchedClicks=0;
  for(const e of events)if(e.surface===surface&&e.name==='product_impression'){
   const key=placement(e),at=Date.parse(e.occurredAt);impressions.set(key,Math.min(at,impressions.get(key)??Infinity));
  }
  for(const e of events)if(e.surface===surface&&e.name==='product_clicked'){
   const key=placement(e),at=impressions.get(key);
   if(at!==undefined&&at<=Date.parse(e.occurredAt))clicked.add(key);else unmatchedClicks++;
  }
  return [surface,{impressions:impressions.size,clickedExposures:clicked.size,ctr:impressions.size?clicked.size/impressions.size:null,unmatchedClicks}];
 }));
 const views=new Map<string,number>(),outbound=new Set<string>();let unmatchedOutbound=0;
 for(const e of events)if(e.surface==='product'&&e.name==='page_viewed')views.set(page(e),Math.min(Date.parse(e.occurredAt),views.get(page(e))??Infinity));
 for(const e of events)if(e.name==='outbound_clicked'){
  const key=page(e),at=views.get(key);if(at!==undefined&&at<=Date.parse(e.occurredAt))outbound.add(key);else unmatchedOutbound++;
 }
 const searchAttempts=new Set(events.filter(e=>e.name==='search_performed').map(e=>JSON.stringify([lower(e.sessionId),lower(e.searchId)])));
 const outcomes=Object.fromEntries(['results','no_results','clarify','unsupported','error'].map(outcome=>[outcome,new Set(events.filter(e=>e.name==='search_results_viewed'&&e.outcome===outcome).map(e=>JSON.stringify([lower(e.sessionId),lower(e.searchId),lower(e.resultSetId)]))).size]));
 return {surfaces,search:{attempts:searchAttempts.size,viewedOutcomes:outcomes},pages:new Set(events.filter(e=>e.name==='page_viewed').map(e=>JSON.stringify([lower(e.sessionId),lower(e.pageViewId),e.path]))).size,escapeViews:new Set(events.filter(e=>e.name==='escape_route_viewed').map(e=>JSON.stringify([lower(e.sessionId),lower(e.pageViewId),e.routeSlug]))).size,product:{views:views.size,outboundViews:outbound.size,ctr:views.size?outbound.size/views.size:null,unmatchedOutbound},duplicates,excludedQa};
}
