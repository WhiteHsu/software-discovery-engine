import type {EscapePage} from './escape-model.ts';
import {escapeDefinitions,publishable} from './escape-model.ts';
import {rankEscapeCandidates} from './privacy-route.ts';
import {safeUrl} from './model.ts';

export const gemSelections=[
 {slug:'joplin',routeSlug:'simple-notion-alternatives',workflow:'Personal notebooks',reason:'A focused place to explore desktop note capture and notebook organization, with Markdown and sync choices to review.'},
 {slug:'krita',routeSlug:'photoshop-alternatives-without-a-subscription',workflow:'Digital painting',reason:'A desktop painting option for an illustration-focused workflow. Check the reviewed raster scope and file-exchange limits.'},
 {slug:'pdf24-creator',routeSlug:'pdf-editors-without-a-subscription',workflow:'Windows PDF page organization',reason:'A Windows desktop option to explore for arranging PDF pages. Check the reviewed edition and editing limits.'},
] as const;
export type GemCard={slug:string;name:string;workflow:string;reason:string;routeSlug:string;routeName:string;scope:string;pricing:string;tradeOff:string;checkedAt:string;sources:{title:string;url:string}[]};
export function selectedGemCards(pages:readonly (EscapePage|null)[]):GemCard[]{
 return gemSelections.flatMap(pick=>{
  const page=pages.find(p=>p?.slug===pick.routeSlug);if(!page?.published)return [];
  const def=escapeDefinitions.find(d=>d.slug===pick.routeSlug)!;
  // Re-evaluate stored evidence; a stale eligible flag alone cannot qualify a pick.
  const candidates=rankEscapeCandidates(def,page.candidates);
  if(!publishable({...page,candidates}))return [];
  const candidate=candidates.find(c=>c.product.slug===pick.slug&&c.product.status==='published'&&c.eligible);
  if(!candidate||!candidate.product.name.trim())return [];
  const scope=candidate.fit.find(c=>c.relationshipType==='alternative'&&c.slug===def.anchor);
  const pricing=candidate.fit.find(c=>c.slug==='pricing-model'),tradeOff=candidate.fit.find(c=>c.slug==='trade-off-summary');
  if(!scope?.description||typeof pricing?.value!=='string'||typeof tradeOff?.value!=='string')return [];
  const claims=candidate.fit;
  const dates=claims.map(c=>c.lastVerifiedAt).filter((d):d is string=>!!d&&Number.isFinite(Date.parse(d)));
  if(dates.length!==claims.length)return [];
  // Display the oldest required evidence check, not an unrelated newer product claim.
  const checkedAt=dates.sort((a,b)=>Date.parse(a)-Date.parse(b))[0];
  const links=new Map<string,{title:string;url:string}>();
  for(const c of [scope,pricing,tradeOff])for(const source of c.sources){const url=safeUrl(source.url);if(url)links.set(url,{title:source.title,url});}
  return [{slug:pick.slug,name:candidate.product.name,workflow:pick.workflow,reason:pick.reason,routeSlug:pick.routeSlug,routeName:page.name,scope:scope.description,pricing:pricing.value,tradeOff:tradeOff.value,checkedAt,sources:[...links.values()]}];
 });
}
export function indexableGemCollection(cards:readonly GemCard[]){return cards.length===gemSelections.length&&gemSelections.every(p=>cards.some(c=>c.slug===p.slug));}
