import type {Metadata} from 'next';
import DiscoverySearch from '@/components/DiscoverySearch';
import {languageAlternates} from '@/lib/i18n/pilot';
export const metadata:Metadata={title:'尋找已查核的軟體',description:'描述熟悉的產品與需求，搜尋已查核的比較、使用範圍與限制。',alternates:{canonical:'/zh-hant/discover',languages:languageAlternates('/discover')},robots:{index:false,follow:false}};
export default function ChineseDiscoverPage(){return <><h1>依你的需求，尋找已查核的軟體</h1><p>描述熟悉的產品，以及你想改變的地方。結果來自已查核的比較，且必須符合每一項解析出的需求。繁中版與英文版共用資格與排序，不代表產品一定支援中文。</p><DiscoverySearch chinese /></>;}
