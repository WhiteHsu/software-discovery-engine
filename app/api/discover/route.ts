import {searchConfig,searchAdmission,searchRequest} from '@/lib/discovery/search-http';
import {modelIntent,modelExplanations} from '@/lib/discovery/search-model';
import {discover} from '@/lib/discovery/search-service';
import {escapeDefinitions} from '@/lib/discovery/escape-model';
import {getEscape} from '@/lib/discovery/escapes';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const admit=searchAdmission();
export async function POST(request:Request){
 const config=searchConfig(process.env);
 return searchRequest(request,config,{admit,now:Date.now,run:(query,signal)=>discover(query,{
  parse:q=>modelIntent(q,config,signal),
  retrieve:async intent=>{
   const defs=escapeDefinitions.filter(d=>!intent.anchor||d.anchor===intent.anchor),pages=[];
   for(let offset=0;offset<defs.length;offset+=2){if(signal.aborted)throw Error('Search cancelled');pages.push(...await Promise.all(defs.slice(offset,offset+2).map(d=>getEscape(d.slug))));}
   return pages;
  },
  explain:matches=>modelExplanations(matches,config,signal),
 })});
}
