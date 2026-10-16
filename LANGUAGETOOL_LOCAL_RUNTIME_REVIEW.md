# PR5.78 — 本機 LanguageTool 實測

LanguageTool 6.6 在指定 CLI 設定下可標出被動句，供人工修改後重查。隱私資格仍待查，公開狀態維持 21 產品／9 完成路線／1 待完成，隱私候選零合格。

依使用者授權，準備免安裝 Temurin JRE 17.0.20.1+1，先比對官方 ZIP SHA256，再以絕對路徑執行既有固定 LanguageTool 6.6。兩個 ZIP 的完整來源與雜湊、12 組完整結果見同包研究 JSON。沒有設定系統 PATH、JAVA_HOME、登錄或服務，沒有啟動 HTTP 伺服器。

| 合成案例 | 預設 | 明確啟用被動規則、只跑該規則 | PICKY＋明確啟用被動規則、只跑該規則 |
|---|---:|---:|---:|
| The report was written by Mira. The parcel was sent by Leon. | 0 | 0 | 2 被動提示 |
| Mira wrote the report. Leon sent the parcel. | 0 | 0 | 0 |
| The students are bored. | 0 | 0 | 0 |
| This are a test. It is also thought that tests are satisfactory. Instruments were played in most cultures. | 3 一般文法提示 | 0 | 2 被動提示 |

12 組皆正常結束。目標提示為 was written、was sent；正向控制被動提示為 is also thought、were played。被動提示沒有替換建議，不能稱自動改寫。零提示不代表文本完全正確。未單獨測 PICKY，不能宣稱兩個設定各自都是必要條件。

重現參數（JAVA、JAR、HOME、TMP、INPUT 皆為使用者指定的本機絕對路徑，輸入 UTF-8）：

```text
JAVA -Duser.home=HOME -Djava.io.tmpdir=TMP -jar JAR -l en-US -c utf-8 --json INPUT
JAVA -Duser.home=HOME -Djava.io.tmpdir=TMP -jar JAR -l en-US -c utf-8 --json --enabledonly --enable PASSIVE_VOICE_SIMPLE,PASSIVE_VOICE,REP_PASSIVE_VOICE INPUT
JAVA -Duser.home=HOME -Djava.io.tmpdir=TMP -jar JAR -l en-US -c utf-8 --json --level PICKY --enabledonly --enable PASSIVE_VOICE_SIMPLE,PASSIVE_VOICE,REP_PASSIVE_VOICE INPUT
```

每組使用新 JVM。實測結束時沒有殘留 Java 程序；指定 home/tmp 沒有找到檔案，但實驗資料夾刻意保留合成輸入與 stdout/stderr。這不是完整檔案系統或留存稽核。未擷取或阻擋對外流量，不能由本機 CLI 推論沒有傳輸。小型案例與舊版固定套件也不構成完整準確性、依賴安全或正式環境適用性證明。

下一個證據關卡是有界的對外連線與日誌／留存觀察。本輪只保存實測證據，不變更產品圖譜、引擎、SQL 或發佈資格。更新包不含 Java、LanguageTool ZIP 或原始實驗資料夾；套用時不用重跑 Java。
