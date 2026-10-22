'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import type {SearchResult} from '@/lib/discovery/search-service';
import styles from './discovery-search.module.css';
import {beginSearchV2,observePlacementsV2,emitV2,type SearchTrackingV2} from '@/lib/analytics/client-v2';
import {exposureGate} from '@/lib/analytics/exposure';
const label=(value:string)=>value.replaceAll('-',' ');
export default function DiscoverySearch(){
 const [query,setQuery]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<(SearchResult&{analytics?:SearchTrackingV2})|null>(null);
 const [tracking,setTracking]=useState<ReturnType<typeof beginSearchV2>>(undefined);
 const resultRoot=useRef<HTMLDivElement>(null);
 const active=useRef<AbortController|null>(null);
 useEffect(()=>()=>active.current?.abort(),[]);
 useEffect(()=>{
  const root=resultRoot.current,a=result?.analytics;
  if(!result||!tracking||!a||a.searchId!==tracking.searchId||!root)return;
  const c={...tracking.context,anchor:result.intent.anchor??undefined,constraints:[...result.intent.attributes]};
  const dispose=observePlacementsV2(root,c,result.matches.map((m,i)=>({slug:m.slug,position:i+1})),a.receipt,{searchId:a.searchId,resultSetId:a.resultSetId});
  const target=root.querySelector<HTMLElement>('[data-search-outcome]');
  const gate=exposureGate(()=>emitV2(c,'search_results_viewed',{searchId:a.searchId,resultSetId:a.resultSetId,intent:result.intent,outcome:result.state,resultCount:result.matches.length},a.receipt),{set:(fn,ms)=>setTimeout(fn,ms),clear:id=>clearTimeout(id as ReturnType<typeof setTimeout>)});
  const observer=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>{for(const e of entries)gate.visibility('outcome','outcome',e.isIntersecting?e.intersectionRatio:0);},{threshold:[0,.5,1]}):undefined;
  if(target)observer?.observe(target);const visible=()=>gate.active(document.visibilityState==='visible');const hide=()=>gate.active(false);visible();document.addEventListener('visibilitychange',visible);window.addEventListener('pagehide',hide);window.addEventListener('pageshow',visible);
  return ()=>{dispose();gate.dispose();observer?.disconnect();document.removeEventListener('visibilitychange',visible);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',visible);};
 },[result,tracking]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();active.current?.abort();const request=new AbortController();active.current=request;
  setBusy(true);setError('');setResult(null);const measurement=beginSearchV2(query);setTracking(undefined);
  try{
   const response=await fetch('/api/discover',{method:'POST',headers:{'Content-Type':'application/json',...(measurement?{'x-discovery-context':measurement.header}:{})},body:JSON.stringify({query}),signal:request.signal,cache:'no-store',credentials:'same-origin'});
   const data=await response.json();if(!response.ok)throw Error(data.error??'Search is temporarily unavailable.');
   if(active.current===request){setResult(data as SearchResult);setTracking(measurement);}
  }catch(e){if(!request.signal.aborted)setError(e instanceof Error?e.message:'Search is temporarily unavailable.');}
  finally{if(active.current===request)setBusy(false);}
 }
 return <section className={styles.search} aria-labelledby="search-title">
  <h2 id="search-title">What are you looking for?</h2>
  <form onSubmit={submit}>
   <label htmlFor="discovery-query">Describe the software or workflow you need</label>
   <div className={styles.controls}><input id="discovery-query" type="text" name="query" value={query} onChange={e=>setQuery(e.target.value)} maxLength={500} required placeholder="Something like Notion, but simpler, offline and without required AI…" aria-describedby="search-privacy" /><button disabled={busy||!query.trim()} type="submit">{busy?'Searching…':'Find software'}</button></div>
   <p id="search-privacy" className={styles.note}>Your request is sent to OpenAI to interpret your needs. When analytics is enabled, redacted query diagnostics are retained for seven days plus the daily cleanup delay. Avoid personal or confidential information.</p>
  </form>
  <div ref={resultRoot} aria-live="polite" aria-busy={busy}>
   {busy&&<p role="status">Checking reviewed software against your needs…</p>}
   {error&&<p role="alert">{error} <Link href="/#comparisons">Browse reviewed comparisons</Link></p>}
   {result&&<>
    <p data-search-outcome className={styles.note}>Interpreted needs: {[result.intent.anchor,result.intent.problem,...result.intent.attributes].filter(Boolean).map(s=>label(s!)).join(' · ')||'More detail needed'}. These describe your request, not guarantees about every product.</p>
    {result.state==='clarify'&&<p role="status">Some requirements need clarification. Try one familiar product and a specific need, such as “Notion for offline notes”. We have not dropped your other requirements.</p>}
    {result.state==='unsupported'&&<p role="status">This request includes a need we cannot currently represent or verify. Try a reviewed comparison or describe a narrower workflow.</p>}
    {result.state==='no_results'&&<p role="status">No reviewed products meet every interpreted requirement. No conditions were relaxed. Try a narrower request or <Link href="/#comparisons">browse comparisons and their limits</Link>.</p>}
    {result.state==='results'&&<>
     <p>{result.matches.length} reviewed match{result.matches.length===1?'':'es'}. {result.explanationMode==='ai-selected-evidence'?'Match explanations use AI-selected verified evidence.':'Showing verified evidence; AI explanation was unavailable.'}</p>
     <ul className={styles.results}>{result.matches.map((match,index)=><li key={match.slug}>
      <h3><Link data-search-product={match.slug} data-discovery-position={index+1} href={`/software/${match.slug}`}>{match.name} →</Link></h3><p>{match.description}</p>
      <h4>Why it fits</h4><ul>{match.facts.filter(f=>match.explanationFacts.includes(f.id)).map(f=><li key={f.id}>{f.label}: {f.value}</li>)}</ul>
      <p><strong>Reviewed scope:</strong> {match.scope}</p><p><strong>Pricing:</strong> {match.pricing}</p><p><strong>Trade-offs:</strong> {match.tradeOff}</p>
      <p>Oldest required evidence check: {match.checkedAt.slice(0,10)}</p>
      <details><summary>Evidence for all matched requirements</summary>{match.facts.map(f=><div key={f.id}><p>{f.label}: {f.value} · Checked {f.checkedAt.slice(0,10)}</p>{f.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗ </a>)}</div>)}</details>
      <p><Link href={`/escape/${match.routeSlug}`}>Review the source comparison and its limits →</Link></p>
     </li>)}</ul>
    </>}
   </>}
  </div>
 </section>;
}
