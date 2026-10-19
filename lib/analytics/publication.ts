import 'server-only';
import {getEscape,escapePreview} from '@/lib/discovery/escapes';
import {getProduct,localPreview} from '@/lib/discovery/products';
import type {DiscoveryEvent} from './events';
import type {PublicationContext} from './ingestion';

export async function eventPublication(events:DiscoveryEvent[]):Promise<PublicationContext>{
 if(escapePreview()||localPreview())throw new Error('Analytics unavailable in local preview');
 const first=events[0];
 if(first.surface==='escape'){
  const page=await getEscape(first.routeSlug!);
  if(!page?.published)return {products:new Set(),placements:[]};
  const qualified=page.candidates.filter(c=>c.eligible&&c.product.status==='published');
  return {products:new Set(qualified.map(c=>c.product.slug)),placements:qualified.map((c,i)=>({routeSlug:page.slug,productSlug:c.product.slug,position:i+1}))};
 }
 const page=await getProduct(first.productSlug);
 return {products:new Set(page?.status==='published'?[page.slug]:[]),placements:[]};
}
