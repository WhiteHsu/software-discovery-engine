const copy = {
  gimp: {
    zh: {
      description: "GIMP 適合在桌面上修照片與合成圖層。若原稿是相機 RAW，先確認相容的外部 RAW 工具與匯入方式。若要送印，先向印刷廠確認交付格式與色彩描述檔。",
      heading: "先用一張照片跑完修圖與輸出",
      guidance: "以一張 JPEG 試做：複製底圖圖層，在副本上調整亮度和對比，再切換圖層可見性確認差異。匯出另一份檔案並重新開啟，檢查尺寸和色彩。若要交付 CMYK，請核對印刷廠要求。既有查核顯示 GIMP 的 CMYK 匯入與匯出流程仍以 RGB 儲存，原生 CMYK 編輯未經驗證。",
    },
  },
  krita: {
    en: {
      description: "Krita is a digital painting tool for building illustrations in layers. Keep a native project for revisions and check a separate PSD when a collaborator needs that format.",
      heading: "Keep a Krita master and check the PSD handoff",
      guidance: "Build a small illustration with separate sketch, color and caption layers, then save the editable master as a .kra file. Save a copy as PSD and reopen it in the app that will receive it. Check layer order, blend modes and text editability. If you used masks or filters, check those too. The manual documents supported PSD elements, and results can vary with the file and the receiving app.",
    },
  },
  "paint-net": {
    zh: {
      description: "Paint.NET 適合在 Windows 上做圖層編輯與基本色彩調整。用 PDN 保存可回頭修改的原稿，再依用途匯出交付檔。",
      heading: "用 PDN 保留圖層，再匯出交付檔",
      guidance: "以有透明背景的產品圖為例，把底圖與修飾內容分開放在兩層，先存成 .pdn。需要保留透明背景時，另存 PNG，再重新開啟核對尺寸、邊緣與透明區域。之後要分層修改時，回到 PDN 原稿。",
    },
  },
  "stirling-pdf": {
    zh: {
      description: "選擇 Stirling PDF 前，先決定要在自己的電腦執行、連到自行管理的伺服器，還是使用託管服務。自架在遠端伺服器時，檔案仍會送到該伺服器。",
      heading: "先確認 PDF 會送到哪裡處理",
      guidance: "先核對瀏覽器開啟的是本機、自架伺服器或託管服務的網址。用一份不含敏感資料的多頁 PDF 擷取其中一頁，下載後另開確認頁數及方向。若需要在自己的電腦處理，請確認這次操作使用的是該電腦上的部署，再處理正式文件。",
    },
  },
  "foxit-pdf-editor": {
    en: {
      description: "For a one-time purchase, check the Windows perpetual edition of Foxit PDF Editor and the version covered by the license. Check the terms for future upgrades and online features separately.",
      heading: "Check what the license covers, then test a copy",
      guidance: "Before buying, confirm that the quoted Windows edition covers the page tools you need. In an available licensed copy, reorder or rotate pages in a representative PDF and save under a new name. Reopen it to check page order and orientation. If your documents rely on bookmarks, forms or annotations, check those in the saved copy too. These are checks to run on your own files.",
    },
    zh: {
      description: "若要一次買斷 Foxit PDF Editor，先核對 Windows 永久授權適用的版本。後續升級與線上功能的條件請分開確認。",
      heading: "先核對授權，再用副本檢查輸出",
      guidance: "購買前確認報價所列的 Windows 版本涵蓋你需要的頁面工具。若已有授權版，用一份代表性 PDF 的副本重新排序或旋轉頁面，另存後重新開啟，核對順序及方向。如果工作文件會用到書籤、表單或註解，也請在另存的檔案中逐一確認。",
    },
  },
  "pdf-xchange-editor": {
    zh: {
      description: "PDF-XChange Editor 的免費使用範圍和付費授權功能有別。拿來整理 PDF 頁面前，先確認目前安裝的 Windows 版本及授權涵蓋哪些操作。",
      heading: "存正式文件前，先查功能是否需要授權",
      guidance: "先用不含敏感資料的副本試做你要的操作，例如擷取指定頁面。留意工具的授權標示與儲存提示。若操作需要付費授權，先核對適用版本，再決定是否購買。另存後重新開啟，核對頁數、順序與是否出現試用浮水印，再決定能否交付。",
    },
  },
  "write-good-local-library-1-0-8": {
    en: {
      description: "write-good 1.0.8 is a Node library for adding English prose suggestions to a script or app. The reviewed call takes a string and returns suggestions in memory.",
      heading: "Pass a sample sentence to the Node library",
      guidance: "Load the pinned package and pass a string such as “The report was written by Mira.” with your fixed options object. Inspect the returned suggestions in memory and use the feedback to decide whether to try “Mira wrote the report.” The reviewed call can return suggestions containing input text. Check whether your own integration logs or stores them.",
    },
    zh: {
      description: "write-good 1.0.8 是可整合進 Node 程式的英文寫作函式庫。已查核的呼叫方式接收文字字串，並在記憶體中回傳建議。",
      heading: "把一句範例交給 Node 函式庫",
      guidance: "載入固定版本，將「The report was written by Mira.」這類字串連同固定選項物件傳給函式庫。先在記憶體查看回傳建議，再判斷是否要手動改成「Mira wrote the report.」。建議可能包含輸入原文，請確認你的整合程式是否會記錄或儲存回傳內容。",
    },
  },
  "vale-local-passive-3-24-0": {
    zh: {
      description: "Vale 3.24.0 適合把固定的文體規則放進本機檢查流程。本站查核的設定只啟用 Microsoft.Passive 規則。",
      heading: "用固定設定檢查一句被動語態",
      guidance: "準備明確的本機設定，指定固定版本的 Microsoft.Passive 規則，停用全域設定，並維持查核所用的條件：不啟用管線來源、NLP 端點留空。從標準輸入送入「The parcel was sent by Leon.」，查看 JSON 的規則名稱與標示片段。輸出可能含原文，請確認呼叫端會把結果存在哪裡。",
    },
  },
  "languagetool-local-cli-6-6": {
    zh: {
      description: "LanguageTool 6.6 可透過 Java 直接在命令列查核英文文字。本站查核的是固定版 CLI 從標準輸入讀取資料的本機流程。",
      heading: "從標準輸入送出範例，再檢查 JSON",
      guidance: "使用固定的 6.6 發行套件及明確的英文設定，確認沒有注入額外 JVM 選項，且未啟用伺服器、用戶端或遠端規則資源。先從標準輸入送一段非敏感英文，例如「The report was written by Mira.」。檢查 JSON 回傳的標示與文字片段，也查看標準錯誤是否包含原文。這個範例用來確認輸出內容，實際標示依規則而定。",
    },
  },
  "hemingway-free-web": {
    zh: {
      description: "Hemingway 免費網頁版會標示英文草稿中較難讀的句子與可能的被動語態。你可以直接在瀏覽器裡修改，再看標示怎麼變化。",
      heading: "貼上一段草稿，先改一個難讀的句子",
      guidance: "以一段英文草稿試用。先挑一句較難讀的句子，試著拆成兩句；若句子因被動語態被標示，先判斷是否需要交代動作者。改完後再看標示，並讀一遍確認原意。本站既有的修改前後觀察限於免費網頁版。",
    },
  },
  "hemingway-classic": {
    zh: {
      description: "Classic Editor 3 是 Windows 與 Mac 的付費桌面版，購買後使用該版本無需持續訂閱。新版 AI 功能另屬其他方案。",
      heading: "購買桌面版前，先核對系統相容性",
      guidance: "先確認你的 Windows 或 macOS 版本符合官網的系統需求。若你的用途是在桌面上修英文稿，可依文件所述流程開啟草稿、檢視被動語態標示，再手動修句。本站尚未獨立驗證桌面版修改後的標示更新，也未驗證現行系統的相容性。",
    },
  },
  "healthy-minds-program": {
    zh: {
      description: "Healthy Minds Program 需要註冊。免費公開課程按覺察、連結、洞察與目的四個主題安排，適合想跟著學習路徑練習的人。",
      heading: "從一堂坐姿冥想開始",
      guidance: "註冊後，先找 Intro To Sitting Meditation。本站在 Android 抽測時可播放、暫停及續播，過程中未出現付款提示。試完後再按需求選主題，例如想練習留意當下的感受，可以從覺察開始。",
    },
  },
  medito: {
    zh: {
      description: "Medito 提供免費的語音引導課程，可沿著同一門課逐堂練習。官方說明核心內容可免帳號使用。",
      heading: "用 Learning to sit 試播第一堂課",
      guidance: "打開課程列表，選 Learning to sit 並播放。本站已在登入的 Android 環境確認這堂課可播放且未出現付款提示。如果你想免註冊使用，請在自己的裝置先略過登入，再確認同一堂課能否開啟和播放。",
    },
  },
  "smiling-mind": {
    zh: {
      description: "Smiling Mind 需要註冊，內容分為成人、家庭等類別。想試成人引導冥想，可以先找一堂呼吸練習。",
      heading: "在成人專區試播 Exploring the Breath",
      guidance: "登入後，從成人內容選擇 Exploring the Breath。本站在 Android 抽測時可播放、暫停及續播，過程中未出現付費或試用提示。若需要通勤時離線收聽，先在連線時下載，再開飛航模式試播同一堂課。",
    },
  },
  simplenote: {
    en: {
      description: "Simplenote keeps text notes organized with tags and syncs them through an account. It suits notes you can keep as text, since you cannot attach files.",
      heading: "Set up sync and check offline access before you rely on it",
      guidance: "Create an account and verify your email. Write a short note, tag it, and open it on the device you plan to take offline while you still have a connection. Disconnect and check whether that note is available to edit.",
    },
    zh: {
      description: "Simplenote 用標籤整理文字筆記，並透過帳號同步。適合只需要記文字的人，筆記無法附加檔案。",
      heading: "先設定同步，再確認筆記能否離線編輯",
      guidance: "先註冊帳號並驗證電子郵件。建立一則短筆記並加上標籤，趁有網路時在預計離線使用的裝置上開啟。斷網後再確認能否編輯同一則筆記。",
    },
  },
  anytype: {
    en: {
      description: "Organize notes and tasks as objects in a personal space. If you plan to keep everything on your own devices, decide how you will sync and back up that space.",
      heading: "Choose how to sync and back up your Anytype space",
      guidance: "Set up a small personal space and create a few objects. If you need local-only mode, check how you will make manual backups and whether local-network sync fits the devices you use."
    },
    zh: {
      description: "把筆記和待辦當作物件，在個人空間中整理。若打算將資料留在自己的裝置上，先決定如何同步與備份這個空間。",
      heading: "先決定如何同步與備份 Anytype 空間",
      guidance: "先建立小型個人空間並新增幾個物件。若需要僅限本機模式，請確認如何手動備份，以及區域網路同步是否適合你使用的裝置。"
    },
  },
  appflowy: {
    en: {
      description: "Use documents and a Kanban board in one workspace. If you are moving from Notion, check what the hosted import brings over and what remains available offline.",
      heading: "Check which imported pages and files work offline",
      guidance: "While connected, import a small Notion ZIP with a page and an attachment. Open both while online, then disconnect and check which items you can still open in the installed workspace."
    },
    zh: {
      description: "在同一個工作區用文件與 Kanban 看板整理工作。若要從 Notion 搬家，先確認託管匯入帶入了哪些內容，以及哪些內容斷網後仍可開啟。",
      heading: "檢查匯入的頁面與附件能否離線開啟",
      guidance: "連線時先匯入一份含頁面與附件的小型 Notion ZIP。在線上各開啟一次，再斷網確認哪些項目仍可在已安裝的工作區中開啟。"
    },
  },
  "2do": {
    zh: {
      description: "想買斷 2Do for Mac，先分清官網直購、Mac App Store 與 Setapp 的方案。",
      heading: "購買 2Do 前先核對通路與更新資格",
      guidance: "官網直購的 Mac 永久授權包含自購買日起 18 個月的更新。購買前，確認你需要哪些裝置的版本，以及更新資格到期後打算續購更新或保留最後符合資格的版本。",
    },
  },
  omnifocus: {
    zh: {
      description: "OmniFocus 4 可用原生 App 管理個人待辦。選版本前，先確認是否需要 Web 存取或 Pro 專屬功能。",
      heading: "確認 OmniFocus 的永久授權涵蓋哪些功能",
      guidance: "比較原生 Standard 與 Pro 時，先列出你會用到的功能和裝置。原生永久授權包含 4.x 更新；如果工作流程需要瀏覽器存取，請另外確認訂閱條件。",
    },
  },
  things: {
    zh: {
      description: "Things 3 可在 Apple 裝置上規劃個人待辦。先列出每天會用哪些裝置，再決定要買哪些版本。",
      heading: "按裝置計算 Things 3 的購買範圍",
      guidance: "Mac、iPhone 與 iPad 版分開購買，Things Cloud 同步不另收費。如果需要與別人即時共用清單，請先確認這個限制是否符合你的流程。",
    },
  },
  "grazie-free-browser": {
    en: {
      description: "Grazie Free gives English writing feedback in a browser. The reviewed workflow used its active-voice setting to check passive constructions in Gmail.",
      heading: "Check Grazie feedback in the editor you use",
      guidance: "In Chrome and Gmail, enable the English active-voice setting. Try a short draft containing a passive sentence, revise it manually, then recheck in the same editor. If feedback fails to load, record the editor and settings before retrying.",
    },
    zh: {
      description: "Grazie Free 在瀏覽器提供英文寫作回饋。既有查核是在 Gmail 啟用主動語態文體設定，再檢查被動語態。",
      heading: "在你常用的編輯器裡檢查 Grazie 回饋",
      guidance: "用 Chrome 開啟 Gmail 並啟用英文主動語態設定。試貼含被動句的短文，手動改寫後在同一個編輯器重新檢查。如果回饋載入失敗，先記下編輯器與設定。",
    },
  },
  "real-write-passive-checker": {
    en: {
      description: "Real Write highlights suspected passive constructions in a browser. Use the highlights to decide which sentences are worth reviewing.",
      heading: "Recheck sentence highlights after a manual edit",
      guidance: "Paste a short passage, choose one highlighted sentence, and revise it by hand. Compare the highlights before and after. Review individual sentences even when the summary reports a high active-voice score.",
    },
    zh: {
      description: "Real Write 在瀏覽器標示疑似被動語態的句子。先逐句看標示，再決定哪些句子值得修改。",
      heading: "手動改寫後，重新核對句子標示",
      guidance: "貼上一小段文章，挑一句有標示的句子手動改寫，再比對修改前後的標示。即使摘要顯示主動語態比例很高，也請逐句確認。",
    },
  },

} as const;

type Language = "en" | "zh";
type WorkflowCopy = {description: string; heading: string; guidance: string};
const workflows: Readonly<Record<string, Partial<Record<Language, WorkflowCopy>>>> = copy;

export function productWorkflowCopy(slug: string, language: Language) {
  return Object.hasOwn(workflows, slug) ? workflows[slug][language] : undefined;
}
