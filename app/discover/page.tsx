import type {Metadata} from 'next';
import DiscoverySearch from '@/components/DiscoverySearch';
export const metadata:Metadata={title:'Find reviewed software',alternates:{canonical:'/discover'},robots:{index:false,follow:false}};
export default function DiscoverPage(){return <><h1>Find reviewed software for your needs</h1><p>Describe a familiar product and what you want to change. Matches come from reviewed comparisons and must satisfy every interpreted requirement.</p><DiscoverySearch /></>;}
