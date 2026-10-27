import Link from 'next/link';
import type {Metadata} from 'next';
import {requestSeo} from '@/lib/discovery/seo-server';
import {getChineseEscape} from '@/lib/i18n/server';
import {pilotSlugs,zhHome,languageAlternates} from '@/lib/i18n/pilot';
import {zh} from '@/lib/i18n/localized';
import styles from '../home.module.css';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{const s=await requestSeo();return {title:'依你的需求，尋找更合適的軟體',description:'比較經查核的軟體替代方案：離線筆記、免訂閱的 Windows PDF 頁面整理，以及各項使用限制。',alternates:{canonical:zhHome,languages:languageAlternates('/')},robots:{index:s.indexable,follow:s.indexable}};}
export default async function ChineseHome(){
 const pages=await Promise.all(pilotSlugs.map(getChineseEscape));
 return <div><section className={styles.hero}><p className="eyebrow">尋找更合適的選擇</p><h1>從你的需求出發，<br/>找到值得了解的軟體。</h1><p>想離線整理筆記，或減少強制訂閱？先比較使用範圍、價格與限制，再決定哪些工具適合進一步了解。</p><a href="#comparisons" className={styles.browse}>探索比較 ↓</a></section>
 <section id="comparisons" className={styles.directory}><h2>你想改善什麼？</h2><p>繁中試點與英文版共用產品資料、證據及排序。這不是國際排名，也不代表產品一定支援中文。</p><ul className={styles.grid}>{pages.flatMap(p=>p?[<li className={styles.card} key={p.slug}><h3><Link href={zhHome+'/escape/'+p.slug}>{zh(p.name)} →</Link></h3><p>{zh(p.description)}</p></li>]:[])}</ul>{!pages.some(Boolean)&&<p role="status">目前比較資料或翻譯暫時不可用，請稍後再試。</p>}
 <p>繁中版目前提供兩個比較主題；產品詳細頁及其他比較仍以英文提供。<Link href="/">前往英文版瀏覽全部主題</Link>。繁中搜尋功能尚未提供。</p></section></div>;
}
