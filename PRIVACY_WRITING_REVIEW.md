# PR5.72 — 隱私寫作路線：版本與資料流審查

已核對乾淨的實際版本 fb919be；使用者截圖確認21項測試與Production90成功。公開狀態維持21個產品、9條完成路線、剩1條；本包只新增研究記錄，沒有公開資格、資料庫或引擎變更。

## 本次可用結論

| 版本 | 處置 | 關鍵限制 |
| --- | --- | --- |
| LanguageTool託管瀏覽器附加元件 | 保留待查 | 不訓練不等於本機處理或完整不留存；需核對附加元件的實際資料路徑。 |
| Hemingway Classic桌面版 | 保留待查 | 官方目前的網頁隱私政策明確排除舊獨立桌面產品，不能用它補齊Classic證據。 |
| Antidote12已安裝Correction模式 | 優先研究 | 隱私路線可接受訂閱；現有永久版升級資格不是唯一方向。帳號、同步、連接器與實際英文功能仍需查核。 |
| LanguageTool本機伺服器 | 獨立研究線索 | 需技術設定；不能當作雲端Basic版，也不能套用Premium功能。 |
| Hemingway免費網頁版 | 獨立研究線索 | 已驗收的寫作功能不代表隱私合格；需以無Plus試用的模式檢查資料流。 |

依據：[LanguageTool政策](https://languagetool.org/legal/privacy)、[本機伺服器文件](https://dev.languagetool.org/http-server)、[Hemingway政策](https://hemingwayapp.com/legal/privacy-policy/2026-10-08)、[Antidote版本資料處理說明](https://www.antidote.info/en/help-centre/troubleshooting/language-content/antidote-and-the-confidentiality-of-your-texts)。完整13個官方來源、定位與日期見JSON。陳述都是廠商文件證據，並非本次實測。

## 判準與後續

逐版記錄六軸：文字處理位置、留存/刪除、訓練預設、雲端/同步/整合、遙測/帳號/第三方，以及取得資格/共同寫作功能。有重大資料路徑未知就保留未知。這是尚未套用的研究判準，不把沒有訓練、沒有帳號或可離線直接轉成privacy-friendly=true。

比較基準限個人英文被動句的檢視、手動修改及再檢查；不是完整Grammarly替代。Grammarly個人帳號的政策、訓練控制與組織帳號適用條款也要分開。[官方政策入口](https://www.grammarly.com/privacy-policy)目前轉向Superhuman政策；不推測使用者的設定。

下一步先查Antidote英文功能與雲端開關文件，以及免費Hemingway的匿名資料路徑。JSON內附合成文本和資料流驗證程序，狀態明確標為尚未執行。只觀察少量網路請求不足以證明永久不傳輸或伺服器立即刪除。本包不要求購買、註冊、安裝、重新跑寫作語料或SQL；也不為湊三個候選降低門檻。

Stripe Directory工具/CLI不可用，入口讀取失敗；本次改查官方文件。未安裝或連接任何服務。歷史研究記錄與公開檢查點原樣保留。
