import DiscoveryBreadcrumb from "@/components/DiscoveryBreadcrumb";
import {routeData,jsonLd,isoDate} from "@/lib/discovery/structured-data";
import {requestSeo} from "@/lib/discovery/seo-server";
import DiscoveryTracker from '@/components/DiscoveryTracker';
import {pageTrackingEnabled} from '@/lib/analytics/page-tracking';
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {getEscape,escapePreview} from "@/lib/discovery/escapes";
import {claimValue,safeUrl,latestVerification} from "@/lib/discovery/model";
import {reviewedPrivacyOperation} from "@/lib/discovery/privacy-route";
import styles from "./escape.module.css";
type Props={params:Promise<{slug:string}>};
export const dynamic="force-dynamic";
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params,p=await getEscape(slug);
  const seo=await requestSeo();
  return {title:p?.name??"Escape Route not available",description:p?.description??undefined,metadataBase:new URL(seo.origin),alternates:{canonical:`/escape/${slug}`},robots:{index:seo.indexable&&!!p&&!escapePreview(),follow:seo.indexable&&!!p&&!escapePreview()}};
}
const date=(value:string|null)=>value&&Number.isFinite(Date.parse(value))?new Date(value).toISOString().slice(0,10):"Unknown";
export default async function Escape({params}:Props){
  const {slug}=await params,p=await getEscape(slug);if(!p)notFound();
  const seo=await requestSeo();
  const preview=escapePreview(),qualified=p.candidates.filter(c=>c.eligible);
  return <article className={styles.page}>
    <DiscoveryBreadcrumb name={p.name}/>
    {seo.indexable&&!preview&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(routeData(seo.origin,p,qualified.map(c=>c.product)))}}/>}
    <DiscoveryTracker enabled={!preview&&pageTrackingEnabled()} surface="escape" slug={slug} products={qualified.filter(c=>c.product.status==="published").map((c,i)=>({slug:c.product.slug,position:i+1}))} />
    {preview&&<aside className={styles.notice}>Local draft preview · This route and its candidates have not been approved for publication.</aside>}
    <header><p className="eyebrow">Find a better fit</p><h1>{p.name}</h1><p>{p.description}</p><p>Route reviewed: <time dateTime={isoDate(p.lastVerifiedAt)??undefined}>{date(p.lastVerifiedAt)}</time></p></header>
    <section><h2>Compare the candidates</h2><p>Only candidates with verified constraint fit and sufficient evidence confidence qualify. A small novelty advantage can reorder qualified candidates; popularity does not determine the order.</p>
      {qualified.length?<div className={styles.tableWrap}><table><caption>Qualified candidates and documented limits</caption><thead><tr><th>Product</th><th>Constraint fit</th><th>Pricing</th><th>Trade-offs</th><th>Latest claim check</th></tr></thead><tbody>{qualified.map(c=>{
        const attr=(slug:string)=>c.product.attributes.find(a=>a.slug===slug);
        return <tr key={c.product.slug}><th scope="row"><Link href={`/software/${c.product.slug}`} data-discovery-product={c.product.slug} data-discovery-position={qualified.findIndex(q=>q.product.slug===c.product.slug)+1}>{c.product.name}</Link></th><td>{reviewedPrivacyOperation(c.product)?<>For the reviewed local operation only<p>{reviewedPrivacyOperation(c.product)}</p></>:c.fit.filter(f=>typeof f.value==="boolean").map(f=>f.name).join(", ")}</td><td>{claimValue(attr("pricing-model")!)}</td><td>{claimValue(attr("trade-off-summary")!)}</td><td><time dateTime={isoDate(latestVerification(c.product))??undefined}>{date(latestVerification(c.product))}</time></td></tr>;
      })}</tbody></table></div>:<p>No candidates currently meet the evidence requirements.</p>}
    </section>
    {preview&&(!p.published||qualified.filter(c=>c.product.status==="published").length<3)&&<aside className={styles.notice}>Publication blocked: editorial approval and at least three qualified, published products are required.</aside>}
    <section><h2>Why these products fit</h2>{(preview?p.candidates:qualified).map(c=><section className={styles.card} key={c.product.slug}><h3><Link href={`/software/${c.product.slug}`} data-discovery-product={c.product.slug} data-discovery-position={qualified.findIndex(q=>q.product.slug===c.product.slug)+1}>{c.product.name}</Link></h3><p>{c.product.description}</p>{c.eligible?<ul>{c.reasons.map(r=><li key={r}>{r}</li>)}</ul>:<><p>Not qualified for this route:</p><ul>{c.blockers.map(b=><li key={b}>{b}</li>)}</ul></>}
      {c.fit.map(f=><div key={f.slug}><strong>{f.name}</strong>{f.relationshipType&&f.description&&<p>{f.description}</p>}<p>{f.slug==="privacy-friendly"?(reviewedPrivacyOperation(c.product)?"Verified only for the reviewed local operation":"Not verified for a reviewed local operation."):f.value===undefined?f.relationshipType:claimValue(f)} · Checked <time dateTime={isoDate(f.lastVerifiedAt)??undefined}>{date(f.lastVerifiedAt)}</time></p>{f.sources.map((s,i)=>safeUrl(s.url)?<a key={i} href={safeUrl(s.url)!} target="_blank" rel="noopener noreferrer">{s.title} ↗ </a>:null)}</div>)}
    </section>)}{!p.candidates.length&&<p>No curated candidates are available. Missing evidence is not treated as a passing constraint.</p>}</section>
    <footer>Source checks describe individual claims, not hands-on testing or complete replacement guarantees.</footer>
  </article>;
}
