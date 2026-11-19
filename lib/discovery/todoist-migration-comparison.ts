export const todoistMigrationSlug = 'todoist-alternatives-with-a-one-time-purchase';

const migrations = {
  "2do": {
    "en": [
      "Connect your existing Todoist account to 2Do for Mac for two-way sync.",
      "Projects become lists. Sections, tasks, labels and supported repeat rules sync. Todoist deadlines, comments and attachments do not sync."
    ],
    "zh": [
      "在 2Do for Mac 連結既有的 Todoist 帳號，進行雙向同步。",
      "專案會成為清單，區段、待辦、標籤及支援的重複規則可同步。Todoist 的獨立截止期限、留言和附件不會同步。"
    ],
    "links": [
      [
        "2Do sync guide",
        "2Do 同步指南",
        "https://www.2doapp.com/docs/macos/sync-with-todoist/"
      ]
    ]
  },
  "omnifocus": {
    "en": [
      "Export a Todoist project as CSV, then map the fields you need to TaskPaper for import into OmniFocus. This workflow has not been tested here.",
      "TaskPaper can represent projects, tasks, notes, dates, tags and repeat rules. Check each field after conversion. Todoist CSV omits the start date of a recurring schedule."
    ],
    "zh": [
      "可先從 Todoist 匯出專案 CSV，再將所需欄位轉成 TaskPaper 匯入 OmniFocus。此流程尚未實測。",
      "TaskPaper 可表示專案、待辦、備註、日期、標籤與重複規則。轉換後需逐欄核對。Todoist CSV 不會保留重複排程的開始日期。"
    ],
    "links": [
      [
        "Todoist CSV export",
        "Todoist CSV 匯出",
        "https://www.todoist.com/help/account-and-billing/security/import-or-export-a-project-as-a-csv-file-in-todoist-YC8YvN"
      ],
      [
        "OmniFocus TaskPaper reference",
        "OmniFocus TaskPaper 參考",
        "https://support.omnigroup.com/omnifocus-taskpaper-reference/"
      ]
    ]
  },
  "things": {
    "en": [
      "Use the built-in Todoist importer to copy your data once. On Mac it requires macOS 14.4 or later.",
      "Projects and labels carry over, and comments become notes. Due dates become When dates. Rebuild recurring schedules and check flattened subtasks. Image attachments and priorities do not import."
    ],
    "zh": [
      "使用內建的 Todoist 匯入工具一次複製資料。Mac 版需要 macOS 14.4 或以上。",
      "可保留專案與標籤，留言轉成備註，到期日轉成 When 日期。重複排程需重建，巢狀待辦會攤平。圖片附件和優先級不會匯入。"
    ],
    "links": [
      [
        "Things Todoist import guide",
        "Things 的 Todoist 匯入指南",
        "https://culturedcode.com/things/support/articles/5117528/"
      ]
    ]
  }
} as const;

export function todoistMigrationComparison(routeSlug: string, productSlug: string) {
  if (routeSlug !== todoistMigrationSlug || !Object.hasOwn(migrations, productSlug)) {
    return undefined;
  }
  return migrations[productSlug as keyof typeof migrations];
}
