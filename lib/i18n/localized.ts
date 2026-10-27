import type {EscapePage} from '../discovery/escape-model.ts';
import {publishable} from '../discovery/escape-model.ts';
import {claimValue} from '../discovery/model.ts';
import {pilotSlugs} from './pilot.ts';
import {zhHantText} from './zh-hant-content.ts';
export function zh(value:string|null|undefined){return value?zhHantText[value]:undefined;}
export function zhValue(claim:Parameters<typeof claimValue>[0]){const v=claimValue(claim);return v==='Unknown'?'未知':v==='Yes'?'是':v==='No'?'否':zh(v);}
// Never silently publish stale translations or remove a qualified candidate to fit a dictionary.
export function localizedReady(page:EscapePage|null):page is EscapePage{
 if(!page||!pilotSlugs.some(s=>s===page.slug)||!publishable(page)||!zh(page.name)||!zh(page.description))return false;
 return page.candidates.filter(c=>c.eligible).every(c=>c.product.status==='published'&&
  !!zh(c.product.description)&&c.fit.every(f=>!!zh(f.name)&&(!f.description||!f.relationshipType||!!zh(f.description))&&(f.value===undefined||!!zhValue(f))));
}
