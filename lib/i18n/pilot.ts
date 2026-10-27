export const pilotSlugs=["offline-notion-alternatives", "notion-alternatives-without-ai", "simple-notion-alternatives", "todoist-alternatives-with-a-one-time-purchase", "privacy-friendly-grammarly-alternatives", "grammarly-alternatives-without-a-subscription", "photoshop-alternatives-without-a-subscription", "pdf-editors-without-a-subscription", "meditation-apps-without-a-subscription", "productivity-apps-you-can-buy-once"] as const;
export const zhHome='/zh-hant';
export function chineseRoute(path:string){return pilotSlugs.find(s=>path==='/zh-hant/escape/'+s);}
export function chinesePath(path:string){return path===zhHome||path===zhHome+'/privacy'||!!chineseRoute(path);}
export function englishPath(path:string){return path===zhHome?'/':chineseRoute(path)?path.slice(8):path;}
export function languageAlternates(english:string){return {en:english,'zh-Hant':english==='/'?zhHome:zhHome+english};}
export function localeNavigation(path:string,availableSlugs:readonly string[]){
 const chinese=chinesePath(path),slug=chineseRoute(path)??path.match(/^\/escape\/([^/]+)$/)?.[1];
 const alternate=path==='/'?zhHome:path===zhHome?'/':path==='/privacy'?zhHome+'/privacy':path===zhHome+'/privacy'?'/privacy':slug&&availableSlugs.includes(slug)?(chinese?'/escape/':zhHome+'/escape/')+slug:null;
 return {chinese,language:chinese?'zh-Hant':'en',home:chinese?zhHome:'/',privacy:chinese?zhHome+'/privacy':'/privacy',alternate};
}
