# PR5.89 — write-good被動句依賴驗證

基準db9a12c，使用者截圖Production106。只測write-good使用的passive-voice0.1.0依賴，不是完整write-good、CLI或外掛。沒有安裝npm套件、跑生命週期腳本或使用真實文章。

已從官方npm登錄取得固定壓縮檔，以登錄SHA512核對完整性，再讀取模組原始碼與開發者測試。模組無執行期依賴；完整write-good仍有其他預先載入的模組，尚未核對。登錄目前只有0.1.0符合^0.1.0，但這不是完整依賴鎖定。

| 合成案例 | 提示數 | 意義 |
|---|---:|---|
| was reviewed by | 1 | 簡單規則被動句可提示 |
| was written by | 1 | 此不規則分詞可提示 |
| editor reviewed | 0 | 手動改為主動後此例無提示 |
| was carefully reviewed | 0 | 副詞間隔造成漏判 |
| got reviewed | 0 | 此get被動句漏判 |
| door is closed | 1 | 狀態／被動解讀需人判斷 |
| is running | 0 | 此進行式未誤標 |
| is indeed active | 0 | 特例排除有效 |

這是八個控制案例，不是語言準確率測量。已檢視的模組只回傳數字位置與長度，未見直接檔案、網路或輸出呼叫；不能延伸為完整程式沒有傳輸或留存。測試使用Node VM情境，不宣稱作業系統隔離。先前write-good主模組會把匹配文字放進提示原因，CLI另有文字輸出，仍要分開核對。

資料紀錄包含壓縮檔與模組SHA256、登錄完整性、版本、八個合成結果和限制；不將原始依賴程式或壓縮檔納入專案更新包。審查檢查器驗證紀錄一致性與公開狀態，不會下載或重新執行第三方模組。

候選維持待查：21／9／1、零隱私合格不變。下一步若繼續此候選，需完成其餘固定依賴與完整函式流程；不把此依賴另算一款產品。

來源：[精確版本登錄](https://registry.npmjs.org/passive-voice/0.1.0)、[官方固定套件](https://registry.npmjs.org/passive-voice/-/passive-voice-0.1.0.tgz)、[write-good固定主模組](https://github.com/btford/write-good/blob/6940b034c6f5a7e101c01a24d651a778fc3fe435/write-good.js)。
