import {requestSeo} from "@/lib/discovery/seo-server";
import type { Metadata } from "next";
import {LocaleHeader,LocaleFooter} from "@/components/LocaleChrome";
import {Suspense} from 'react';
import AnalyticsV2 from '@/components/AnalyticsV2';
import {collectorConfigV2} from '@/lib/analytics/http-v2';
import VercelWebAnalytics from "@/components/VercelWebAnalytics";
import {vercelAnalyticsEnabled} from "@/lib/analytics/vercel-policy";
import "./globals.css";
import {headers} from "next/headers";
import {chinesePath,pilotSlugs} from "@/lib/i18n/pilot";
import {getChineseEscape,availableChineseProducts} from "@/lib/i18n/server";

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
  const availableSlugs=(await Promise.all(pilotSlugs.map(async slug=>{try{return await getChineseEscape(slug)?slug:null;}catch{return null;}}))).filter((slug):slug is NonNullable<typeof slug>=>slug!==null);
  return (
    <html lang={isChinese?"zh-Hant":"en"}>
      <body>
        <Suspense fallback={null}><AnalyticsV2 enabled={collectorConfigV2(process.env).enabled&&process.env.ANALYTICS_PRODUCER_ENABLED==='true'&&process.env.VERCEL==='1'&&process.env.VERCEL_ENV==='production'} /></Suspense>
        {vercelAnalyticsEnabled(process.env)&&<Suspense fallback={null}><VercelWebAnalytics/></Suspense>}
        <div className="app-shell">
          <LocaleHeader availableSlugs={availableSlugs} availableProducts={await availableChineseProducts()}/>
          <main className="site-main">{children}</main>
          <LocaleFooter/>
        </div>
      </body>
    </html>
  );
}
