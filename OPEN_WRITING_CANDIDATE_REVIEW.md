# PR5.88 — 開放原始碼候選初查

使用者回覆目前沒有／不確定具備Antidote12安裝版與使用權，因此暫緩其實測，不要求購買。PR5.87原始紀錄保持原樣。

write-good列為下一個優先來源候選：官方README描述英文被動句提示，固定原始碼6940b034c6f5a7e101c01a24d651a778fc3fe435可見預設passive檢查。主模組會載入其他檢查依賴；關閉檢查不等於未載入依賴。回傳提示包含匹配文字，CLI會列印標註，直接文字參數另涉及命令列可見性。這些是要界定的資料出口，不能只因為一份程式沒有網路呼叫就判定整體隱私合格。

下一步先固定依賴版本、檢視passive偵測與完整選定資料路徑，再做小型合成測試；本輪沒有安裝或執行第三方程式。MIT與1.0.8來自目前master套件中繼資料，尚未驗證發行套件一致性。不使用浮動npx，也不把外掛沿用為本機證據。

Vale CLI官方首頁描述離線及MIT；另有託管CMS，必須分開。CMS頁面被動句規則範例，不能當成預設CLI已有該功能。本輪尚未選定本機規則與版本，列次要待查。

兩個候選來源都尚未合格；不把同引擎的移植或設定變體湊成三款產品。公開21／9／1、隱私路線暫緩保持。沒有修改產品屬性、圖譜、SQL或發佈。JSON記錄來源、限制與後續步驟。

來源：[write-good](https://github.com/btford/write-good)、[固定主模組](https://github.com/btford/write-good/blob/6940b034c6f5a7e101c01a24d651a778fc3fe435/write-good.js)、[固定CLI](https://github.com/btford/write-good/blob/6940b034c6f5a7e101c01a24d651a778fc3fe435/bin/write-good.js)、[Vale](https://vale.sh/)、[CMS](https://vale.sh/cms)。
