import {escapeDefinitions} from '../discovery/escape-model.ts';

export type DiscoveryEvent={
 version:1; eventId:string; sessionId:string; pageViewId:string; occurredAt:string;
 name:'product_impression'|'product_click'|'product_view'|'outbound_click';
 surface:'escape'|'product'; path:string; productSlug:string;
 routeSlug?:string; exposureId?:string; position?:number; referrerHost?:string;
};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowed=new Set(['version','eventId','sessionId','pageViewId','occurredAt','name','surface','path','productSlug','routeSlug','exposureId','position','referrerHost']);
export function referrerHost(input:string):string|undefined{
 try{const url=new URL(input);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?url.hostname.toLowerCase():undefined;}catch{return undefined;}
}
// Validation is a payload contract, not proof of a human visit or published data.
// The future collector must verify current publication and apply abuse controls.
export function parseDiscoveryEvent(input:unknown):DiscoveryEvent{
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Event object required');
 const r=input as Record<string,unknown>;
 if(Object.keys(r).some(k=>!allowed.has(k)))throw Error('Unexpected event field');
 if(r.version!==1||!['eventId','sessionId','pageViewId'].every(k=>typeof r[k]==='string'&&uuid.test(r[k] as string)))throw Error('Invalid version or identifiers');
 if(typeof r.occurredAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(r.occurredAt)||!Number.isFinite(Date.parse(r.occurredAt))||new Date(r.occurredAt).toISOString()!==r.occurredAt)throw Error('Canonical UTC timestamp required');
 if(typeof r.productSlug!=='string'||r.productSlug.length>100||!slug.test(r.productSlug))throw Error('Invalid product slug');
 if(r.referrerHost!==undefined&&(typeof r.referrerHost!=='string'||r.referrerHost.length>253||referrerHost('https://'+r.referrerHost)!==r.referrerHost))throw Error('Referrer must contain hostname only');
 if(r.name==='product_impression'||r.name==='product_click'){
  if(r.surface!=='escape'||typeof r.routeSlug!=='string'||!escapeDefinitions.some(d=>d.slug===r.routeSlug)||r.path!=='/escape/'+r.routeSlug||typeof r.exposureId!=='string'||!uuid.test(r.exposureId)||typeof r.position!=='number'||!Number.isInteger(r.position)||r.position<1||r.position>100)throw Error('Invalid route placement');
 }else if(r.name==='product_view'||r.name==='outbound_click'){
  if(r.surface!=='product'||r.path!=='/software/'+r.productSlug||r.routeSlug!==undefined||r.exposureId!==undefined||r.position!==undefined)throw Error('Invalid product page context');
 }else throw Error('Unsupported event name');
 return {...r} as DiscoveryEvent;
}
