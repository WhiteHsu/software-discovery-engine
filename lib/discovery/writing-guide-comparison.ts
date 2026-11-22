const subscription = "grammarly-alternatives-without-a-subscription";
const privacy = "privacy-friendly-grammarly-alternatives";

type Language = "en" | "zh";
type Copy = Record<Language, readonly [string, string, string]>;

const subscriptionRows: Record<string, Copy> = {
  "grazie-free-browser": {
    en: ["Install the Chrome extension and check its account requirements before relying on it.", "Basic English highlighting in Gmail was reviewed. AI rewrite quotas were not established.", "Try a sample email in Gmail and check what is flagged before relying on the extension in another editor."],
    zh: ["安裝 Chrome 擴充功能，採用前先確認帳號要求。", "已查核 Gmail 內的基本英文標示。AI 改寫用量未確認。", "先用一封範例郵件看看 Gmail 內會標示哪些問題，再確認其他編輯器是否符合需求。"],
  },
  "hemingway-classic": {
    en: ["Paid Classic Editor 3 for Windows or Mac. Verify activation requirements before buying.", "One-time desktop purchase for readability editing. Plus AI is separate.", "Try your usual draft format and check whether the desktop version preserves the formatting you need. Free Web results do not establish Classic behavior."],
    zh: ["Windows 或 Mac 付費 Classic Editor 3。購買前先確認啟用要求。", "一次購買的可讀性編輯工具。Plus AI 另計。", "用平常的草稿格式確認桌面版能否保留所需格式。免費網頁版的結果不能直接套用到 Classic。"],
  },
  "hemingway-free-web": {
    en: ["Paste a draft into the browser editor.", "Free readability highlights and manual editing. Plus AI rewriting is separate.", "Revise one highlighted sentence yourself. If you mainly need grammar corrections, compare the results with a dedicated grammar checker."],
    zh: ["將草稿貼進瀏覽器編輯器。", "免費提供可讀性標示與手動編輯。Plus AI 改寫另計。", "挑一句被標示的句子手動修改。若主要需要文法校正，可和專用文法檢查器比較結果。"],
  },
  prowritingaid: {
    en: ["Use a free web account and open the browser editor.", "Reviewed limit: 500 words per run and two runs per line-editing report per day.", "Start with a short draft. Use the dedicated Style Report when checking passive voice, and compare it with the general summary."],
    zh: ["使用免費網頁帳號，開啟瀏覽器編輯器。", "已查核的上限為每次 500 個英文單字、每項逐行編輯報告每日兩次。", "從一篇短稿開始。檢查被動語態時，開啟專用 Style Report，並與一般摘要核對。"],
  },
  "real-write-passive-checker": {
    en: ["Paste text into the standalone web checker. The reviewed tool was available without signing in.", "Reviewed input limit: 3,000 characters. Checks passive voice.", "Try one active sentence and one passive sentence before editing a full draft. Read the highlights in context, especially when the summary looks inconsistent."],
    zh: ["將文字貼到獨立網頁工具。查核時可免登入使用。", "已查核的輸入上限為 3,000 字元。專查被動語態。", "先用一句主動句和一句被動句確認標示，再處理整篇草稿。摘要有矛盾時，回到句子上下文判斷。"],
  },
};

const privacyRows: Record<string, Copy> = {
  "languagetool-local-cli-6-6": {
    en: ["Java and pinned LanguageTool 6.6 CLI with English text on standard input. No server or client in the reviewed setup.", "The reviewed rules run locally. JSON and diagnostics can expose text to the caller; retention was not verified.", "Before checking sensitive text, use a dummy paragraph to inspect what your shell or wrapper captures from standard output and error."],
    zh: ["使用 Java 與固定版本的 LanguageTool 6.6 CLI，從標準輸入讀取英文文字。查核未使用伺服器或用戶端。", "已查核規則在本機執行。JSON 與診斷資訊可能把文字交給呼叫端，保留方式未驗證。", "送入敏感文字前，先用範例段落確認終端機或包裝程式會擷取哪些輸出。"],
  },
  "vale-local-passive-3-24-0": {
    en: ["Vale 3.24.0 with the pinned Microsoft.Passive rule and explicit configuration. No pipeline or external NLP in scope.", "The reviewed plain-text check runs locally. JSON contains text; caller retention was not verified.", "Confirm which configuration and rules are loaded using a dummy paragraph before reusing this setup in another project."],
    zh: ["使用 Vale 3.24.0、固定版 Microsoft.Passive 規則與明確設定。範圍不含管線或外部 NLP。", "已查核的純文字檢查在本機執行。JSON 含原文，呼叫端保留未驗證。", "在其他專案重用設定前，先用範例段落確認載入的規則及設定。"],
  },
  "write-good-local-library-1-0-8": {
    en: ["Node integration with npm package 1.0.8 and a fixed options object. Pass plain text to the library.", "The reviewed call returns text-bearing suggestions in memory. Logging and storage by the calling app were outside scope.", "Check how your own integration handles the returned suggestions, especially logging or forwarding results to another service."],
    zh: ["整合 Node、固定 npm 套件 1.0.8 及選項物件後，將純文字交給函式庫。", "已查核呼叫會在記憶體回傳含原文的建議。呼叫端記錄及儲存不在查核範圍。", "確認整合程式如何處理回傳的建議，尤其是寫入紀錄或轉送其他服務。"],
  },
};

const copy = {
  en: {
    subscription: ["Account and input", "Free limits or purchase", "Try before switching", "Start with an ordinary draft and check whether the tool covers the edits you need before paying or moving your workflow."],
    privacy: ["Local setup and input", "Processing and retention scope", "Check what your setup saves", "Use a dummy paragraph first and inspect output, logs and any editor integration. The evidence covers only the pinned local operations shown here."],
  },
  zh: {
    subscription: ["帳號與輸入方式", "免費用量或購買條件", "轉用前先試一篇草稿", "用一篇平常會寫的草稿，確認工具能處理哪些修改，再決定購買或轉移工作流程。"],
    privacy: ["本機設定與輸入", "處理位置與保留範圍", "確認你的設定會留下什麼", "先用範例段落檢查輸出、紀錄與編輯器整合。證據僅涵蓋表中的固定版本與本機操作。"],
  },
};

export function writingGuideComparison(slug: string, products: string[], language: Language) {
  const rows = slug === subscription ? subscriptionRows : slug === privacy && language === "en" ? privacyRows : undefined;
  if (!rows || !products.length || !products.every(product => Object.hasOwn(rows, product))) return undefined;

  const [firstColumn, secondColumn, heading, guidance] = copy[language][slug === subscription ? "subscription" : "privacy"];
  return {
    firstColumn,
    secondColumn,
    heading,
    guidance,
    row: (product: string) => rows[product][language].slice(0, 2),
    workflow: (product: string) => rows[product][language][2],
  };
}
