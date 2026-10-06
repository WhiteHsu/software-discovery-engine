# PR3.4 — Official-source desk review, 2026-10-06

## 結論

已檢視 30 個候選產品的官方平台、方案及限制資料，並抽查原始 Notion 資料中對證據敏感的分類。發現的問題適合用局部修正處理，尚不足以宣告整份資料通過發布驗收。這是 AI 官方來源複核，沒有實機使用測試，也沒有取得人工發布批准。

本次共 **43 項欄位／證據／信心修正，涉及 12 個產品**。43 不是 43 個錯誤產品，也不全是事實錯誤；其中包括更精準的方案範圍、更合適的證據指標，以及將推薦推論降為 likely。完整前後差異會產生於 `.seed-output/source-review/changes.json`。

## 重要發現

| 發現 | 處理與官方依據 |
|---|---|
| ProWritingAid 方案與限制不完整 | 補上 Lifetime／Premium Pro、僅英文、免費單次字數與報告次數限制。[方案與 FAQ](https://prowritingaid.com/pricing) |
| Antidote 平台範圍混淆 | 補 Mac；區分 Mobile 字典／指南與透過 Web 的校正器。[Mac](https://www.antidote.info/en/antidote-12/compatibility/mac)、[Mobile](https://www.antidote.info/en/antidote-mobile) |
| Smiling Mind 漏網頁版 | 補 browser access。[官方產品資訊](https://www.smilingmind.com.au/app-product-information-statement) |
| Vikunja 免費範圍過寬 | 區分 AGPL 核心、付費 Cloud 與 Pro。[定價](https://vikunja.io/pricing/) |
| Stirling 平台與授權待釐清 | 補 Windows/Mac/Linux；記錄 MIT 與排除的另行授權元件，open-source 布林仍 unknown。[下載](https://www.stirling.com/download)、[LICENSE](https://github.com/Stirling-Tools/Stirling-PDF/blob/main/LICENSE) |
| AFFiNE 方案／後端授權範圍 | 補 Believer 與 EE compilation 條件；核心編輯器 open-source=true 保留，因現有欄位定義容許核心編輯器開源。[方案 FAQ](https://affine.pro/pricing) |
| Joplin Markdown 被誤解的風險 | 補 SQLite 儲存與 Markdown 匯入／匯出差別。現有 markdown-files 定義包含 supported note format，因此保留 true，不能誤改為 false。[使用說明](https://joplinapp.org/help/)、[profile](https://joplinapp.org/help/dev/spec/user_profile/) |
| Obsidian 證據未直接支持 Markdown | 改接官方檔案儲存說明，true 保留。[儲存方式](https://obsidian.md/help/Files%2Band%2Bfolders/How%2BObsidian%2Bstores%2Bdata) |
| Logseq 版本混用 | 區分 file graphs 與 SQLite DB graphs；補 beta／alpha 範圍。產品級 markdown-files、free-core-use 改 unknown；核心開源接官方 repo。[README](https://github.com/logseq/logseq) |
| Anytype 有些來源無法讀取 | 離線／local-first／self-host 接可讀的官方文件。平台比較是較舊版本，仍 likely；目前收費與免費核心改 unknown。[現行文件](https://doc.anytype.io/anytype)、[版本化平台比較](https://doc.anytype.io/anytype/documentation_cn/za-xiang/feature-list-by-platform) |
| Balance 平台證據不對題 | 原 billing 分類不能證明平台，平台改 unknown。這不表示 iOS/Android 不支援；只是此輪未取得適當平台證據。[原引用](https://support.balanceapp.com/hc/en-us/categories/4407653443995-Subscriptions-Billing) |
| 使用者／痛點配對信心過高 | 原有 verified 的 problems/audiences 配對改 likely。功能文件能支持推論，但不等於實證使用者結果；保留底層來源。 |

## 30 個產品的複核範圍

「保留」表示此輪沒有在已讀官方資料中發現需修正的主要摘要，不是所有功能、平台、授權及體驗均通過完整驗收。未建立證據的 AI、離線、隱私或開源屬性繼續 unknown。替代關係仍以 likely 為主，不表示完整功能等價。

| 生態系 | 產品 | 本輪結論／來源 |
|---|---|---|
| Notion | Obsidian | 修正 Markdown 證據；降推薦推論信心。[價格](https://obsidian.md/pricing)、[安全](https://obsidian.md/security) |
| Notion | Anytype | 補可讀文件；定價 unknown，平台 likely；降推薦推論。[文件](https://doc.anytype.io/anytype) |
| Notion | AppFlowy | 平台／Cloud 摘要保留；降推薦推論。[下載](https://appflowy.com/download)、[價格](https://appflowy.com/pricing)、[說明](https://docs.appflowy.io/docs) |
| Notion | AFFiNE | 修正方案與後端範圍；降推薦推論。[下載](https://affine.pro/download)、[價格](https://affine.pro/pricing) |
| Notion | Joplin | 補儲存限制；降推薦推論。[安裝](https://joplinapp.org/help/install/)、[Cloud](https://joplinapp.org/plans/) |
| Notion | Logseq | 分版本並撤回部分過廣確認；降推薦推論。[repo](https://github.com/logseq/logseq) |
| Todoist | TickTick | 保留免費／Premium 與平台摘要，未建立全平台離線證據。[下載](https://www.ticktick.com/download)、[方案](https://www.ticktick.com/upgrade) |
| Todoist | Remember The Milk | 保留；Web 離線與 subtasks 的 Pro 限制不能泛化。[平台](https://www.rememberthemilk.com/services/)、[方案](https://www.rememberthemilk.com/upgrade/) |
| Todoist | Toodledo | 保留免費歷史與 Standard subtasks 限制。[官網](https://www.toodledo.com/)、[方案](https://www.toodledo.com/subscribe/index.php) |
| Todoist | Things | 保留 Apple 與 App Store 區域方案範圍；沒有把未列平台當 false。[產品](https://culturedcode.com/things/)、[價格](https://culturedcode.com/things/pricing/) |
| Todoist | OmniFocus | 保留 Apple 原生／Web 與付費方案範圍。[產品](https://www.omnigroup.com/omnifocus/) |
| Todoist | Vikunja | 補 Pro；免費只指核心。[方案](https://vikunja.io/pricing/) |
| Grammarly | LanguageTool | 保留平台／免費基本檢查／Premium 範圍；未確認整體 AI-optional。[官網](https://languagetool.org/) |
| Grammarly | ProWritingAid | 補 Lifetime、英文與免費限制。[官網](https://prowritingaid.com/)、[方案](https://prowritingaid.com/pricing) |
| Grammarly | Hemingway Classic | 保留 Windows/Mac、離線及 Classic 非 AI 範圍，不能套到 Editor Plus。[Classic](https://hemingwayapp.com/desktop) |
| Grammarly | Antidote | 分 Windows/Mac/Web/Mobile 的功能。[Mobile](https://www.antidote.info/en/antidote-mobile)、[購買](https://www.antidote.info/en/store/first-purchase) |
| Grammarly | Ginger | 保留平台與免費入口／Premium 摘要；不保存促銷價。[官網](https://www.gingersoftware.com/)、[方案](https://www.gingersoftware.com/online_store/ginger_upgrade?cp=link-footer) |
| Grammarly | Quillbot | 保留；官方方案頁列出平台及各平台限制差異。[方案](https://quillbot.com/premium) |
| Adobe/PDF | PDFgear | 保留核心免費宣稱，產品版本與 eSign 服務範圍仍需按操作判斷。[官網](https://www.pdfgear.com/) |
| Adobe/PDF | PDF24 Creator | 保留 Windows-only、免費商用與本機處理，不能套到 Web tools。[Creator](https://tools.pdf24.org/en/creator) |
| Adobe/PDF | PDF-XChange Editor | 保留 Windows、Editor/Plus、API-key AI 範圍；未把所有功能當免費。[產品](https://www.pdf-xchange.com/product/pdf-xchange-editor) |
| Adobe/PDF | Foxit PDF Editor | 保留 subscription/perpetual/Editor+ 區分；不是每個版本都含 AI/cloud/mobile。[產品](https://www.foxit.com/pdf-editor/) |
| Adobe/PDF | Sejda | 保留免費限制與本機／Web 處理差別，離線布林不概括所有版本。[Desktop](https://www.sejda.com/desktop)、[方案](https://www.sejda.com/upgrade) |
| Adobe/PDF | Stirling PDF | 補桌面平台與混合授權。[下載](https://www.stirling.com/download)、[方案](https://www.stirling.com/pricing) |
| Calm | Insight Timer | 保留免費內容與付費 offline listening；整體離線仍 unknown。[Member Plus](https://insighttimer.com/member-plus) |
| Calm | Medito | 保留免費、免帳號；不推定醫療效果或完整 Calm 等價。[產品](https://meditofoundation.org/medito-app/) |
| Calm | Smiling Mind | 補 Web；帳號要求保留，沒有驗證醫療效果。[產品資訊](https://www.smilingmind.com.au/app-product-information-statement) |
| Calm | Healthy Minds Program | 保留免費 app／另付費課程及註冊要求，不驗證效果。[產品](https://www.humin.org/wellbeing-tools/app) |
| Calm | Balance | 平台 unknown；個人化描述保留 likely，試用不是永久免費。[產品](https://themindcompany.com/apps/balance)、[billing](https://support.balanceapp.com/hc/en-us/categories/4407653443995-Subscriptions-Billing) |
| Calm | Waking Up | 保留付費／申請 scholarship 的差別；不是無條件免費。[scholarship](https://www.wakingup.com/scholarship) |

## 如何套用

1. 將交付包 `files/` 內容依原相對路徑複製到 repo。
2. 在 repo 根目錄執行 `node scripts/seed/build-source-review.mjs`，產生局部修正。不要重跑舊 PR3.3 IMPORT SQL；它保留原始審查基線。
3. 在 Supabase SQL Editor，先完整執行 `.seed-output/source-review/01_REHEARSAL.sql`。成功後完整執行 `02_APPLY.sql`。兩份各約 147 KB，均是單一原子 DO statement，只處理 `software_discovery`。
4. 執行 `03_VERIFY.sql`，17 列 `matches` 應全為 true。APPLY 會驗證每個寫入欄位；`changes.json` 可查實際修正內容。

若遇到 `AI review baseline conflict` 或 `AI review evidence conflict`，表示庫內資料已與原始／目標版本不同。停止並提供錯誤，保留人工更改；不要移除 guard 或直接授權整份資料覆蓋。

保留舊來源與 fragment 作為歷史，所以修正後 expected sources=149、fragments=254、attribute evidence links=162。其餘數量不變，products=30、attributes=250、routes=3。AI review 不改發布狀態或路線。

## 仍未完成的驗收

- Anytype 現行方案、Balance 平台與 Logseq 版本化定價等已明示 unknown，不靠補猜完成。
- 原本 24 個新增產品尚沒有 problems/audiences 關係；候選清單與有意義的推薦資料仍有差距。
- 定性平台文字尚不能替代日後可查詢的版本／平台結構；目前先用範圍文字避免誤判。
- 沒有實機確認 onboarding、離線、匯出、協作、功能品質，或隱私／健康效果。授權內容記錄的是來源描述，不是法律判斷。
- 人工審查可以集中檢視這份重要發現與 unknown，批准明確範圍；尚未取得批准，故 #3 保持 open、全部產品 draft。發布必須另有具體人工紀錄，不能把「build pass」當成內容批准。

## 本機驗證

19 個 Node tests、lint、typecheck、build 通過；另以 PGlite/PostgreSQL 模擬了 PR3.2C → PR3.3 → 此次 delta。確認演練完全回滾、17 counts、未納入欄位／路線保留、重跑不改 row/timestamp、人工欄位改動阻止整批套用。尚未操作遠端資料庫。
