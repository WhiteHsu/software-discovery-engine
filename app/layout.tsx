import {requestSeo} from "@/lib/discovery/seo-server";
import type { Metadata } from "next";
import Link from "next/link";
import {Suspense} from 'react';
import AnalyticsV2 from '@/components/AnalyticsV2';
import {collectorConfigV2} from '@/lib/analytics/http-v2';
import VercelWebAnalytics from "@/components/VercelWebAnalytics";
import {vercelAnalyticsEnabled} from "@/lib/analytics/vercel-policy";
import "./globals.css";
import {headers} from "next/headers";
import {chinesePath,chineseRoute,zhHome} from "@/lib/i18n/pilot";
import {getChineseEscape} from "@/lib/i18n/server";

export async function generateMetadata():Promise<Metadata>{
 const seo=await requestSeo();
 return {
  metadataBase:new URL(seo.origin),
  alternates:{canonical:"/"},
  robots:{index:seo.indexable,follow:seo.indexable},
  title: {
    default: "ToolElse",
    template: "%s | ToolElse",
  },
  description:
    "Find software the algorithms missed. Compare curated alternatives for fewer subscriptions, offline access, and simpler workflows.",
};
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h=await headers(),path=h.get("x-toolelse-path")??"/",isChinese=h.get("x-toolelse-language")==="zh-Hant"&&chinesePath(path);
  const slug=chineseRoute(path)??path.match(/^\/escape\/([^/]+)$/)?.[1];
  const equivalent=slug?await getChineseEscape(slug):null;
  const switchHref=path==="/"?zhHome:path===zhHome?"/":path==="/privacy"?zhHome+"/privacy":path===zhHome+"/privacy"?"/privacy":equivalent?(isChinese?"/escape/":"/zh-hant/escape/")+slug:null;
  return (
    <html lang={isChinese?"zh-Hant":"en"}>
      <body>
        <Suspense fallback={null}><AnalyticsV2 enabled={collectorConfigV2(process.env).enabled&&process.env.ANALYTICS_PRODUCER_ENABLED==='true'&&process.env.VERCEL==='1'&&process.env.VERCEL_ENV==='production'} /></Suspense>
        {vercelAnalyticsEnabled(process.env)&&<Suspense fallback={null}><VercelWebAnalytics/></Suspense>}
        <div className="app-shell">
          <header className="site-header">
            <div className="site-header__inner">
              <Link href={isChinese?zhHome:"/"} className="wordmark">ToolElse</Link>
              {switchHref&&<nav aria-label={isChinese?"語言":"Language"}><Link href={switchHref} hrefLang={isChinese?"en":"zh-Hant"} lang={isChinese?"en":"zh-Hant"}>{isChinese?"English":"繁體中文"}</Link></nav>}
            </div>
          </header>
          <main className="site-main">{children}</main>
          <footer><Link href={isChinese?zhHome+"/privacy":"/privacy"}>{isChinese?"隱私與分析":"Privacy & analytics"}</Link></footer>
        </div>
      </body>
    </html>
  );
}
