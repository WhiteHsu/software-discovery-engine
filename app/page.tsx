import Link from 'next/link';
import {getPublishedRouteCards} from '@/lib/discovery/route-catalog-server';
import type {RouteCard} from '@/lib/discovery/route-catalog';
import {anchorOptions,constraintOptions,navigationSelection,filterRouteCards} from '@/lib/discovery/navigation';
import {requestSeo} from '@/lib/discovery/seo-server';
import type {Metadata} from 'next';
import styles from './home.module.css';
type HomeProps={searchParams:Promise<{anchor?:string|string[];constraint?:string|string[]}>};
export async function generateMetadata({searchParams}:HomeProps):Promise<Metadata>{
 const selection=navigationSelection(await searchParams),seo=await requestSeo();
 return {alternates:{canonical:'/'},robots:{index:seo.indexable&&!selection.filtered,follow:seo.indexable}};
}
export default async function Home({searchParams}:HomeProps){
 const selection=navigationSelection(await searchParams);
 let routes:RouteCard[]=[];
 let unavailable=false;
 try{routes=await getPublishedRouteCards();}catch{unavailable=true;}
 const matches=filterRouteCards(routes,selection);
 return <div>
  <section className={styles.hero} aria-labelledby="discovery-title">
   <p className="eyebrow">Find a better fit</p>
   <h1 id="discovery-title">Find software<br />the algorithms missed.</h1>
   <p>Start with what you want to change: fewer subscriptions, offline access, simpler tools, or a specific local workflow.</p>
   <a className={styles.browse} href="#comparisons">Explore comparisons <span aria-hidden="true">↓</span></a>
   <Link className={styles.gemsLink} href="/hidden-gems">Explore Hidden Gems →</Link>
  </section>
  <section id="comparisons" aria-labelledby="comparisons-title" className={styles.directory}>
   <h2 id="comparisons-title">What would you like to change?</h2>
   <p className={styles.intro}>Compare reviewed alternatives, their pricing models and their limits. Each comparison covers a specific task or edition; check the scope before choosing.</p>
   <form action="/#comparisons" method="get" className={styles.filters} aria-label="Find a reviewed comparison">
    <div><label htmlFor="discovery-anchor">What do you use?</label><select id="discovery-anchor" name="anchor" defaultValue={selection.anchor}>
     <option value="">Any software or workflow</option>{anchorOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select></div>
    <div><label htmlFor="discovery-constraint">What would you like to change?</label><select id="discovery-constraint" name="constraint" defaultValue={selection.constraint}>
     <option value="">Any reviewed need</option>{constraintOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select></div>
    <button type="submit">Find comparisons</button>
    {selection.filtered&&<Link href="/#comparisons">Clear filters</Link>}
   </form>
   <p className={styles.scopeNote}>Choose either option or both. Results cover existing reviewed comparisons; each page explains the supported scope and limits.</p>
   {unavailable?<p role="status">Comparisons are temporarily unavailable. Please try again shortly.</p>:selection.invalid?<p role="status">That filter is not available. Choose from the options above or clear the filters.</p>:routes.length===0?<p>No comparisons are available yet. Please check back soon.</p>:matches.length===0?<p role="status">No reviewed comparison matches both choices yet. Try a different need or clear the filters to browse all comparisons.</p>:<>
   <p role="status">{matches.length} reviewed comparison{matches.length===1?'':'s'}</p>
   <ul className={styles.grid}>{matches.map(route=><li key={route.slug} className={styles.card}>
    <h3><Link href={`/escape/${route.slug}`}>{route.name}<span aria-hidden="true"> ↗</span></Link></h3>
    <p>{route.description}</p>
   </li>)}</ul></>}
  </section>
  <section className={styles.gems} aria-labelledby="hidden-gems-title">
   <p className="eyebrow">Explore a focused workflow</p>
   <h2 id="hidden-gems-title">Hidden Gems</h2>
   <p>Explore editorial software picks with reviewed scope, pricing and practical trade-offs.</p>
   <Link className={styles.browse} href="/hidden-gems">Explore the picks <span aria-hidden="true">→</span></Link>
  </section>
 </div>;
}
