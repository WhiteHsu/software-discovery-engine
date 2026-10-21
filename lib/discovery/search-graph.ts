import {escapeDefinitions,publishable,type EscapePage} from './escape-model.ts';
import {rankEscapeCandidates} from './privacy-route.ts';
import {safeUrl,type Claim} from './model.ts';
import {parseSearchIntent,type SearchIntent} from './search-intent.ts';
export type SearchFact={id:string;label:string;value:string;checkedAt:string;sources:{title:string;url:string}[]};
export type SearchMatch={slug:string;name:string;description:string;score:number;facts:SearchFact[];routeSlug:string;scope:string;pricing:string;tradeOff:string;checkedAt:string};
const verified=(c:Claim|undefined):c is Claim=>!!c&&c.verificationStatus==='verified'&&typeof c.confidence==='number'&&c.confidence>=.8&&c.confidence<=1&&!!c.lastVerifiedAt&&Number.isFinite(Date.parse(c.lastVerifiedAt))&&c.sources.some(s=>safeUrl(s.url));
const fact=(id:string,c:Claim):SearchFact=>({id,label:c.name,value:typeof c.value==='boolean'?(c.value?'Yes':'No'):typeof c.value==='string'?c.value:c.description??'Verified relationship',checkedAt:c.lastVerifiedAt!,sources:c.sources.flatMap(s=>{const url=safeUrl(s.url);return url?[{title:s.title,url}]:[];})});
export function searchGraph(intentInput:SearchIntent,pages:readonly (EscapePage|null)[]):SearchMatch[]{
 const intent=parseSearchIntent(intentInput);if(intent.status!=='ready')return [];
 if(pages.length>escapeDefinitions.length)throw Error('Search graph exceeds bound');
 const matches=new Map<string,SearchMatch>();
 for(const page of pages){
  if(!page?.published)continue;
  const def=escapeDefinitions.find(d=>d.slug===page.slug);if(!def||intent.anchor&&def.anchor!==intent.anchor)continue;
  const ranked=rankEscapeCandidates(def,page.candidates);if(!publishable({...page,candidates:ranked}))continue;
  for(const candidate of ranked){
   const p=candidate.product;if(!candidate.eligible||p.status!=='published'||!p.name.trim())continue;
   const required:SearchFact[]=[],confidences=[candidate.quality];let complete=true;
   for(const slug of intent.attributes){
    // Privacy claims qualify only through the scoped privacy route evaluator.
    if(slug==='privacy-friendly'&&def.slug!=='privacy-friendly-grammarly-alternatives'){complete=false;break;}
    const c=p.attributes.find(a=>a.slug===slug);if(!verified(c)||c.value!==true){complete=false;break;}required.push(fact('attribute:'+slug,c));confidences.push(c.confidence!);
   }
   if(!complete)continue;
   if(intent.problem){const c=p.problems.find(a=>a.slug===intent.problem);if(!verified(c)||c.value===false){continue;}required.push(fact('problem:'+intent.problem,c));confidences.push(c.confidence!);}
   if(intent.anchor){const c=candidate.fit.find(c=>c.relationshipType==='alternative'&&c.slug===intent.anchor);if(!verified(c))continue;required.unshift(fact('anchor:'+intent.anchor,c));}
   const pricing=candidate.fit.find(c=>c.slug==='pricing-model')!,tradeOff=candidate.fit.find(c=>c.slug==='trade-off-summary')!;
   const scope=candidate.fit.find(c=>c.relationshipType==='alternative');
   const facts=[...required,fact('pricing',pricing),fact('trade-off',tradeOff)];
   const quality=Math.min(...confidences);
   const score=quality+Math.min(.05,Math.max(0,candidate.score-candidate.quality));
   const entry:SearchMatch={slug:p.slug,name:p.name,description:p.description??'',score,facts,routeSlug:page.slug,scope:scope?.description??page.description??'',pricing:String(pricing.value),tradeOff:String(tradeOff.value),checkedAt:facts.map(f=>f.checkedAt).sort((a,b)=>Date.parse(a)-Date.parse(b))[0]};
   const old=matches.get(p.slug);if(!old||entry.score>old.score||entry.score===old.score&&entry.routeSlug<old.routeSlug)matches.set(p.slug,entry);
  }
 }
 return [...matches.values()].sort((a,b)=>b.score-a.score||a.slug.localeCompare(b.slug)).slice(0,6);
}
export type SearchExplanation={slug:string;factIds:string[]};
export function explanationSchema(matches:readonly SearchMatch[]){return {type:'object',additionalProperties:false,properties:{explanations:{type:'array',maxItems:6,items:{type:'object',additionalProperties:false,properties:{slug:{type:'string',enum:matches.map(m=>m.slug)},factIds:{type:'array',minItems:1,maxItems:8,items:{type:'string',enum:[...new Set(matches.flatMap(m=>m.facts.map(f=>f.id)))]}}},required:['slug','factIds']}}},required:['explanations']};}
export function validateExplanations(value:unknown,matches:readonly SearchMatch[]):SearchExplanation[]{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).join()!=='explanations')throw Error('Invalid explanations');
 const rows=(value as {explanations:unknown}).explanations;if(!Array.isArray(rows)||rows.length!==matches.length)throw Error('Incomplete explanations');
 const seen=new Set<string>();
 for(const row of rows){
  if(!row||typeof row!=='object'||Array.isArray(row)||Object.keys(row).length!==2||Object.keys(row).some(k=>!['slug','factIds'].includes(k)))throw Error('Invalid explanation');
  const m=matches.find(m=>m.slug===row.slug);if(!m||seen.has(row.slug)||!Array.isArray(row.factIds)||!row.factIds.length||row.factIds.length>8||new Set(row.factIds).size!==row.factIds.length||row.factIds.some((id:unknown)=>!m.facts.some(f=>f.id===id)))throw Error('Invented explanation');seen.add(row.slug);
 }
 return matches.map(m=>rows.find(r=>r.slug===m.slug));
}
