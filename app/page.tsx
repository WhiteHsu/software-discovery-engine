import Link from 'next/link';
import {getPublishedRouteCards} from '@/lib/discovery/route-catalog-server';
import type {RouteCard} from '@/lib/discovery/route-catalog';
import styles from './home.module.css';
export default async function Home(){
 let routes:RouteCard[]=[];
 let unavailable=false;
 try{routes=await getPublishedRouteCards();}catch{unavailable=true;}
 return <div>
  <section className={styles.hero} aria-labelledby="discovery-title">
   <p className="eyebrow">Find a better fit</p>
   <h1 id="discovery-title">Software that fits<br />the way you work.</h1>
   <p>Start with what you want to change: fewer subscriptions, offline access, simpler tools, or a specific local workflow.</p>
   <a className={styles.browse} href="#comparisons">Explore comparisons <span aria-hidden="true">↓</span></a>
   <Link className={styles.gemsLink} href="/hidden-gems">Explore Hidden Gems →</Link>
  </section>
  <section id="comparisons" aria-labelledby="comparisons-title" className={styles.directory}>
   <h2 id="comparisons-title">What would you like to change?</h2>
   <p className={styles.intro}>Compare reviewed alternatives, their pricing models and their limits. Each comparison covers a specific task or edition; check the scope before choosing.</p>
   {unavailable?<p role="status">Comparisons are temporarily unavailable. Please try again shortly.</p>:routes.length===0?<p>No comparisons are available yet. Please check back soon.</p>:<ul className={styles.grid}>{routes.map(route=><li key={route.slug} className={styles.card}>
    <h3><Link href={`/escape/${route.slug}`}>{route.name}<span aria-hidden="true"> ↗</span></Link></h3>
    <p>{route.description}</p>
   </li>)}</ul>}
  </section>
  <section className={styles.gems} aria-labelledby="hidden-gems-title">
   <p className="eyebrow">Explore a focused workflow</p>
   <h2 id="hidden-gems-title">Hidden Gems</h2>
   <p>Explore editorial software picks with reviewed scope, pricing and practical trade-offs.</p>
   <Link className={styles.browse} href="/hidden-gems">Explore the picks <span aria-hidden="true">→</span></Link>
  </section>
 </div>;
}
