'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect} from 'react';
import {localeNavigation} from '@/lib/i18n/pilot';

export function LocaleHeader({availableSlugs,availableProducts=[],hiddenGemsAvailable=false}:{availableSlugs:readonly string[];availableProducts?:readonly string[];hiddenGemsAvailable?:boolean}){
 const path=usePathname(),nav=localeNavigation(path,availableSlugs,availableProducts,hiddenGemsAvailable);
 // App Router preserves root layouts during client navigation. Keep the document
 // language and shared navigation in sync with the actual current URL.
 useEffect(()=>{document.documentElement.lang=nav.language;},[nav.language]);
 return <header className="site-header"><div className="site-header__inner">
  <Link href={nav.home} className="wordmark">ToolElse</Link>
  {nav.alternate&&<nav aria-label={nav.chinese?'語言':'Language'}><Link href={nav.alternate} hrefLang={nav.chinese?'en':'zh-Hant'} lang={nav.chinese?'en':'zh-Hant'}>{nav.chinese?'English':'繁體中文'}</Link></nav>}
 </div></header>;
}

export function LocaleFooter(){
 const nav=localeNavigation(usePathname(),[]);
 return <footer><Link href={nav.privacy}>{nav.chinese?'隱私與分析':'Privacy & analytics'}</Link></footer>;
}
