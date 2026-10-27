export const pilotSlugs=['offline-notion-alternatives','pdf-editors-without-a-subscription'] as const;
export const zhHome='/zh-hant';
export function chineseRoute(path:string){return pilotSlugs.find(s=>path==='/zh-hant/escape/'+s);}
export function chinesePath(path:string){return path===zhHome||path===zhHome+'/privacy'||!!chineseRoute(path);}
export function englishPath(path:string){return path===zhHome?'/':chineseRoute(path)?path.slice(8):path;}
export function languageAlternates(english:string){return {en:english,'zh-Hant':english==='/'?zhHome:zhHome+english};}
