import {parseDiscoveryEvent,type DiscoveryEvent} from './events.ts';

export const MAX_EVENT_BYTES=16_384;
export const MAX_BATCH_EVENTS=20;
export type PublishedPlacement={routeSlug:string;productSlug:string;position:number};
export type PublicationContext={products:ReadonlySet<string>;placements:readonly PublishedPlacement[]};
// Pure receiver boundary. Context must come from server-qualified live records,
// never from request JSON. This does not persist events or implement rate limits.
export function prepareEventBatch(body:string,context:PublicationContext,receivedAt:Date){
 const now=receivedAt.getTime();
 if(!Number.isFinite(now))throw Error('Invalid ingestion time');
 if(new TextEncoder().encode(body).byteLength>MAX_EVENT_BYTES)throw Error('Event batch too large');
 const raw:unknown=JSON.parse(body);
 if(!Array.isArray(raw)||raw.length<1||raw.length>MAX_BATCH_EVENTS)throw Error('Expected 1 to 20 events');
 const events:DiscoveryEvent[]=[],ids=new Map<string,string>();
 for(const item of raw){
  const event=parseDiscoveryEvent(item),occurred=Date.parse(event.occurredAt);
  if(occurred>now+5*60_000||occurred<now-24*60*60_000)throw Error('Event outside ingestion window');
  if(!context.products.has(event.productSlug))throw Error('Product is not currently public');
  if(event.surface==='escape'&&!context.placements.some(p=>p.routeSlug===event.routeSlug&&p.productSlug===event.productSlug&&p.position===event.position))throw Error('Placement is not currently qualified and public');
  const normalized=JSON.stringify(Object.entries(event).sort()),prior=ids.get(event.eventId);
  if(prior!==undefined){if(prior!==normalized)throw Error('Conflicting event ID');continue;}
  ids.set(event.eventId,normalized);events.push(event);
 }
 return {events,receivedAt:receivedAt.toISOString()};
}
