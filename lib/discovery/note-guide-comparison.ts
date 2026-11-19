const guides = {
  "offline-notion-alternatives": {
    en: ["What works without a connection", "What still needs a connection", "Check before going offline", "Open a sample page and its attachments before disconnecting. Then edit the page and reopen the attachments offline. Test sync and import separately once you reconnect."],
    zh: ["斷網時能做什麼", "哪些操作仍需連線", "出門前先做一次斷網測試", "斷網前先開啟一則範例頁面及附件。斷網後再試著編輯頁面、重新開啟附件。恢復連線後，再分開檢查同步與匯入。"],
    rows: {
      affine: {en: ["After installation, use documents, databases and whiteboards stored in the desktop workspace.", "Cloud sync and collaboration need a connection. Browser and mobile capabilities may differ."], zh: ["安裝桌面版後，可使用工作區中儲存在本機的文件、資料庫和白板。", "雲端同步與協作需要連線；瀏覽器及行動版的可用功能可能不同。"]},
      anytype: {en: ["After initial setup, work on notes and objects already on the device.", "Sync in the normal local-first mode and Notion import need connectivity. The separate local-only mode requires manual backups."], zh: ["完成初始設定後，可在斷網時處理已存於裝置上的筆記與物件。", "一般本機優先模式的同步及 Notion 匯入需要連線。另有僅限本機模式，須自行備份。"]},
      appflowy: {en: ["Use notes and other content already available in the installed workspace.", "Cloud sync and hosted Notion ZIP import need connectivity. Offline access to every cloud page and attachment remains unverified."], zh: ["可在已安裝的工作區中使用本機已可存取的筆記與其他內容。", "雲端同步和託管 Notion ZIP 匯入需要連線。所有雲端頁面與附件能否離線開啟，仍未驗證。"]},
    },
  },
  "account-free-note-taking-apps": {
    en: ["Start without an app account", "Separate setup for sync or backup", "Check whether notes stay on the device", "In the installed desktop app, skip account creation and write a sample note. Close and reopen the app to check that the note is still there. Decide how you will back it up before adding important notes."],
    zh: ["免註冊即可開始的操作", "同步與備份的額外設定", "確認筆記會留在裝置上", "安裝桌面版後略過註冊，建立一則範例筆記。關閉再重開程式，確認筆記仍在。開始存放重要筆記前，先決定如何備份。"],
    rows: {
      affine: {en: ["Create a local desktop workspace and write a note without signing in.", "Cloud sync and collaboration have separate sign-in requirements."], zh: ["不用登入，即可在桌面版建立本機工作區並寫筆記。", "雲端同步及多人協作另有登入要求。"]},
      obsidian: {en: ["Create or open a local vault and save a Markdown note without registering.", "The reviewed workflow uses local files. Optional Sync and Publish are separate paid services."], zh: ["不用註冊，即可在本機建立或開啟 vault，並儲存 Markdown 筆記。", "本次查核範圍是本機檔案。選用 Sync 或 Publish 須另外付費。"]},
      "standard-notes": {en: ["Write and keep plain-text notes in the local desktop app without registering.", "Account-free notes do not sync. Set an Application Passcode to enable encryption in this mode and arrange your own backups."], zh: ["不用註冊，即可在桌面版建立並保留本機純文字筆記。", "免帳號時筆記不會同步。在此模式下須設定應用程式密碼才能啟用加密，備份也要自行處理。"]},
    },
  },
  "simple-notion-alternatives": {
    en: ["What to set up before the first note", "How to organize everyday notes", "Try the simplest setup first", "Create and organize a few sample notes without adding plugins or custom database views. Check whether notebooks, a vault folder, or tags make those notes easy for you to find again."],
    zh: ["寫第一則筆記前要做什麼", "平常怎麼整理筆記", "先試最簡單的設定", "先用幾則範例筆記試做，暫時略過外掛及自訂資料庫檢視。用筆記本、vault 資料夾或標籤整理後，再試著找回剛才的筆記。"],
    rows: {
      joplin: {en: ["Open the desktop app and create a notebook. The reviewed workflow needs no custom database or server.", "Keep related notes in notebooks. Learn Markdown or set up sync if your workflow needs it."], zh: ["開啟桌面版並建立筆記本。這套已查核的流程無須自訂資料庫或架設伺服器。", "用筆記本分組整理。需要時再學 Markdown 或設定同步。"]},
      obsidian: {en: ["Create or open a local vault folder. Community plugins are optional for basic notes.", "Save Markdown files in the vault and use folders to group them. Expect to learn what a vault is."], zh: ["先建立或開啟本機 vault 資料夾。記基本筆記時可略過社群外掛。", "在 vault 內儲存 Markdown 檔案，再用資料夾分類。初次使用要先熟悉 vault 的概念。"]},
      simplenote: {en: ["Create an account and verify your email before using the desktop app.", "Use tags to organize text notes. The reviewed workflow has no file attachments."], zh: ["先註冊並驗證電子郵件，再使用桌面版。", "用標籤整理文字筆記。查核的流程不支援檔案附件。"]},
    },
  },
} as const;

type Language = "en" | "zh";
type Guide = {
  [K in Language]: readonly [string, string, string, string];
} & {rows: Record<string, Record<Language, readonly [string, string]>>};

export function noteGuideComparison(slug: string, products: string[], language: Language) {
  const guide: Guide | undefined = Object.hasOwn(guides, slug) ? guides[slug as keyof typeof guides] : undefined;
  if (!guide || !products.length || !products.every(product => Object.hasOwn(guide.rows, product))) return undefined;
  const [firstColumn, secondColumn, heading, guidance] = guide[language];
  return {firstColumn, secondColumn, heading, guidance, row: (product: string) => guide.rows[product][language]};
}

