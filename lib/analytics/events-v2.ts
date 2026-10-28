import {englishPath} from '../i18n/pilot.ts';
import {parseDiscoveryEvent,type DiscoveryEvent} from './events.ts';
import {parseSearchIntent,type SearchIntent,searchAnchors,searchAttributes} from '../discovery/search-intent.ts';
import {escapeDefinitions} from '../discovery/escape-model.ts';
import {constraintOptions} from '../discovery/navigation.ts';

export const eventNamesV2=['page_viewed','search_performed','search_results_viewed','escape_route_viewed','product_impression','product_clicked','outbound_clicked','constraint_selected','anchor_selected'] as const;
export type SurfaceV2='home'|'search'|'escape'|'hidden_gems'|'product';
export type EventV2={version:2;eventId:string;sessionId:string;pageViewId:string;occurredAt:string;name:typeof eventNamesV2[number];surface:SurfaceV2;path:string;anchor?:string;constraints?:string[];referrerHost?:string;source?:'direct'|'internal'|'external';routeSlug?:string;productSlug?:string;position?:number;exposureId?:string;searchId?:string;intent?:SearchIntent;query?:string;outcome?:'results'|'no_results'|'clarify'|'unsupported'|'error';resultCount?:number;resultSetId?:string;selection?:string|null;originSurface?:'search'|'escape'|'hidden_gems';originPageViewId?:string;originSearchId?:string;originExposureId?:string;originPosition?:number;originRouteSlug?:string};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fields=['version','eventId','sessionId','pageViewId','occurredAt','name','surface','path','anchor','constraints','referrerHost','source','routeSlug','productSlug','position','exposureId','searchId','intent','query','outcome','resultCount','resultSetId','selection','originSurface','originPageViewId','originSearchId','originExposureId','originPosition','originRouteSlug'];
const requireId=(v:unknown)=>{if(typeof v!=='string'||!uuid.test(v))throw Error('Invalid identifier');};
const position=(v:unknown)=>{if(typeof v!=='number'||!Number.isInteger(v)||v<1||v>100)throw Error('Invalid position');};
const product=(v:unknown)=>{if(typeof v!=='string'||v.length>100||!slug.test(v))throw Error('Invalid product');};
// Diagnostic text is opt-in for a future producer. Redaction is best-effort, not
// anonymization; private storage and short retention remain mandatory.
export function redactSearchQuery(input:string){
 return input.trim().slice(0,500).replace(/https?:\/\/\S+/gi,'[url]').replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,'[email]').replace(/(?:\+?\d[\d ().-]{6,}\d)/g,'[number]');
}
// This validates a contract, not publication or proof that a browser saw a card.
// A collector must validate publication and signed result context separately.
export function parseEventV2(input:unknown):EventV2{
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Event required');
 const e=input as EventV2;
 if(Object.keys(e).some(k=>!fields.includes(k))||e.version!==2||!eventNamesV2.includes(e.name))throw Error('Unknown event');
 for(const id of [e.eventId,e.sessionId,e.pageViewId])requireId(id);
 if(typeof e.occurredAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(e.occurredAt)||!Number.isFinite(Date.parse(e.occurredAt))||new Date(e.occurredAt).toISOString()!==e.occurredAt)throw Error('Invalid time');
 const normalized=englishPath(e.path);
 const route=escapeDefinitions.find(d=>'/escape/'+d.slug===normalized);
 if(!((e.surface==='home'&&normalized==='/')||(e.surface==='search'&&(e.path==='/'||e.path==='/discover'))||(e.surface==='hidden_gems'&&e.path==='/hidden-gems')||(e.surface==='escape'&&route&&e.routeSlug===route.slug)||(e.surface==='product'&&typeof e.productSlug==='string'&&normalized==='/software/'+e.productSlug)))throw Error('Invalid surface/path');
 if(e.surface!=='escape'&&e.routeSlug!==undefined)throw Error('Unexpected route');
 if(e.anchor!==undefined&&!searchAnchors.includes(e.anchor as typeof searchAnchors[number]))throw Error('Unknown anchor');
 const constraints=new Set<string>([...searchAttributes,...constraintOptions.map(c=>c.value)]);
 if(e.constraints!==undefined&&(!Array.isArray(e.constraints)||e.constraints.length>5||new Set(e.constraints).size!==e.constraints.length||e.constraints.some(c=>!constraints.has(c))))throw Error('Unknown constraints');
 if(route&&e.anchor!==undefined&&e.anchor!==route.anchor)throw Error('Wrong anchor context');
 if(e.referrerHost!==undefined&&(typeof e.referrerHost!=='string'||e.referrerHost.length>253||!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(e.referrerHost)))throw Error('Hostname only');
 if(e.source!==undefined&&!['direct','internal','external'].includes(e.source))throw Error('Invalid source');
 const searchEvent=e.name==='search_performed'||e.name==='search_results_viewed';
 const placement=e.name==='product_impression'||e.name==='product_clicked';
 if(searchEvent){
  if(e.surface!=='search')throw Error('Search surface required');requireId(e.searchId);
  if(e.name==='search_performed'){
   if(e.query!==undefined&&(typeof e.query!=='string'||!e.query.trim()||e.query.length>500||/[\u0000-\u001f\u007f]/.test(e.query)||redactSearchQuery(e.query)!==e.query))throw Error('Unredacted query');
   if(e.intent!==undefined||e.outcome!==undefined||e.resultCount!==undefined||e.resultSetId!==undefined)throw Error('Attempt cannot assert result');
  }else{
   requireId(e.resultSetId);parseSearchIntent(e.intent);
   if(!['results','no_results','clarify','unsupported','error'].includes(e.outcome!))throw Error('Result outcome required');
   if(!Number.isInteger(e.resultCount)||e.resultCount!<0||e.resultCount!>6||(e.outcome==='results'?e.resultCount!<1:e.resultCount!==0))throw Error('Invalid result count');
   if((e.outcome==='results'||e.outcome==='no_results')&&e.intent?.status!=='ready')throw Error('Intent/result mismatch');
   if((e.outcome==='clarify'||e.outcome==='unsupported')&&e.intent?.status!==e.outcome)throw Error('Intent/result mismatch');
   if(e.query!==undefined)throw Error('Query belongs only to attempt');
  }
 }else if(placement){
  if(!['search','escape','hidden_gems'].includes(e.surface))throw Error('Placement surface required');
  product(e.productSlug);position(e.position);requireId(e.exposureId);
  if(e.surface==='search'){requireId(e.searchId);requireId(e.resultSetId);if(e.position!>6)throw Error('Search position');}
  if(e.surface==='hidden_gems'&&e.position!>3)throw Error('Editorial position');
 }else if(e.name==='outbound_clicked'){
  if(e.surface!=='product')throw Error('Product surface required');product(e.productSlug);
 }else if(e.name==='escape_route_viewed'){
  if(e.surface!=='escape')throw Error('Escape surface required');
 }else if(e.name==='anchor_selected'||e.name==='constraint_selected'){
  if(e.surface!=='home'||!Object.hasOwn(e,'selection'))throw Error('Home selection required');
  const options=e.name==='anchor_selected'?new Set<string>(searchAnchors):constraints;
  if(e.selection!==null&&!options.has(e.selection!))throw Error('Unknown selection');
 }else if(e.name!=='page_viewed')throw Error('Unknown event');
 if(e.productSlug!==undefined)product(e.productSlug);
 if(!placement&&[e.position,e.exposureId].some(v=>v!==undefined))throw Error('Unexpected placement');
 if(!searchEvent&&!(placement&&e.surface==='search')&&[e.searchId,e.resultSetId].some(v=>v!==undefined))throw Error('Unexpected search identifiers');
 if(!searchEvent&&[e.query,e.intent,e.outcome,e.resultCount].some(v=>v!==undefined))throw Error('Unexpected search data');
 if(e.name==='search_performed'&&e.resultSetId!==undefined)throw Error('Unexpected result set');
 if(e.name!=='anchor_selected'&&e.name!=='constraint_selected'&&e.selection!==undefined)throw Error('Unexpected selection');
 if(!placement&&e.surface!=='product'&&e.productSlug!==undefined)throw Error('Unexpected product');
 const originFields=[e.originSurface,e.originPageViewId,e.originSearchId,e.originExposureId,e.originPosition,e.originRouteSlug];
 if(originFields.some(v=>v!==undefined)){
  if(e.surface!=='product'||!['page_viewed','outbound_clicked'].includes(e.name)||!['search','escape','hidden_gems'].includes(e.originSurface!))throw Error('Unexpected attribution');
  requireId(e.originPageViewId);requireId(e.originExposureId);position(e.originPosition);
  if(e.originSurface==='search')requireId(e.originSearchId);else if(e.originSearchId!==undefined)throw Error('Unexpected origin search');
  if(e.originSurface==='escape'){if(!escapeDefinitions.some(d=>d.slug===e.originRouteSlug))throw Error('Unknown origin route');}else if(e.originRouteSlug!==undefined)throw Error('Unexpected origin route');
 }
 return JSON.parse(JSON.stringify(e)) as EventV2;
}

// Historical adapter is read-only. Never dual-write normalized copies.
export function historicalEvent(input:unknown):EventV2{
 const old=parseDiscoveryEvent(input);
 const {name,...rest}=old;
 const mapped:Record<DiscoveryEvent['name'],EventV2['name']>={product_view:'page_viewed',product_click:'product_clicked',product_impression:'product_impression',outbound_click:'outbound_clicked'};
 return parseEventV2({...rest,version:2,name:mapped[name]});
}
