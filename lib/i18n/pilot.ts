import {translatedProductSlugs} from './product-slugs.ts';
export const pilotSlugs=["offline-notion-alternatives", "notion-alternatives-without-ai", "simple-notion-alternatives", "todoist-alternatives-with-a-one-time-purchase", "privacy-friendly-grammarly-alternatives", "grammarly-alternatives-without-a-subscription", "photoshop-alternatives-without-a-subscription", "pdf-editors-without-a-subscription", "meditation-apps-without-a-subscription", "productivity-apps-you-can-buy-once"] as const;
export const zhHome='/zh-hant';
export const zhHiddenGems=zhHome+'/hidden-gems';
export function chineseRoute(path:string){return pilotSlugs.find(s=>path==='/zh-hant/escape/'+s);}
export function chineseProduct(path:string){return translatedProductSlugs.find(s=>path===zhHome+'/software/'+s);}
export function chinesePath(path:string){return path===zhHome||path===zhHiddenGems||path===zhHome+'/discover'||path===zhHome+'/privacy'||!!chineseRoute(path)||!!chineseProduct(path);}
export function englishPath(path:string){return path===zhHome?'/':path===zhHiddenGems||path===zhHome+'/discover'||chineseRoute(path)||chineseProduct(path)?path.slice(8):path;}
export function languageAlternates(english:string){return {en:english,'zh-Hant':english==='/'?zhHome:zhHome+english};}
export function localeNavigation(path:string,availableSlugs:readonly string[],availableProducts:readonly string[]=[],hiddenGemsAvailable=false){
 const chinese=chinesePath(path),slug=chineseRoute(path)??path.match(/^\/escape\/([^/]+)$/)?.[1];
 const product=chineseProduct(path)??path.match(/^\/software\/([^/]+)$/)?.[1];
 const alternate=path==='/discover'?zhHome+'/discover':path===zhHome+'/discover'?'/discover':(path==='/hidden-gems'||path===zhHiddenGems)&&hiddenGemsAvailable?(chinese?'/hidden-gems':zhHiddenGems):product&&availableProducts.includes(product)?(chinese?'/software/':zhHome+'/software/')+product:path==='/'?zhHome:path===zhHome?'/':path==='/privacy'?zhHome+'/privacy':path===zhHome+'/privacy'?'/privacy':slug&&availableSlugs.includes(slug)?(chinese?'/escape/':zhHome+'/escape/')+slug:null;
 return {chinese,language:chinese?'zh-Hant':'en',home:chinese?zhHome:'/',privacy:chinese?zhHome+'/privacy':'/privacy',alternate};
}
