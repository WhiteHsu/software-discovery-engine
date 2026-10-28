'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import type {SearchResult} from '@/lib/discovery/search-service';
import styles from './discovery-search.module.css';
import {beginSearchV2,observePlacementsV2,emitV2,type SearchTrackingV2} from '@/lib/analytics/client-v2';
import {exposureGate} from '@/lib/analytics/exposure';
import {searchIntentLabels} from '@/lib/i18n/search-localized';
export default function DiscoverySearch({chinese=false}:{chinese?:boolean}){return <SearchForm key={chinese?'zh-Hant':'en'} chinese={chinese}/>;}
function SearchForm({chinese}:{chinese:boolean}){
 const text=(en:string,zh:string)=>chinese?zh:en;
 const label=(value:string)=>chinese?searchIntentLabels[value]??value:value.replaceAll('-',' ');
 const home=chinese?'/zh-hant':'/';
 const productPath=(slug:string)=>(chinese?'/zh-hant':'')+'/software/'+slug;
 const routePath=(slug:string)=>(chinese?'/zh-hant':'')+'/escape/'+slug;
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
   const response=await fetch('/api/discover',{method:'POST',headers:{'Content-Type':'application/json',...(chinese?{'x-discovery-locale':'zh-Hant'}:{}),...(measurement?{'x-discovery-context':measurement.header}:{})},body:JSON.stringify({query}),signal:request.signal,cache:'no-store',credentials:'same-origin'});
   const data=await response.json();if(!response.ok)throw Error(data.error??text('Search is temporarily unavailable.','搜尋暫時無法使用，請稍後再試。'));
   if(active.current===request){setResult(data as SearchResult);setTracking(measurement);}
  }catch(e){if(!request.signal.aborted)setError(e instanceof Error&&!(chinese&&e instanceof TypeError)?e.message:text('Search is temporarily unavailable.','搜尋暫時無法使用，請稍後再試。'));}
  finally{if(active.current===request)setBusy(false);}
 }
 return <section className={styles.search} aria-labelledby="search-title">
  <h2 id="search-title">{text('What are you looking for?','你想找什麼？')}</h2>
  <form onSubmit={submit}>
   <label htmlFor="discovery-query">{text('Describe the software or workflow you need','描述你需要的軟體或工作流程')}</label>
   <div className={styles.controls}><input id="discovery-query" type="text" name="query" value={query} onChange={e=>setQuery(e.target.value)} maxLength={500} required placeholder={text("Something like Notion, but simpler, offline and without required AI…","類似 Notion，但更簡單、可離線，且不強制使用 AI…")} aria-describedby="search-privacy" /><button disabled={busy||!query.trim()} type="submit">{busy?text('Searching…','搜尋中…'):text('Find software','尋找軟體')}</button></div>
   <p id="search-privacy" className={styles.note}>{text('Your request is sent to OpenAI to interpret your needs. When analytics is enabled, redacted query diagnostics are retained for seven days plus the daily cleanup delay. Avoid personal or confidential information.','你的需求會傳送至 OpenAI 進行解析。啟用分析時，經遮蔽處理的查詢診斷資料會保留七天，另加每日清理的延遲時間。請勿輸入個人或機密資訊。')}</p>
  </form>
  <div ref={resultRoot} aria-live="polite" aria-busy={busy}>
   {busy&&<p role="status">{text('Checking reviewed software against your needs…','正在核對已查核的軟體是否符合你的需求…')}</p>}
   {error&&<p role="alert">{error} <Link href={home+'#comparisons'}>{text('Browse reviewed comparisons','瀏覽已查核的比較')}</Link></p>}
   {result&&<>
    <p data-search-outcome className={styles.note}>{text('Interpreted needs: ','解析出的需求：')} {[result.intent.anchor,result.intent.problem,...result.intent.attributes].filter(Boolean).map(s=>label(s!)).join(' · ')||text('More detail needed','需要更多細節')}{text('. These describe your request, not guarantees about every product.','。這些描述的是你的需求，不代表每款產品都具有相關保證。')}</p>
    {result.state==='clarify'&&<p role="status">{text('Some requirements need clarification. Try one familiar product and a specific need, such as “Notion for offline notes”. We have not dropped your other requirements.','部分需求需要釐清。請描述一款熟悉的產品與具體用途，例如「可離線記筆記的 Notion 替代工具」。我們沒有移除你的其他要求。')}</p>}
    {result.state==='unsupported'&&<p role="status">{text('This request includes a need we cannot currently represent or verify. Try a reviewed comparison or describe a narrower workflow.','這項請求包含目前無法表示或查核的需求。請查閱已查核的比較，或描述範圍更明確的工作流程。')}</p>}
    {result.state==='no_results'&&<p role="status">{text('No reviewed products meet every interpreted requirement. No conditions were relaxed. Try a narrower request or ','沒有已查核的產品符合每一項解析出的需求，且未放寬任何條件。請縮小需求範圍，或')}<Link href={home+'#comparisons'}>{text('browse comparisons and their limits','瀏覽比較及其限制')}</Link>{text('.','。')}</p>}
    {result.state==='results'&&<>
     <p>{chinese?`${result.matches.length} 款已查核的符合工具。`:`${result.matches.length} reviewed match${result.matches.length===1?'':'es'}.`} {result.explanationMode==='ai-selected-evidence'?text('Match explanations use AI-selected verified evidence.','符合原因採用由 AI 選取的已查核證據。'):text('Showing verified evidence; AI explanation was unavailable.','AI 說明暫時不可用，以下直接顯示已查核的證據。')}</p>
     <ul className={styles.results}>{result.matches.map((match,index)=><li key={match.slug}>
      <h3><Link data-search-product={match.slug} data-discovery-position={index+1} href={productPath(match.slug)}>{match.name} →</Link></h3><p>{match.description}</p>
      <h4>{text('Why it fits','符合需求的原因')}</h4><ul>{match.facts.filter(f=>match.explanationFacts.includes(f.id)).map(f=><li key={f.id}>{f.label}: {f.value}</li>)}</ul>
      <p><strong>{text('Reviewed scope:','已查核的適用範圍：')}</strong> {match.scope}</p><p><strong>{text('Pricing:','價格：')}</strong> {match.pricing}</p><p><strong>{text('Trade-offs:','取捨：')}</strong> {match.tradeOff}</p>
      <p>{text('Oldest required evidence check: ','必要證據中最早的查核日期：')} {match.checkedAt.slice(0,10)}</p>
      <details><summary>{text('Evidence for all matched requirements','所有符合需求的證據')}</summary>{match.facts.map(f=><div key={f.id}><p>{f.label}: {f.value} · {text('Checked ','查核日期：')} {f.checkedAt.slice(0,10)}</p>{f.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗ </a>)}</div>)}</details>
      <p><Link href={routePath(match.routeSlug)}>{text('Review the source comparison and its limits →','查閱來源比較及其限制 →')}</Link></p>
     </li>)}</ul>
    </>}
   </>}
  </div>
 </section>;
}
