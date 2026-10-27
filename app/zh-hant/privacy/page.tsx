import type {Metadata} from 'next';
import {requestSeo} from '@/lib/discovery/seo-server';
import VercelAnalyticsPreference from '@/components/VercelAnalyticsPreference';
export async function generateMetadata():Promise<Metadata>{const s=await requestSeo();return {title:'隱私與分析',alternates:{canonical:'/zh-hant/privacy'},robots:{index:false,follow:s.indexable}};}
export default function ChinesePrivacy(){return <section className="container"><h1>隱私與分析</h1><p>ToolElse 使用自有分析了解頁面瀏覽、軟體探索與外連點擊。英文搜尋請求會送往 OpenAI 解讀需求。啟用時，經遮蔽的搜尋診斷保留七天，加上每日清理的延遲；分析事件保留九十天，加上該延遲。請勿輸入個人或機密資訊。繁中試點未提供搜尋表單。</p><p>啟用的 Vercel Web Analytics 提供補充瀏覽統計，包含來源網站、裝置與大略位置。我們移除所傳頁面網址的查詢參數與片段，只收集列出的公開頁面，並排除已知測試工作階段。無法安全限制來源資訊的部分瀏覽會被略過。此服務與自有探索分析分開運作。</p><p>以下偏好僅儲存在這個瀏覽器，僅停用補充 Vercel 分析，不會停用自有探索分析。無痕視窗的偏好不會永久保留。</p><VercelAnalyticsPreference language="zh-Hant"/><a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Web Analytics 隱私說明（英文）</a></section>;}
