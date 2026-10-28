import type {Metadata} from 'next';
import DiscoverySearch from '@/components/DiscoverySearch';
import {languageAlternates} from '@/lib/i18n/pilot';
export const metadata:Metadata={title:'Find reviewed software',alternates:{canonical:'/discover',languages:languageAlternates('/discover')},robots:{index:false,follow:false}};
export default function DiscoverPage(){return <><h1>Find reviewed software for your needs</h1><p>Describe a familiar product and what you want to change. Matches come from reviewed comparisons and must satisfy every interpreted requirement.</p><DiscoverySearch /></>;}
