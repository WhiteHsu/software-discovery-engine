import {parseSearchIntent,validateQuery,type SearchIntent} from './search-intent.ts';
import {searchGraph,validateExplanations,type SearchMatch,type SearchExplanation} from './search-graph.ts';
import type {EscapePage} from './escape-model.ts';
export type SearchResult={state:'results'|'no_results'|'clarify'|'unsupported';intent:SearchIntent;matches:(SearchMatch&{explanationFacts:string[]})[];explanationMode:'ai-selected-evidence'|'verified-evidence'};
export async function discover(queryInput:unknown,deps:{parse:(query:string)=>Promise<unknown>;retrieve:(intent:SearchIntent)=>Promise<(EscapePage|null)[]>;explain:(matches:SearchMatch[])=>Promise<unknown>}):Promise<SearchResult>{
 const query=validateQuery(queryInput),intent=parseSearchIntent(await deps.parse(query));
 if(intent.status!=='ready')return {state:intent.status,intent,matches:[],explanationMode:'verified-evidence'};
 const matches=searchGraph(intent,await deps.retrieve(intent));
 if(!matches.length)return {state:'no_results',intent,matches:[],explanationMode:'verified-evidence'};
 let selected:SearchExplanation[],mode:SearchResult['explanationMode']='ai-selected-evidence';
 try{selected=validateExplanations(await deps.explain(matches),matches);}catch{selected=matches.map(m=>({slug:m.slug,factIds:m.facts.map(f=>f.id)}));mode='verified-evidence';}
 return {state:'results',intent,matches:matches.map(m=>({...m,explanationFacts:selected.find(s=>s.slug===m.slug)!.factIds})),explanationMode:mode};
}
