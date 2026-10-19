import {requestSeo} from "@/lib/discovery/seo-server";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export async function generateMetadata():Promise<Metadata>{
 const seo=await requestSeo();
 return {
  metadataBase:new URL(seo.origin),
  alternates:{canonical:"/"},
  robots:{index:seo.indexable,follow:seo.indexable},
  title: {
    default: "Software Discovery Engine",
    template: "%s | Software Discovery Engine",
  },
  description:
    "A constraint-aware discovery engine for finding great software beyond the big names.",
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
        <div className="app-shell">
          <header className="site-header">
            <div className="site-header__inner">
              <Link href="/" className="wordmark">Software Discovery Engine</Link>
            </div>
          </header>
          <main className="site-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
