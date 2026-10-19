import 'server-only';
import {headers} from 'next/headers';
import {createClient} from '@/lib/supabase/server';
import {escapeDefinitions} from './escape-model';
import {getEscape} from './escapes';
import {seoContext,publishedSitemapPaths} from './seo';
import {getHiddenGems} from './hidden-gems-server';
import {indexableGemCollection} from './hidden-gems';

export async function requestSeo(){return seoContext(process.env,(await headers()).get('host'));}
export async function liveSitemapPaths(){
 const client=await createClient();
 const [paths,gems]=await Promise.all([publishedSitemapPaths({
  identities:async()=>{
   const {data,error}=await client.from('products').select('slug').eq('status','published').order('slug').limit(500);
   if(error||!Array.isArray(data))throw Error('Published product catalog unavailable');
   return data;
  },
  product:async slug=>{
   const {data,error}=await client.rpc('product_discovery_page',{product_slug:slug});
   if(error)throw Error('Published product page unavailable');
   return data;
  },
  // getEscape includes editorial approval, published status and runtime qualification.
  routes:()=>Promise.all(escapeDefinitions.map(d=>getEscape(d.slug))),
 }),getHiddenGems()]);
 return [...paths,...(indexableGemCollection(gems)?['/hidden-gems']:[])].sort();
}
