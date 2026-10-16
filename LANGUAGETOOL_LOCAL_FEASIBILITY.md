# PR5.76 — 本機LanguageTool可行性審查

乾淨實際版本118445a已核對；使用者截圖確認8項測試與Production94成功。公開狀態維持21/9/1，零個新增隱私合格候選。

官方[本機伺服器文件](https://dev.languagetool.org/http-server)提供可行路徑，但基本伺服器與雲端Basic/Premium不是同一版本，並有功能缺口。[英文被動句規則](https://community.languagetool.org/rule/show/PASSIVE_VOICE?lang=en&subId=6)存在但預設關閉；該頁顯示較早的6.8-SNAPSHOT，不代表目前下載包已被驗證。

[伺服器設定原始碼](https://github.com/languagetool-org/languagetool/blob/master/languagetool-server/src/main/java/org/languagetool/server/HTTPServerConfig.java)顯示遠端規則、快取與資料庫記錄選項。這次只讀到移動中的master部分檔案，尚未取得固定commit，因此不能聲稱完成全程資料流或所有記錄檢查。

## 處置

值得做有界可行性實測，尚不具公開資格。下一步先固定官方版本與雜湊，再核對被動句規則的啟用方式及有效設定。初測使用直接loopback API與合成文本，避免先引入附加元件和其雲端路徑；不開公開連接埠、不改防火牆。JSON附明確的版本、功能、對外連線、記錄與清理門檻，全部標為尚未實測。

這不是要求現在安裝或購買。沒有取得可重現版本前，不把本機架構或dbLogging=false當成隱私保證；也不移用雲端產品的身分、權利或準確率。Hemingway與Antidote維持既有待查狀態，不再要求重複Hemingway截圖。

## 存取限制

GitHub原始碼索引下載未執行：本機網路解析失敗，提升權限後的自動審查又逾時，並非安全性否決。改由官方網頁完成有限文件審查；大型英文規則檔無法完整讀取，沒有偽稱已取得commit或完整原始碼。未安裝、執行或啟動任何LanguageTool軟體。

本包僅研究紀錄，不含SQL、不改引擎、不新增產品屬性或公開資格。
