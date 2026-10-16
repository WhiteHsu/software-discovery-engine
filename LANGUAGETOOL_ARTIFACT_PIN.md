# PR5.77 — LanguageTool具名檔案固定與靜態檢查

已核對乾淨實際版本83f150c，使用者截圖確認8項測試與Production95成功。公開維持21/9/1，零個隱私合格候選。

本次從[官方下載目錄](https://languagetool.org/download/)取得LanguageTool-6.6.zip，只讀取ZIP內容，沒有解壓安裝、執行Java或啟動伺服器。檔案251,998,221 bytes，SHA256為`53600506b399bb5ffe1e4c8dec794fd378212f14aaf38ccef9b6f89314d11631`。英文模組pom.properties確認6.6。

官方標籤另有6.8，但具名下載目錄目前列到6.6；不能把6.8來源碼或較新規則頁視為這個ZIP的內容。6.6來源標籤對應commit[f13e71a7fe85a122290826fd691d267d64e97c33](https://github.com/languagetool-org/languagetool/commit/f13e71a7fe85a122290826fd691d267d64e97c33)。這是來源參照，未做可重現建置或證明ZIP逐位元對應該commit；雜湊是本次實收檔案指紋，不是廠商簽章或已驗證的安全背書。

## ZIP內的實際英文規則

在`org/languagetool/rules/en/style.xml`找到：

| 規則群組 | 群組上的default標記 |
| --- | --- |
| PASSIVE_VOICE_SIMPLE | 未指定 |
| PASSIVE_VOICE | off |
| REP_PASSIVE_VOICE | 未指定 |

三組皆標picky。「未指定」不能直接寫成已啟用，還有分類、模式及客戶端設定。PR5.76官方規則頁提供研究線索，本包進一步以實收檔案確認；沒有宣稱兩句測試文已被此版本偵測。

附唯讀檢查器`inspect-languagetool-artifact.ps1`，先驗證整檔雜湊，再讀版本與規則資訊。它不下載、不解壓、不安裝、不執行JAR、不開連接埠，也不寫產品資料。實際檔案檢查成功，錯誤檔案被拒絕。

## 下一步

以這個固定檔案作為隔離合成文本實測候選；仍需核對Java相容性、實際規則啟用、有效記錄設定、對外連線與清理。6.6是較舊版本的重現候選，沒有完成相依套件安全審查，不是生產部署建議。來源設定檔只作部分靜態參照，不代表全部執行路徑已稽核。

本包不需要使用者再下載大型檔案或執行LanguageTool。ZIP留在本機Downloads，不放入更新包或Git；本包只提交紀錄與唯讀工具。Hemingway與Antidote待查狀態、引擎與SQL保持原樣。
