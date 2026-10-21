'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import type {SearchResult} from '@/lib/discovery/search-service';
import styles from './discovery-search.module.css';
const label=(value:string)=>value.replaceAll('-',' ');
export default function DiscoverySearch(){
 const [query,setQuery]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<SearchResult|null>(null);
 const active=useRef<AbortController|null>(null);
 useEffect(()=>()=>active.current?.abort(),[]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();active.current?.abort();const request=new AbortController();active.current=request;
  setBusy(true);setError('');setResult(null);
  try{
   const response=await fetch('/api/discover',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query}),signal:request.signal,cache:'no-store',credentials:'same-origin'});
   const data=await response.json();if(!response.ok)throw Error(data.error??'Search is temporarily unavailable.');
   if(active.current===request)setResult(data as SearchResult);
  }catch(e){if(!request.signal.aborted)setError(e instanceof Error?e.message:'Search is temporarily unavailable.');}
  finally{if(active.current===request)setBusy(false);}
 }
 return <section className={styles.search} aria-labelledby="search-title">
  <h2 id="search-title">What are you looking for?</h2>
  <form onSubmit={submit}>
   <label htmlFor="discovery-query">Describe the software or workflow you need</label>
   <div className={styles.controls}><input id="discovery-query" type="text" name="query" value={query} onChange={e=>setQuery(e.target.value)} maxLength={500} required placeholder="Something like Notion, but simpler, offline and without required AI…" aria-describedby="search-privacy" /><button disabled={busy||!query.trim()} type="submit">{busy?'Searching…':'Find software'}</button></div>
   <p id="search-privacy" className={styles.note}>Your request is sent to OpenAI to interpret your needs. Avoid personal or confidential information.</p>
  </form>
  <div aria-live="polite" aria-busy={busy}>
   {busy&&<p role="status">Checking reviewed software against your needs…</p>}
   {error&&<p role="alert">{error} <Link href="/#comparisons">Browse reviewed comparisons</Link></p>}
   {result&&<>
    <p className={styles.note}>Interpreted needs: {[result.intent.anchor,result.intent.problem,...result.intent.attributes].filter(Boolean).map(s=>label(s!)).join(' · ')||'More detail needed'}. These describe your request, not guarantees about every product.</p>
    {result.state==='clarify'&&<p role="status">Some requirements need clarification. Try one familiar product and a specific need, such as “Notion for offline notes”. We have not dropped your other requirements.</p>}
    {result.state==='unsupported'&&<p role="status">This request includes a need we cannot currently represent or verify. Try a reviewed comparison or describe a narrower workflow.</p>}
    {result.state==='no_results'&&<p role="status">No reviewed products meet every interpreted requirement. No conditions were relaxed. Try a narrower request or <Link href="/#comparisons">browse comparisons and their limits</Link>.</p>}
    {result.state==='results'&&<>
     <p>{result.matches.length} reviewed match{result.matches.length===1?'':'es'}. {result.explanationMode==='ai-selected-evidence'?'Match explanations use AI-selected verified evidence.':'Showing verified evidence; AI explanation was unavailable.'}</p>
     <ul className={styles.results}>{result.matches.map(match=><li key={match.slug}>
      <h3><Link href={`/software/${match.slug}`}>{match.name} →</Link></h3><p>{match.description}</p>
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
