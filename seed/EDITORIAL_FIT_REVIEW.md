# PR3.5 — 使用者與痛點配對

## 本次內容

新增 24 個產品已有功能、方案與限制，這次補上 **28 個 audiences 關係與 22 個 problems 關係**，全部是 `likely`。四個新增使用者分類為個人任務規劃者、寫作者／編輯、PDF 文件使用者、冥想 app 聆聽者。

這些是根據已複核功能所作的編輯判斷，沒有宣稱測試過使用者滿意度、完整替代性、醫療效果、隱私保證或遷移品質。沒有適當證據的痛點仍不配對。

## 配對規則與範圍

| 配對 | 支持條件 | 不能推論的事 |
|---|---|---|
| 主要使用者類型 | 官方產品流程與既有生態系證據 | 不等於完整取代原產品或適合每個使用者 |
| subscription-fatigue | 已有 verified 的免費核心使用證據 | 不等於所有進階功能、Cloud、商用授權與代管都免費 |
| cloud-dependency / offline-first-users | 已有 verified 的離線核心證據 | 不等於同步、協作及每個平台都能離線 |
| unwanted-ai | 已有 verified 的 AI-optional 核心證據 | 不等於完全沒有 AI 功能 |
| vendor-lock-in / data-ownership-seekers | 已有 verified 的可自行部署證據 | 不等於無限制授權、無運維成本或容易遷移 |

例如 [PDF24 Creator](https://tools.pdf24.org/en/creator) 的本機版可以支持離線使用者的 likely 配對；[Stirling 官方下載](https://www.stirling.com/download) 所描述的自行部署則只支持部署控制的編輯推論。[Medito](https://meditofoundation.org/medito-app/) 的免費 app 可以支持避免額外訂閱的配對，不能支持健康療效的分類。

Insight Timer、Sejda 的全產品離線屬性仍 unknown，未因此添加離線推薦。Waking Up scholarship 是有條件申請，不因此添加免費核心／subscription-fatigue 配對。Balance 未核實的免費核心與平台也保留 unknown。有些產品只有使用者類型、沒有痛點配對，是有意保留的結果。

逐筆配對的原因與來源 key 在產生的 `fit-rationale.json`；完整前後資料可由 PR3.4 與 PR3.5 的 reviewed JSON 比較。來源沿用已複核資料，不假造新的引用內容。

## 套用

1. 複製交付包 `files/` 內容到 repo，保留相對路徑。
2. 執行 `node scripts/seed/build-editorial-fit.mjs`。
3. 依序在 Supabase SQL Editor 完整執行 `.seed-output/editorial-fit/01_REHEARSAL.sql`、`02_APPLY.sql`、`03_VERIFY.sql`。
4. 17 列 matches 應全部 true。products 仍 30，routes 仍 3；audiences=8、product_problems=39、product_audiences=46、fragments=305、problem evidence=40、audience evidence=46。sources 仍149、attribute evidence仍162。

不需要 schema migration。只處理 `software_discovery`，不授予任何既有產品／關係的覆蓋 ownership。已修改的既有欄位會被既有匯入器拒絕；不同證據集合也會整批停止。不要刪除 guard 或重跑 PR3.3/PR3.4 APPLY 作為修復方式。

## 精簡人工審查包

產生的 `review-packet.json` 包含 30 個 product slugs、完整資料集 SHA-256、unknown 清單及空白 reviewer／decision。狀態始終 pending；執行命令、測試通過或部署成功都不會填入人工批准。

需要人工判斷的具體範圍是：

1. 接受這份 **官方來源桌面複核的 draft 資料集**，包括 PR3.4 記錄的修正與明示 unknown。
2. 接受本次配對作為 **likely 的編輯判斷**，而不是 verified 的效果或完整替代保證。
3. 記錄此次審查沒有實機測試，也沒有批准產品／路線發布。

人工決定應寫明 reviewer、日期、資料集 hash、範圍及任何例外。若接受的是上述 draft 範圍，記錄應只說 draft acceptance，不能寫成已批准發布或已逐功能實測。這份文件本身是待審查材料，未代表你同意。

#3 原本要求至少 30 個產品／五個生態系、可重複匯入、證據／信心／日期、平台、可核實價格及限制，目前都已有資料或明示未知。unknown 是允許的資料狀態，無需用猜測填滿。最後需對照 issue 的驗收條件記錄人工決定；產品發布仍須另外的產品級人審紀錄。

## 驗證

22 個 Node tests、lint、typecheck、build 通過。PostgreSQL/PGlite 模擬確認：必須先有 PR3.4、演練完全回滾、17 counts 正確、所有既有 row/ID/timestamp 及修正保留、重跑無改動、修改後的配對阻止整批匯入。這是本機模擬，未由此工具操作遠端資料庫。
