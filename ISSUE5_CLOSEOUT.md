# Issue #5 結案核對 — 2026-10-21

依 owner 提供的 Issue #5 本文，13 項條件對照如下。此表準備結案審核，不代表已關閉 GitHub Issue 或本輪重查正式 DB。

| 驗收條件 | 程式/測試/證據 |
| --- | --- |
| /escape/[slug] | app/escape/[slug]/page.tsx；getEscape 只載入登記且核准的公開路線 |
| 全部十條路線 | escapeDefinitions；acceptedPublicationAudit 重算既有 owner 驗收：10 accepted、0 remaining |
| 每條至少三個合格候選 | publishable、getEscape；escape-model.test.mjs；accepted-publication-audit.test.mjs |
| 比較介面 | 路線頁的比較表 |
| 限制符合程度可見 | 比較表及逐產品 fit/evidence |
| 推薦理由 | 路線頁 Why these products fit 與 reasons |
| 取捨 | trade-off-summary 及比較表 |
| 結構化圖譜排序 | 公開資料庫 RPC、rankEscapeCandidates、rankCandidates |
| 品質門檻先於 novelty | 品質至少 .80，無效證據不能以 novelty 補救；核心測試通過 |
| 受控 novelty 優勢 | 合格候選最多 .05 加分；越界值不當作有效加分 |
| 人氣非主要排序 | 排序使用資格/品質/有界 novelty，slug 決定同分順序 |
| 驗證資訊可見 | 比較表日期與逐證據檢查日期 |
| 連到相關產品頁 | 比較表及候選卡產品頁連結 |

PRIVACY_PUBLICATION_ACCEPTANCE.md / PR5.105 已記錄公開24產品/10路線發布里程碑與 owner SQL/UI 驗收，可供 owner 審核 #5 結案。Launch-01 在 C 槽副本重新執行的核心與 accepted-publication 測試通過，包括預設報告完成；先前在 D 槽測試受報告寫入權限限制的情況不是核心排序失敗。

尚需：將既有正式驗收記錄對應到 Issue，並確認最新部署十條路線、至少三候選、表格/理由/範圍/日期/產品連結仍正常。已充分覆蓋的舊證據可沿用；若最新部署有差異只補查差異。若無缺口即可由 owner 關閉 #5，不需要等待自然語言搜尋、分析擴充、SEO 成效或30產品門檻。
