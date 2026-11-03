import {accountFreeDefinition} from './escape-model.ts';
export const accountFreeReview={
 checkedAt:'2026-11-02T00:00:00Z',
 definition:accountFreeDefinition,
 description:'Compare creating, editing and retaining personal notes locally in installed desktop apps without registering an app account. Downloads, operating-system accounts, sync, sharing and paid services have separate requirements. Official-document review, not hands-on testing or full Notion replacement.',
 products:[
  {slug:'obsidian',name:'Obsidian',websiteUrl:'https://obsidian.md/',description:'Personal notes stored as Markdown files in a local desktop vault. No app account is required for the core local workflow.',accountSource:'https://obsidian.md/security',scopeSources:['https://obsidian.md/security','https://obsidian.md/help/data-storage','https://obsidian.md/pricing'],pricingSource:'https://obsidian.md/pricing',pricing:'The core app is free without signup. Sync and Publish are optional paid services; check current terms.',tradeOff:'Multi-device sync needs separate setup. Sync encryption does not establish automatic encryption of local files. Plugins and external services have separate requirements; keep your own backup.'},
  {slug:'affine',name:'AFFiNE',websiteUrl:'https://affine.pro/',description:'Personal docs and whiteboards in a local desktop workspace without an app account. Self-hosting a server is not required for this local flow.',accountSource:'https://affine.pro/blog/getting-started-with-affine',scopeSources:['https://affine.pro/blog/getting-started-with-affine','https://affine.pro/pricing'],pricingSource:'https://affine.pro/pricing',pricing:'Local Doc and Edgeless editing is free. Cloud plans and AI add-ons have separate prices and terms.',tradeOff:'Local work does not automatically appear on another device. AFFiNE Cloud sync requires sign-in. Keep a separate export or backup. The official workflow guide references 0.27.4; this review did not install that version or establish mobile parity.'},
  {slug:'standard-notes',name:'Standard Notes',websiteUrl:'https://standardnotes.com/',description:'Personal local note-taking without an account or an internet connection, as documented by the vendor. Free core scope here is plain-text notes.',accountSource:'https://standardnotes.com/help/59/can-i-use-standard-notes-totally-offline',scopeSources:['https://standardnotes.com/help/59/can-i-use-standard-notes-totally-offline','https://standardnotes.com/plans'],pricingSource:'https://standardnotes.com/plans',pricing:'Standard is free and includes plain-text notes. Advanced editors and other features have subscription tiers; paid offline activation has a separate process.',tradeOff:'Account-free notes are not synced. Set an Application Passcode to enable encryption in this mode; do not assume it is already enabled. Backups are your responsibility. Paid-feature activation and cloud services have separate conditions.'},
 ],
 translations:{} as Record<string,string>,
};

Object.assign(accountFreeReview.translations,{
  "Compare creating, editing and retaining personal notes locally in installed desktop apps without registering an app account. Downloads, operating-system accounts, sync, sharing and paid services have separate requirements. Official-document review, not hands-on testing or full Notion replacement.": "比較安裝桌面程式後，不必註冊應用程式帳號即可在本機建立、編輯與保留個人筆記的選項。下載、作業系統帳號、同步、分享與付費服務各有條件。本比較是官方文件查核，並非實機測試或完整取代 Notion 的承諾。",
  "Personal notes stored as Markdown files in a local desktop vault. No app account is required for the core local workflow.": "在桌面本機儲存庫中，以 Markdown 檔案保存個人筆記。核心本機流程不需要應用程式帳號。",
  "The core app is free without signup. Sync and Publish are optional paid services; check current terms.": "核心程式免費且不用註冊。Sync 與 Publish 是選用的付費服務；請確認目前條款。",
  "Multi-device sync needs separate setup. Sync encryption does not establish automatic encryption of local files. Plugins and external services have separate requirements; keep your own backup.": "多裝置同步需要另外設定。Sync 加密不代表本機檔案已自動加密。外掛與外部服務另有條件；請自行備份。",
  "Personal docs and whiteboards in a local desktop workspace without an app account. Self-hosting a server is not required for this local flow.": "在不需應用程式帳號的桌面本機工作區中使用個人文件與白板。此本機流程不必自行架設伺服器。",
  "Local Doc and Edgeless editing is free. Cloud plans and AI add-ons have separate prices and terms.": "本機 Doc 與 Edgeless 編輯免費。雲端方案及 AI 加購各有價格與條款。",
  "Local work does not automatically appear on another device. AFFiNE Cloud sync requires sign-in. Keep a separate export or backup. The official workflow guide references 0.27.4; this review did not install that version or establish mobile parity.": "本機內容不會自動出現在另一台裝置。AFFiNE Cloud 同步需要登入。請另存匯出檔或備份。官方流程指南參考 0.27.4；此次未安裝該版本，也未證實行動版具有相同功能。",
  "Personal local note-taking without an account or an internet connection, as documented by the vendor. Free core scope here is plain-text notes.": "官方記錄可不建立帳號、不連網地使用本機個人筆記。本比較的免費核心範圍是純文字筆記。",
  "Standard is free and includes plain-text notes. Advanced editors and other features have subscription tiers; paid offline activation has a separate process.": "Standard 免費並包含純文字筆記。進階編輯器及其他功能有訂閱方案；付費離線功能有另外的啟用流程。",
  "Account-free notes are not synced. Set an Application Passcode to enable encryption in this mode; do not assume it is already enabled. Backups are your responsibility. Paid-feature activation and cloud services have separate conditions.": "無帳號筆記不會同步。此模式需設定 Application Passcode 才啟用加密，不能假定已經啟用。請自行負責備份。付費功能啟用與雲端服務另有條件。",
  "Account-Free Personal Note-Taking Apps": "不用註冊帳號的個人筆記工具",
  "Account-Free Personal Note Workflow Scope": "免帳號個人筆記工作流程範圍",
  "No Account Required": "不需帳號",
  "Pricing Model": "價格模式",
  "Trade-Off Summary": "取捨與限制",
  "personal-desktop-local-note-creation-editing-retention-without-app-account": "不需應用程式帳號的個人桌面本機筆記建立、編輯與保留"
});

Object.assign(accountFreeReview.translations,{"Documented local creation, editing and retention of personal notes in an installed desktop app without an app account. Sync, paid activation and external services are separate.":"已安裝桌面程式中的個人本機筆記建立、編輯與保留，不需應用程式帳號。同步、付費功能啟用與外部服務另有條件。"});
