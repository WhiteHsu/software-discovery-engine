# 導流準備盤點 — Launch-01 / 2026-10-21

基準：使用者已推送 ff021d7，並提供 Production 成功紀錄。此盤點以本機現有程式、PRODUCT_SPEC.md、VALIDATION_PLAN.md 及既有 owner 驗收紀錄為依據。GitHub #6–#9 本文未能取得，因此以下是規格對照，不代表已完整核對每個 Issue 的最新文字。歷史 STATUS 段落描述當時狀態，以本表及各較新的驗收紀錄判斷現況。原規格不變。

## 工作界線

#5 Escape Route Engine 的十路線發布里程碑已完成。PR5.105 已記錄可供 owner 審核結案；後續 PR5 編號不等於 #5 新增驗收條件。24 個產品、10 條路線、0 條待補是既有 owner 發布驗收的紀錄，不是本次重新查詢正式資料庫的結果。不要重跑已完成的匯入或發布 SQL。

## #6–#9 對照

| 範圍 | 已有成果 | 導流前必須補齊或驗收 | 可延後 |
| --- | --- | --- | --- |
| #6 首頁與導覽 | 公開比較路線目錄、產品入口、Hidden Gems 三個編輯選品及既有正式 UI 驗收 | Launch-01 補軟體/需求交集篩選、首頁核心文案；需正式部署驗收。自然語言入口待 #7 成品串接。Popular 區塊的最新 Issue 要求仍需對照，沒有流量依據時不宣稱人氣排名 | 個人化、擴大分類、依行為排序 |
| #7 自然語言探索 | 十路線規則、公開產品 RPC、確定性品質與排序邊界可重用 | 尚無 search 頁面/API/parser。需完整最小流程：文字→有界意圖→公開資料圖譜→符合全部必要條件的候選→理由/取捨；處理未知意圖、無結果、錯誤、逾時；結果 noindex。模型不能自行產生產品 | 聊天、多輪記憶、自由推薦、向量服務 |
| #8 探索分析 | 四種事件：產品曝光/點擊/瀏覽/外連；Escape/Hidden Gems 分開計算；限流、私人儲存、清理排程、QA 排除；DNT/GPC、鍵盤/中鍵、手機及未曝光點擊已有驗收 | 缺通用頁面/路線瀏覽、搜尋/意圖/結果曝光、軟體與條件選擇事件；producer 目前不帶 referrerHost，雖 schema 容許欄位。需最小來源歸因與事件版本/接收/儲存/統計一致擴充；收斂可見性中斷驗收；正式啟動前開啟 producer 並驗證健康/排除 QA | 創作者報表、完整跨站歸因、帳號與跨裝置追蹤 |
| #9 SEO/GEO | canonical、robots、動態 sitemap、草稿/別名 noindex 已實作並有既有正式驗收；sitemap 曾驗收 36 個網址 | Launch-01 篩選頁 noindex 與首頁 canonical；#7 搜尋頁 noindex；檢查現有產品/路線機器可讀資訊對規格的覆蓋。正式提交 sitemap / Search Console 所有權與實際索引狀態尚未在本輪核實 | 大量自動 SEO 頁面、擴大結構化資料；不可捏造評分/價格 |

程式依據：app/page.tsx、lib/discovery/navigation.ts、lib/discovery/escapes.ts、lib/discovery/escape-model.ts、lib/discovery/privacy-route.ts、app/hidden-gems/page.tsx、lib/analytics/events.ts、components/DiscoveryTracker.tsx、lib/analytics/metrics.ts、lib/discovery/seo.ts、app/sitemap.xml/route.ts。

## 收斂後的執行順序

1. Launch-01：交付 #6 導覽及此盤點，保留 #5 結案核對表。這次不擴充事件或變更 DB。
2. 下一個開發批次專注 #7 完整搜尋流程，串接首頁入口與 noindex。先確認可用的既有模型設定/部署方式，服務端金鑰不得送到瀏覽器。先建可測契約與假模型測試，不把硬編碼搜尋宣稱為自然語言模型解析完成。
3. 依最終搜尋/導覽互動，一次補齊 #8 事件與統計，避免每新增一個測試就重做整套發布。新事件需要獨立的可審核資料庫更新，不能直接送入現有只接受四種事件的 collector。
4. 對更新後網站做一次 #6–#9 整合驗收：首頁/分類/自然語言→產品→官方網站，桌面與手機、無結果、失敗、隱私退出、索引訊號及測量一致。
5. #10/#11：補足並審核至少 30 個 verified products 的整體內容門檻（目前 24，至少差 6），確認 5 anchors、至少 10 attributes、品質與正式部署，記錄 Day 0。凍結規格要求 Issue11 完成後才開始 30 天正式觀察期；本次不宣告已開始。

搜尋與必要測量是目前主要開發路徑。首頁/SEO 的既有成果直接沿用。無需等搜尋排名或自然流量達標才開始實驗；索引健康與結果是後續觀察事項，不得把成功部署當作需求證據。

## 本批驗證及限制

61 個 Node 測試、TypeScript（production build 內）、針對變更檔案的 ESLint、webpack production build 通過。包含舊有 53 項，加 5 個核心 escape 測試及 3 個導覽測試。正式 UI 尚待 owner 部署後驗收。

本機未帶入 Supabase 或 OpenAI 金鑰。瀏覽器確認窄視窗排版、原生選單、送出 GET 表單、保留選項及 Clear filters 入口；HTTP 檢查四種首頁/篩選網址皆為 200、canonical 指向首頁、開發環境 noindex/nofollow，後端不可用時顯示中性錯誤。真實資料的篩選結果由純函式測試驗證，未假稱本機已連正式資料庫。這不是實機手機或正式網域索引驗收。

保持 ANALYTICS_PRODUCER_ENABLED=false、ANALYTICS_PURGE_ENABLED=false。不變更正式 DB、排程、權限、憑證或產品發布。
