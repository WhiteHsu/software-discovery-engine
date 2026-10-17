# PR5.94 — 可審查的候選文字草稿

基準acb316d；使用者截圖Production111。三份草稿只支持英文被動句人工檢視、手動修改與重查，不是完整Grammarly替代。這些工具有CLI／程式整合門檻，不能呈現成一般使用者安裝即用的外掛。尚未套用圖譜、隱私屬性、引擎範圍或發佈；公開仍21／9／1、零新增合格。

## LanguageTool

**限定版本：** 6.6 direct CLI + pinned portable Java + complete distribution snapshot

**替代關係草稿：** A technical local alternative for manually reviewing English passive constructions, revising them yourself and rechecking. Explicit passive rules with PICKY mode are required in this tested profile; not the hosted editor, browser add-on or full Grammarly replacement.

**隱私描述草稿：** In the selected direct CLI profile, fixed local resources process synthetic text without an HTTP server or editor client. Reviewed default branches and bounded runtime observations support local operation; returned context, diagnostics, caller storage and host memory remain within the documented limits.

**實測功能：** Two passive targets detected; active and adjectival controls not flagged in selected recorded corpus. No automatic rewriting.

**使用權／費用界線：** Local open-source distribution, not hosted Premium entitlement. Current commercial pricing and complete rights/notice wording not refreshed; pricing graph claim remains pending.

**取捨：** Requires Java and command-line setup; fixed English style-rule profile; no Premium parity or universal grammar coverage.

## write-good

**限定版本：** npm1.0.8 direct local Node function with eight-package lock, stock checks and passive-only options

**替代關係草稿：** A developer-oriented local function for highlighting likely passive English constructions, manually revising and rechecking. It requires a caller and does not supply a Grammarly-like editor.

**隱私描述草稿：** The selected inspected loaded library path performs string matching locally and returns suggestions containing matched text, with no direct I/O calls located. The caller must keep prose and returned values within the described local operation; logging, saving, CLI/editor integrations and host diagnostics are separate data paths.

**實測功能：** Regular/irregular passive1 each; manual active revision0. Adverb/get passive misses and closed-state ambiguity remain.

**使用權／費用界線：** Eight locked package metadata records declare MIT; no paid account used. No legal audit or hosted-service pricing claim.

**取捨：** Node integration required; heuristic detector, no automatic rewrite; caller owns presentation and retention.

## Vale

**限定版本：** 3.24.0 portable CLI + fixed single Microsoft.Passive rule, explicit ini/no-global, clean child VALE environment

**替代關係草稿：** A configurable local command-line workflow for identifying likely passive constructions in plain English text, manually editing and rechecking. Suggestion threshold must be enabled for the chosen rule.

**隱私描述草稿：** The selected profile uses local configuration and a local existence rule, with empty NLP endpoint and profiling variables excluded. JSON contains matched prose. Optional remote NLP, pipeline configurations and profiling exist in the product and must remain outside this scoped operation.

**實測功能：** Simple passive1 and manual active0; adverb/get misses, closed-state ambiguity and indeed false positive.

**使用權／費用界線：** Official CLI documents MIT/free open-source; commercial CMS is excluded. Full distribution notices and style-license attribution wording remain review items.

**取捨：** CLI and local configuration required; limited regex-based detection, no automatic rewrite. Not a hosted CMS or a browser integration.

## Vale設定缺口的決定

固定版本ReadPipeline會讀取StylesPath/.vale-config並可能合併套件設定；--no-global不會把這條路徑一併禁止。規則manager也會建立預設規則、載入設定樣式及個別checks，再編譯／繼承與過濾。因此不能只看到一份YAML就宣稱只載入這份程式。

本次本機樣式目錄沒有.vale-config，Microsoft目錄只有Passive.yml；有效ConfigFiles只有指定ini，NLP endpoint空，global base styles無設定。相同受控環境的--counts結果只有Microsoft.Passive:1。這足以補清本次有效設定／規則問題，不是完整依賴或所有linked code稽核，也不防止稍後檔案變更。沒有觸發遠端endpoint、profiling測試或新網路擷取。

## 接續實作條件

下一包可根據這些具體草稿準備選擇性圖譜提案：明確對齊替代關係與privacy屬性範圍、六軸判定、定價與取捨的日期來源，逐款驗證；不能只因為剛好三款就直接合格。完整記憶體安全抹除或來源／binary可重現等價不是自動加上的必過條件，但任何聲明都不能超過證據。

本輪舊紀錄保持原樣，七份來源以只轉CRLF的SHA256固定。JSON包含英文可用草稿與本輪Vale結果；審查檢查器只驗證紀錄，不重新執行工具。
