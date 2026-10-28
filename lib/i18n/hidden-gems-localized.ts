import type {GemCard} from '../discovery/hidden-gems.ts';
import {indexableGemCollection} from '../discovery/hidden-gems.ts';
import {zh} from './localized.ts';

const editorial:Record<string,string>={
 'Personal notebooks':'個人筆記本',
 'Digital painting':'數位繪畫',
 'Windows PDF page organization':'Windows PDF 頁面整理',
 'A focused place to explore desktop note capture and notebook organization, with Markdown and sync choices to review.':'適合進一步了解桌面筆記擷取與筆記本整理的工具，並可查閱 Markdown 與同步方式的選擇。',
 'A desktop painting option for an illustration-focused workflow. Check the reviewed raster scope and file-exchange limits.':'以插畫工作流程為主的桌面繪畫選擇，請查閱已查核的點陣影像適用範圍與檔案交換限制。',
 'A Windows desktop option to explore for arranging PDF pages. Check the reviewed edition and editing limits.':'可進一步了解的 Windows 桌面 PDF 頁面整理工具，請查閱已查核的版本與編輯限制。',
};
export function gemText(value:string){return editorial[value]??zh(value);}
// Keep English selection/order/positions intact. Never substitute or remove a
// qualified pick merely to fit a translation dictionary.
export function localizedGemsReady(cards:readonly GemCard[]){
 return indexableGemCollection(cards)&&cards.every(c=>[c.workflow,c.reason,c.scope,c.pricing,c.tradeOff].every(v=>!!gemText(v)));
}
