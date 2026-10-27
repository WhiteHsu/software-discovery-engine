import 'server-only';
import {cache} from 'react';
import {getEscape,escapePreview} from '@/lib/discovery/escapes';
import {localizedReady} from './localized';
import {pilotSlugs} from './pilot';
export const getChineseEscape=cache(async(slug:string)=>{
 if(!pilotSlugs.some(s=>s===slug)||escapePreview())return null;
 const page=await getEscape(slug);return localizedReady(page)?page:null;
});
