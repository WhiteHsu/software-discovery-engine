const slug = "meditation-apps-without-a-subscription";
type Language = "en" | "zh";
type Entry = Record<Language, readonly [access: string, offline: string, workflow: string]>;

const rows: Record<string, Entry> = {
  "insight-timer": {
    en: [
      "The reviewed browser workflow uses an account. Choose a free guided session from the core library.",
      "Offline downloads are a Member Plus benefit. The free workflow covers online playback.",
      "Choose a free session by length and teacher, then play it in the browser to see whether browsing a library suits your routine.",
    ],
    zh: [
      "已查核的瀏覽器流程需使用帳號。從核心內容庫選一堂免費引導課程即可線上播放。",
      "離線下載屬於 Member Plus 權益。免費流程涵蓋線上播放。",
      "依課程長度和老師挑一堂免費課程，在瀏覽器試播，看看從內容庫自由選課是否符合你的習慣。",
    ],
  },
  medito: {
    en: [
      "Free public courses. Medito documents no-account access for core sessions; our Android sample was signed in.",
      "The app listing describes session downloads. Offline playback was outside our test.",
      "Start with Learning to sit. Play the guided audio and see whether the course format suits how you want to practice.",
    ],
    zh: [
      "公開課程免費。官方說明核心課程可免帳號使用，本站的 Android 抽測則是在登入後進行。",
      "應用程式商店頁面列有課程下載功能，本站未測試離線播放。",
      "先選 Learning to sit，播放一段語音引導，看看循序上課的方式是否符合你的練習習慣。",
    ],
  },
  "smiling-mind": {
    en: [
      "A registered account is required. The adult guided session we sampled played without a payment prompt.",
      "The app listing describes offline downloads. We did not test downloading or playing a session offline.",
      "Open the adult section and try Exploring the Breath. Pause and resume the session to see whether it fits a short break.",
    ],
    zh: [
      "需註冊帳號。本站抽測的成人引導課程可播放，過程中未出現付款提示。",
      "應用程式商店頁面列有離線下載功能，本站未測試下載或離線播放。",
      "從成人專區選擇 Exploring the Breath，試著暫停再繼續播放，看看是否適合在休息空檔練習。",
    ],
  },
  "healthy-minds-program": {
    en: [
      "Register for the free, donation-funded public program. Separate workplace and research arrangements are outside this comparison.",
      "Older help instructions describe preloading the same activity for offline use. Current download and offline playback were not verified.",
      "Try Intro To Sitting Meditation before committing to a learning path. The program organizes practice around Awareness, Connection, Insight and Purpose.",
    ],
    zh: [
      "需註冊才能使用由捐款支持的免費公開課程。企業及研究方案另計。",
      "較早的說明提到預載同一項活動後可離線使用。現行版的下載與離線播放未經驗證。",
      "先試播 Intro To Sitting Meditation，再決定是否沿著課程練習。課程分為覺察、連結、洞察和目標四個主題。",
    ],
  },
};

const copy = {
  en: {
    firstColumn: "Account and free sessions",
    secondColumn: "Downloads and offline playback",
    heading: "Choose a first session",
    guidance: "Our Android samples covered adult guided sessions. Insight Timer is covered by a documented browser workflow. If offline access matters, try the same session before you travel: load it while connected, then switch on airplane mode and try to play it again.",
  },
  zh: {
    firstColumn: "帳號與免費課程",
    secondColumn: "下載與離線播放",
    heading: "挑一堂課試播",
    guidance: "本站的 Android 抽測範圍是成人引導課程。Insight Timer 則依文件查核瀏覽器流程。若你需要離線收聽，出門前先連網載入想聽的課程，再開飛航模式試播同一堂課。",
  },
};

export function meditationGuideComparison(route: string, products: string[], language: Language) {
  if (route !== slug || !products.length || !products.every(product => Object.hasOwn(rows, product))) return undefined;

  return {
    ...copy[language],
    row: (product: string) => rows[product][language].slice(0, 2),
    workflow: (product: string) => rows[product][language][2],
  };
}
