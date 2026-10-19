type Clock={set:(callback:()=>void,delay:number)=>unknown;clear:(id:unknown)=>void};
export function exposureGate(emit:(key:string)=>void,clock:Clock){
 let active=false,disposed=false;
 const visible=new Map<string,Set<string>>(),timers=new Map<string,unknown>(),sent=new Set<string>();
 const cancel=(key:string)=>{if(timers.has(key)){clock.clear(timers.get(key));timers.delete(key);}};
 const update=(key:string)=>{
  if(disposed||!active||!visible.get(key)?.size||sent.has(key)){cancel(key);return;}
  if(timers.has(key))return;
  timers.set(key,clock.set(()=>{timers.delete(key);if(!disposed&&active&&visible.get(key)?.size&&!sent.has(key)){sent.add(key);emit(key);}},1000));
 };
 return {
  visibility(key:string,target:string,ratio:number){if(disposed)return;const set=visible.get(key)??new Set<string>();if(ratio>=.5)set.add(target);else set.delete(target);visible.set(key,set);update(key);},
  active(value:boolean){if(disposed)return;active=value;for(const key of visible.keys())update(key);},
  dispose(){disposed=true;for(const key of timers.keys())cancel(key);visible.clear();}
 };
}
