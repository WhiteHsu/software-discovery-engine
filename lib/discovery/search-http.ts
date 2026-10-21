import {createHmac} from 'node:crypto';
import {isIP} from 'node:net';
import {validateQuery} from './search-intent.ts';
export function searchConfig(env:Record<string,string|undefined>){
 let origin='';try{const url=new URL(env.NEXT_PUBLIC_SITE_URL??'');if(url.protocol==='https:'&&!url.username&&!url.password&&url.pathname==='/'&&!url.search&&!url.hash&&!url.port)origin=url.origin;}catch{}
 const rateSecret=env.DISCOVERY_SEARCH_RATE_SECRET??'',key=env.OPENAI_API_KEY??'',model=env.OPENAI_DISCOVERY_MODEL??'';
 return {origin,rateSecret,key,model,enabled:env.DISCOVERY_SEARCH_ENABLED==='true'&&env.VERCEL==='1'&&env.VERCEL_ENV==='production'&&!!origin&&/^[a-f0-9]{64,128}$/.test(rateSecret)&&!!key&&/^[a-zA-Z0-9._:-]{1,100}$/.test(model)};
}
export function searchAdmission(){let minute=-1,total=0;const clients=new Map<string,number>();return (key:string,now:number)=>{const current=Math.floor(now/60000);if(current!==minute){minute=current;total=0;clients.clear();}if(total>=20||(clients.get(key)??0)>=3)return false;clients.set(key,(clients.get(key)??0)+1);total++;return true;};}
const reply=(status:number,value:unknown)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex',...(status===429?{'Retry-After':'60'}:{})}});
async function requestQuery(request:Request){
 const length=request.headers.get('content-length');if(length!==null&&(!/^\d+$/.test(length)||Number(length)>3072))throw Error('Invalid body');
 const reader=request.body?.getReader();if(!reader)throw Error('Missing body');let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([(async()=>{let bytes=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>3072)throw Error('Body too large');chunks.push(value);}const buffer=new Uint8Array(bytes);let offset=0;for(const c of chunks){buffer.set(c,offset);offset+=c.length;}const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).join()!=='query')throw Error('Invalid fields');return validateQuery(body.query);})(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('Read timeout')),2000);})]);}finally{if(timer)clearTimeout(timer);void reader.cancel().catch(()=>{});}
}
export async function searchRequest(request:Request,config:ReturnType<typeof searchConfig>,deps:{admit:(key:string,now:number)=>boolean;run:(query:string,signal:AbortSignal)=>Promise<unknown>;now:()=>number;timeoutMs?:number}){
 if(!config.enabled)return reply(503,{error:'Search is temporarily unavailable. Please browse the reviewed comparisons.'});
 if(request.method!=='POST')return reply(405,{error:'Use POST.'});
 if(request.headers.get('origin')!==config.origin||new URL(request.url).origin!==config.origin||request.headers.get('sec-fetch-site')&&request.headers.get('sec-fetch-site')!=='same-origin')return reply(403,{error:'Request not allowed.'});
 const ip=request.headers.get('x-vercel-forwarded-for')?.trim()??'';if(!isIP(ip))return reply(503,{error:'Search is temporarily unavailable.'});
 if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('content-type')??'')||!['identity',null].includes(request.headers.get('content-encoding')))return reply(415,{error:'JSON required.'});
 const now=deps.now(),address=isIP(ip)===6?new URL('http://['+ip+']/').hostname:ip;
 const quota=createHmac('sha256',config.rateSecret).update(Math.floor(now/60000)+'\0'+address).digest('hex');
 if(!deps.admit(quota,now))return reply(429,{error:'Please wait a minute before searching again.'});
 let query:string;try{query=await requestQuery(request);}catch{return reply(400,{error:'Enter a request of 1–500 characters.'});}
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
 try{return reply(200,await Promise.race([deps.run(query,controller.signal),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Search timeout'));},deps.timeoutMs??18000);})]));}
 catch{return reply(503,{error:'Search is temporarily unavailable. Please try a reviewed comparison.'});}
 finally{if(timer)clearTimeout(timer);controller.abort();}
}
