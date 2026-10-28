import type {Metadata} from 'next';
import Link from 'next/link';
import {getChineseHiddenGems} from '@/lib/i18n/server';
import {gemText} from '@/lib/i18n/hidden-gems-localized';
import {languageAlternates,zhHiddenGems,zhHome} from '@/lib/i18n/pilot';
import {requestSeo} from '@/lib/discovery/seo-server';
import styles from '../../hidden-gems/hidden-gems.module.css';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{
 const [seo,cards]=await Promise.all([requestSeo(),getChineseHiddenGems()]);
 const index=seo.indexable&&cards.length>0;
 return {title:'值得發掘的軟體',description:'編輯精選的個人筆記、數位繪畫與 Windows PDF 頁面整理工具，附已查核的適用範圍與限制。',alternates:{canonical:zhHiddenGems,...(cards.length?{languages:languageAlternates('/hidden-gems')}:{})},robots:{index,follow:index}};
}
export default async function ChineseHiddenGems(){
 const cards=await getChineseHiddenGems();
 return <div className={styles.page} data-discovery-root>
  <header className={styles.hero}>
   <p className="eyebrow">值得進一步了解</p><h1>值得發掘的軟體</h1>
   <p>從具體的工作流程出發。這些編輯精選工具列出值得探索的原因，以及已查核的適用範圍、價格與取捨。</p>
   <p className={styles.note}>由編輯針對這些任務挑選。請查閱各產品頁的證據與版本細節；繁中版共用英文版的精選、證據與排序，不代表產品一定支援中文。</p>
  </header>
  {!cards.length?<p role="status">目前精選資料或完整翻譯暫時不可用。<Link href={zhHome+'#comparisons'}>探索已發布的比較。</Link></p>:
   <div className={styles.cards}>{cards.map((card,i)=><article key={card.slug} className={styles.card} aria-labelledby={'gem-'+card.slug}>
    <header><p className={styles.workflow}>{gemText(card.workflow)}</p><h2 id={'gem-'+card.slug}><Link data-discovery-exposure data-discovery-product={card.slug} data-discovery-position={i+1} href={zhHome+'/software/'+card.slug}>{card.name}</Link></h2><p>{gemText(card.reason)}</p></header>
    <dl className={styles.details}>
     <div><dt>已查核的工作流程</dt><dd>{gemText(card.scope)}</dd></div>
     <div><dt>需要考量的取捨</dt><dd>{gemText(card.tradeOff)}</dd></div>
     <div><dt>已查核的價格</dt><dd>{gemText(card.pricing)}</dd></div>
     <div><dt>證據查核日期</dt><dd>{new Date(card.checkedAt).toISOString().slice(0,10)}</dd></div>
    </dl>
    <details className={styles.sources}><summary>適用範圍與限制的資料來源</summary><ul>{card.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ul></details>
    <footer><Link data-discovery-product={card.slug} data-discovery-position={i+1} className={styles.productLink} href={zhHome+'/software/'+card.slug}>了解 {card.name} <span aria-hidden="true">→</span></Link><Link href={zhHome+'/escape/'+card.routeSlug}>比較替代方案</Link></footer>
   </article>)}</div>}
  <nav className={styles.back} aria-label="探索更多"><Link href={zhHome+'#comparisons'}>瀏覽所有比較</Link></nav>
 </div>;
}
