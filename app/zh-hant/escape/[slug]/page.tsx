import {writingGuideComparison} from "@/lib/discovery/writing-guide-comparison";
import {noteGuideComparison} from "@/lib/discovery/note-guide-comparison";
import {todoistMigrationComparison, todoistMigrationSlug} from '@/lib/discovery/todoist-migration-comparison';
import {notionAiComparison} from '@/lib/discovery/notion-ai-comparison';
import { portabilityPath, portabilityRelatedSlugs, publishedPortability } from '@/lib/discovery/portability-publication';
import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getChineseEscape,getChineseProduct} from '@/lib/i18n/server';
import {zh,zhValue} from '@/lib/i18n/localized';
import {zhHome,languageAlternates} from '@/lib/i18n/pilot';
import {requestSeo} from '@/lib/discovery/seo-server';
import {isoDate,jsonLd} from '@/lib/discovery/structured-data';
import {reviewedPrivacyOperation} from '@/lib/discovery/privacy-route';
import {safeUrl,latestVerification} from '@/lib/discovery/model';
import styles from '../../../escape/[slug]/escape.module.css';
type Props={params:Promise<{slug:string}>};
export const dynamic='force-dynamic';
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params,p=await getChineseEscape(slug),s=await requestSeo();return {title:p?zh(p.name):'比較暫時無法提供',description:p?zh(p.description):undefined,alternates:{canonical:zhHome+'/escape/'+slug,...(p?{languages:languageAlternates('/escape/'+slug)}:{})},robots:{index:s.indexable&&!!p,follow:s.indexable&&!!p}};}
const date=(v:string|null)=>isoDate(v)??'未知';
export default async function ChineseEscape({params}:Props){
 const {slug}=await params,p=await getChineseEscape(slug);if(!p)notFound();
 const qualified=p.candidates.filter(c=>c.eligible&&c.product.status==='published'),s=await requestSeo(),path=zhHome+'/escape/'+slug;
 const translatedProducts=new Set((await Promise.all(qualified.map(async c=>await getChineseProduct(c.product.slug)?c.product.slug:null))).filter(Boolean));
 const comparisonFor = (productSlug: string) => notionAiComparison(slug, productSlug) ?? todoistMigrationComparison(slug, productSlug);
 const noteGuide = noteGuideComparison(slug, qualified.map(c => c.product.slug), "zh");
 const writingGuide = writingGuideComparison(slug, qualified.map(c => c.product.slug), "zh");
 const guide = noteGuide ?? writingGuide;
 const showCustomComparison = qualified.some(c => comparisonFor(c.product.slug));
 const isTodoistMigration = slug === todoistMigrationSlug;
 const hasNotionAiDetails = qualified.length === 3 && qualified.every(c => notionAiComparison(slug, c.product.slug));
 return <article className={styles.page}>
 <nav aria-label="導覽路徑"><Link href={zhHome}>首頁</Link> / {zh(p.name)}</nav>
 {s.indexable&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@type':'CollectionPage',url:s.origin+path,inLanguage:'zh-Hant',name:zh(p.name),description:zh(p.description),...(isoDate(p.lastVerifiedAt)?{lastReviewed:isoDate(p.lastVerifiedAt)}:{}),mainEntity:{'@type':'ItemList',numberOfItems:qualified.length,itemListElement:qualified.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.product.name,url:s.origin+(translatedProducts.has(c.product.slug)?zhHome:'')+'/software/'+c.product.slug}))}})}}/>}
 <header><p className="eyebrow">尋找更合適的選擇</p><h1>{zh(p.name)}</h1><p>{zh(p.description)}</p><p>比較查核日期：<time dateTime={isoDate(p.lastVerifiedAt)??undefined}>{date(p.lastVerifiedAt)}</time></p></header>
 <section><h2>比較符合條件的工具</h2>{!guide&&<><p>僅列入條件已驗證且證據信心足夠的選項。小幅新穎性加分可調整合格選項的順序，人氣不決定排序。產品詳細頁提供繁中與英文版本；未完成翻譯者會標示英文。</p><p>未列入本比較不代表產品不支援；也可能是缺少查證資料、證據不足或超出已查核範圍。</p></>}
 <div className={styles.tableWrap}><table><caption>合格選項與已記錄的限制</caption><thead><tr><th>產品</th><th>符合條件</th><th>{guide?.firstColumn ?? (showCustomComparison ? (isTodoistMigration ? '如何從 Todoist 轉用' : '不使用 AI 仍可完成') : '價格與授權')}</th><th>{guide?.secondColumn ?? (showCustomComparison ? (isTodoistMigration ? '可保留與需重建的項目' : '想使用 AI 時') : '取捨與限制')}</th><th>最近主張查核</th></tr></thead><tbody>{qualified.map((c,i)=><tr key={c.product.slug}><th scope="row"><Link href={(translatedProducts.has(c.product.slug)?zhHome:'')+'/software/'+c.product.slug} data-discovery-product={c.product.slug} data-discovery-position={i+1}>{c.product.name}{!translatedProducts.has(c.product.slug)&&<span>（英文產品詳情）</span>}</Link></th><td>{writingGuide && reviewedPrivacyOperation(c.product) ? '僅限已查核的本機操作' : reviewedPrivacyOperation(c.product)?<>僅限已查核的本機操作<p>{zh(reviewedPrivacyOperation(c.product))}</p></>:c.fit.filter(f=>typeof f.value==='boolean').map(f=>zh(f.name)).join('、')}</td>{guide ? <>{guide.row(c.product.slug).map((value, i) => <td key={i}>{value}</td>)}</> : showCustomComparison ? (() => { const comparison = comparisonFor(c.product.slug); return comparison ? <><td>{comparison.zh[0]}</td><td>{comparison.zh[1]}<ul>{comparison.links.map(source => <li key={source[2]}><a href={source[2]}>{source[1]}</a></li>)}</ul></td></> : <><td>—</td><td>—</td></>; })() : <><td>{zhValue(c.product.attributes.find(a=>a.slug==='pricing-model')!)}</td><td>{zhValue(c.product.attributes.find(a=>a.slug==='trade-off-summary')!)}</td></>}<td>{date(latestVerification(c.product))}</td></tr>)}</tbody></table></div></section>
 {guide && <section><h2>{guide.heading}</h2><p>{guide.guidance}</p></section>}
 {hasNotionAiDetails ? <section>
   <h2>試做一遍不用 AI 的日常流程</h2>
   <p>用一則範例筆記和幾項待辦，確認每天會重複的操作能否完成。</p>
   <ul>
     <li><strong>AFFiNE：</strong>在桌面本機工作區維持登出，編輯文件、加入待辦，再用 Edgeless 白板整理資料。</li>
     <li><strong>Anytype：</strong>略過外部 AI 助手的設定。把一則筆記和一項待辦加入 Collection，再在 Anytype 裡排序或篩選。</li>
     <li><strong>AppFlowy：</strong>略過 Ollama 外掛的設定。手動編輯文件，再將一項待辦移到 Kanban 看板的另一欄。</li>
   </ul>
   <p>若你也需要斷網工作，可查閱<Link href="/zh-hant/escape/offline-notion-alternatives">離線 Notion 替代工具指南</Link>，確認同步及匯入的限制。</p>
 </section> : <section><h2>為什麼這些產品符合條件？</h2>{qualified.map((c,i)=><section className={styles.card} key={c.product.slug}><h3><Link href={(translatedProducts.has(c.product.slug)?zhHome:'')+'/software/'+c.product.slug} data-discovery-product={c.product.slug} data-discovery-position={i+1}>{c.product.name}{!translatedProducts.has(c.product.slug)&&'（英文產品詳情）'}</Link></h3>{writingGuide && <p>{writingGuide.workflow(c.product.slug)}</p>}{!guide&&<><p>{zh(c.product.description)}</p><p>符合本比較的條件已查核；價格與取捨均附有註明日期的來源證據。</p></>}{c.fit.filter(f=>!noteGuide || !["pricing-model","trade-off-summary"].includes(f.slug)).map(f=><div key={f.slug}><h4>{zh(f.name)}</h4>{!writingGuide && <>{f.relationshipType&&f.description&&<p>{zh(f.description)}</p>}<p>{f.slug==='privacy-friendly'?'僅針對已查核的本機操作驗證':f.value===undefined?'替代關係':zhValue(f)} · 查核日期：<time dateTime={isoDate(f.lastVerifiedAt)??undefined}>{date(f.lastVerifiedAt)}</time></p></>}{writingGuide && <p>查核日期 <time dateTime={isoDate(f.lastVerifiedAt)??undefined}>{date(f.lastVerifiedAt)}</time></p>}<ul aria-label="查核來源（保留原文標題）">{f.sources.map((source,n)=>safeUrl(source.url)?<li key={n}><a href={safeUrl(source.url)!} target="_blank" rel="noopener noreferrer">來源原文：{source.title} ↗</a></li>:null)}</ul></div>)}</section>)}</section>}
 <footer>來源查核針對個別主張，不代表實機測試或完整替代保證。翻譯不會更新來源查核日期；產品是否支援中文須另行確認。</footer>{portabilityRelatedSlugs.has(slug) && await publishedPortability().catch(() => false) && <p><Link href={'/zh-hant' + portabilityPath}>筆記搬家時，哪些內容帶得走？</Link></p>}
</article>;
}
