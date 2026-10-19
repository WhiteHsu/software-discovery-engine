import 'server-only';
import {cache} from 'react';
import {getEscape} from './escapes';
import {gemSelections,selectedGemCards} from './hidden-gems';
export const getHiddenGems=cache(async()=>{
 const pages=await Promise.all([...new Set(gemSelections.map(p=>p.routeSlug))].map(slug=>getEscape(slug)));
 return selectedGemCards(pages);
});
