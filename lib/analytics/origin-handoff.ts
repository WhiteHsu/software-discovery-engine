// Short-lived same-origin handoff. Only a random lookup key appears in the URL.
// The signed receipt remains local; server signature/session/rank checks are unchanged.
export type OriginHandoff={sessionId:string;productSlug:string;expiresAt:number;receipt:string;fields:{originSurface:'search';originPageViewId:string;originSearchId:string;originExposureId:string;originPosition:number}};
const prefix='sd-handoff-v2:',uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function valid(value:unknown,now:number):value is OriginHandoff{
 if(!value||typeof value!=='object')return false;
 const v=value as OriginHandoff,f=v.fields;
 return uuid.test(v.sessionId)&&typeof v.productSlug==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.productSlug)&&Number.isSafeInteger(v.expiresAt)&&v.expiresAt>now&&v.expiresAt<=now+1800000&&typeof v.receipt==='string'&&v.receipt.length>0&&v.receipt.length<=6000&&!!f&&f.originSurface==='search'&&uuid.test(f.originPageViewId)&&uuid.test(f.originSearchId)&&uuid.test(f.originExposureId)&&Number.isInteger(f.originPosition)&&f.originPosition>=1&&f.originPosition<=6;
}
export function storeOriginHandoff(storage:Storage,value:OriginHandoff,now=Date.now()):string|undefined{
 try{
  if(!valid(value,now))return;
  const keys=[];for(let i=0;i<storage.length;i++){const k=storage.key(i);if(k?.startsWith(prefix))keys.push(k);}
  for(const k of keys){try{if(!valid(JSON.parse(storage.getItem(k)??'null'),now))storage.removeItem(k);}catch{storage.removeItem(k);}}
  const remaining=keys.filter(k=>storage.getItem(k)!==null);if(remaining.length>=64)return;
  const key=crypto.randomUUID();storage.setItem(prefix+key,JSON.stringify(value));return key;
 }catch{return;}
}
export function readOriginHandoff(storage:Storage,hash:string,path:string,now=Date.now()):OriginHandoff|undefined{
 const key=/^#sd-origin=([a-f0-9-]{36})$/i.exec(hash)?.[1];if(!key||!uuid.test(key))return;
 try{const raw=storage.getItem(prefix+key);if(!raw||raw.length>10000)return;const value:unknown=JSON.parse(raw);
  if(!valid(value,now)){storage.removeItem(prefix+key);return;}
  if(path!=='/software/'+value.productSlug&&path!=='/zh-hant/software/'+value.productSlug)return;
  return value;
 }catch{return;}
}
