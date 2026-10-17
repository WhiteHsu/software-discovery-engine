# PR5.81 — 系統層級有界觀察

已在同一輪系統記錄中驗證本機正向控制，並執行 LanguageTool 6.6 合成被動句。LanguageTool 正常結束、標出兩處被動句。這輪沒有足夠證據判定沒有傳輸；隱私資格維持待查，公開狀態仍 21／9／1、零新合格。

使用者以管理員權限執行約20秒的 Windows Performance Recorder TCPIP 記錄，原始 ETL 在本機成功儲存且停止。觀察程序、時間與測試埠用於本機核對；本包只保存去識別摘要與原檔 SHA256，不提交 ETL、原始解碼、程序編號、主機名稱、其他程式位址、測試埠或金鑰。

| 項目 | 結果 |
|---|---|
| TCPIP 提供者事件 | 31,191 |
| 控制程序 header PID 匹配 | 287 |
| 控制程序雙向 loopback 收發摘要 | 2 |
| LanguageTool header PID 匹配 | 108 |
| 明確 owner 欄位匹配 LanguageTool | ID1001、1013 各1筆 |
| 選定連線生命週期 ID 的明確 owner 匹配 | 0 |
| LanguageTool 執行／被動提示 | exit0／2處 |

**Header PID 不能單獨視為連線擁有者。** 系統可能在該程序執行上下文處理其他工作。108筆主要包含計時器、路由及其他系統事件；這個數字不能稱108次連線，也不是寫作內容外傳證據。檢查生命週期 ID1017、1031、1033、1038、1043、1044 的明確 owner 欄位沒有 LanguageTool 匹配，只能描述這個有限範圍的未發現。部分 header1332 摘要缺乏足夠明確 owner 關聯；未強行歸屬。

初次設定 Level5 漏掉本機 TCPIP 的 TcpSummary16 級別，控制未通過；該輪不能當無網路證據。修正版採 Level16、NonPagedMemory=true、Strict=true，先完成獨立本機控制，再做本輪同時窗控制與 LanguageTool。多個設定一同變更，不能稱已單獨實驗證明某個設定是全部根因。

本輪沒有 DNS 提供者、ProcessThread 完整生命週期關聯、完整 UDP／原生程式覆蓋、檔案留存稽核或封包擷取，也沒有完成本輪事件漏失稽核。沒有可普遍適用的無傳輸、無留存或隱私合格結論。

此輪使用者擷取作業結束，不再要求逐筆截圖或重跑同類擷取。下一階段先整理所有隱私資格條件與明確未滿足項，再決定是否值得進一步調查，不以累積零事件推進資格。不變更引擎、產品圖譜、SQL 或發佈。套用本包不需管理員、Java或系統擷取。

設定語義參考：[Microsoft EventProvider](https://learn.microsoft.com/en-us/windows-hardware/test/wpt/eventprovider)；NonPagedMemory 的 TCPIP 範例參考：[Microsoft MsQuic WPRP](https://github.com/microsoft/msquic/blob/main/src/manifest/MsQuic.wprp)。本機級別數值取自實際提供者中繼資料，不由文件推定。
