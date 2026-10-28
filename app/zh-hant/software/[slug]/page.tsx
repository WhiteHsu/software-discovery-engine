import {getChineseEscape,getChineseProduct} from '@/lib/i18n/server';
import {languageAlternates} from '@/lib/i18n/pilot';
import {zh} from '@/lib/i18n/localized';
import {translateProduct} from '@/lib/i18n/product-localized';
import {indexableProduct,productData,jsonLd,isoDate} from "@/lib/discovery/structured-data";
import {requestSeo} from "@/lib/discovery/seo-server";


import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localPreview } from "@/lib/discovery/products";
import { claimValue, latestVerification, safeUrl, supported, type Claim } from "@/lib/discovery/model";
import {reviewedPrivacyOperation,privacyClaimForDisplay} from "@/lib/discovery/privacy-route";
import styles from "../../../software/[slug]/product.module.css";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params,p=await getChineseProduct(slug),seo=await requestSeo();
 return {title:p?.name??'產品暫時無法提供',description:p?zh(p.description):undefined,alternates:{canonical:'/zh-hant/software/'+slug,...(p?{languages:languageAlternates('/software/'+slug)}:{})},robots:{index:seo.indexable&&!!p&&indexableProduct(p),follow:seo.indexable&&!!p&&indexableProduct(p)}};
}
function displayValue(c:Claim){const v=claimValue(c);return v==='Yes'?'是':v==='No'?'否':v==='未知'||v==='Unknown'?'未知':v;}
function date(d:string|null) { return d && Number.isFinite(Date.parse(d)) ? new Date(d).toISOString().slice(0,10) : "未知"; }
function Evidence({claim}:{claim:Claim}) {
  const state=supported(claim)?claim.verificationStatus:"unknown";
  return <div className={styles.evidence}><span className={styles.badge}>{zh(state)}</span><span>{state==="unknown"?"查核日期未知":<>查核日期：<time dateTime={isoDate(claim.lastVerifiedAt)??undefined}>{date(claim.lastVerifiedAt)}</time></>}</span>
    {claim.sources.map((s,i)=>safeUrl(s.url)?<a key={i} href={safeUrl(s.url)!} target="_blank" rel="noopener noreferrer">{s.title} ↗</a>:null)}
  </div>;
}
function Claims({items,empty}:{items:Claim[];empty:string}) {
  return items.length?<ul className={styles.claims}>{items.map(c=><li key={c.slug+(c.relationshipType??"")}><strong>{c.name}</strong>{c.relationshipType&&<p>關係：{c.relationshipType}</p>}{c.description&&<p>{c.description}</p>}<Evidence claim={c}/></li>)}</ul>:<p className={styles.muted}>{empty}</p>;
}
export default async function Product({params}:Props) {
  const {slug}=await params; const original=await getChineseProduct(slug); if(!original)notFound(); const p=translateProduct(original);
  const seo=await requestSeo();
  const translatedRoutes=new Set((await Promise.all(p.routes.map(async route=>await getChineseEscape(route.slug)?route.slug:null))).filter(Boolean));
  const preview=localPreview(); const url=safeUrl(p.websiteUrl);
  const attribute=(slug:string)=>p.attributes.find(c=>c.slug===slug);
  const pricing=attribute("pricing-model"),platforms=attribute("supported-platforms"),tradeoffs=attribute("trade-off-summary");
  const facts=p.attributes.filter(c=>!["pricing-model","supported-platforms","trade-off-summary"].includes(c.slug));
  const privacyOperation=zh(reviewedPrivacyOperation(original));
  const positive=facts.filter(c=>c.slug!=="privacy-friendly"&&supported(c)&&c.verificationStatus==="verified"&&c.value===true);
  const audiences=p.audiences.filter(supported),problems=p.problems.filter(supported),anchors=p.anchors.filter(supported);
  return <article className={styles.page}>
    <nav aria-label="導覽路徑"><Link href="/zh-hant">首頁</Link> / {p.name}</nav>
    {seo.indexable&&!preview&&indexableProduct(p)&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({...productData(seo.origin,original),'@graph':productData(seo.origin,original)['@graph'].map((node,i)=>i===2?{...node,'@id':seo.origin+'/zh-hant/software/'+slug+'#breadcrumbs',itemListElement:[{'@type':'ListItem',position:1,name:'首頁',item:seo.origin+'/zh-hant'},{'@type':'ListItem',position:2,name:p.name,item:seo.origin+'/zh-hant/software/'+slug}]}:JSON.parse(JSON.stringify({...node,description:p.description,inLanguage:'zh-Hant'}).replaceAll(seo.origin+'/software/'+slug,seo.origin+'/zh-hant/software/'+slug)))})}}/>}
    {preview&&<aside className={styles.preview}>本機草稿預覽，尚未核准發布。</aside>}
    <header className={styles.hero}><p className="eyebrow">值得進一步了解的軟體</p><h1>{p.name}</h1><p className={styles.positioning}>{p.description??"產品定位尚未查核。"}</p>
      <div className={styles.actions}>{url?<a className={styles.cta} href={url} data-discovery-outbound target="_blank" rel="noopener noreferrer">前往 {p.name} 官網 ↗</a>:<span>官方網站未知</span>}<span className={styles.muted}>最近主張查核：<time dateTime={isoDate(latestVerification(p))??undefined}>{date(latestVerification(p))}</time></span></div>
    </header>
    <section className={styles.section}><h2>值得探索的原因</h2><p>先了解以下有來源支持的功能，再將限制與你的工作流程比較。</p><Claims items={positive} empty="目前尚無已驗證的正向功能主張。"/></section>
    <div className={styles.columns}><section className={styles.section}><h2>適合哪些使用者</h2><p className={styles.muted}>適用對象屬於編輯判斷。「可能符合」表示潛在的適用性。</p><Claims items={audiences} empty="尚未確認適用對象。"/></section>
    <section className={styles.section}><h2>如果你有這些需求，可以考慮</h2><p className={styles.muted}>請將以下需求與自身情況比較；不保證使用結果。</p><Claims items={problems} empty="尚未建立有來源證據支持的需求對應。"/></section></div>
    <div className={styles.columns}>{[["支援平台",platforms],["價格與授權",pricing]].map(([title,c])=>{
      const claim=c as Claim|undefined;
      const usable=claim&&supported(claim)&&(title!=="價格與授權"||claim.verificationStatus==="verified");
      return <section className={styles.section} key={title as string}><h2>{title as string}</h2><p>{usable?displayValue(claim):"未知，尚未驗證。"}</p>{claim&&<Evidence claim={claim}/>}<p className={styles.muted}>{title==="價格與授權"?"目前的地區價格與方案限制，請以官方來源為準。":"支援某個平台，不代表各平台功能完全相同。"}</p></section>;
    })}</div>
    <section className={styles.section}><h2>可能不適合的情況／取捨與限制</h2><p>做決定前，請先比較以下限制：</p><p>{tradeoffs?displayValue(tradeoffs):"未知，尚未記錄具體的取捨與限制。"}</p>{tradeoffs&&<Evidence claim={tradeoffs}/>}</section>
    <section className={styles.section}><h2>屬性詳情</h2><p className={styles.muted}>未知表示尚未確認；只有具來源支持的明確否定主張，才會顯示「否」。</p><div className={styles.facts}>{facts.map(c=><div className={styles.fact} key={c.slug}><h3>{c.name}</h3><p>{c.slug==="privacy-friendly"?(privacyOperation?"僅針對已查核的本機操作驗證":"尚未針對已查核的本機操作驗證。"):displayValue(c)}</p>{c.slug==="privacy-friendly"&&privacyOperation&&<p>{privacyOperation}</p>}{c.description&&<p className={styles.muted}>屬性意義：{c.description}</p>}<Evidence claim={privacyClaimForDisplay(original,c)}/></div>)}</div></section>
    <section className={styles.section}><h2>可比較的主流軟體</h2><p className={styles.muted}>這些關係描述替代或互補用途，不保證可完整取代。</p><Claims items={anchors} empty="目前沒有來源支持的主流軟體比較。"/></section>
    <section className={styles.section}><h2>相關比較主題</h2>{p.routes.length?<ul className={styles.claims}>{p.routes.map(r=><li key={r.slug}><strong><Link href={`${translatedRoutes.has(r.slug)?'/zh-hant':''}/escape/${r.slug}`}>{translatedRoutes.has(r.slug)?zh(r.name):r.name+'（英文）'}</Link></strong><p className={styles.muted}>{preview?"比較主題草稿，尚未核准發布。":translatedRoutes.has(r.slug)?zh(r.description):r.description}</p></li>)}</ul>:<p className={styles.muted}>目前沒有已核准的相關比較主題。</p>}</section>
    <footer className={styles.footer}>來源查核針對個別主張，不代表所有功能均經實機測試。{url&&<a href={url} data-discovery-outbound target="_blank" rel="noopener noreferrer">前往 {p.name} 官方網站了解更多 ↗</a>}</footer>
  </article>;
}
