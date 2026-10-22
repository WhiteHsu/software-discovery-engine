'use client';
import {useEffect,useRef} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import {escapeDefinitions} from '@/lib/discovery/escape-model';
import {navigationSelection} from '@/lib/discovery/navigation';
import {configureClientV2,setCurrentPageV2,makePageV2,emitV2,flushV2,optedOut,originV2,observePlacementsV2,type PageContextV2} from '@/lib/analytics/client-v2';
export default function AnalyticsV2({enabled}:{enabled:boolean}){
 const path=usePathname(),params=useSearchParams(),anchor=params.get('anchor')??'',constraint=params.get('constraint')??'';
 const saved=useRef<{key:string;context:PageContextV2;sent:boolean}|null>(null);
 useEffect(()=>{
  configureClientV2(enabled);if(!enabled||optedOut()||!globalThis.crypto?.randomUUID)return;
  const def=escapeDefinitions.find(d=>path==='/escape/'+d.slug);
  const product=path.match(/^\/software\/([a-z0-9-]+)$/)?.[1];
  if(!['/','/discover','/hidden-gems'].includes(path)&&!def&&!product)return;
  const key=JSON.stringify([path,anchor,constraint]);
  if(!saved.current||saved.current.key!==key){const c=makePageV2(path,def?'escape':product?'product':path==='/hidden-gems'?'hidden_gems':path==='/discover'?'search':'home');
   if(def)Object.assign(c,{routeSlug:def.slug,anchor:def.anchor,constraints:[...def.constraints]});
   if(product)c.productSlug=product;
   if(path==='/'){const selection=navigationSelection({anchor:anchor||undefined,constraint:constraint||undefined});if(!selection.invalid)Object.assign(c,{...(selection.anchor?{anchor:selection.anchor}:{}),constraints:selection.constraint?[selection.constraint]:[]});}
   saved.current={key,context:c,sent:false};
  }
  const state=saved.current,c=state.context;setCurrentPageV2(c);
  const origin=product?originV2(product):undefined;
  const show=()=>{if(document.visibilityState==='visible'&&!state.sent){state.sent=true;emitV2(c,'page_viewed',origin?.fields,origin?.receipt);if(def)emitV2(c,'escape_route_viewed');}};
  show();document.addEventListener('visibilitychange',show);
  const root=document.querySelector<HTMLElement>('main');let dispose:(()=>void)|undefined;
  if(root&&(def||path==='/hidden-gems')){const links=[...root.querySelectorAll<HTMLAnchorElement>('a[data-discovery-product]')];const products=[...new Map(links.map(a=>[a.dataset.discoveryProduct!,{slug:a.dataset.discoveryProduct!,position:Number(a.dataset.discoveryPosition)}])).values()];dispose=observePlacementsV2(root,c,products);}
  const change=(e:Event)=>{if(path!=='/'||!(e.target instanceof HTMLSelectElement)||!['anchor','constraint'].includes(e.target.name))return;emitV2(c,e.target.name==='anchor'?'anchor_selected':'constraint_selected',{selection:e.target.value||null});};
  const click=(e:MouseEvent)=>{
   if(e.type==='click'&&e.button!==0||e.type==='auxclick'&&e.button!==1||!(e.target instanceof Element))return;
   if(path==='/'){
    const link=e.target.closest<HTMLAnchorElement>('a[data-analytics-filter],a[data-analytics-clear]');
    if(link){
     if(link.hasAttribute('data-analytics-clear')){emitV2(c,'anchor_selected',{selection:null});emitV2(c,'constraint_selected',{selection:null});}
     else if(link.dataset.analyticsConstraint)emitV2(c,'constraint_selected',{selection:link.dataset.analyticsConstraint});
     else{const url=new URL(link.href),s=navigationSelection({anchor:url.searchParams.get('anchor')??undefined,constraint:url.searchParams.get('constraint')??undefined});if(!s.invalid){if(s.anchor)emitV2(c,'anchor_selected',{selection:s.anchor});if(s.constraint)emitV2(c,'constraint_selected',{selection:s.constraint});}}
     flushV2();
    }
   }
   if(product&&e.target.closest('a[data-discovery-outbound]')){emitV2(c,'outbound_clicked',origin?.fields,origin?.receipt);flushV2();}
  };
  const hide=()=>flushV2(true),visibility=()=>{if(document.visibilityState!=='visible')flushV2(true);};
  const timer=setInterval(()=>flushV2(),500);document.addEventListener('change',change);document.addEventListener('click',click);document.addEventListener('auxclick',click);window.addEventListener('pagehide',hide);document.addEventListener('visibilitychange',visibility);
  return ()=>{clearInterval(timer);dispose?.();flushV2();document.removeEventListener('visibilitychange',show);document.removeEventListener('change',change);document.removeEventListener('click',click);document.removeEventListener('auxclick',click);window.removeEventListener('pagehide',hide);document.removeEventListener('visibilitychange',visibility);};
 },[enabled,path,anchor,constraint]);
 return null;
}
