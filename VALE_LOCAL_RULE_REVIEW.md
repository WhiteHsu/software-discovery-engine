# PR5.91 — Vale本機被動句規則

基準8f6ea43；使用者截圖Production108。實測官方Vale3.24.0 Windows64可攜版，下載SHA256與官方release API digest一致。搭配Microsoft樣式固定提交ea5fa73c530a8413f39701b01856258c0223f101中的單一Passive.yml；不是全部Microsoft規則，也不是託管CMS。未安裝系統服務、修改PATH、註冊或執行sync。

選定本機設定StylesPath=styles、MinAlertLevel=suggestion、純文字BasedOnStyles=Microsoft。啟動時明確指定設定檔、--no-global、JSON輸出及.txt stdin。規則是suggestion等級，另一個控制改為warning門檻時，明明有簡單被動句也回傳空JSON。退出碼0不代表沒有提示。

| 合成案例 | 提示數 | 限制 |
|---|---:|---|
| was reviewed by | 1 | 可供人工修改 |
| was written by | 1 | 此不規則分詞可提示 |
| editor reviewed | 0 | 手動修改後重查不再提示 |
| was carefully reviewed | 0 | 漏判 |
| got reviewed | 0 | 漏判 |
| door is closed | 1 | 狀態解讀需人判斷 |
| is running | 0 | 此例未誤標 |
| is indeed active | 1 | indeed誤判 |

這條規則是existence比對be動詞與緊接分詞，與write-good同類啟發式；沒有passive-voice的indeed排除。不是CMS展示的可選副詞詞性sequence規則，也不能把換引擎算成偵測能力提升。八句並非準確率統計。實際提示沒有自動改寫或替代建議，靠使用者判斷並修改。

JSON含匹配文字與訊息，測試輸出保存於合成研究結果；不能宣稱沒有留存。下載使用網路；檢查時沒有使用sync或CMS，但尚未完成選定CLI資料路徑、診斷與留存審查，也沒有作業系統流量觀察。--no-global只限制全域設定，不是網路封鎖。雜湊確認檔案身分，不是原始碼與二進位可重現等價或安全認證。

JSON記錄固定下載來源、CLI及規則雜湊、設定、九次控制結果與未解問題。審查檢查器只驗證紀錄，不會下載或執行Vale；更新包不包含執行檔、規則原始碼或依賴。公開21／9／1與零隱私合格維持，沒有圖譜或SQL更動。

來源：[Vale固定發行](https://github.com/vale-cli/vale/releases/tag/v3.24.0)、[固定規則](https://github.com/errata-ai/Microsoft/blob/ea5fa73c530a8413f39701b01856258c0223f101/Microsoft/Passive.yml)、[CLI首頁](https://vale.sh/)、[須分開看待的CMS](https://vale.sh/cms)。
