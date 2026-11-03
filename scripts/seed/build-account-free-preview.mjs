import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rankCandidates,publishable} from '../../lib/discovery/escape-model.ts';
import {accountFreeReview} from '../../lib/discovery/account-free-review.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export function buildAccountFreePreview(){
 const review=accountFreeReview;
 // Proposed documentary decisions only. These objects are not a production seed.
 const claim=(slug,name,value,sources)=>({slug,name,value,description:null,verificationStatus:'verified',confidence:.9,lastVerifiedAt:review.checkedAt,sources:sources.map(url=>({title:'Official documentation',url,retrievedAt:review.checkedAt}))});
 const products=review.products.map(p=>({slug:p.slug,name:p.name,description:p.description,websiteUrl:p.websiteUrl,status:'draft',attributes:[claim('no-account-required','No Account Required',true,[p.accountSource]),claim('account-free-note-workflow-scope','Account-Free Personal Note Workflow Scope',review.definition.workflowScope,p.scopeSources),claim('pricing-model','Pricing Model',p.pricing,[p.pricingSource]),claim('trade-off-summary','Trade-Off Summary',p.tradeOff,p.scopeSources)],anchors:[],audiences:[],problems:[],routes:[{slug:review.definition.slug,name:review.definition.name,description:review.description}]}));
 const page={slug:review.definition.slug,name:review.definition.name,description:review.description,lastVerifiedAt:review.checkedAt,published:false,candidates:rankCandidates(review.definition,products.map(product=>({product,noveltyScore:0})))};
 if(page.candidates.some(c=>!c.eligible)||publishable(page))throw Error('Draft preview qualification drift');
 return {reviewType:'documentary-editorial-proposal',publicationApproved:false,handsOnTested:false,products,page};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderAccountFreePreview(proposal,chinese=false){
 const t=s=>chinese?(accountFreeReview.translations[s]??s):s;
 const rows=proposal.page.candidates.map(c=>{const p=accountFreeReview.products.find(p=>p.slug===c.product.slug);return `<tr><th><a href="${esc(p.websiteUrl)}">${esc(p.name)}</a></th><td>${esc(t(p.description))}</td><td>${esc(t(p.pricing))}</td><td>${esc(t(p.tradeOff))}</td><td>${[...new Set([p.accountSource,...p.scopeSources,p.pricingSource])].map(url=>`<p><a href="${esc(url)}">${esc(url)}</a></p>`).join('')}</td></tr>`;}).join('');
 return `<!doctype html><html lang="${chinese?'zh-Hant':'en'}"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width"><title>${esc(t(proposal.page.name))} — draft</title><style>body{font:17px/1.65 system-ui;margin:40px auto;padding:0 24px;max-width:1400px;color:#20251f;background:#f8faf6}table{border-collapse:collapse;min-width:1000px;width:100%}td,th{border:1px solid #ccd4c8;padding:16px;text-align:left;vertical-align:top}td a{overflow-wrap:anywhere}main{overflow:auto}aside{background:#fff0b8;padding:16px}h1{line-height:1.25}</style><aside>${chinese?'未發布研究預覽；官方文件查核，非實機測試。排序僅供預覽，無總冠軍。':'Unpublished research preview. Official-document review, not hands-on testing. Preview order is not a best-overall ranking.'}</aside><h1>${esc(t(proposal.page.name))}</h1><p>${esc(t(proposal.page.description))}</p><p>${chinese?'文件查核日期':'Documentation checked'}: ${esc(accountFreeReview.checkedAt.slice(0,10))}</p><main><table><thead><tr>${(chinese?['工具','比較範圍','價格模式','取捨與限制','官方來源']:['App','Scope','Pricing model','Trade-offs','Official sources']).map(s=>`<th>${s}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></main><p>${chinese?'未列入不代表不支援；可能缺少證據。免帳號不代表匿名、加密、自動備份或所有功能免費。':'Not listed does not mean unsupported; evidence may be missing. Account-free does not establish anonymity, encryption, automatic backups or free access to all features.'}</p></html>`;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const proposal=buildAccountFreePreview(),out=path.join(root,'.seed-output/account-free-preview');fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'proposal.json'),JSON.stringify(proposal,null,2)+'\n');
 for(const chinese of [false,true])fs.writeFileSync(path.join(out,chinese?'preview.zh-Hant.html':'preview.en.html'),renderAccountFreePreview(proposal,chinese));
 console.log('Generated draft-only JSON and English/Traditional Chinese HTML previews. No network or database writes.');
}
