import type {RouteCard} from './route-catalog.ts';
import type {EscapePage} from './escape-model.ts';
import {escapeDefinitions,publishable} from './escape-model.ts';
import {rankEscapeCandidates} from './privacy-route.ts';
import {safeUrl} from './model.ts';
const featured=['offline-notion-alternatives','todoist-alternatives-with-a-one-time-purchase','privacy-friendly-grammarly-alternatives','pdf-editors-without-a-subscription'];
export function featuredRoutes(cards:readonly RouteCard[]){return featured.flatMap(slug=>{const card=cards.find(c=>c.slug===slug);return card?[card]:[];});}
export type NeedEntry={label:string;href:string;description:string};
const needs=[
 {label:'No Subscription',constraint:'no-subscription',route:'pdf-editors-without-a-subscription',description:'Compare reviewed access paths without mandatory recurring software payments.'},
 {label:'No AI',constraint:'optional-ai',route:'notion-alternatives-without-ai',description:'Explore note workflows where AI can remain optional. This does not mean every product has no AI features.'},
 {label:'Privacy',constraint:'privacy',route:'privacy-friendly-grammarly-alternatives',description:'Review specific local writing operations, including setup, output and retention limits.'},
 {label:'Offline',constraint:'offline',route:'offline-notion-alternatives',description:'Compare locally available notes and objects; setup, sync and remote content have separate requirements.'},
 {label:'Buy Once',constraint:'buy-once',route:'todoist-alternatives-with-a-one-time-purchase',description:'Compare reviewed paid editions. Platforms, upgrades and optional services have separate terms.'},
 {label:'Minimalist',constraint:'simpler',route:'simple-notion-alternatives',description:'Explore focused personal note-taking without a required database workflow; compare the actual limits.'},
] as const;
export function needEntries(cards:readonly RouteCard[]):NeedEntry[]{return needs.filter(n=>cards.some(c=>c.slug===n.route)).map(n=>({label:n.label,href:`/?constraint=${n.constraint}#comparisons`,description:n.description}));}
export function localFirstEntry(page:EscapePage|null):NeedEntry|null{
 if(!page?.published||page.slug!=='offline-notion-alternatives')return null;
 const candidates=rankEscapeCandidates(escapeDefinitions[0],page.candidates);
 if(!publishable({...page,candidates}))return null;
 const match=candidates.find(c=>{
  const claim=c.product.attributes.find(a=>a.slug==='local-first');
  return c.eligible&&c.product.status==='published'&&!!c.product.name.trim()&&claim?.value===true&&claim.verificationStatus==='verified'&&typeof claim.confidence==='number'&&claim.confidence>=.8&&claim.confidence<=1&&!!claim.lastVerifiedAt&&Number.isFinite(Date.parse(claim.lastVerifiedAt))&&claim.sources.some(s=>safeUrl(s.url));
 });
 return match?{label:'Local First',href:`/software/${match.product.slug}`,description:`Explore ${match.product.name}'s reviewed local-first workflow. Check the product evidence, setup, sync and backup limits.`}:null;
}
