# PR5.73 — 隱私寫作：自動改寫邊界與網頁留存觀察

乾淨實際版本8841aa9已核對，使用者截圖顯示Production91成功。公開仍21/9/1，零個隱私合格候選。本包不改引擎、既有研究、產品屬性或SQL。

## Antidote：校對畫面也可能啟動改寫

官方Antidote12文件支持英文被動句檢視，但同時說明Correction模式內可自動提出Reformulation，相關設定預設開啟。因此PR5.72提出的本機Correction路徑，必須加上「核對自動改寫控制」這一步，不能只以沒有切換到Reformulation畫面為準。[設定文件](https://www.antidote.info/en/documentation/user-guide/settings/corrector-settings/general-panel)、[被動句文件](https://www.antidote.info/en/documentation/user-guide/the-corrector/the-correction-prism/style-view/constructions)。

同步另有多個分類與新字典/規則自動同步選項，需逐項記錄。[同步文件](https://www.antidote.info/en/documentation/user-guide/settings/interface-settings/sync-panel)。本次沒有已授權安裝版實測、購買或註冊；設定清單是驗證方案，不是已套用或已證明不傳輸。

## Hemingway：本次確實看見什麼

在內建瀏覽器免費頁輸入兩句合成被動句，畫面標出was written與was sent，顯示12字、2個weakeners。重新載入仍保留同文；手動改成主動句後顯示8字、0個weakeners。清空後重新載入顯示空白起始提示，再關閉暫存分頁。證明截圖附在更新包evidence/。

這是同一瀏覽器設定檔的畫面觀察，不是全新設定檔或網路測試。工具沒有請求內容擷取介面，因此未取得請求、儲存鍵值或伺服器紀錄；不能據此宣稱本機處理、不傳輸、沒有追蹤或所有副本已刪除。

## 下一步：一次可判讀的匿名網路紀錄

在Chrome無痕開啟免費Hemingway頁，保持未登入、不啟用Plus試用：

1. 開啟開發者工具的Network頁，勾Preserve log，選All；記錄Cookie選擇，重新載入建立起始紀錄。
2. 清除範例，只輸入JSON中的兩句合成被動句；記錄新增請求的目的網域、路徑、類型、時間及Payload是否含測試句。也檢查WebSocket等持續連線，不只Fetch/XHR。
3. 手動改成JSON中的主動句並重新載入，分別記錄結果。對編碼、壓縮或不透明內容標未知，不當成「沒有文字」。
4. Application頁只記錄測試文字是否出現在本機儲存；清空編輯器再重新載入，核對可見文本與儲存殘留。不要清除其他網站資料。
5. 回傳去識別的摘要表或截圖即可：階段、目的網域/路徑、是否包含合成句、儲存殘留、未知項目。移除Cookie、Authorization、Token、電子郵件與其他頁籤資訊，不需傳完整HAR。

短時間網路觀察仍不能證明伺服器留存期限或永久沒有傳輸。這一步補的是目前缺失的操作證據，不是公開核准。Antidote若沒有既有使用權，暫不安裝或購買，先保留文件路徑。
