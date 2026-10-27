import 'server-only';
import {getEscape,escapePreview} from '@/lib/discovery/escapes';
import {getProduct,localPreview} from '@/lib/discovery/products';
import {getHiddenGems} from '@/lib/discovery/hidden-gems-server';
import {escapeDefinitions} from '@/lib/discovery/escape-model';
import type {EventV2} from './events-v2';
export async function publicationV2(events:EventV2[]){
 if(escapePreview()||localPreview())throw Error('Preview analytics disabled');
 const first=events[0];
 const routeSlug=first.surface==='escape'?first.routeSlug:first.originSurface==='escape'?first.originRouteSlug:undefined;
 let placements:{slug:string;position:number}[]=[];
 if(routeSlug){
  const page=await getEscape(routeSlug);if(!page?.published)throw Error('Unpublished route');
  placements=page.candidates.filter(c=>c.eligible&&c.product.status==='published').map((c,i)=>({slug:c.product.slug,position:i+1}));
  const def=escapeDefinitions.find(d=>d.slug===routeSlug)!;
  for(const e of events)if(e.surface==='escape'&&(e.anchor!==(def.anchor??undefined)||JSON.stringify([...(e.constraints??[])].sort())!==JSON.stringify([...def.constraints].sort())))throw Error('Wrong route context');
 }
 if(first.surface==='hidden_gems'||first.originSurface==='hidden_gems')placements=(await getHiddenGems()).map((c,i)=>({slug:c.slug,position:i+1}));
 for(const e of events){
  if((e.surface==='escape'||e.surface==='hidden_gems')&&e.productSlug&&!placements.some(p=>p.slug===e.productSlug&&p.position===e.position))throw Error('Unpublished placement');
  if(e.originSurface==='escape'||e.originSurface==='hidden_gems'){
   if(e.originRouteSlug!==first.originRouteSlug||e.originSurface!==first.originSurface||!placements.some(p=>p.slug===e.productSlug&&p.position===e.originPosition))throw Error('Wrong origin placement');
  }
 }
 const products=[...new Set(events.map(e=>e.productSlug).filter((s):s is string=>!!s))];
 if(products.length>6)throw Error('Publication fanout exceeded');
 for(let i=0;i<products.length;i+=2){const pages=await Promise.all(products.slice(i,i+2).map(getProduct));if(pages.some(p=>p?.status!=='published'))throw Error('Unpublished product');}
}
