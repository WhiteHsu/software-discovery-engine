import {requestSeo} from "@/lib/discovery/seo-server";
import type { Metadata } from "next";
import Link from "next/link";
import {Suspense} from 'react';
import AnalyticsV2 from '@/components/AnalyticsV2';
import {collectorConfigV2} from '@/lib/analytics/http-v2';
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}><AnalyticsV2 enabled={collectorConfigV2(process.env).enabled&&process.env.ANALYTICS_PRODUCER_ENABLED==='true'&&process.env.VERCEL==='1'&&process.env.VERCEL_ENV==='production'} /></Suspense>
        <div className="app-shell">
          <header className="site-header">
            <div className="site-header__inner">
              <Link href="/" className="wordmark">ToolElse</Link>
            </div>
          </header>
          <main className="site-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
