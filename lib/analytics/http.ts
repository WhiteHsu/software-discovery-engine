import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {isIP} from 'node:net';
import {parseDiscoveryEvent,type DiscoveryEvent} from './events.ts';
import {prepareEventBatch,MAX_EVENT_BYTES,MAX_BATCH_EVENTS,type PublicationContext} from './ingestion.ts';

export type CollectorConfig={enabled:boolean;origin:string;rateSecret:string;trustedVercel:boolean};
type Dependencies={publication:(events:DiscoveryEvent[])=>Promise<PublicationContext>;store:(events:DiscoveryEvent[],key:string)=>Promise<'ok'|'limited'>;admit:(key:string,now:number)=>boolean;now:()=>Date;readTimeoutMs?:number};
class HttpFailure extends Error {status:number;constructor(status:number){super('Invalid analytics request');this.status=status;}}
export const analyticsResponse=(status:number)=>new Response(null,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex',...(status===429?{'Retry-After':'60'}:{})}});
export function collectorConfig(env:Record<string,string|undefined>):CollectorConfig{
 let origin='';try{const u=new URL(env.NEXT_PUBLIC_SITE_URL??'');if(u.protocol==='https:'&&!u.username&&!u.password&&u.pathname==='/'&&!u.search&&!u.hash)origin=u.origin;}catch{}
 const rateSecret=env.ANALYTICS_RATE_SECRET??'';
 return {enabled:env.ANALYTICS_ENABLED==='true'&&env.ANALYTICS_MAINTENANCE_READY==='true'&&!!origin&&/^[a-f0-9]{64,128}$/.test(rateSecret)&&!!env.SUPABASE_SERVICE_ROLE_KEY,origin,rateSecret,trustedVercel:env.VERCEL==='1'&&env.VERCEL_ENV==='production'};
}
export function dailyRateKey(ip:string,secret:string,now:Date){
 if(!isIP(ip))throw new HttpFailure(503);
 // Canonical IPv6 spelling prevents equivalent textual addresses splitting quotas.
 const address=isIP(ip)===6?new URL('http://['+ip+']/').hostname:ip;
 return createHmac('sha256',secret).update(now.toISOString().slice(0,10)+'\0'+address).digest('hex');
}
export function memoryAdmission(){
 let minute=-1,total=0;const clients=new Map<string,number>();
 return (key:string,now:number)=>{const bucket=Math.floor(now/60_000);if(bucket!==minute){minute=bucket;total=0;clients.clear();}
  if(total>=300||(clients.get(key)??0)>=30||(!clients.has(key)&&clients.size>=2048))return false;
  total++;clients.set(key,(clients.get(key)??0)+1);return true;};
}
async function limitedBody(request:Request,timeout:number){
 const length=request.headers.get('content-length');
 if(length!==null&&(!/^\d+$/.test(length)||Number(length)>MAX_EVENT_BYTES))throw new HttpFailure(413);
 const reader=request.body?.getReader();if(!reader)throw new HttpFailure(400);
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{
  const read=async()=>{const chunks:Uint8Array[]=[];let bytes=0;
   while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>MAX_EVENT_BYTES)throw new HttpFailure(413);chunks.push(value);}
   const all=new Uint8Array(bytes);let offset=0;for(const c of chunks){all.set(c,offset);offset+=c.length;}
   try{return new TextDecoder('utf-8',{fatal:true}).decode(all);}catch{throw new HttpFailure(400);}
  };
  return await Promise.race([read(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new HttpFailure(408)),timeout);})]);
 }finally{if(timer)clearTimeout(timer);void reader.cancel().catch(()=>{});try{reader.releaseLock();}catch{}}
}
export async function collectEvents(request:Request,config:CollectorConfig,deps:Dependencies){
 if(!config.enabled)return analyticsResponse(404);
 try{
  if(request.method!=='POST')throw new HttpFailure(405);
  if(!config.trustedVercel)throw new HttpFailure(503);
  if(request.headers.get('origin')!==config.origin||new URL(request.url).origin!==config.origin)throw new HttpFailure(403);
  const site=request.headers.get('sec-fetch-site');if(site&&site!=='same-origin')throw new HttpFailure(403);
  if(request.headers.get('dnt')==='1'||request.headers.get('sec-gpc')==='1')return analyticsResponse(204);
  if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('content-type')??'')||!['identity',null].includes(request.headers.get('content-encoding')))throw new HttpFailure(415);
  const now=deps.now(),ip=request.headers.get('x-vercel-forwarded-for')?.trim()??'';
  const key=dailyRateKey(ip,config.rateSecret,now);
  if(!deps.admit(key,now.getTime()))throw new HttpFailure(429);
  const body=await limitedBody(request,deps.readTimeoutMs??2000);
  let parsed:unknown;try{parsed=JSON.parse(body);}catch{throw new HttpFailure(400);}
  if(!Array.isArray(parsed)||parsed.length<1||parsed.length>MAX_BATCH_EVENTS)throw new HttpFailure(400);
  let events:DiscoveryEvent[];try{events=parsed.map(parseDiscoveryEvent);}catch{throw new HttpFailure(400);}
  // Prevent one request from fanning out across many database graph lookups.
  const first=events[0];if(events.some(e=>e.sessionId!==first.sessionId||e.pageViewId!==first.pageViewId||e.surface!==first.surface||e.path!==first.path))throw new HttpFailure(400);
  const publication=await deps.publication(events);
  let batch;try{batch=prepareEventBatch(body,publication,now);}catch{throw new HttpFailure(400);}
  const result=await deps.store(batch.events,key);
  return analyticsResponse(result==='limited'?429:204);
 }catch(error){return analyticsResponse(error instanceof HttpFailure?error.status:503);}
}
export async function purgeEvents(request:Request,secret:string,ready:boolean,purge:()=>Promise<void>){
 if(!ready||!/^[a-f0-9]{64,128}$/.test(secret))return analyticsResponse(404);
 const value=request.headers.get('authorization')??'';
 if(value.length>150||!timingSafeEqual(createHash('sha256').update(value).digest(),createHash('sha256').update('Bearer '+secret).digest()))return analyticsResponse(401);
 if(request.method!=='POST')return analyticsResponse(405);
 try{await purge();return analyticsResponse(204);}catch{return analyticsResponse(503);}
}
