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
} as const;

export function noteWorkspaceCopy(slug: string, language: "en" | "zh") {
  return slug === "anytype" || slug === "appflowy" ? copy[slug][language] : undefined;
}
