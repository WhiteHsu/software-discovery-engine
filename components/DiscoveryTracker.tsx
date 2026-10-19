'use client';
import {useEffect,useRef} from 'react';
import {exposureGate} from '@/lib/analytics/exposure';
import {eventQueue} from '@/lib/analytics/queue';
import type {DiscoveryEvent} from '@/lib/analytics/events';

type Props={enabled:boolean;surface:'escape'|'product';slug:string;products?:{slug:string;position:number}[];officialUrl?:string|null};
type Identity={path:string;sessionId:string;pageViewId:string;exposures:Map<string,string>;sent:Set<string>};
let fallbackSession:string|undefined;
function privacyOptOut(){return navigator.doNotTrack==='1'||(window as Window&{doNotTrack?:string}).doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl===true;}
function sessionId(){
 try{const old=sessionStorage.getItem('sd-session-v1');if(old&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(old))return old;const value=crypto.randomUUID();sessionStorage.setItem('sd-session-v1',value);return value;}catch{return fallbackSession??=crypto.randomUUID();}
}
export default function DiscoveryTracker({enabled,surface,slug,products,officialUrl}:Props){
 const marker=useRef<HTMLSpanElement>(null),identity=useRef<Identity|null>(null);
 useEffect(()=>{
  if(!enabled||privacyOptOut()||!globalThis.crypto?.randomUUID)return;
  const root=marker.current?.closest('article');if(!root)return;
  const path=(surface==='escape'?'/escape/':'/software/')+slug;
  let context:Identity;
  try{if(!identity.current||identity.current.path!==path)identity.current={path,sessionId:sessionId(),pageViewId:crypto.randomUUID(),exposures:new Map(),sent:new Set()};context=identity.current;}catch{return;}
  const placements=new Map((products??[]).map(p=>[p.slug,p.position]));
  const queue=eventQueue((body,unloading)=>{
   if(privacyOptOut())return;
   if(unloading&&navigator.sendBeacon){try{if(navigator.sendBeacon('/api/events',new Blob([body],{type:'application/json'})))return;}catch{}}
   void fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true,credentials:'same-origin',cache:'no-store'}).catch(()=>{});
  });
  const emit=(name:DiscoveryEvent['name'],productSlug:string)=>{
   if(privacyOptOut())return;
   try{
    const event:DiscoveryEvent={version:1,eventId:crypto.randomUUID(),sessionId:context.sessionId,pageViewId:context.pageViewId,occurredAt:new Date().toISOString(),name,surface,path,productSlug};
    // Do not carry full referrer URLs or free-text into this initial producer.
    if(surface==='escape'){const position=placements.get(productSlug);if(!position)return;let exposureId=context.exposures.get(productSlug);if(!exposureId){exposureId=crypto.randomUUID();context.exposures.set(productSlug,exposureId);}Object.assign(event,{routeSlug:slug,position,exposureId});}
    queue.push(event);
   }catch{/* Optional measurement cannot interrupt the page. */}
  };
  const gate=exposureGate(key=>{if(context.sent.has(key))return;context.sent.add(key);emit('product_impression',key);},{set:(fn,ms)=>setTimeout(fn,ms),clear:id=>clearTimeout(id as ReturnType<typeof setTimeout>)});
  const entries=[...root.querySelectorAll<HTMLAnchorElement>('a[data-discovery-product]')].filter(a=>placements.get(a.dataset.discoveryProduct??'')===Number(a.dataset.discoveryPosition));
  const targetIds=new Map(entries.map((a,i)=>[a,String(i)]));
  const observer=surface==='escape'&&typeof IntersectionObserver!=='undefined'?new IntersectionObserver(changes=>{for(const entry of changes){const a=entry.target as HTMLAnchorElement;gate.visibility(a.dataset.discoveryProduct!,targetIds.get(a)!,entry.isIntersecting?entry.intersectionRatio:0);}},{threshold:[0,.5,1]}):null;
  entries.forEach(a=>observer?.observe(a));
  const visibility=()=>{
   const active=document.visibilityState==='visible';gate.active(active);if(!active)queue.flush(true);
   if(active&&surface==='product'&&!context.sent.has('product_view')){context.sent.add('product_view');emit('product_view',slug);}
  };
  const click=(event:MouseEvent)=>{
   if(event.type==='click'&&event.button!==0||event.type==='auxclick'&&event.button!==1||!(event.target instanceof Element))return;
   const a=event.target.closest<HTMLAnchorElement>('a');if(!a||!root.contains(a))return;
   if(surface==='escape'){
    const product=a.dataset.discoveryProduct;if(!product||placements.get(product)!==Number(a.dataset.discoveryPosition)||a.origin!==location.origin||a.pathname!=='/software/'+product)return;
    emit('product_click',product);
   }else{
    if(!a.hasAttribute('data-discovery-outbound')||!officialUrl||a.href!==new URL(officialUrl,location.origin).href)return;
    emit('outbound_click',slug);
   }
   queue.flush(); // Never preventDefault or await delivery before navigation.
  };
  const pagehide=()=>{gate.active(false);queue.flush(true);};
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pageshow',visibility);window.addEventListener('pagehide',pagehide);
  root.addEventListener('click',click);root.addEventListener('auxclick',click);visibility();
  const interval=setInterval(()=>queue.flush(),500);
  return ()=>{clearInterval(interval);gate.dispose();observer?.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pageshow',visibility);window.removeEventListener('pagehide',pagehide);root.removeEventListener('click',click);root.removeEventListener('auxclick',click);queue.flush();};
 },[enabled,surface,slug,products,officialUrl]);
 return <span ref={marker} hidden aria-hidden="true" />;
}
