import type {DiscoveryEvent} from './events.ts';
export function eventQueue(send:(body:string,unloading:boolean)=>void){
 let pending:DiscoveryEvent[]=[];
 const bytes=(events:DiscoveryEvent[])=>new TextEncoder().encode(JSON.stringify(events)).byteLength;
 const flush=(unloading=false)=>{if(!pending.length)return;const body=JSON.stringify(pending);pending=[];try{send(body,unloading);}catch{/* Measurement must never block navigation. */}};
 return {flush,push(event:DiscoveryEvent){if(bytes([event])>16384)return;if(pending.length>=20||bytes([...pending,event])>16384)flush();pending.push(event);},size:()=>pending.length};
}
