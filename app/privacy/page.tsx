import VercelAnalyticsPreference from '@/components/VercelAnalyticsPreference';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Privacy & analytics',robots:{index:false,follow:true},alternates:{canonical:'/privacy'}};
export default function Privacy(){return <section className="container"><h1>Privacy & analytics</h1>
<p>ToolElse uses its own analytics to understand page visits, software discovery and outbound clicks. Search requests are sent to OpenAI to interpret your needs. When enabled, redacted search diagnostics are retained for seven days plus the daily cleanup delay; analytics events are retained for ninety days plus that delay. Avoid entering personal or confidential information.</p>
<p>When enabled, Vercel Web Analytics provides supplementary page-view statistics, including referring sites and device and approximate location information. We remove query strings and fragments from the page URL we send, limit collection to listed public pages, and exclude known testing sessions. Some visits are omitted when referrer information cannot be safely limited. This is separate from our discovery analytics.</p>
<p>You can disable supplementary Vercel analytics in this browser below. Your choice is saved in browser storage. This setting does not disable the separate discovery analytics.</p><VercelAnalyticsPreference/>
<a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Web Analytics privacy information</a></section>;}
