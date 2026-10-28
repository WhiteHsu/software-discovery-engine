import 'server-only';
import {cache} from 'react';
import {getEscape,escapePreview} from '@/lib/discovery/escapes';
import {localizedReady} from './localized';
import {pilotSlugs} from './pilot';
export const getChineseEscape=cache(async(slug:string)=>{
 if(!pilotSlugs.some(s=>s===slug)||escapePreview())return null;
 const page=await getEscape(slug);return localizedReady(page)?page:null;
});

import {getProduct,localPreview} from '@/lib/discovery/products';
import {localizedProductReady} from './product-localized';
import {translatedProductSlugs} from './product-slugs';
export const getChineseProduct=cache(async(slug:string)=>{
 if(!translatedProductSlugs.some(s=>s===slug)||localPreview())return null;
 const page=await getProduct(slug);return localizedProductReady(page)?page:null;
});
export const availableChineseProducts=cache(async()=>{
 const slugs:string[]=[];
 for(let i=0;i<translatedProductSlugs.length;i+=6){const batch=await Promise.all(translatedProductSlugs.slice(i,i+6).map(async slug=>{try{return await getChineseProduct(slug)?slug:null;}catch{return null;}}));slugs.push(...batch.filter((s):s is NonNullable<typeof s>=>s!==null));}
 return slugs;
});

import {getHiddenGems} from '@/lib/discovery/hidden-gems-server';
import {localizedGemsReady} from './hidden-gems-localized';
export const getChineseHiddenGems=cache(async()=>{
 const cards=await getHiddenGems();
 if(!localizedGemsReady(cards))return [];
 const destinations=await Promise.all(cards.map(async c=>!!await getChineseProduct(c.slug)&&!!await getChineseEscape(c.routeSlug)));
 return destinations.every(Boolean)?cards:[];
});
