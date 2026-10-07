import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {getEscape,escapePreview} from "@/lib/discovery/escapes";
import {claimValue,safeUrl,latestVerification} from "@/lib/discovery/model";
import styles from "./escape.module.css";
type Props={params:Promise<{slug:string}>};
export const dynamic="force-dynamic";
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params,p=await getEscape(slug);
  return {title:p?.name??"Escape Route not available",description:p?.description??undefined,metadataBase:new URL(safeUrl(process.env.NEXT_PUBLIC_SITE_URL)??"https://software-discovery-engine.vercel.app"),alternates:{canonical:`/escape/${slug}`},robots:{index:!!p&&!escapePreview(),follow:!!p&&!escapePreview()}};
}
const date=(value:string|null)=>value&&Number.isFinite(Date.parse(value))?new Date(value).toISOString().slice(0,10):"Unknown";
export default async function Escape({params}:Props){
  const {slug}=await params,p=await getEscape(slug);if(!p)notFound();
  const preview=escapePreview(),qualified=p.candidates.filter(c=>c.eligible);
  return <article className={styles.page}>
    {preview&&<aside className={styles.notice}>Local draft preview · This route and its candidates have not been approved for publication.</aside>}
    <header><p className="eyebrow">Find a better fit</p><h1>{p.name}</h1><p>{p.description}</p><p>Route reviewed: {date(p.lastVerifiedAt)}</p></header>
    <section><h2>Compare the candidates</h2><p>Only candidates with verified constraint fit and sufficient evidence confidence qualify. A small novelty advantage can reorder qualified candidates; popularity does not determine the order.</p>
      {qualified.length?<div className={styles.tableWrap}><table><caption>Qualified candidates and documented limits</caption><thead><tr><th>Product</th><th>Constraint fit</th><th>Pricing</th><th>Trade-offs</th><th>Latest claim check</th></tr></thead><tbody>{qualified.map(c=>{
        const attr=(slug:string)=>c.product.attributes.find(a=>a.slug===slug);
        return <tr key={c.product.slug}><th scope="row"><Link href={`/software/${c.product.slug}`}>{c.product.name}</Link></th><td>{c.fit.filter(f=>typeof f.value==="boolean").map(f=>f.name).join(", ")}</td><td>{claimValue(attr("pricing-model")!)}</td><td>{claimValue(attr("trade-off-summary")!)}</td><td>{date(latestVerification(c.product))}</td></tr>;
      })}</tbody></table></div>:<p>No candidates currently meet the evidence requirements.</p>}
    </section>
    {preview&&qualified.length<3&&<aside className={styles.notice}>Publication blocked: at least three qualified, published products are required.</aside>}
    <section><h2>Why these products fit</h2>{(preview?p.candidates:qualified).map(c=><section className={styles.card} key={c.product.slug}><h3><Link href={`/software/${c.product.slug}`}>{c.product.name}</Link></h3><p>{c.product.description}</p>{c.eligible?<ul>{c.reasons.map(r=><li key={r}>{r}</li>)}</ul>:<><p>Not qualified for this route:</p><ul>{c.blockers.map(b=><li key={b}>{b}</li>)}</ul></>}
      {c.fit.map(f=><div key={f.slug}><strong>{f.name}</strong><p>{f.value===undefined?f.relationshipType:claimValue(f)} · Checked {date(f.lastVerifiedAt)}</p>{f.sources.map((s,i)=>safeUrl(s.url)?<a key={i} href={safeUrl(s.url)!} target="_blank" rel="noopener noreferrer">{s.title} ↗ </a>:null)}</div>)}
    </section>)}{!p.candidates.length&&<p>No curated candidates are available. Missing evidence is not treated as a passing constraint.</p>}</section>
    <footer>Source checks describe individual claims, not hands-on testing or complete replacement guarantees.</footer>
  </article>;
}
