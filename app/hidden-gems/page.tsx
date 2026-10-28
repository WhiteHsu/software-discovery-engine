import type {Metadata} from 'next';
import Link from 'next/link';
import {getHiddenGems} from '@/lib/discovery/hidden-gems-server';
import {indexableGemCollection} from '@/lib/discovery/hidden-gems';
import {requestSeo} from '@/lib/discovery/seo-server';
import DiscoveryTracker from '@/components/DiscoveryTracker';
import {pageTrackingEnabled} from '@/lib/analytics/page-tracking';
import {getChineseHiddenGems} from '@/lib/i18n/server';
import {languageAlternates} from '@/lib/i18n/pilot';
import styles from './hidden-gems.module.css';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{
 const [seo,cards,chinese]=await Promise.all([requestSeo(),getHiddenGems(),getChineseHiddenGems()]);
 const index=seo.indexable&&indexableGemCollection(cards);
 return {title:'Hidden Gems',description:'Editorial software picks for personal notebooks, digital painting and Windows PDF page organization, with reviewed scope and limits.',metadataBase:new URL(seo.origin),alternates:{canonical:'/hidden-gems',...(chinese.length?{languages:languageAlternates('/hidden-gems')}:{})},robots:{index,follow:index}};
}
export default async function HiddenGems(){
 const cards=await getHiddenGems();
 return <div className={styles.page} data-discovery-root>
  <DiscoveryTracker enabled={pageTrackingEnabled()} surface="hidden_gems" slug="hidden-gems" products={cards.map((c,i)=>({slug:c.slug,position:i+1}))} />
  <header className={styles.hero}>
   <p className="eyebrow">Worth a closer look</p><h1>Hidden Gems</h1>
   <p>Start with a specific workflow. These editorial picks pair a reason to explore with reviewed scope, pricing and trade-offs.</p>
   <p className={styles.note}>Selected for these tasks by the editors. Check each product page for evidence and edition details.</p>
  </header>
  {!cards.length?<p role="status">No selections are available right now. <Link href="/#comparisons">Explore the published comparisons.</Link></p>:<>
   {!indexableGemCollection(cards)&&<p role="status" className={styles.note}>Some selections are currently unavailable. Available picks are shown below.</p>}
   <div className={styles.cards}>{cards.map((card,i)=><article key={card.slug} className={styles.card} aria-labelledby={'gem-'+card.slug}>
    <header><p className={styles.workflow}>{card.workflow}</p><h2 id={'gem-'+card.slug}><Link data-discovery-exposure data-discovery-product={card.slug} data-discovery-position={i+1} href={'/software/'+card.slug}>{card.name}</Link></h2><p>{card.reason}</p></header>
    <dl className={styles.details}>
     <div><dt>Reviewed workflow</dt><dd>{card.scope}</dd></div>
     <div><dt>Trade-offs to consider</dt><dd>{card.tradeOff}</dd></div>
     <div><dt>Reviewed pricing</dt><dd>{card.pricing}</dd></div>
     <div><dt>Evidence checked</dt><dd>{new Date(card.checkedAt).toISOString().slice(0,10)}</dd></div>
    </dl>
    <details className={styles.sources}><summary>Sources for this scope and its limits</summary><ul>{card.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ul></details>
    <footer><Link data-discovery-product={card.slug} data-discovery-position={i+1} className={styles.productLink} href={'/software/'+card.slug}>Explore {card.name} <span aria-hidden="true">→</span></Link><Link href={'/escape/'+card.routeSlug}>Compare alternatives</Link></footer>
   </article>)}</div>
  </>}
  <nav className={styles.back} aria-label="More discovery"><Link href="/#comparisons">Browse all comparisons</Link></nav>
 </div>;
}
