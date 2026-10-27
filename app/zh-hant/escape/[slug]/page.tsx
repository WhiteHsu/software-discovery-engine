import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getChineseEscape} from '@/lib/i18n/server';
import {zh,zhValue} from '@/lib/i18n/localized';
import {zhHome,languageAlternates} from '@/lib/i18n/pilot';
import {requestSeo} from '@/lib/discovery/seo-server';
import {isoDate,jsonLd} from '@/lib/discovery/structured-data';
import {safeUrl,latestVerification} from '@/lib/discovery/model';
import styles from '../../../escape/[slug]/escape.module.css';
type Props={params:Promise<{slug:string}>};
export const dynamic='force-dynamic';
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params,p=await getChineseEscape(slug),s=await requestSeo();return {title:p?zh(p.name):'比較暫時無法提供',description:p?zh(p.description):undefined,alternates:{canonical:zhHome+'/escape/'+slug,...(p?{languages:languageAlternates('/escape/'+slug)}:{})},robots:{index:s.indexable&&!!p,follow:s.indexable&&!!p}};}
const date=(v:string|null)=>isoDate(v)??'未知';
export default async function ChineseEscape({params}:Props){
 const {slug}=await params,p=await getChineseEscape(slug);if(!p)notFound();
 const qualified=p.candidates.filter(c=>c.eligible&&c.product.status==='published'),s=await requestSeo(),path=zhHome+'/escape/'+slug;
 return <article className={styles.page}>
 <nav aria-label="導覽路徑"><Link href={zhHome}>首頁</Link> / {zh(p.name)}</nav>
 {s.indexable&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@type':'CollectionPage',url:s.origin+path,inLanguage:'zh-Hant',name:zh(p.name),description:zh(p.description),...(isoDate(p.lastVerifiedAt)?{lastReviewed:isoDate(p.lastVerifiedAt)}:{}),mainEntity:{'@type':'ItemList',numberOfItems:qualified.length,itemListElement:qualified.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.product.name,url:s.origin+'/software/'+c.product.slug}))}})}}/>}
 <header><p className="eyebrow">尋找更合適的選擇</p><h1>{zh(p.name)}</h1><p>{zh(p.description)}</p><p>比較查核日期：<time dateTime={isoDate(p.lastVerifiedAt)??undefined}>{date(p.lastVerifiedAt)}</time></p></header>
 <section><h2>比較符合條件的工具</h2><p>僅列入條件已驗證且證據信心足夠的選項。小幅新穎性加分可調整合格選項的順序，人氣不決定排序。產品詳細頁目前以英文提供。</p>
 <div className={styles.tableWrap}><table><caption>合格選項與已記錄的限制</caption><thead><tr><th>產品</th><th>符合條件</th><th>價格與授權</th><th>取捨與限制</th><th>最近主張查核</th></tr></thead><tbody>{qualified.map((c,i)=><tr key={c.product.slug}><th scope="row"><Link href={'/software/'+c.product.slug} data-discovery-product={c.product.slug} data-discovery-position={i+1}>{c.product.name}<span>（英文產品詳情）</span></Link></th><td>{c.fit.filter(f=>typeof f.value==='boolean').map(f=>zh(f.name)).join('、')}</td><td>{zhValue(c.product.attributes.find(a=>a.slug==='pricing-model')!)}</td><td>{zhValue(c.product.attributes.find(a=>a.slug==='trade-off-summary')!)}</td><td>{date(latestVerification(c.product))}</td></tr>)}</tbody></table></div></section>
 <section><h2>為什麼這些產品符合條件？</h2>{qualified.map((c,i)=><section className={styles.card} key={c.product.slug}><h3><Link href={'/software/'+c.product.slug} data-discovery-product={c.product.slug} data-discovery-position={i+1}>{c.product.name}（英文產品詳情）</Link></h3><p>{zh(c.product.description)}</p><p>符合本比較的條件已查核；價格與取捨均附有註明日期的來源證據。</p>{c.fit.map(f=><div key={f.slug}><h4>{zh(f.name)}</h4>{f.relationshipType&&f.description&&<p>{zh(f.description)}</p>}<p>{f.value===undefined?'替代關係':zhValue(f)} · 查核日期：<time dateTime={isoDate(f.lastVerifiedAt)??undefined}>{date(f.lastVerifiedAt)}</time></p><ul aria-label="查核來源（保留原文標題）">{f.sources.map((source,n)=>safeUrl(source.url)?<li key={n}><a href={safeUrl(source.url)!} target="_blank" rel="noopener noreferrer">來源原文：{source.title} ↗</a></li>:null)}</ul></div>)}</section>)}</section>
 <footer>來源查核針對個別主張，不代表實機測試或完整替代保證。翻譯不會更新來源查核日期；產品是否支援中文須另行確認。</footer></article>;
}
