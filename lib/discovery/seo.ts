import {chineseRoute,chineseProduct,englishPath,zhHome,languageAlternates} from '../i18n/pilot.ts';
import {escapeDefinitions} from './escape-model.ts';
const fallbackOrigin='https://toolelse.com';
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export type SeoContext={origin:string;indexable:boolean};
export function canonicalOrigin(env:Record<string,string|undefined>){
 const u=new URL(env.NEXT_PUBLIC_SITE_URL??fallbackOrigin);
 if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash||u.port)throw Error('Invalid canonical site origin');
 return u.origin;
}
export function seoContext(env:Record<string,string|undefined>,host:string|null):SeoContext{
 const origin=canonicalOrigin(env);
 return {origin,indexable:env.VERCEL==='1'&&env.VERCEL_ENV==='production'&&host?.toLowerCase()===new URL(origin).host};
}
export function sitemapPaths(products:unknown[],routes:unknown[]){
 const paths=new Set<string>(['/']);
 for(const [rows,prefix] of [[products,'software'],[routes,'escape']] as const){
  for(const row of rows){
   if(!row||typeof row!=='object')continue;
   const r=row as Record<string,unknown>;
   if(typeof r.slug!=='string'||r.slug.length>100||!slug.test(r.slug))continue;
   if(prefix==='software'?r.status!=='published':r.published!==true)continue;
   if(prefix==='escape'&&!escapeDefinitions.some(d=>d.slug===r.slug))continue;
   paths.add(`/${prefix}/${r.slug}`);
  }
 }
 return [...paths].sort();
}
export async function publishedSitemapPaths(deps:{identities:()=>Promise<unknown[]>;product:(slug:string)=>Promise<unknown>;routes:()=>Promise<unknown[]>}){
 const identities=await deps.identities();
 if(!Array.isArray(identities)||identities.length>=500)throw Error('Product catalog unavailable or exceeds sitemap bound');
 const products:unknown[]=[];
 // Bound concurrent public RPC calls instead of fanning out to the entire catalog.
 for(let offset=0;offset<identities.length;offset+=8){
  products.push(...await Promise.all(identities.slice(offset,offset+8).map(async identity=>{
   if(!identity||typeof identity!=='object')throw Error('Malformed published product identity');
   const id=identity as Record<string,unknown>;
   if(typeof id.slug!=='string'||id.slug.length>100||!slug.test(id.slug))throw Error('Malformed published product identity');
   const page=await deps.product(id.slug);
   if(page===null)return null;
   if(!page||typeof page!=='object'||(page as Record<string,unknown>).slug!==id.slug)throw Error('Product page identity drift');
   return (page as Record<string,unknown>).status==='published'?{slug:id.slug,status:'published'}:null;
  })));
 }
 return sitemapPaths(products,await deps.routes());
}
export function sitemapXml(origin:string,paths:string[]){
 if(canonicalOrigin({NEXT_PUBLIC_SITE_URL:origin})!==origin)throw Error('Noncanonical sitemap origin');
 const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
 for(const p of paths)if(p!=='/'&&p!=='/hidden-gems'&&p!==zhHome+'/hidden-gems'&&p!==zhHome&&!chineseRoute(p)&&!chineseProduct(p)&&!/^\/(?:software|escape)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p))throw Error('Invalid sitemap path');
 return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+paths.map(p=>{const en=englishPath(p),alts=languageAlternates(en),pair=Object.values(alts).every(v=>paths.includes(v));return `  <url><loc>${escape(origin+p)}</loc>${pair?Object.entries(alts).map(([lang,url])=>`<xhtml:link rel="alternate" hreflang="${lang}" href="${escape(origin+url)}"/>`).join(''):''}</url>`;}).join('\n')+'\n</urlset>\n';
}
export async function sitemapResponse(context:SeoContext,load:()=>Promise<string[]>){
 const headers={'Content-Type':'application/xml; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'};
 if(!context.indexable)return new Response(sitemapXml(context.origin,[]),{headers});
 try{return new Response(sitemapXml(context.origin,await load()),{headers});}
 catch{return new Response('Sitemap temporarily unavailable.',{status:503,headers:{...headers,'Content-Type':'text/plain; charset=utf-8','Retry-After':'300'}});}
}
export function robotsConfig(context:SeoContext){
 return context.indexable?{rules:{userAgent:'*',allow:'/',disallow:'/api/'},sitemap:context.origin+'/sitemap.xml'}:{rules:{userAgent:'*',disallow:'/'}};
}
