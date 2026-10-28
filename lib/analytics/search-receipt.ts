import {randomUUID} from 'node:crypto';
import {collectorConfigV2} from './http-v2.ts';
import {signSearchContext} from './context-v2.ts';
import type {SearchResult} from '../discovery/search-service.ts';
export function searchReceipt(request:Request,result:SearchResult,env:Record<string,string|undefined>,now=Date.now()){
 const config=collectorConfigV2(env);
 if(!config.enabled||!config.trustedVercel||request.headers.get('dnt')==='1'||request.headers.get('sec-gpc')==='1')return undefined;
 // Optional metadata failure must never break an otherwise successful search.
 try{
  const raw=request.headers.get('x-discovery-context');if(!raw||raw.length>400)return undefined;
  const c=JSON.parse(raw),keys=['sessionId','pageViewId','searchId','path'];
  if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).length!==4||Object.keys(c).some(k=>!keys.includes(k)))return undefined;
  const chinese=request.headers.get('x-discovery-locale')==='zh-Hant';
  if(!(chinese?['/zh-hant','/zh-hant/discover']:['/','/discover']).includes(c.path))return undefined;
  const resultSetId=randomUUID();
  const receipt=signSearchContext({version:1,...c,resultSetId,issuedAt:now,expiresAt:now+1800000,intent:result.intent,outcome:result.state,products:result.matches.map(m=>m.slug)},config.contextSecret);
  return {searchId:c.searchId,resultSetId,receipt};
 }catch{return undefined;}
}
