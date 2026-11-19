const copy = {
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
