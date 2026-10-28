import type {ProductPage,Claim} from '../discovery/model.ts';
import {supported,claimValue} from '../discovery/model.ts';
import {translatedProductSlugs} from './product-slugs.ts';
import {zh} from './localized.ts';
const meaningReady=(c:Claim)=>!c.description||!!zh(c.description);
export function localizedProductReady(p:ProductPage|null):p is ProductPage{
 if(!p||p.status!=='published'||!translatedProductSlugs.some(s=>s===p.slug)||!p.description||!zh(p.description))return false;
 if(!p.attributes.every(c=>!!zh(c.name)&&meaningReady(c)&&(!supported(c)||typeof c.value!=='string'||!!zh(claimValue(c)))))return false;
 return [...p.audiences,...p.problems].filter(supported).every(c=>!!zh(c.name)&&meaningReady(c)&&(!c.relationshipType||!!zh(c.relationshipType)))&&p.anchors.filter(supported).every(c=>meaningReady(c)&&(!c.relationshipType||!!zh(c.relationshipType)));
}
// Only display copies are translated. Shared facts, evidence, dates, status and order stay intact.
export function translateProduct(p:ProductPage):ProductPage{
 if(!localizedProductReady(p))throw Error('Incomplete product translation');
 const claim=(c:Claim,brand=false):Claim=>({...c,name:brand?c.name:zh(c.name)??c.name,description:c.description?zh(c.description)??c.description:null,relationshipType:c.relationshipType?zh(c.relationshipType)??c.relationshipType:undefined,value:typeof c.value==='string'&&supported(c)?zh(c.value)??c.value:c.value});
 return {...p,description:zh(p.description)!,attributes:p.attributes.map(c=>claim(c)),anchors:p.anchors.map(c=>claim(c,true)),audiences:p.audiences.map(c=>claim(c)),problems:p.problems.map(c=>claim(c))};
}
