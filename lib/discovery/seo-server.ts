import {getChineseEscape} from '@/lib/i18n/server';
import {pilotSlugs,zhHome} from '@/lib/i18n/pilot';
import {getProduct} from './products';
import {indexableProduct} from './structured-data';
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
   const page=await getProduct(slug);
   return page&&indexableProduct(page)?page:null;
  },
  // getEscape includes editorial approval, published status and runtime qualification.
  routes:()=>Promise.all(escapeDefinitions.map(d=>getEscape(d.slug))),
 }),getHiddenGems()]);
 const translated=await Promise.all(pilotSlugs.map(getChineseEscape));
 return [...paths,zhHome,...translated.flatMap(p=>p?[zhHome+'/escape/'+p.slug]:[]),...(indexableGemCollection(gems)?['/hidden-gems']:[])].sort();
}
