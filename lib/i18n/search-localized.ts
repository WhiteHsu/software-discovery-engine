import type {SearchResult} from '../discovery/search-service.ts';
import {zh} from './localized.ts';
export const searchIntentLabels:Record<string,string>={
 notion:'Notion',todoist:'Todoist',grammarly:'Grammarly',photoshop:'Photoshop','adobe-pdf':'Adobe Acrobat',calm:'Calm',
 'cloud-dependency':'依賴雲端','vendor-lock-in':'受限於單一廠商','unwanted-ai':'不需要的 AI','subscription-fatigue':'訂閱負擔','workspace-complexity':'工作空間過於複雜',
 'works-offline':'可離線使用','local-first':'本機優先','no-account-required':'不需帳號','self-hostable':'可自行架設','open-source':'開源','ai-optional':'AI 為選用功能','free-core-use':'核心用途免費','focused-note-taking':'專注於基本筆記','no-database-required':'不需資料庫','minimal-setup':'設定簡單','one-time-purchase':'可一次購買','no-subscription':'無強制訂閱','privacy-friendly':'限定範圍的隱私友善操作',
};
const translated=(value:string)=>{const text=value==='Yes'?'是':value==='No'?'否':zh(value);if(!text)throw Error('Search translation unavailable');return text;};
// Translate display text after shared qualification/ranking and explanation
// selection. Preserve identities, fact IDs, source titles/URLs, dates and scores.
// Incomplete translations fail the whole response, never remove ranked matches.
export function localizeSearchResult(result:SearchResult):SearchResult{
 return {...result,matches:result.matches.map(m=>({...m,description:translated(m.description),scope:translated(m.scope),pricing:translated(m.pricing),tradeOff:translated(m.tradeOff),facts:m.facts.map(f=>({...f,label:translated(f.label),value:translated(f.value)}))}))};
}
