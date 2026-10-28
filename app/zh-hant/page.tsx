import Link from 'next/link';
import type {Metadata} from 'next';
import {requestSeo} from '@/lib/discovery/seo-server';
import {getChineseEscape,getChineseHiddenGems} from '@/lib/i18n/server';
import {pilotSlugs,zhHome,languageAlternates} from '@/lib/i18n/pilot';
import {zh} from '@/lib/i18n/localized';
import styles from '../home.module.css';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{const s=await requestSeo();return {title:'依你的需求，尋找更合適的軟體',description:'比較經查核的筆記、任務管理、寫作、影像、PDF 與冥想工具替代方案，了解價格、適用範圍與限制。',alternates:{canonical:zhHome,languages:languageAlternates('/')},robots:{index:s.indexable,follow:s.indexable}};}
export default async function ChineseHome(){
 const pages=await Promise.all(pilotSlugs.map(getChineseEscape));
 const gems=await getChineseHiddenGems();
 return <div><section className={styles.hero}><p className="eyebrow">尋找更合適的選擇</p><h1>從你的需求出發，<br/>找到值得了解的軟體。</h1><p>想離線整理筆記，或減少強制訂閱？先比較使用範圍、價格與限制，再決定哪些工具適合進一步了解。</p><a href="#comparisons" className={styles.browse}>探索比較 ↓</a></section>
 <section id="comparisons" className={styles.directory}><h2>你想改善什麼？</h2><p>繁中版與英文版共用產品資料、證據及排序。這不是國際排名，也不代表產品一定支援中文。</p><ul className={styles.grid}>{pages.flatMap(p=>p?[<li className={styles.card} key={p.slug}><h3><Link href={zhHome+'/escape/'+p.slug}>{zh(p.name)} →</Link></h3><p>{zh(p.description)}</p></li>]:[])}</ul>{!pages.some(Boolean)&&<p role="status">目前比較資料或翻譯暫時不可用，請稍後再試。</p>}
 {gems.length>0&&<p><Link href={zhHome+'/hidden-gems'}>值得發掘的軟體 →</Link>：從編輯精選的個人筆記、數位繪畫與 PDF 頁面整理工具開始探索。</p>}
 <p>繁中版涵蓋十個比較主題，實際顯示以目前證據及翻譯完整性為準；產品詳細頁提供繁中與英文版本，實際供應以翻譯完整性為準。<Link href="/">前往英文版瀏覽全部主題</Link>。繁中搜尋功能尚未提供。</p></section></div>;
}
