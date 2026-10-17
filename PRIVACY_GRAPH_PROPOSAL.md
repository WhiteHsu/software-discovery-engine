# PR5.99 — 真正seed契約的選擇性草稿

基準a28a62c；使用者截圖Production116。三款PR5.98限定聲明轉為實際seed契約資料：3個獨立版本產品、12項屬性、3項有範圍的Grammarly替代關係及3項隱私路線成員。來源、日期、信心與定價／取捨保留。基準由既有歷史draft builder重建，不讀取或覆寫production；不能把此完整歷史草稿直接匯入。

新增Reviewed Local Operation文字屬性，把每款版本、條件及排除範圍真正存入seed可投影欄位，而非只在研究JSON放臨時scope。隱私boolean必須搭配這段文字；來源關係及條件仍需審查顯示。不能只顯示Yes就對外發佈。

lib/discovery/privacy-proposal.ts提供可重用檢查：指定產品版本及條件文字必須與已審profile完全相符，anchor限定英文被動句操作，六軸有日期／來源且實質未知已處理，並沿用原有verified、定價／取捨及信心門檻。新helper只在草稿builder使用，沒有接入正式路線或修改舊escape-model／歷史source pins；不可誤認正式引擎已補上範圍保護。

執行builder會於.seed-output/privacy-graph-proposal產生bundle、product-preview與report。語義validator驗證真正契約；三款draft合格、published候選0、publishable=false、liveCollisionChecked=false。所有原產品與其他路線維持位元組語義相同。新回歸會拒絕不同版本／條件、範圍錯誤、likely隱私與實質未知，也拒絕未審改動。

本輪不產生SQL、不匯入、不公開，公開21／9／1及正式隱私圖譜0不變。下一步審查實際預覽、整合production讀取／顯示／資格門檻及必要scope資料，再另做live collision檢查與選擇性匯入提案。所有原歷史紀錄維持不變。
