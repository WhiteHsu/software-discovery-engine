'use client';
import {exposureGate} from './exposure.ts';
import {chineseProduct,englishPath} from '../i18n/pilot.ts';
import {redactSearchQuery,type EventV2, type SurfaceV2} from './events-v2.ts';
export type PageContextV2={sessionId:string;pageViewId:string;path:string;surface:SurfaceV2;anchor?:string;constraints?:string[];routeSlug?:string;productSlug?:string;source?:EventV2['source'];referrerHost?:string};
export type SearchTrackingV2={searchId:string;resultSetId:string;receipt:string};
let enabled=false,current:PageContextV2|undefined,fallback:string|undefined;
let pending:{event:EventV2;receipt?:string}[]=[];
export function optedOut(){return navigator.doNotTrack==='1'||(window as Window&{doNotTrack?:string}).doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl===true;}
export function configureClientV2(value:boolean){enabled=value;if(!value)pending=[];}
export function setCurrentPageV2(c:PageContextV2){current=c;}
export function makePageV2(path:string,surface:SurfaceV2):PageContextV2{
 let sessionId:string;
 try{const old=sessionStorage.getItem('sd-session-v1');sessionId=old&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(old)?old.toLowerCase():crypto.randomUUID();sessionStorage.setItem('sd-session-v1',sessionId);}catch{sessionId=fallback??=crypto.randomUUID();}
 let referrerHost:string|undefined;try{const u=new URL(document.referrer);if(['http:','https:'].includes(u.protocol))referrerHost=u.hostname.toLowerCase();}catch{}
 if(current)referrerHost=location.hostname;
 return {sessionId,pageViewId:crypto.randomUUID(),path,surface,source:current?'internal':!referrerHost?'direct':referrerHost===location.hostname?'internal':'external',...(referrerHost?{referrerHost}:{})};
}
export function emitV2(c:PageContextV2,name:EventV2['name'],fields:Partial<EventV2>={},receipt?:string){
 if(!enabled||optedOut())return;
 const event={...c,version:2,eventId:crypto.randomUUID(),occurredAt:new Date().toISOString(),name,...fields} as EventV2;
 if(pending.length>=200)flushV2();pending.push({event,receipt});
}
export function flushV2(unloading=false){
 if(!enabled||optedOut()){pending=[];return;}
 const items=pending;pending=[];const groups=new Map<string,typeof items>();
 for(const item of items){const e=item.event,key=JSON.stringify([e.sessionId,e.pageViewId,e.surface,e.path,item.receipt]);const g=groups.get(key)??[];g.push(item);groups.set(key,g);}
 const send=(events:EventV2[],receipt?:string)=>{
  if(!events.length)return;const body=JSON.stringify({events,...(receipt?{receipt}:{})});
  if(unloading&&navigator.sendBeacon){try{if(navigator.sendBeacon('/api/events/v2',new Blob([body],{type:'application/json'})))return;}catch{}}
  void fetch('/api/events/v2',{method:'POST',headers:{'Content-Type':'application/json'},body,credentials:'same-origin',keepalive:true,cache:'no-store'}).catch(()=>{});
 };
 for(const group of groups.values()){let batch:EventV2[]=[];const receipt=group[0].receipt;for(const item of group){if(batch.length===20||new TextEncoder().encode(JSON.stringify({events:[...batch,item.event],receipt})).length>32768){send(batch,receipt);batch=[];}batch.push(item.event);}send(batch,receipt);}
}
export function beginSearchV2(query:string){
 if(!enabled||optedOut()||!current||!['/','/discover'].includes(englishPath(current.path)))return undefined;
 const c={...current,surface:'search' as const},searchId=crypto.randomUUID();
 emitV2(c,'search_performed',{searchId,query:redactSearchQuery(query)});return {context:c,searchId,header:JSON.stringify({sessionId:c.sessionId,pageViewId:c.pageViewId,searchId,path:c.path})};
}
export function originV2(productSlug:string){
 try{const value=JSON.parse(sessionStorage.getItem('sd-origin-v2')??'null');if(value?.productSlug===productSlug&&value.sessionId===current?.sessionId&&Date.now()<value.expiresAt)return {fields:value.fields as Partial<EventV2>,receipt:value.receipt as string|undefined};}catch{}return undefined;
}
export function observePlacementsV2(root:HTMLElement,c:PageContextV2,products:{slug:string;position:number}[],receipt?:string,search?:{searchId:string;resultSetId:string}){
 const positions=new Map(products.map(p=>[p.slug,p.position])),exposures=new Map(products.map(p=>[p.slug,crypto.randomUUID()]));
 const extra=(slug:string)=>({productSlug:slug,position:positions.get(slug),exposureId:exposures.get(slug),...(search??{})});
 const gate=exposureGate(slug=>emitV2(c,'product_impression',extra(slug),receipt),{set:(fn,ms)=>setTimeout(fn,ms),clear:id=>clearTimeout(id as ReturnType<typeof setTimeout>)});
 const selector=c.surface==='search'?'a[data-search-product]':'a[data-discovery-product]';
 const links=[...root.querySelectorAll<HTMLAnchorElement>(selector)].filter(a=>positions.get(a.dataset.searchProduct??a.dataset.discoveryProduct??'')===Number(a.dataset.discoveryPosition)&&(c.surface!=='hidden_gems'||a.hasAttribute('data-discovery-exposure')));
 const ids=new Map(links.map((a,i)=>[a,String(i)]));
 const observer=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(changes=>{for(const change of changes){const a=change.target as HTMLAnchorElement;gate.visibility(a.dataset.searchProduct??a.dataset.discoveryProduct!,ids.get(a)!,change.isIntersecting?change.intersectionRatio:0);}},{threshold:[0,.5,1]}):undefined;
 links.forEach(a=>observer?.observe(a));
 const visibility=()=>gate.active(document.visibilityState==='visible');
 const click=(e:MouseEvent)=>{
  if(e.type==='click'&&e.button!==0||e.type==='auxclick'&&e.button!==1||!(e.target instanceof Element)||optedOut())return;
  const a=e.target.closest<HTMLAnchorElement>(selector);if(!a||!root.contains(a))return;
  const slug=a.dataset.searchProduct??a.dataset.discoveryProduct;if(!slug||!positions.has(slug)||a.origin!==location.origin||(a.pathname!=='/software/'+slug&&chineseProduct(a.pathname)!==slug))return;
  emitV2(c,'product_clicked',extra(slug),receipt);
  try{sessionStorage.setItem('sd-origin-v2',JSON.stringify({sessionId:c.sessionId,productSlug:slug,expiresAt:Date.now()+1800000,receipt,fields:{originSurface:c.surface,originPageViewId:c.pageViewId,originExposureId:exposures.get(slug),originPosition:positions.get(slug),...(c.surface==='escape'?{originRouteSlug:c.routeSlug}:{}),...(search?{originSearchId:search.searchId}:{})}}));}catch{}
  flushV2();
 };
 root.addEventListener('click',click);root.addEventListener('auxclick',click);document.addEventListener('visibilitychange',visibility);visibility();
 const hide=()=>gate.active(false);window.addEventListener('pagehide',hide);window.addEventListener('pageshow',visibility);
 return ()=>{gate.dispose();observer?.disconnect();root.removeEventListener('click',click);root.removeEventListener('auxclick',click);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',visibility);};
}
