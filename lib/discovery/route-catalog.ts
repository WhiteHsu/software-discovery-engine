import {escapeDefinitions} from './escape-model.ts';
export type RouteCard={slug:string;name:string;description:string};
export function publishedRouteCards(rows:unknown[]):RouteCard[]{
 const cards=new Map<string,RouteCard>();
 for(const row of rows){
  if(!row||typeof row!=='object')continue;
  const r=row as Record<string,unknown>;
  if(r.status!=='published'||r.editorially_approved!==true||typeof r.slug!=='string'||!escapeDefinitions.some(d=>d.slug===r.slug)||typeof r.name!=='string'||!r.name.trim()||typeof r.description!=='string'||!r.description.trim())continue;
  cards.set(r.slug,{slug:r.slug,name:r.name.trim(),description:r.description.trim()});
 }
 return [...cards.values()].sort((a,b)=>a.name.localeCompare(b.name,'en')||a.slug.localeCompare(b.slug,'en'));
}
