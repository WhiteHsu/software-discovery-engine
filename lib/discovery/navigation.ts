import {escapeDefinitions} from './escape-model.ts';
import type {RouteCard} from './route-catalog.ts';

export const anchorOptions=[
 {value:'notion',label:'Notion'}, {value:'todoist',label:'Todoist'},
 {value:'grammarly',label:'Grammarly'}, {value:'photoshop',label:'Photoshop'},
 {value:'adobe-pdf',label:'Adobe / PDF'}, {value:'calm',label:'Calm / meditation'},
] as const;
export const constraintOptions=[
 {value:'offline',label:'Offline workflows'},
 {value:'optional-ai',label:'AI can be optional'},
 {value:'simpler',label:'Simpler note-taking'},
 {value:'buy-once',label:'One-time purchase'},
 {value:'privacy',label:'Reviewed local writing workflows'},
 {value:'no-subscription',label:'No subscription'},
] as const;
// These describe reviewed route intents, not additional product-level claims.
const constraintRoutes:Record<string,readonly string[]>={
 offline:['offline-notion-alternatives'],
 'optional-ai':['notion-alternatives-without-ai'],
 simpler:['simple-notion-alternatives'],
 'buy-once':['todoist-alternatives-with-a-one-time-purchase','productivity-apps-you-can-buy-once'],
 privacy:['privacy-friendly-grammarly-alternatives'],
 'no-subscription':['grammarly-alternatives-without-a-subscription','photoshop-alternatives-without-a-subscription','pdf-editors-without-a-subscription','meditation-apps-without-a-subscription'],
};
type Param=string|string[]|undefined;
export function navigationSelection(params:{anchor?:Param;constraint?:Param}){
 const read=(value:Param,options:readonly {value:string}[])=>value===undefined||value===''?'':typeof value==='string'&&options.some(o=>o.value===value)?value:null;
 const anchor=read(params.anchor,anchorOptions),constraint=read(params.constraint,constraintOptions);
 return {anchor:anchor??'',constraint:constraint??'',invalid:anchor===null||constraint===null,filtered:params.anchor!==undefined||params.constraint!==undefined};
}
export function filterRouteCards(cards:RouteCard[],selection:ReturnType<typeof navigationSelection>){
 if(selection.invalid)return [];
 return cards.filter(card=>{
  const def=escapeDefinitions.find(d=>d.slug===card.slug);
  return !!def&&(!selection.anchor||def.anchor===selection.anchor)&&(!selection.constraint||constraintRoutes[selection.constraint]?.includes(card.slug));
 });
}
