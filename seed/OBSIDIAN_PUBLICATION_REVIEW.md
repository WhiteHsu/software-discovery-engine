# PR4.2 — Obsidian 首頁面發布審查

**狀態：使用者已批准僅發布 Obsidian 產品頁及允許索引。** 2026-10-06；批准記錄見 OBSIDIAN_PUBLICATION_APPROVAL.md。正式套用尚待操作確認。

## 準備公開的內容

正式網址：`https://software-discovery-engine.vercel.app/software/obsidian`。

定位為本機 Markdown 知識管理 app，Sync 與 Publish 為可選付費服務。CTA 指向 `https://obsidian.md/`。頁面沿用目前本機 Obsidian 預覽內容；不新增宣傳文案或數字價格。

| 項目 | 發布時的呈現 |
|---|---|
| 離線、本機資料、核心不用帳號、免費核心、Markdown 檔案 | 有來源支持的 verified / Yes |
| 平台 | Windows、macOS、Linux、iOS、Android；不保證平台功能完全相同 |
| 價格與限制 | 免費核心；廠商 Sync / Publish 額外付費；實際價格請看官方頁面 |
| 自行部署、開源、AI optional、專注筆記、無需配置資料庫、最少設定 | 維持 Unknown；沒有變成 No 或新增肯定宣稱 |
| 適用對象 | 隱私關注、本機離線及資料控制使用者；全部維持 likely 的適配判斷 |
| 痛點 | cloud-dependency、vendor-lock-in、subscription-fatigue；維持 likely，沒有遷移品質或隱私保證 |
| Notion 關係 | alternative / likely；來源是既有 AFFiNE 第三方比較文，不包裝成官方或完整替代保證 |
| Escape Routes | 現有關聯路線仍 draft，正式產品頁不顯示或發布它們 |
| 日期 | 逐項保留原驗證日期；頁首顯示最新的單項檢查日期，而非宣稱整個產品實測完成 |

## 來源複核

再次查閱 [官方價格頁](https://obsidian.md/pricing)：支持免費核心、不需註冊，以及可選的 Sync / Publish 付費服務。

[官方儲存文件](https://obsidian.md/help/Files%2Band%2Bfolders/How%2BObsidian%2Bstores%2Bdata) 支持本機資料夾與 Markdown 純文字檔；[官方同步文件](https://obsidian.md/help/Getting%20started/Sync%20your%20notes%20across%20devices) 支持本機離線資料存取，同時指出同步方式及各平台限制。[官方下載頁](https://obsidian.md/download) 用來複核平台。

沒有增加實機測試紀錄。沒有把來源桌面審查或 AI 判斷記成使用者逐功能實測。原本的 unknown 與 likely 都保留。

## 精確發布範圍

審查資料 SHA-256：`0d184653bcb7f7ae9e9074a5c5cc08c20b6c3b1873cc31fd47ae767a3ceeb254`。

這是生成的單一產品 bundle 的 JSON.stringify SHA-256，包含產品、14 個屬性、1 個 anchor、3 個 audiences、3 個 problems，以及其關聯來源與分類定義。與 #3 完整 30 產品資料集 hash 不同。

批准後只將 Obsidian 的 status 從 draft 改為 published，並更新該產品的 updated_at。其餘 29 個產品、所有 claim、來源與 Escape Route 狀態都不改。正式產品頁將對公眾可見，依 PR4.1 的 metadata 可以被搜尋引擎索引。

SQL 在同一交易中鎖定資料、比對審查版本的欄位、來源、證據片段及完整關係集合，再發布。資料變更、證據變更、review/archived 狀態或新增已批准的關聯路線會停止整批操作，不能用覆蓋方式跳過。重跑相同發布 SQL 不改 timestamp。預設演練完整回滾。

## 已完成驗證

單一產品切片與範圍測試、rollback 預設與 guard 測試通過。PostgreSQL/PGlite 本機確認演練完全回滾、修改欄位或證據會拒絕發布、正式套用只修改目標產品狀態／時間、匿名 RPC 可以讀到產品及來源、其他 draft 仍不可見、重跑不變更。

使用者已確認 PR4.1 的 25 tests、lint/typecheck/build、commit b7568d1 部署，以及正式 Obsidian 的未發布頁面。Supabase 四項公開讀取檢查全 true。

使用者已對本文件範圍明確批准。批准交付包包含演練、正式 APPLY 及發布後驗證 SQL。正式資料庫操作尚待使用者執行與確認；先前 #3 的 draft acceptance 與本次發布批准分別記錄。
