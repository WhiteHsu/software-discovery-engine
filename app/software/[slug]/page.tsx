import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, localPreview } from "@/lib/discovery/products";
import { claimValue, latestVerification, safeUrl, supported, type Claim } from "@/lib/discovery/model";
import styles from "./product.module.css";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug}=await params;
  const p=await getProduct(slug);
  return {title:p?.name ?? "Product not found",description:p?.description ?? undefined,
    metadataBase:new URL(safeUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://software-discovery-engine.vercel.app"),
    alternates:{canonical:`/software/${slug}`},
    robots:{index:!!p && !localPreview(),follow:!!p && !localPreview()}};
}
function date(d:string|null) { return d && Number.isFinite(Date.parse(d)) ? new Date(d).toISOString().slice(0,10) : "Unknown"; }
function Evidence({claim}:{claim:Claim}) {
  const state=supported(claim)?claim.verificationStatus:"unknown";
  return <div className={styles.evidence}><span className={styles.badge}>{state}</span><span>{state==="unknown"?"Verification date unknown":`Checked ${date(claim.lastVerifiedAt)}`}</span>
    {claim.sources.map((s,i)=>safeUrl(s.url)?<a key={i} href={safeUrl(s.url)!} target="_blank" rel="noopener noreferrer">{s.title} ↗</a>:null)}
  </div>;
}
function Claims({items,empty}:{items:Claim[];empty:string}) {
  return items.length?<ul className={styles.claims}>{items.map(c=><li key={c.slug+(c.relationshipType??"")}><strong>{c.name}</strong>{c.relationshipType&&<p>Relationship: {c.relationshipType}</p>}{c.description&&<p>{c.description}</p>}<Evidence claim={c}/></li>)}</ul>:<p className={styles.muted}>{empty}</p>;
}
export default async function Product({params}:Props) {
  const {slug}=await params; const p=await getProduct(slug); if(!p)notFound();
  const preview=localPreview(); const url=safeUrl(p.websiteUrl);
  const attribute=(slug:string)=>p.attributes.find(c=>c.slug===slug);
  const pricing=attribute("pricing-model"),platforms=attribute("supported-platforms"),tradeoffs=attribute("trade-off-summary");
  const facts=p.attributes.filter(c=>!["pricing-model","supported-platforms","trade-off-summary"].includes(c.slug));
  const positive=facts.filter(c=>supported(c)&&c.verificationStatus==="verified"&&c.value===true);
  const audiences=p.audiences.filter(supported),problems=p.problems.filter(supported),anchors=p.anchors.filter(supported);
  return <article className={styles.page}>
    {preview&&<aside className={styles.preview}>Local draft preview · Publication has not been approved.</aside>}
    <header className={styles.hero}><p className="eyebrow">Software worth a closer look</p><h1>{p.name}</h1><p className={styles.positioning}>{p.description??"Product positioning has not been reviewed yet."}</p>
      <div className={styles.actions}>{url?<a className={styles.cta} href={url} target="_blank" rel="noopener noreferrer">Visit {p.name} ↗</a>:<span>Official website unknown</span>}<span className={styles.muted}>Latest claim check: {date(latestVerification(p))}</span></div>
    </header>
    <section className={styles.section}><h2>Why it’s worth discovering</h2><p>Start with the supported features below, then compare the limits with your workflow.</p><Claims items={positive} empty="No positive verified feature claims are available yet."/></section>
    <div className={styles.columns}><section className={styles.section}><h2>Best for</h2><p className={styles.muted}>Audience fits are editorial judgments. “Likely” describes a potential fit.</p><Claims items={audiences} empty="Suitable audiences have not been established."/></section>
    <section className={styles.section}><h2>Consider it if…</h2><p className={styles.muted}>These are problems worth comparing against your needs, not guaranteed outcomes.</p><Claims items={problems} empty="No evidence-backed problem fits have been established."/></section></div>
    <div className={styles.columns}>{[["Platforms",platforms],["Pricing",pricing]].map(([title,c])=>{
      const claim=c as Claim|undefined;
      const usable=claim&&supported(claim)&&(title!=="Pricing"||claim.verificationStatus==="verified");
      return <section className={styles.section} key={title as string}><h2>{title as string}</h2><p>{usable?claimValue(claim):"Unknown — not verified."}</p>{claim&&<Evidence claim={claim}/>}<p className={styles.muted}>{title==="Pricing"?"Check the official source for current regional prices and plan limits.":"Platform availability does not imply feature parity."}</p></section>;
    })}</div>
    <section className={styles.section}><h2>Skip it if… / Trade-offs</h2><p>Compare these limits before deciding:</p><p>{tradeoffs?claimValue(tradeoffs):"Unknown — meaningful trade-offs have not been documented."}</p>{tradeoffs&&<Evidence claim={tradeoffs}/>}</section>
    <section className={styles.section}><h2>Attribute details</h2><p className={styles.muted}>Unknown means unconfirmed. “No” appears only for a supported explicit negative claim.</p><div className={styles.facts}>{facts.map(c=><div className={styles.fact} key={c.slug}><h3>{c.name}</h3><p>{claimValue(c)}</p>{c.description&&<p className={styles.muted}>Attribute meaning: {c.description}</p>}<Evidence claim={c}/></div>)}</div></section>
    <section className={styles.section}><h2>Mainstream software to compare</h2><p className={styles.muted}>These graph relationships describe alternatives or complements, not full replacement guarantees.</p><Claims items={anchors} empty="No supported mainstream comparison is available."/></section>
    <section className={styles.section}><h2>Related Escape Routes</h2>{p.routes.length?<ul className={styles.claims}>{p.routes.map(r=><li key={r.slug}><strong>{r.name}</strong><p className={styles.muted}>{preview?"Draft route · not approved for publication.":"Route navigation will be available with the Escape Route Engine."}</p></li>)}</ul>:<p className={styles.muted}>No approved related Escape Routes are available.</p>}</section>
    <footer className={styles.footer}>Source checks are scoped to individual claims. They do not imply hands-on testing of every feature.{url&&<a href={url} target="_blank" rel="noopener noreferrer">Explore {p.name} on its official website ↗</a>}</footer>
  </article>;
}
