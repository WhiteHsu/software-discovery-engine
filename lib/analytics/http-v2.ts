import {collectorConfig,dailyRateKey,analyticsResponse,type CollectorConfig} from './http.ts';
import {parseEventV2,redactSearchQuery,type EventV2} from './events-v2.ts';
import {readSearchContext,validateSearchContext} from './context-v2.ts';
export type ConfigV2=CollectorConfig&{contextSecret:string};
export function collectorConfigV2(env:Record<string,string|undefined>):ConfigV2{
 const c=collectorConfig(env),contextSecret=env.ANALYTICS_CONTEXT_SECRET??'';
 return {...c,contextSecret,enabled:c.enabled&&env.ANALYTICS_V2_ENABLED==='true'&&/^[a-f0-9]{64,128}$/.test(contextSecret)&&contextSecret!==c.rateSecret};
}
type Deps={now:()=>Date;admit:(key:string,now:number)=>boolean;publication:(events:EventV2[])=>Promise<void>;store:(events:EventV2[],key:string)=>Promise<'ok'|'limited'>;readTimeoutMs?:number};
class Failure extends Error{status:number;constructor(status:number){super('Analytics rejected');this.status=status;}}
async function readBody(request:Request,timeout:number){
 const length=request.headers.get('content-length');if(length!==null&&(!/^\d+$/.test(length)||Number(length)>32768))throw new Failure(413);
 const reader=request.body?.getReader();if(!reader)throw new Failure(400);let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([(async()=>{const chunks:Uint8Array[]=[];let n=0;while(true){const r=await reader.read();if(r.done)break;n+=r.value.length;if(n>32768)throw new Failure(413);chunks.push(r.value);}const b=new Uint8Array(n);let at=0;for(const c of chunks){b.set(c,at);at+=c.length;}try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(b));}catch{throw new Failure(400);}})(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Failure(408)),timeout);})]);}
 finally{if(timer)clearTimeout(timer);void reader.cancel().catch(()=>{});}
}
export async function collectV2(request:Request,config:ConfigV2,deps:Deps){
 if(!config.enabled)return analyticsResponse(404);
 try{
  if(request.method!=='POST')throw new Failure(405);
  if(!config.trustedVercel)throw new Failure(503);
  if(request.headers.get('origin')!==config.origin||new URL(request.url).origin!==config.origin||request.headers.get('sec-fetch-site')&&request.headers.get('sec-fetch-site')!=='same-origin')throw new Failure(403);
  if(request.headers.get('dnt')==='1'||request.headers.get('sec-gpc')==='1')return analyticsResponse(204);
  if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('content-type')??'')||![null,'identity'].includes(request.headers.get('content-encoding')))throw new Failure(415);
  const now=deps.now();let key:string;try{key=dailyRateKey(request.headers.get('x-vercel-forwarded-for')?.trim()??'',config.rateSecret,now);}catch{throw new Failure(503);}
  if(!deps.admit(key,now.getTime()))throw new Failure(429);
  const body=await readBody(request,deps.readTimeoutMs??2000);
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!['events','receipt'].includes(k))||!Array.isArray(body.events)||!body.events.length||body.events.length>20)throw new Failure(400);
  let events:EventV2[];
  try{
   events=body.events.map((raw:unknown)=>{
    // Never trust browser redaction; sanitize again before contract validation.
    if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&typeof (raw as {query?:unknown}).query==='string')return parseEventV2({...raw,query:redactSearchQuery((raw as {query:string}).query)});
    return parseEventV2(raw);
   });
   const first=events[0];if(events.some(e=>e.sessionId!==first.sessionId||e.pageViewId!==first.pageViewId||e.surface!==first.surface||e.path!==first.path))throw Error('Mixed batch');
   const needsReceipt=events.some(e=>(e.surface==='search'&&!['page_viewed','search_performed'].includes(e.name))||e.originSurface==='search');
   if(needsReceipt){const c=readSearchContext(body.receipt,config.contextSecret,now.getTime());for(const e of events)if((e.surface==='search'&&!['page_viewed','search_performed'].includes(e.name))||e.originSurface==='search')validateSearchContext(e,c);}
   else if(body.receipt!==undefined)throw Error('Unexpected receipt');
   for(const e of events){const occurred=Date.parse(e.occurredAt);if(occurred<now.getTime()-86400000||occurred>now.getTime()+300000)throw Error('Outside ingestion window');}
  }catch{throw new Failure(400);}
  try{await deps.publication(events);}catch{throw new Failure(400);}
  return analyticsResponse(await deps.store(events,key)==='limited'?429:204);
 }catch(e){return analyticsResponse(e instanceof Failure?e.status:503);}
}
