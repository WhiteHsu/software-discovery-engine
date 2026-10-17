# PR5.92 — Vale選定操作的資料路徑

基準7c4fc6f，使用者截圖Production109。固定3.24.0官方標籤提交與前輪可攜執行檔，檢視stdin、設定、NLP、profiling、existence與JSON輸出的相關程式段落。索引13份檔案供重查，不代表完整依賴稽核。

新發現：選配NLPEndpoint可能透過HTTP把文字送出，文字與語言在URL查詢參數內。這不是只有不含正文的診斷。選定有效設定的endpoint為空，但不能因此宣稱整個產品永不連網。

另一條路徑在解析旗標前就開始：VALE_CPUPROFILE／VALE_MEMPROFILE可使程式寫出效能分析檔；檔案可能有操作資料，未證明含不含完整正文。--no-global不會停用它們，也不是系統網路或寫檔封鎖。

本輪只在子程序移除所有VALE_*環境變數，不改使用者系統設定。沿用明確本機設定、單一固定Microsoft.Passive規則、純文字stdin、JSON及--no-global，先檢查有效設定，再跑被動句與人工主動修改，各1與0提示，stderr空。這份新結果不回填推定前輪繼承環境；舊紀錄保持原樣。

stdin正文進入記憶體；existence執行比對並建立提示；JSON把包含匹配文字的提示印到stdout。呼叫端如何記錄、保留與刪除仍是獨立邊界。空endpoint的分支回到本機詞性處理；本規則是existence而非CMS詞性sequence範例。尚未排除所有程式／依賴的網路與寫入路徑，也沒有OS擷取、記憶體刪除證明或來源與二進位可重現等價驗證。

結論是縮小選定操作的未知，不把可選遠端功能說成這次已傳出，也不把本機結果擴成全產品保證。仍為研究資料、零新增隱私合格，公開21／9／1不變。接續整合候選證據與發佈門檻，不預設擴建擷取工具。

來源與LF正規化SHA256列於JSON，主要為固定版本的[入口](https://github.com/vale-cli/vale/blob/2ee781716f8c177c2a143e18d535ddb11e264f00/cmd/vale/main.go)、[profiling](https://github.com/vale-cli/vale/blob/2ee781716f8c177c2a143e18d535ddb11e264f00/cmd/vale/profile.go)、[遠端NLP](https://github.com/vale-cli/vale/blob/2ee781716f8c177c2a143e18d535ddb11e264f00/internal/nlp/http.go)、[設定載入](https://github.com/vale-cli/vale/blob/2ee781716f8c177c2a143e18d535ddb11e264f00/internal/core/source.go)。
