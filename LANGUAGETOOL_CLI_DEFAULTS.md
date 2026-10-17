# PR5.84 — 遠端工廠與套件預設

已補讀固定6.6提交的兩個遠端工廠，並直接檢查既有6.6套件的JAR內容、命令列manifest及logback.xml。另依套件manifest確認OpenTelemetry API1.42.1，取得相同版本來源核對。這輪純靜態閱讀，沒有執行下載內容或重跑Java。

| 項目 | 可支持的有限結論 |
|---|---|
| GRPCRule.createAll | 空設定清單不會經這兩個工廠建立規則或呼叫連線建構子 |
| GRPCPostProcessing.configure | 實例／channel建立位於設定清單迭代內，空清單不進入該分支 |
| 命令列logback.xml | INFO、單一ConsoleAppender；該XML沒有檔案／網路appender、include或屬性引用 |
| OTel API1.42.1 | 先用既有global；沒有成功自動設定才回退no-op，自動設定需SDK類別與啟用屬性 |
|139個JAR靜態掃描 | 未找到SDK／exporter套件類別或OTel服務註冊檔，不是有效執行狀態證明 |

上一輪已證明命令列未指定--remoterules時傳入空設定清單。本輪補上這兩個工廠的條件推論；不延伸為所有初始化、原生依賴或其他程式分支都不連網。Fresh CLI前提亦不能套到已預先配置全域狀態的嵌入式程式。

Logback主控台預設System.out可由[官方文件](https://logback.qos.ch/manual/appenders-console-file.html)支持；但此處只檢查套件XML，沒有在執行時驗證實際選用設定。直接System.out／System.err輸出不由該XML移除；正文JSON、錯誤片段與呼叫端重導向副本仍須按PR5.83處理。外部設定、classpath、JVM agent或既有global均可能改變結果。

命令列manifest含142項、140個不重複項，明列./、API/context/semconv及Logback；沒有core-tests。libs內core-tests JAR雖含logback-test.xml與logback.xml，不能因它存在就宣稱CLI採用測試設定。另33個language-all／language-* JAR引用不在實際解壓目錄，./內有未封裝語言資源；manifest清單不是完整有效classpath證明。

JSON保存來源URL、SHA256、檔案／函式位置、JAR掃描摘要雜湊及相關設定條件。來源與二進位仍未做可重現建置對照；套件掃描不等於全程式安全稽核或動態載入分析。不能宣稱零遙測、零傳輸、零留存或無訓練。

這輪縮小了已知條件下的未解範圍，但不新增產品隱私屬性。維持21／9／1、零隱私合格。下一步以現有證據評估明確CLI使用設定及仍屬實質的留存／使用權／工作流程條件，不以反覆擷取零事件推進資格。使用者擷取作業維持結束。
