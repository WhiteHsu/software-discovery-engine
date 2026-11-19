const comparisons = {
  "affine": {
    "en": [
      "In a local desktop workspace, edit documents, add tasks, and organize material on an Edgeless whiteboard without signing in.",
      "Sign in to use hosted AFFiNE AI, then choose Ask AI in a document."
    ],
    "zh": [
      "在桌面本機工作區免登入編輯文件、加入待辦，並用 Edgeless 白板整理資料。",
      "使用官方託管的 AFFiNE AI 需先登入，再從文件選擇 Ask AI。"
    ],
    "links": [
      [
        "Getting started",
        "入門指南",
        "https://affine.pro/blog/getting-started-with-affine"
      ],
      [
        "AFFiNE AI FAQ",
        "AFFiNE AI 常見問題",
        "https://affine.pro/ai"
      ]
    ]
  },
  "anytype": {
    "en": [
      "Create notes and tasks, add them to a Collection, and filter or sort them in Anytype.",
      "To let an external AI assistant work with your Anytype data, configure Agents’ Skill and authorize it with a Local API key."
    ],
    "zh": [
      "建立筆記與待辦、加入 Collection，再在 Anytype 裡篩選或排序。",
      "若要讓外部 AI 助手操作 Anytype 資料，需設定 Agents’ Skill，並以 Local API 金鑰授權。"
    ],
    "links": [
      [
        "Collections",
        "Collections 文件",
        "https://doc.anytype.io/anytype/organize/collections"
      ],
      [
        "Agents’ Skill",
        "Agents’ Skill 文件",
        "https://doc.anytype.io/anytype/features/integrations/anytype-agents-skill.md"
      ]
    ]
  },
  "appflowy": {
    "en": [
      "Write and edit documents manually and manage tasks on a Kanban board.",
      "For local AI on desktop, you can set up AppFlowy’s Ollama plugin."
    ],
    "zh": [
      "手動撰寫及編輯文件，並用 Kanban 看板管理待辦。",
      "若想在桌面版使用本機 AI，可另外設定 AppFlowy 的 Ollama 外掛。"
    ],
    "links": [
      [
        "AppFlowy Docs",
        "AppFlowy 文件",
        "https://docs.appflowy.io/docs/appflowy/readme/welcome-to-appflowy"
      ],
      [
        "Local AI plugin",
        "本機 AI 外掛",
        "https://github.com/AppFlowy-IO/AppFlowy-LAI/blob/main/README.md"
      ]
    ]
  }
} as const;

export function notionAiComparison(routeSlug: string, productSlug: string) {
  if (routeSlug !== 'notion-alternatives-without-ai' || !Object.hasOwn(comparisons, productSlug)) {
    return undefined;
  }
  return comparisons[productSlug as keyof typeof comparisons];
}
